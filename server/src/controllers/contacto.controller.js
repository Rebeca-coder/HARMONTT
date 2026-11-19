import ContactMessage from '../models/ContactMessage.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const crearMensaje = asyncHandler(async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
        throw new ApiError(400, 'Todos los campos del formulario son obligatorios');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, 'El correo no tiene un formato válido');
    }

    const registro = await ContactMessage.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        asunto: asunto.trim(),
        mensaje: mensaje.trim(),
    });

    res.status(201).json({
        ok: true,
        mensaje: 'Mensaje recibido. Te responderemos pronto.',
        id: registro._id,
    });
});
