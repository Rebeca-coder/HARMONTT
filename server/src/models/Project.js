import mongoose from 'mongoose';
import {
    CATEGORIAS,
    ESTADOS_PROYECTO,
    MODALIDADES,
    NIVELES_DIFICULTAD,
    ORIGENES_PROYECTO,
    TIPOS_ECONOMICOS,
} from '../config/constants.js';

const { Schema, model, models } = mongoose;

const revisionSchema = new Schema(
    {
        motivo: String,
        revisadoPor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        revisadoEn: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const projectSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del proyecto es obligatorio'],
            trim: true,
        },
        categoria: {
            type: String,
            enum: CATEGORIAS,
            required: true,
        },
        descripcion: String,
        objetivo: String,
        imagen: String,
        requisitosPostulacion: String,
        actividades: [String],
        responsabilidades: [String],
        entregables: [String],
        habilidadesTecnicas: [String],
        habilidadesBlandas: [String],
        habilidadesADesarrollar: [String],
        nivelDificultad: {
            type: String,
            enum: NIVELES_DIFICULTAD,
            default: 'principiante',
        },

        // Dos ejes independientes: un proyecto real puede ser remunerado o voluntario.
        // Los simulados se presentan como formativos en la interfaz, pero no se fuerza aquí.
        origen: {
            type: String,
            enum: ORIGENES_PROYECTO,
            required: true,
        },
        tipoEconomico: {
            type: String,
            enum: TIPOS_ECONOMICOS,
            required: true,
        },
        compensacion: {
            type: String,
            default: null,
        },

        modalidad: {
            type: String,
            enum: MODALIDADES,
            required: true,
        },
        duracionSemanas: Number,
        participantes: {
            type: Number,
            min: 1,
            default: 1,
        },
        fechaInicio: Date,
        fechaLimite: Date,

        // null significa que lo creó Harmont directamente (proyecto simulado).
        empresa: {
            type: Schema.Types.ObjectId,
            ref: 'CompanyProfile',
            default: null,
        },
        creadoPor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        estado: {
            type: String,
            enum: ESTADOS_PROYECTO,
            default: 'borrador',
        },
        revision: {
            type: revisionSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

// El catálogo público filtrará siempre por estado:'publicado' y fechaLimite futura.
projectSchema.index({ estado: 1, fechaLimite: 1 });
projectSchema.index({ empresa: 1 });

export default models.Project || model('Project', projectSchema);
