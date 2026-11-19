import mongoose from 'mongoose';
import { ESTADOS_POSTULACION } from '../config/constants.js';

const { Schema, model, models } = mongoose;

// Mongoose 9 ignora un `enum` que contiene null, así que usamos un validador explícito.
const estadosHarmont = ['en_revision', 'preseleccionada', 'no_preseleccionada', 'en_evaluacion_empresa'];

const decisionHarmontSchema = new Schema(
    {
        estado: {
            type: String,
            default: null,
            validate: {
                validator: (valor) => valor === null || estadosHarmont.includes(valor),
                message: 'Estado de decisión de Harmont no válido',
            },
        },
        por: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        fecha: {
            type: Date,
            default: null,
        },
        motivo: {
            type: String,
            default: null,
        },
    },
    { _id: false }
);

const estadosEmpresa = ['seleccionada', 'no_seleccionada'];

const decisionEmpresaSchema = new Schema(
    {
        estado: {
            type: String,
            default: null,
            validate: {
                validator: (valor) => valor === null || estadosEmpresa.includes(valor),
                message: 'Estado de decisión de empresa no válido',
            },
        },
        por: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        fecha: {
            type: Date,
            default: null,
        },
        motivo: {
            type: String,
            default: null,
        },
    },
    { _id: false }
);

const applicationSchema = new Schema(
    {
        proyecto: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        estudiante: {
            type: Schema.Types.ObjectId,
            ref: 'StudentProfile',
            required: true,
        },
        cartaPresentacion: String,
        habilidadesDeclaradas: [String],
        enlacePortafolio: String,

        estado: {
            type: String,
            enum: ESTADOS_POSTULACION,
            default: 'recibida',
        },

        // Dos campos separados = dos etapas que nadie puede saltarse.
        decisionHarmont: {
            type: decisionHarmontSchema,
            default: () => ({}),
        },
        decisionEmpresa: {
            type: decisionEmpresaSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

// Un estudiante no puede postularse dos veces al mismo proyecto.
applicationSchema.index({ proyecto: 1, estudiante: 1 }, { unique: true });
applicationSchema.index({ proyecto: 1, estado: 1 });
applicationSchema.index({ estudiante: 1, estado: 1 });

export default models.Application || model('Application', applicationSchema);
