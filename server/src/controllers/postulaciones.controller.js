import Application from '../models/Application.js';
import Project from '../models/Project.js';
import DecisionLog from '../models/DecisionLog.js';
import { ACCIONES, ROLES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { puedePostularse } from '../services/perfilService.js';
import { aplicarTransicionPostulacion } from '../services/estadosService.js';
import {
    esPropietarioPostulacion,
    filtroPostulacionesParaAdmin,
    perfilEmpresaDe,
    perfilEstudianteDe,
} from '../services/propiedadService.js';
import { registrarDecision } from '../services/auditoriaService.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : valor);

async function cargarPostulacion(id) {
    const postulacion = await Application.findById(id);
    if (!postulacion) {
        throw new ApiError(404, 'Postulación no encontrada');
    }
    return postulacion;
}

export const crearPostulacion = asyncHandler(async (req, res) => {
    const proyecto = await Project.findById(req.body.proyecto);

    if (!proyecto || proyecto.estado !== 'publicado' || proyecto.fechaLimite <= new Date()) {
        throw new ApiError(404, 'El proyecto no está disponible para postulaciones');
    }

    const perfil = await perfilEstudianteDe(req.usuario._id);
    if (!perfil) {
        throw new ApiError(403, 'Necesitas completar tu perfil antes de postularte');
    }

    // Los campos mínimos se validan en el servidor, no solo en el formulario.
    const { ok, faltantes } = puedePostularse(perfil, req.usuario);
    if (!ok) {
        throw new ApiError(400, 'Falta información en tu perfil', { faltantes });
    }

    const duplicada = await Application.findOne({
        proyecto: proyecto._id,
        estudiante: perfil._id,
    });
    if (duplicada) {
        throw new ApiError(409, 'Ya te postulaste a este proyecto');
    }

    const postulacion = await Application.create({
        proyecto: proyecto._id,
        estudiante: perfil._id,
        cartaPresentacion: texto(req.body.cartaPresentacion),
        habilidadesDeclaradas: Array.isArray(req.body.habilidadesDeclaradas)
            ? req.body.habilidadesDeclaradas.filter(Boolean)
            : [],
        enlacePortafolio: texto(req.body.enlacePortafolio),
        estado: 'recibida',
    });

    await registrarDecision({
        recurso: 'application',
        recursoId: postulacion._id,
        accion: ACCIONES.POSTULARSE,
        actor: req.usuario,
        estadoAnterior: null,
        estadoNuevo: 'recibida',
    });

    res.status(201).json({
        ok: true,
        mensaje: 'Postulación recibida. Harmont la revisará.',
        postulacion,
    });
});

export const misPostulaciones = asyncHandler(async (req, res) => {
    const perfil = await perfilEstudianteDe(req.usuario._id);
    if (!perfil) {
        throw new ApiError(403, 'No tienes un perfil de estudiante');
    }

    const postulaciones = await Application.find({ estudiante: perfil._id })
        .populate('proyecto', 'nombre imagen categoria estado modalidad fechaLimite')
        .sort({ creadoEn: -1 });

    res.json({ ok: true, postulaciones });
});

export const listarParaAdmin = asyncHandler(async (req, res) => {
    const filtro = filtroPostulacionesParaAdmin({
        proyecto: req.query.proyecto,
        estado: req.query.estado,
        estudiante: req.query.estudiante,
    });

    const postulaciones = await Application.find(filtro)
        .populate('proyecto', 'nombre estado origen tipoEconomico')
        .populate({
            path: 'estudiante',
            select: 'descripcion ubicacion habilidadesTecnicas habilidadesBlandas portafolio usuario',
            populate: { path: 'usuario', select: 'nombre email' },
        })
        .sort({ creadoEn: -1 });

    res.json({ ok: true, total: postulaciones.length, postulaciones });
});

// Acciones de Harmont: revisar, preseleccionar, no preseleccionar y compartir.
export function decisionHarmont(accion) {
    return asyncHandler(async (req, res) => {
        const postulacion = await cargarPostulacion(req.params.id);

        const resultado = aplicarTransicionPostulacion({
            postulacion,
            accion,
            actor: req.usuario,
            motivo: req.body?.motivo,
        });

        await postulacion.save();
        await registrarDecision({
            recurso: 'application',
            recursoId: postulacion._id,
            actor: req.usuario,
            motivo: req.body?.motivo,
            ...resultado,
        });

        res.json({
            ok: true,
            mensaje: `Postulación ${resultado.estadoNuevo}`,
            estado: postulacion.estado,
        });
    });
}

// Acciones de la empresa: solo sobre candidatos que Harmont ya compartió.
export function decisionEmpresa(accion) {
    return asyncHandler(async (req, res) => {
        const postulacion = await cargarPostulacion(req.params.id);
        const proyecto = await Project.findById(postulacion.proyecto);

        if (!proyecto) {
            throw new ApiError(404, 'Proyecto relacionado no encontrado');
        }

        const perfil = await perfilEmpresaDe(req.usuario._id);
        const esDueno = Boolean(
            perfil && proyecto.empresa && proyecto.empresa.equals(perfil._id)
        );

        if (!esDueno) {
            throw new ApiError(403, 'Esta postulación no pertenece a tu empresa');
        }

        // Harmont decide quién llega a esta etapa: se comprueba de nuevo en el servidor.
        if (postulacion.estado !== 'en_evaluacion_empresa') {
            throw new ApiError(409, 'Harmont todavía no ha compartido esta postulación');
        }

        const seleccionados = await Application.countDocuments({
            proyecto: proyecto._id,
            estado: 'seleccionada',
        });

        const resultado = aplicarTransicionPostulacion({
            postulacion,
            accion,
            actor: req.usuario,
            motivo: req.body?.motivo,
            seleccionados,
            participantes: proyecto.participantes,
        });

        await postulacion.save();
        await registrarDecision({
            recurso: 'application',
            recursoId: postulacion._id,
            actor: req.usuario,
            motivo: req.body?.motivo,
            ...resultado,
        });

        res.json({
            ok: true,
            mensaje: `Decisión registrada: ${resultado.estadoNuevo}`,
            estado: postulacion.estado,
        });
    });
}

export const retirarPostulacion = asyncHandler(async (req, res) => {
    const postulacion = await cargarPostulacion(req.params.id);
    const perfil = await perfilEstudianteDe(req.usuario._id);

    if (!esPropietarioPostulacion(postulacion, perfil)) {
        throw new ApiError(403, 'Solo puedes retirar tus propias postulaciones');
    }

    const resultado = aplicarTransicionPostulacion({
        postulacion,
        accion: ACCIONES.RETIRARSE,
        actor: req.usuario,
    });

    await postulacion.save();
    await registrarDecision({
        recurso: 'application',
        recursoId: postulacion._id,
        actor: req.usuario,
        ...resultado,
    });

    res.json({ ok: true, mensaje: 'Postulación retirada', estado: postulacion.estado });
});

// El admin necesita ver el historial completo de decisiones de una postulación.
export const detallePostulacion = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== ROLES.ADMIN) {
        throw new ApiError(403, 'Solo el administrador puede ver el historial completo');
    }

    const postulacion = await cargarPostulacion(req.params.id);
    const decisiones = await DecisionLog.find({
        recurso: 'application',
        recursoId: postulacion._id,
    }).sort({ fecha: 1 });

    res.json({ ok: true, postulacion, decisiones });
});
