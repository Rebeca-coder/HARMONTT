// Vite inyecta BASE_URL según dónde se publique:
//   - '/' en local (http://localhost:5173)
//   - '/HARMONTT/' en GitHub Pages (https://rebeca-coder.github.io/HARMONTT/)
// Las fotos están en client/public/img, así que necesitan ese prefijo.
const BASE = import.meta.env.BASE_URL || '/';

export const IMAGEN_POR_DEFECTO = `${BASE}img/proyecto-marketing.jpg`;

export function rutaImagen(ruta) {
    if (!ruta) return IMAGEN_POR_DEFECTO;

    // Enlaces externos o imágenes incrustadas no se tocan.
    if (/^(https?:|data:|blob:)/i.test(ruta)) return ruta;

    // Si ya viene con el prefijo, evitar /HARMONTT/HARMONTT/img/...
    const prefijo = BASE.replace(/\/$/, '');
    if (prefijo && ruta.startsWith(`${prefijo}/`)) return ruta;

    return `${BASE}${ruta.replace(/^\/+/, '')}`;
}
