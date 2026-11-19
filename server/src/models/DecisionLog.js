import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const { Schema, model, models } = mongoose;

// Un registro por cada decisión importante. Es el "acta" de Harmont.
const decisionLogSchema = new Schema(
    {
        recurso: {
            type: String,
            enum: ['project', 'application', 'company'],
            required: true,
        },
        recursoId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        accion: {
            type: String,
            required: true,
        },
        actor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rolActor: {
            type: String,
            enum: Object.values(ROLES),
            required: true,
        },
        estadoAnterior: String,
        estadoNuevo: String,
        motivo: String,
        fecha: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

decisionLogSchema.index({ recurso: 1, recursoId: 1 });

export default models.DecisionLog || model('DecisionLog', decisionLogSchema);
