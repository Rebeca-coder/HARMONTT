import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    // useState crea una variable de estado: cuando cambia, React vuelve a dibujar.
    const [menuAbierto, setMenuAbierto] = useState(false);

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <header className="cabecera">
            <div className="cabecera-interna">
                <nav className="navegacion navegacion-izquierda" aria-label="Navegación principal">
                    <Link to="/proyectos" onClick={cerrarMenu}>Proyectos</Link>
                    {/* state viaja con la navegación; Home lo leerá para desplazarse */}
                    <Link to="/" state={{ seccion: 'como-funciona' }} onClick={cerrarMenu}>Cómo funciona</Link>
                    <Link to="/" state={{ seccion: 'empresas' }} onClick={cerrarMenu}>Empresas</Link>
                    <Link to="/" state={{ seccion: 'modelo' }} onClick={cerrarMenu}>Modelo</Link>
                </nav>

                <Link className="logo" to="/" onClick={cerrarMenu}>
                    HARMONT<span className="logo-detalle" aria-hidden="true">✦</span>
                </Link>

                <div className="cabecera-acciones">
                    <Link className="pildora pildora-pequena" to="/proyectos" onClick={cerrarMenu}>Explorar</Link>
                    <Link className="enlace-sesion" to="/contacto" onClick={cerrarMenu}>Hablemos</Link>
                    <button
                        type="button"
                        className="boton-menu"
                        aria-label="Abrir menú"
                        aria-expanded={menuAbierto}
                        onClick={() => setMenuAbierto(!menuAbierto)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* La clase 'abierta' Se añade o se quita según el estado */}
            <nav
                className={`navegacion-movil${menuAbierto ? ' abierta' : ''}`}
                aria-label="Navegación móvil"
            >
                <Link to="/proyectos" onClick={cerrarMenu}>Proyectos</Link>
                <Link to="/" state={{ seccion: 'como-funciona' }} onClick={cerrarMenu}>Cómo funciona</Link>
                <Link to="/" state={{ seccion: 'empresas' }} onClick={cerrarMenu}>Empresas</Link>
                <Link to="/" state={{ seccion: 'modelo' }} onClick={cerrarMenu}>Modelo</Link>
                <Link to="/contacto" onClick={cerrarMenu}>Hablemos</Link>
            </nav>
        </header>
    );
}
