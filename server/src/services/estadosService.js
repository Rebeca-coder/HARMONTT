import { ACCIONES, PERMISOS } from '../config/constants.js';
import { buscarTransicion } from '../utils/transiciones.js';
import { ApiError } from '../utils/apiError.js';

const ACCIONES_HARMONT = [
    ACCIONES.REVISAR_POSTULACION,
    ACCIONES.PRESELECCIONAR,
    ACCIONES.NO_PRESELECCIONAR,
    ACCIONES.COMPARTIR_EMPRESA,
];

const ACCIONES_EMPRESA = [ACCIONES.SELECCIONAR_FINAL, ACCIONES.NO_SELECCIONAR_FINAL];

function validar(flujo, estado, accion, rol) {
    const permitidas = PERMISOS[rol] || [];
    if (!permitidas.includes(accion)) {
        throw new ApiError(403, `El rol ${rol} no puede ejecutar ${accion}`);
    }

    const transicion = buscarTransicion(flujo, estado, accion, rol);
    if (!transicion) {
        throw new ApiError(409, `No se puede ${accion} cuando el estado es ${estado}`);
    }

    return transicion;
}

// El servicio recibe documentos ya cargados. La propiedad se valida en el controlador.
export function aplicarTransicionProyecto({ proyecto, accion, actor, motivo }) {
    const estadoAnterior = proyecto.estado;
    const transicion = validar('proyecto', estadoAnterior, accion, actor.rol);

    proyecto.estado = transicion.hasta;

    if (accion === ACCIONES.APROBAR_PROYECTO || accion === ACCIONES.RECHAZAR_PROYECTO) {
        proyecto.revision = {
            motivo: motivo || null,
            revisadoPor: actor._id,
            revisadoEn: new Date(),
        };
    }

    return { estadoAnterior, estadoNuevo: proyecto.estado, accion };
}

export function aplicarTransicionPostulacion({
    postulacion,
    accion,
    actor,
    motivo,
    seleccionados = 0,
    participantes = 1,
}) {
    const estadoAnterior = postulacion.estado;
    const transicion = validar('postulacion', estadoAnterior, accion, actor.rol);

    // La empresa no puede superar el número de participantes del proyecto.
    if (accion === ACCIONES.SELECCIONAR_FINAL && seleccionados >= participantes) {
        throw new ApiError(409, 'El proyecto ya alcanzó el número de participantes');
    }

    postulacion.estado = transicion.hasta;

    const ahora = new Date();

    if (ACCIONES_HARMONT.includes(accion)) {
        postulacion.decisionHarmont = {
            estado: transicion.hasta,
            por: actor._id,
            fecha: ahora,
            motivo: motivo || null,
        };
    }

    if (ACCIONES_EMPRESA.includes(accion)) {
        postulacion.decisionEmpresa = {
            estado: transicion.hasta,
            por: actor._id,
            fecha: ahora,
            motivo: motivo || null,
        };
    }

    return { estadoAnterior, estadoNuevo: postulacion.estado, accion };
}
