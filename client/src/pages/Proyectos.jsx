import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Buscador from '../components/Buscador.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { api } from '../services/api.js';
import { rutaImagen } from '../services/imagen.js';

function aTarjeta(proyecto) {
    return {
        id: proyecto.id,
        imagen: rutaImagen(proyecto.imagen),
        etiqueta: `${proyecto.categoria} · ${proyecto.origen === 'simulado' ? 'Simulado' : proyecto.tipoEconomico}`,
        meta: `${proyecto.duracionSemanas || '—'} semanas · ${proyecto.modalidad} · ${proyecto.empresa}`,
        titulo: proyecto.nombre,
        descripcion: proyecto.descripcion,
    };
}

export default function Proyectos() {
    const [parametros, setParametros] = useSearchParams();
    const [proyectos, setProyectos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [tieneMas, setTieneMas] = useState(false);

    const pagina = Math.max(Number(parametros.get('pagina')) || 1, 1);

    // La paginación no es un filtro de negocio: la separamos para no mostrarla como tal.
    const filtros = new URLSearchParams(parametros);
    filtros.delete('pagina');
    const cadenaFiltros = filtros.toString();

    const consulta = new URLSearchParams(filtros);
    consulta.set('pagina', String(pagina));
    const sufijo = `?${consulta.toString()}`;

    const busqueda = parametros.get('q');
    const categoria = parametros.get('categoria');
    const modalidad = parametros.get('modalidad');

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError('');

        api.get(`/proyectos${sufijo}`)
            .then((datos) => {
                if (cancelado) return;
                setProyectos(datos.proyectos || []);
                setTotal(datos.total || 0);
                setTotalPaginas(datos.totalPaginas || 1);
                setTieneMas(Boolean(datos.tieneMas));
            })
            .catch((fallo) => {
                if (!cancelado) setError(fallo.message);
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => { cancelado = true; };
    }, [cadenaFiltros, pagina]);

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas || nuevaPagina === pagina) return;
        const siguientes = new URLSearchParams(parametros);
        siguientes.set('pagina', String(nuevaPagina));
        setParametros(siguientes);
        document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
    };

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

            <section className="seccion" id="resultados">
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

                {!cargando && !error && total > 0 && (
                    <nav className="paginacion" aria-label="Paginación de proyectos">
                        <button
                            className="pildora pildora-pequena"
                            type="button"
                            disabled={pagina === 1}
                            onClick={() => cambiarPagina(pagina - 1)}
                        >
                            ← Anterior
                        </button>
                        <span>
                            Página {pagina} de {totalPaginas} · {total} proyecto(s)
                        </span>
                        <button
                            className="pildora pildora-pequena"
                            type="button"
                            disabled={!tieneMas}
                            onClick={() => cambiarPagina(pagina + 1)}
                        >
                            Siguiente →
                        </button>
                    </nav>
                )}
            </section>
        </>
    );
}
