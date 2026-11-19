import Project from '../models/Project.js';
import Application from '../models/Application.js';
import {
    ACCIONES,
    ROLES,
} from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escaparRegex } from '../utils/validacion.js';
import {
    aplicarTransicionProyecto,
} from '../services/estadosService.js';
import {
    esPropietarioProyecto,
    filtroPostulacionesVisiblesParaEmpresa,
    perfilEmpresaDe,
} from '../services/propiedadService.js';
import { registrarDecision } from '../services/auditoriaService.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : valor);
const arreglo = (valor) => (Array.isArray(valor) ? valor.filter(Boolean) : []);

// Lista blanca: nunca copiamos req.body completo, así nadie puede inyectar 'estado'.
function datosDelProyecto(body) {
    return {
        nombre: texto(body.nombre),
        categoria: texto(body.categoria),
        descripcion: texto(body.descripcion),
        objetivo: texto(body.objetivo),
        imagen: texto(body.imagen),
        requisitosPostulacion: texto(body.requisitosPostulacion),
        actividades: arreglo(body.actividades),
        responsabilidades: arreglo(body.responsabilidades),
        entregables: arreglo(body.entregables),
        habilidadesTecnicas: arreglo(body.habilidadesTecnicas),
        habilidadesBlandas: arreglo(body.habilidadesBlandas),
        habilidadesADesarrollar: arreglo(body.habilidadesADesarrollar),
        nivelDificultad: texto(body.nivelDificultad) || 'principiante',
        tipoEconomico: texto(body.tipoEconomico),
        compensacion: texto(body.compensacion) || null,
        modalidad: texto(body.modalidad),
        duracionSemanas: body.duracionSemanas,
        participantes: body.participantes || 1,
        fechaInicio: body.fechaInicio,
        fechaLimite: body.fechaLimite,
    };
}

function validarDatosBasicos(datos) {
    if (!datos.nombre || !datos.categoria || !datos.tipoEconomico || !datos.modalidad) {
        throw new ApiError(400, 'Nombre, categoría, tipo económico y modalidad son obligatorios');
    }
}

function dtoPublico(proyecto) {
    return {
        id: proyecto._id,
        nombre: proyecto.nombre,
        categoria: proyecto.categoria,
        descripcion: proyecto.descripcion,
        imagen: proyecto.imagen,
        origen: proyecto.origen,
        tipoEconomico: proyecto.tipoEconomico,
        modalidad: proyecto.modalidad,
        duracionSemanas: proyecto.duracionSemanas,
        participantes: proyecto.participantes,
        fechaLimite: proyecto.fechaLimite,
        habilidadesTecnicas: proyecto.habilidadesTecnicas,
        empresa: proyecto.empresa?.nombreComercial || 'Harmont',
    };
}

export const crearProyectoEmpresa = asyncHandler(async (req, res) => {
    const perfil = await perfilEmpresaDe(req.usuario._id);

    if (!perfil) {
        throw new ApiError(403, 'Necesitas un perfil empresarial para publicar proyectos');
    }

    if (perfil.estadoVerificacion !== 'aprobada') {
        throw new ApiError(403, 'Harmont debe aprobar tu empresa antes de crear proyectos');
    }

    const datos = datosDelProyecto(req.body);
    validarDatosBasicos(datos);

    const proyecto = await Project.create({
        ...datos,
        origen: 'real',
        empresa: perfil._id,
        creadoPor: req.usuario._id,
        estado: 'borrador',
    });

    res.status(201).json({ ok: true, mensaje: 'Borrador creado', proyecto });
});

export const crearProyectoSimulado = asyncHandler(async (req, res) => {
    const datos = datosDelProyecto(req.body);
    validarDatosBasicos(datos);

    const proyecto = await Project.create({
        ...datos,
        origen: 'simulado',
        empresa: null,
        creadoPor: req.usuario._id,
        estado: 'borrador',
    });

    res.status(201).json({ ok: true, mensaje: 'Proyecto simulado creado', proyecto });
});

export const listarProyectos = asyncHandler(async (req, res) => {
    const { q, categoria, modalidad, origen, tipoEconomico } = req.query;

    // Regla de catálogo: jamás salen borradores ni propuestas rechazadas.
    const filtro = {
        estado: 'publicado',
        fechaLimite: { $gt: new Date() },
    };

    if (categoria) filtro.categoria = texto(categoria);
    if (modalidad) filtro.modalidad = texto(modalidad);
    if (origen) filtro.origen = texto(origen);
    if (tipoEconomico) filtro.tipoEconomico = texto(tipoEconomico);

    if (q) {
        const patron = new RegExp(escaparRegex(q), 'i');
        filtro.$or = [
            { nombre: patron },
            { descripcion: patron },
            { habilidadesTecnicas: patron },
        ];
    }

    const proyectos = await Project.find(filtro)
        .populate('empresa', 'nombreComercial')
        .sort({ fechaLimite: 1 });

    res.json({
        ok: true,
        total: proyectos.length,
        proyectos: proyectos.map(dtoPublico),
    });
});

export const listarTodosParaAdmin = asyncHandler(async (req, res) => {
    const filtro = req.query.estado ? { estado: texto(req.query.estado) } : {};
    const proyectos = await Project.find(filtro)
        .populate('empresa', 'nombreComercial')
        .populate('creadoPor', 'nombre email')
        .sort({ creadoEn: -1 });

    res.json({ ok: true, total: proyectos.length, proyectos });
});

export const misProyectos = asyncHandler(async (req, res) => {
    const perfil = await perfilEmpresaDe(req.usuario._id);
    if (!perfil) {
        throw new ApiError(403, 'No tienes un perfil empresarial');
    }

    const proyectos = await Project.find({ empresa: perfil._id }).sort({ creadoEn: -1 });
    res.json({ ok: true, proyectos });
});

export const obtenerProyecto = asyncHandler(async (req, res) => {
    const proyecto = await Project.findById(req.params.id).populate('empresa', 'nombreComercial');

    if (!proyecto) {
        throw new ApiError(404, 'Proyecto no encontrado');
    }

    if (proyecto.estado !== 'publicado') {
        const esAdmin = req.usuario?.rol === ROLES.ADMIN;
        const perfil = req.usuario?.rol === ROLES.EMPRESA
            ? await perfilEmpresaDe(req.usuario._id)
            : null;

        if (!esAdmin && !esPropietarioProyecto(proyecto, perfil)) {
            // Se responde 404 para no revelar que existe un borrador ajeno.
            throw new ApiError(404, 'Proyecto no encontrado');
        }
    }

    res.json({ ok: true, proyecto });
});

export const editarProyecto = asyncHandler(async (req, res) => {
    const proyecto = await Project.findById(req.params.id);
    if (!proyecto) {
        throw new ApiError(404, 'Proyecto no encontrado');
    }

    const esAdmin = req.usuario.rol === ROLES.ADMIN;
    const perfil = !esAdmin ? await perfilEmpresaDe(req.usuario._id) : null;
    const esDueno = esPropietarioProyecto(proyecto, perfil);

    if (!esAdmin && !esDueno) {
        throw new ApiError(403, 'Solo puedes editar tus propios proyectos');
    }

    if (!esAdmin && !['borrador', 'rechazado'].includes(proyecto.estado)) {
        throw new ApiError(409, 'Solo puedes editar borradores o proyectos rechazados');
    }

    // Los campos de control (estado, origen, empresa, revisión) no se editan desde aquí.
    Object.assign(proyecto, datosDelProyecto(req.body));
    await proyecto.save();

    res.json({ ok: true, mensaje: 'Proyecto actualizado', proyecto });
});

export const enviarRevision = asyncHandler(async (req, res) => {
    const proyecto = await Project.findById(req.params.id);
    if (!proyecto) {
        throw new ApiError(404, 'Proyecto no encontrado');
    }

    const perfil = await perfilEmpresaDe(req.usuario._id);
    if (!esPropietarioProyecto(proyecto, perfil)) {
        throw new ApiError(403, 'Solo puedes enviar tus propios proyectos');
    }

    const resultado = aplicarTransicionProyecto({
        proyecto,
        accion: ACCIONES.ENVIAR_PROYECTO_REVISION,
        actor: req.usuario,
    });

    await proyecto.save();
    await registrarDecision({
        recurso: 'project',
        recursoId: proyecto._id,
        actor: req.usuario,
        ...resultado,
    });

    res.json({ ok: true, mensaje: 'Proyecto enviado a revisión', estado: proyecto.estado });
});

// Fábrica de controladores: una función por acción administrativa.
export function cambiarEstado(accion) {
    return asyncHandler(async (req, res) => {
        const proyecto = await Project.findById(req.params.id);
        if (!proyecto) {
            throw new ApiError(404, 'Proyecto no encontrado');
        }

        const resultado = aplicarTransicionProyecto({
            proyecto,
            accion,
            actor: req.usuario,
            motivo: req.body?.motivo,
        });

        await proyecto.save();
        await registrarDecision({
            recurso: 'project',
            recursoId: proyecto._id,
            actor: req.usuario,
            motivo: req.body?.motivo,
            ...resultado,
        });

        res.json({ ok: true, mensaje: `Proyecto ${resultado.estadoNuevo}`, estado: proyecto.estado });
    });
}

export const postulacionesVisibles = asyncHandler(async (req, res) => {
    const perfil = await perfilEmpresaDe(req.usuario._id);
    if (!perfil) {
        throw new ApiError(403, 'No tienes un perfil empresarial');
    }

    const proyectoConsultado = await Project.findById(req.params.id);
    if (!proyectoConsultado || !esPropietarioProyecto(proyectoConsultado, perfil)) {
        throw new ApiError(403, 'Solo puedes consultar postulaciones de tus proyectos');
    }

    const proyectos = await Project.find({ empresa: perfil._id }).select('_id');
    const filtro = filtroPostulacionesVisiblesParaEmpresa(proyectos.map((p) => p._id));

    const postulaciones = await Application.find(filtro)
        // NUNCA se pide decisionHarmont: es información interna de Harmont.
        .select('estado cartaPresentacion habilidadesDeclaradas enlacePortafolio creadoEn decisionEmpresa')
        .populate({
            path: 'estudiante',
            select: 'foto descripcion ubicacion habilidadesTecnicas habilidadesBlandas portafolio proyectosPersonales usuario',
            populate: { path: 'usuario', select: 'nombre email' },
        })
        .populate('proyecto', 'nombre')
        .sort({ creadoEn: -1 });

    res.json({ ok: true, total: postulaciones.length, postulaciones });
});
