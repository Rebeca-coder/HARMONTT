import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Outlet es el hueco donde React colocará la página correspondiente a la ruta.
export default function Layout() {
    const location = useLocation();

    // Al cambiar de página volvemos arriba. Si el enlace pide ir a una sección
    // concreta (state.seccion), Home se encarga de desplazarse hasta ella.
    useEffect(() => {
        if (location.state?.seccion) return;
        window.scrollTo(0, 0);
    }, [location.pathname, location.state]);

    return (
        <div className="pagina">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
