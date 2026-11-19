import CompanyProfile from '../models/CompanyProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import { ESTADOS_VISIBLES_EMPRESA } from '../config/constants.js';

export async function perfilEmpresaDe(usuarioId) {
    return CompanyProfile.findOne({ usuario: usuarioId });
}

export async function perfilEstudianteDe(usuarioId) {
    return StudentProfile.findOne({ usuario: usuarioId });
}

// Comparar ObjectId con .equals evita comparar dos objetos por referencia.
export function esPropietarioProyecto(proyecto, perfilEmpresa) {
    return Boolean(proyecto?.empresa && perfilEmpresa && proyecto.empresa.equals(perfilEmpresa._id));
}

export function esPropietarioPostulacion(postulacion, perfilEstudiante) {
    return Boolean(
        postulacion?.estudiante &&
        perfilEstudiante &&
        postulacion.estudiante.equals(perfilEstudiante._id)
    );
}

// Filtro para el panel empresarial: solo sus proyectos y solo etapa de empresa.
export function filtroPostulacionesVisiblesParaEmpresa(idsProyectos) {
    return {
        proyecto: { $in: idsProyectos },
        estado: { $in: ESTADOS_VISIBLES_EMPRESA },
    };
}

// El admin ve todo, pero la empresa nunca recibe este filtro.
export function filtroPostulacionesParaAdmin({ proyecto, estado, estudiante } = {}) {
    const filtro = {};
    if (proyecto) filtro.proyecto = proyecto;
    if (estado) filtro.estado = estado;
    if (estudiante) filtro.estudiante = estudiante;
    return filtro;
}
