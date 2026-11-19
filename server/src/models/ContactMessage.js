import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const contactMessageSchema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        asunto: {
            type: String,
            required: true,
        },
        mensaje: {
            type: String,
            required: true,
        },
        atendido: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

export default models.ContactMessage || model('ContactMessage', contactMessageSchema);
