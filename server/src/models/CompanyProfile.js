import mongoose from 'mongoose';
import { ESTADOS_EMPRESA } from '../config/constants.js';

const { Schema, model, models } = mongoose;

const companyProfileSchema = new Schema(
    {
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        nombreComercial: {
            type: String,
            required: true,
            trim: true,
        },
        razonSocial: String,
        correoEmpresarial: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        personaContacto: String,
        sector: String,
        ciudad: String,
        descripcion: String,
        sitioWeb: String,
        logotipo: String,
        estadoVerificacion: {
            type: String,
            enum: ESTADOS_EMPRESA,
            default: 'pendiente',
        },
        verificadoPor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        verificadoEn: {
            type: Date,
            default: null,
        },
        motivoRechazo: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

export default models.CompanyProfile || model('CompanyProfile', companyProfileSchema);
