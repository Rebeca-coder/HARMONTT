import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Envuelve páginas que requieren sesión.
// Mientras se comprueba la cookie mostramos un aviso para no parpadear.
export default function RutaPrivada({ children, roles }) {
    const { usuario, cargando } = useAuth();
    const location = useLocation();

    if (cargando) {
        return <section className="seccion"><p className="aviso">Comprobando sesión…</p></section>;
    }

    if (!usuario) {
        return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
    }

    if (roles && !roles.includes(usuario.rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
