import { rutaImagen } from './imagen.js';

// Adapta el documento que devuelve la API a las props de ProjectCard.
// Así el catálogo y la portada muestran exactamente la misma información.
export function aTarjeta(proyecto) {
    return {
        id: proyecto.id,
        imagen: rutaImagen(proyecto.imagen),
        etiqueta: `${proyecto.categoria} · ${proyecto.origen === 'simulado' ? 'Simulado' : proyecto.tipoEconomico}`,
        meta: `${proyecto.duracionSemanas || '—'} semanas · ${proyecto.modalidad} · ${proyecto.empresa}`,
        titulo: proyecto.nombre,
        descripcion: proyecto.descripcion,
    };
}
