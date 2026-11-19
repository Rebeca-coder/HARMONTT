// Errores controlados: el controlador lanza ApiError y el middleware los convierte en JSON.
export class ApiError extends Error {
    constructor(status, mensaje, detalles) {
        super(mensaje);
        this.name = 'ApiError';
        this.status = status;
        this.detalles = detalles;
    }
}

export function manejarErrores(error, req, res, next) {
    // next se recibe aunque no se use: Express reconoce el middleware de errores por sus 4 argumentos.
    if (error instanceof ApiError) {
        return res.status(error.status).json({
            ok: false,
            mensaje: error.mensaje,
            ...(error.detalles ? { detalles: error.detalles } : {}),
        });
    }

    if (error.name === 'ValidationError') {
        const detalles = Object.values(error.errors).map((campo) => campo.message);
        return res.status(400).json({ ok: false, mensaje: 'Datos no válidos', detalles });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            ok: false,
            mensaje: 'Ya existe un registro con esos datos',
        });
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ ok: false, mensaje: 'Sesión no válida o caducada' });
    }

    console.error(error);
    return res.status(500).json({
        ok: false,
        mensaje: error.stack && process.env.NODE_ENV === 'development'
            ? error.stack
            : 'Error interno del servidor',
    });
}
