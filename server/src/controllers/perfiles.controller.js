import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { ACCIONES, ROLES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { aplicarTransicionEmpresa } from '../services/estadosService.js';
import { registrarDecision } from '../services/auditoriaService.js';
import {
    calcularCompletitud,
    camposFaltantesParaPostular,
} from '../services/perfilService.js';
import {
    perfilEmpresaDe,
    perfilEstudianteDe,
} from '../services/propiedadService.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : valor);

// Una lista puede llegar como arreglo (API) o como texto separado por comas (formulario).
function lista(valor) {
    if (Array.isArray(valor)) {
        return valor.map(texto).filter(Boolean);
    }
    if (typeof valor === 'string') {
        return valor.split(',').map(texto).filter(Boolean);
    }
    return [];
}

function proyectosPersonales(valor) {
    if (!Array.isArray(valor)) return [];
    return valor
        .filter((proyecto) => proyecto && typeof proyecto === 'object')
        .map((proyecto) => ({
            nombre: texto(proyecto.nombre),
            descripcion: texto(proyecto.descripcion),
            url: texto(proyecto.url),
        }))
        .filter((proyecto) => proyecto.nombre || proyecto.descripcion || proyecto.url);
}

// Lista blanca: jamás copiamos req.body completo porque ahí podría venir
// estadoVerificacion, usuario o cualquier campo de control.
function datosEstudiante(body = {}) {
    return {
        foto: texto(body.foto),
        descripcion: texto(body.descripcion),
        ubicacion: texto(body.ubicacion),
        formacion: texto(body.formacion),
        institucion: texto(body.institucion),
        areaInteres: texto(body.areaInteres),
        habilidadesTecnicas: lista(body.habilidadesTecnicas),
        habilidadesBlandas: lista(body.habilidadesBlandas),
        intereses: lista(body.intereses),
        herramientas: lista(body.herramientas),
        // Se conserva el campo por si el estudiante quiere usarlo, pero no es obligatorio.
        experienciaPrevia: lista(body.experienciaPrevia),
        proyectosPersonales: proyectosPersonales(body.proyectosPersonales),
        portafolio: lista(body.portafolio),
        disponibilidad: texto(body.disponibilidad),
    };
}

function datosEmpresa(body = {}) {
    return {
        nombreComercial: texto(body.nombreComercial),
        razonSocial: texto(body.razonSocial),
        correoEmpresarial: texto(body.correoEmpresarial)?.toLowerCase(),
        personaContacto: texto(body.personaContacto),
        sector: texto(body.sector),
        ciudad: texto(body.ciudad),
        descripcion: texto(body.descripcion),
        sitioWeb: texto(body.sitioWeb),
        logotipo: texto(body.logotipo),
    };
}

export const obtenerMiPerfil = asyncHandler(async (req, res) => {
    if (req.usuario.rol === ROLES.ESTUDIANTE) {
        const perfil = await perfilEstudianteDe(req.usuario._id);
        if (!perfil) {
            throw new ApiError(404, 'No tienes un perfil de estudiante');
        }

        return res.json({
            ok: true,
            perfil,
            completitud: calcularCompletitud(perfil, req.usuario),
            faltantes: camposFaltantesParaPostular(perfil, req.usuario),
        });
    }

    if (req.usuario.rol === ROLES.EMPRESA) {
        const perfil = await perfilEmpresaDe(req.usuario._id);
        if (!perfil) {
            throw new ApiError(404, 'No tienes un perfil empresarial');
        }

        return res.json({
            ok: true,
            perfil,
            puedePublicar: perfil.estadoVerificacion === 'aprobada',
        });
    }

    throw new ApiError(404, 'Este rol no tiene un perfil editable');
});

export const actualizarMiPerfil = asyncHandler(async (req, res) => {
    if (req.usuario.rol === ROLES.ESTUDIANTE) {
        const perfil = await perfilEstudianteDe(req.usuario._id);
        if (!perfil) {
            throw new ApiError(404, 'No tienes un perfil de estudiante');
        }

        Object.assign(perfil, datosEstudiante(req.body));
        await perfil.save();

        return res.json({
            ok: true,
            mensaje: 'Perfil actualizado',
            perfil,
            completitud: calcularCompletitud(perfil, req.usuario),
            faltantes: camposFaltantesParaPostular(perfil, req.usuario),
        });
    }

    if (req.usuario.rol === ROLES.EMPRESA) {
        const perfil = await perfilEmpresaDe(req.usuario._id);
        if (!perfil) {
            throw new ApiError(404, 'No tienes un perfil empresarial');
        }

        const datos = datosEmpresa(req.body);
        if (!datos.nombreComercial) {
            throw new ApiError(400, 'El nombre comercial es obligatorio');
        }
        if (!datos.correoEmpresarial) {
            throw new ApiError(400, 'El correo empresarial es obligatorio');
        }

        Object.assign(perfil, datos);
        await perfil.save();

        return res.json({
            ok: true,
            mensaje: 'Perfil actualizado',
            perfil,
            puedePublicar: perfil.estadoVerificacion === 'aprobada',
        });
    }

    throw new ApiError(403, 'Este rol no puede editar estos perfiles');
});

export const listarEmpresas = asyncHandler(async (req, res) => {
    const filtro = req.query.estado ? { estadoVerificacion: req.query.estado } : {};
    const empresas = await CompanyProfile.find(filtro)
        .populate('usuario', 'nombre email')
        .sort({ creadoEn: -1 });

    res.json({ ok: true, total: empresas.length, empresas });
});

export const decidirEmpresa = (accion) => asyncHandler(async (req, res) => {
    const empresa = await CompanyProfile.findById(req.params.id);
    if (!empresa) {
        throw new ApiError(404, 'Perfil empresarial no encontrado');
    }

    const resultado = aplicarTransicionEmpresa({
        empresa,
        accion,
        actor: req.usuario,
        motivo: req.body?.motivo,
    });

    await empresa.save();
    await registrarDecision({
        recurso: 'companyprofile',
        recursoId: empresa._id,
        actor: req.usuario,
        motivo: req.body?.motivo,
        ...resultado,
    });

    res.json({
        ok: true,
        mensaje: `Empresa ${resultado.estadoNuevo}`,
        estado: empresa.estadoVerificacion,
    });
});

export const listarEstudiantes = asyncHandler(async (req, res) => {
    const estudiantes = await StudentProfile.find()
        .populate('usuario', 'nombre email activo')
        .sort({ creadoEn: -1 });

    res.json({ ok: true, total: estudiantes.length, estudiantes });
});

export const verEstudiante = asyncHandler(async (req, res) => {
    const perfil = await StudentProfile.findById(req.params.id)
        .populate('usuario', 'nombre email');

    if (!perfil) {
        throw new ApiError(404, 'Perfil de estudiante no encontrado');
    }

    res.json({
        ok: true,
        perfil,
        completitud: calcularCompletitud(perfil, { nombre: perfil.usuario?.nombre }),
    });
});

export const listarUsuarios = asyncHandler(async (req, res) => {
    const usuarios = await User.find().select('nombre email rol activo creadoEn').sort({ creadoEn: -1 });
    res.json({ ok: true, total: usuarios.length, usuarios });
});

export const accionesPorRol = (req, res) => {
    res.json({ ok: true, rol: req.usuario.rol, acciones: ACCIONES });
};
