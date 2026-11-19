import { CAMPOS_MINIMOS_ESTUDIANTE } from '../config/constants.js';

// Los datos derivados se calculan, no se guardan.
// Guardar un "porcentaje" obligaría a actualizarlo en cada cambio de perfil.
export function calcularCompletitud(perfil, usuario) {
    const campos = {
        nombre: Boolean(usuario?.nombre),
        ubicacion: Boolean(perfil?.ubicacion),
        formacion: Boolean(perfil?.formacion),
        areaInteres: Boolean(perfil?.areaInteres),
        descripcion: Boolean(perfil?.descripcion),
        herramientas: Boolean(perfil?.herramientas?.length),
        habilidades: Boolean(perfil?.habilidadesTecnicas?.length || perfil?.habilidadesBlandas?.length),
        portafolio: Boolean(perfil?.portafolio?.length),
        disponibilidad: Boolean(perfil?.disponibilidad),
    };

    const valores = Object.values(campos);
    const completados = valores.filter(Boolean).length;
    return Math.round((completados / valores.length) * 100);
}

// Devuelve la lista exacta de lo que falta para postularse.
export function camposFaltantesParaPostular(perfil, usuario) {
    const disponibles = {
        nombre: Boolean(usuario?.nombre),
        ubicacion: Boolean(perfil?.ubicacion),
        formacion: Boolean(perfil?.formacion),
        areaInteres: Boolean(perfil?.areaInteres),
        descripcion: Boolean(perfil?.descripcion),
        habilidades: Boolean(perfil?.habilidadesTecnicas?.length || perfil?.habilidadesBlandas?.length),
    };

    return CAMPOS_MINIMOS_ESTUDIANTE.filter((campo) => !disponibles[campo]);
}

export function puedePostularse(perfil, usuario) {
    const faltantes = camposFaltantesParaPostular(perfil, usuario);
    return { ok: faltantes.length === 0, faltantes };
}
