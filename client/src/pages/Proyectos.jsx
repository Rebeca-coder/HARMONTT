import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Buscador from '../components/Buscador.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { api } from '../services/api.js';

function aTarjeta(proyecto) {
    return {
        id: proyecto.id,
        imagen: proyecto.imagen || 'https://picsum.photos/seed/harmont-proyecto/700/500',
        etiqueta: `${proyecto.categoria} · ${proyecto.origen === 'simulado' ? 'Simulado' : proyecto.tipoEconomico}`,
        meta: `${proyecto.duracionSemanas || '—'} semanas · ${proyecto.modalidad} · ${proyecto.empresa}`,
        titulo: proyecto.nombre,
        descripcion: proyecto.descripcion,
    };
}

export default function Proyectos() {
    const [parametros] = useSearchParams();
    const [proyectos, setProyectos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const cadenaFiltros = parametros.toString();
    const busqueda = parametros.get('q');
    const categoria = parametros.get('categoria');
    const modalidad = parametros.get('modalidad');

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError('');

        const sufijo = cadenaFiltros ? `?${cadenaFiltros}` : '';

        api.get(`/proyectos${sufijo}`)
            .then((datos) => {
                if (!cancelado) setProyectos(datos.proyectos || []);
            })
            .catch((fallo) => {
                if (!cancelado) setError(fallo.message);
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => { cancelado = true; };
    }, [cadenaFiltros]);

    return (
        <>
            <div className="portada-interna">
                <p className="etiqueta-seccion">Catálogo de proyectos</p>
                <h1>Explora proyectos</h1>
                <p>
                    Busca por habilidad, categoría o modalidad. Cada reto tiene objetivos,
                    tareas y entregables definidos.
                </p>
                {(busqueda || categoria || modalidad) && (
                    <p className="aviso">
                        Filtros: {busqueda || '—'} · {categoria || 'todas'} · {modalidad || 'cualquiera'}
                    </p>
                )}
            </div>

            <Buscador />

            <section className="seccion">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">01 / Resultados</p>
                        <h2 className="titulo-seccion">Proyectos disponibles</h2>
                    </div>
                    <Link className="enlace-con-flecha" to="/">Volver al inicio →</Link>
                </div>

                {cargando && <p className="aviso">Cargando proyectos desde la API…</p>}
                {error && <p className="mensaje-error">{error}</p>}
                {!cargando && !error && proyectos.length === 0 && (
                    <p className="aviso">No hay proyectos publicados con esos filtros.</p>
                )}

                <div className="lista-tarjetas">
                    {proyectos.map((proyecto) => (
                        <ProjectCard key={proyecto.id} {...aTarjeta(proyecto)} />
                    ))}
                </div>
            </section>
        </>
    );
}
