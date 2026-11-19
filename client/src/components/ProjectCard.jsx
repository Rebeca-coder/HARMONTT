import { Link } from 'react-router-dom';

// Componente reutilizable: recibe datos por "props" y devuelve siempre la misma estructura.
export default function ProjectCard({ id, imagen, etiqueta, meta, titulo, descripcion }) {
    const destino = id ? `/proyectos/${id}` : '/proyectos';

    return (
        <article className="carta">
            <img className="carta-imagen" src={imagen} alt={titulo} />
            <div className="carta-cuerpo">
                <span className="carta-etiqueta">{etiqueta}</span>
                <p className="carta-meta">{meta}</p>
                <h3 className="carta-titulo">{titulo}</h3>
                <p className="carta-texto">{descripcion}</p>
                <Link className="enlace-con-flecha" to={destino}>Ver proyecto →</Link>
            </div>
        </article>
    );
}
