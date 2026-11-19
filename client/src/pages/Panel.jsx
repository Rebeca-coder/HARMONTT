import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// /panel es una puerta de entrada: cada rol tiene su propio entorno.
export default function Panel() {
    const { usuario } = useAuth();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    if (usuario.rol === 'estudiante') {
        return <Navigate to="/panel/estudiante" replace />;
    }

    if (usuario.rol === 'empresa') {
        return <Navigate to="/panel/empresa" replace />;
    }

    return <Navigate to="/panel/admin" replace />;
}
