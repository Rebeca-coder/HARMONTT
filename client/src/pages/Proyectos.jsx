import { Link, useSearchParams } from 'react-router-dom';
import Buscador from '../components/Buscador.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

const proyectos = [
    {
        imagen: 'https://picsum.photos/seed/harmont-proyecto-1/700/500',
        etiqueta: 'Marketing · Simulado',
        meta: '4 semanas · Remoto · Harmont selecciona',
        titulo: 'Estrategia de marketing para una marca ficticia',
        descripcion: 'Diseña una estrategia completa de lanzamiento y presenta tus entregables.',
    },
    {
        imagen: 'https://picsum.photos/seed/harmont-proyecto-2/700/500',
        etiqueta: 'Datos · Voluntario',
        meta: '6 semanas · Híbrido · Harmont selecciona',
        titulo: 'Dashboard de impacto para una organización social',
        descripcion: 'Convierte datos reales en un panel claro para medir resultados.',
    },
    {
        imagen: 'https://picsum.photos/seed/harmont-proyecto-3/700/500',
        etiqueta: 'Diseño · Remunerado',
        meta: '3 semanas · Remoto · Harmont selecciona',
        titulo: 'Rediseño de la experiencia de usuario',
        descripcion: 'Investiga, propón mejoras y entrega un prototipo justificado.',
    },
];

export default function Proyectos() {
    // useSearchParams lee los filtros que el Buscador puso en la URL.
    const [parametros] = useSearchParams();
    const busqueda = parametros.get('q');
    const categoria = parametros.get('categoria');
    const modalidad = parametros.get('modalidad');

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

                <div className="lista-tarjetas">
                    {proyectos.map((proyecto) => (
                        <ProjectCard key={proyecto.titulo} {...proyecto} />
                    ))}
                </div>
            </section>
        </>
    );
}
