import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'El correo es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        // select:false evita que el hash viaje en cada consulta.
        // En el login habrá que pedirlo explícitamente con .select('+passwordHash').
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        rol: {
            type: String,
            enum: Object.values(ROLES),
            required: true,
        },
        activo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

// El guard evita "OverwriteModelError" cuando node --watch recarga el archivo.
export default models.User || model('User', userSchema);
