import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Outlet es el hueco donde React colocará la página correspondiente a la ruta.
export default function Layout() {
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
