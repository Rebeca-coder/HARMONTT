import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { PERMISOS } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const COOKIE_NOMBRE = 'harmont_token';

// La cookie httpOnly significa que JavaScript del navegador NO puede leerla.
// Eso protege el token contra ataques XSS. React nunca guarda el token en localStorage.
export function opcionesCookie() {
    const produccion = env.entorno === 'production';
    return {
        httpOnly: true,
        secure: produccion,
        sameSite: produccion ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    };
}

export function generarToken(usuario) {
    return jwt.sign(
        { id: usuario._id.toString(), rol: usuario.rol },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );
}

export const autenticar = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NOMBRE];

    if (!token) {
        throw new ApiError(401, 'Debes iniciar sesión para acceder a este recurso');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const usuario = await User.findById(payload.id);

    if (!usuario || !usuario.activo) {
        throw new ApiError(401, 'La cuenta no existe o está desactivada');
    }

    req.usuario = usuario;
    next();
});

export function requireRol(...roles) {
    return (req, res, next) => {
        if (!req.usuario || !roles.includes(req.usuario.rol)) {
            return next(new ApiError(403, 'No tienes permiso para realizar esta acción'));
        }
        next();
    };
}

// Permisos por acción: ni el admin es todopoderoso ni la empresa ve todo.
export function requireAccion(accion) {
    return (req, res, next) => {
        const permitidas = PERMISOS[req.usuario?.rol] || [];
        if (!permitidas.includes(accion)) {
            return next(new ApiError(403, `Acción no permitida: ${accion}`));
        }
        next();
    };
}
