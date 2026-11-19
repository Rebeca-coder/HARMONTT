import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="final">
            <div className="final-interna">
                <div>
                    <p className="final-logo">
                        HARMONT<span className="logo-detalle" aria-hidden="true">✦</span>
                    </p>
                    <p>Experiencia demostrable para jóvenes talentosos. Proyectos prácticos, selección supervisada y portafolio con evidencia.</p>
                </div>
                <div>
                    <h3>Plataforma</h3>
                    <div className="final-enlaces">
                        <Link to="/proyectos">Proyectos</Link>
                        <Link to="/" state={{ seccion: 'como-funciona' }}>Cómo funciona</Link>
                        <Link to="/" state={{ seccion: 'modelo' }}>Modelo de negocio</Link>
                    </div>
                </div>
                <div>
                    <h3>Empresas</h3>
                    <div className="final-enlaces">
                        <Link to="/" state={{ seccion: 'empresas' }}>Para empresas</Link>
                        <Link to="/contacto">Contacto</Link>
                        <Link to="/contacto">Solicitar colaboración</Link>
                    </div>
                </div>
            </div>
            <div className="final-abajo">
                <p>Harmont · Demuestra lo que sabes hacer.</p>
            </div>
        </footer>
    );
}
