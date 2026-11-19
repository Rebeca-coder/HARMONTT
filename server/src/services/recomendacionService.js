import { PESOS_RECOMENDACION } from '../config/constants.js';

// Normalizar evita que "Diseño", "diseno" y "  DISEÑO  " se comparen como textos distintos.
export function normalizar(valor) {
    return String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function conjunto(valores) {
    if (!Array.isArray(valores)) return new Set();
    return new Set(valores.map(normalizar).filter(Boolean));
}

function textoProyecto(proyecto) {
    return normalizar([
        proyecto.categoria,
        proyecto.nombre,
        proyecto.descripcion,
        ...(proyecto.habilidadesTecnicas || []),
        ...(proyecto.habilidadesBlandas || []),
    ].join(' '));
}

function puntuarHabilidades(perfil, proyecto) {
    const delEstudiante = conjunto([
        ...(perfil.habilidadesTecnicas || []),
        ...(perfil.habilidadesBlandas || []),
        ...(perfil.herramientas || []),
    ]);
    const delProyecto = conjunto([
        ...(proyecto.habilidadesTecnicas || []),
        ...(proyecto.habilidadesBlandas || []),
        ...(proyecto.habilidadesADesarrollar || []),
    ]);

    // Un proyecto sin habilidades declaradas no puede castigarse: se considera neutro.
    if (delProyecto.size === 0) return 0.5;
    if (delEstudiante.size === 0) return 0;

    let coincidencias = 0;
    for (const habilidad of delProyecto) {
        const existe = [...delEstudiante].some(
            (propia) => propia.includes(habilidad) || habilidad.includes(propia)
        );
        if (existe) coincidencias += 1;
    }

    return coincidencias / delProyecto.size;
}

function puntuarIntereses(perfil, proyecto) {
    const intereses = conjunto([
        perfil.areaInteres,
        ...(perfil.intereses || []),
    ]);
    if (intereses.size === 0) return 0.5;

    const texto = textoProyecto(proyecto);
    let coincidencias = 0;
    for (const interes of intereses) {
        if (texto.includes(interes)) coincidencias += 1;
    }

    return coincidencias / intereses.size;
}

function puntuarCategoria(perfil, proyecto) {
    const area = normalizar(perfil.areaInteres);
    const categoria = normalizar(proyecto.categoria);
    if (!area || !categoria) return 0;
    if (area === categoria) return 1;

    // "Diseño" dentro de una descripción es una coincidencia parcial, no exacta.
    return textoProyecto(proyecto).includes(area) ? 0.5 : 0;
}

// Devuelve 0 a 1. La interfaz puede multiplicarlo por 100 para mostrar un porcentaje.
export function calcularPuntaje(perfil, proyecto) {
    const habilidades = puntuarHabilidades(perfil, proyecto);
    const intereses = puntuarIntereses(perfil, proyecto);
    const categoria = puntuarCategoria(perfil, proyecto);

    const puntaje =
        habilidades * PESOS_RECOMENDACION.habilidades +
        intereses * PESOS_RECOMENDACION.intereses +
        categoria * PESOS_RECOMENDACION.categoria;

    const motivos = [];
    if (habilidades >= 0.5) motivos.push('Coincides con las habilidades solicitadas');
    if (intereses >= 0.5) motivos.push('Conecta con tus intereses');
    if (categoria === 1) motivos.push('Es de tu área de interés');

    return {
        puntaje: Math.round(puntaje * 100) / 100,
        porcentaje: Math.round(puntaje * 100),
        desglose: {
            habilidades: Math.round(habilidades * 100),
            intereses: Math.round(intereses * 100),
            categoria: Math.round(categoria * 100),
        },
        motivos,
    };
}

export function ordenarRecomendaciones(perfil, proyectos) {
    return proyectos
        .map((proyecto) => ({
            proyecto,
            ...calcularPuntaje(perfil, proyecto),
        }))
        .sort((a, b) => b.puntaje - a.puntaje || a.proyecto.fechaLimite - b.proyecto.fechaLimite);
}
