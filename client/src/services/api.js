// Una sola puerta de entrada a la API.
// credentials:'include' es imprescindible: sin eso el navegador no envía la cookie httpOnly.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function peticion(ruta, { metodo = 'GET', cuerpo, ...opciones } = {}) {
    let respuesta;

    try {
        respuesta = await fetch(`${BASE}${ruta}`, {
            method: metodo,
            credentials: 'include',
            headers: cuerpo ? { 'Content-Type': 'application/json' } : {},
            body: cuerpo ? JSON.stringify(cuerpo) : undefined,
            ...opciones,
        });
    } catch (error) {
        throw new Error('No se pudo conectar con la API. Comprueba que el servidor esté encendido.');
    }

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        const error = new Error(datos.mensaje || 'Error en la petición');
        error.status = respuesta.status;
        error.detalles = datos.detalles;
        throw error;
    }

    return datos;
}

export const api = {
    get: (ruta) => peticion(ruta),
    post: (ruta, cuerpo) => peticion(ruta, { metodo: 'POST', cuerpo }),
    patch: (ruta, cuerpo) => peticion(ruta, { metodo: 'PATCH', cuerpo }),
};
