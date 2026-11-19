import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al cargar la página preguntamos quién es el usuario.
    // La cookie viaja sola; React nunca ve el token.
    useEffect(() => {
        api.get('/auth/me')
            .then((datos) => setUsuario(datos.usuario))
            .catch(() => setUsuario(null))
            .finally(() => setCargando(false));
    }, []);

    const iniciarSesion = async (credenciales) => {
        const datos = await api.post('/auth/login', credenciales);
        setUsuario(datos.usuario);
        return datos;
    };

    const registrar = async (formulario) => {
        const datos = await api.post('/auth/registro', formulario);
        setUsuario(datos.usuario);
        return datos;
    };

    const cerrarSesion = async () => {
        await api.post('/auth/logout');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, registrar, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return contexto;
}
