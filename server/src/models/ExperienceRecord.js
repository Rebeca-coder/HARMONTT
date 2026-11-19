import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const referenciaSchema = new Schema(
    {
        evaluador: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        comentario: {
            type: String,
            default: null,
        },
        calificacion: {
            type: Number,
            min: 0,
            max: 5,
            default: null,
        },
        fecha: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const experienceRecordSchema = new Schema(
    {
        estudiante: {
            type: Schema.Types.ObjectId,
            ref: 'StudentProfile',
            required: true,
        },
        proyecto: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        organizacion: String,
        fechaInicio: Date,
        fechaFin: Date,
        funcion: String,
        habilidadesDesarrolladas: [String],
        entregables: [String],
        estado: {
            type: String,
            enum: ['en_curso', 'completado'],
            default: 'en_curso',
        },
        // Reservado para el futuro: hoy no se captura ninguna evaluación.
        referencia: {
            type: referenciaSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

experienceRecordSchema.index({ estudiante: 1, proyecto: 1 }, { unique: true });

export default models.ExperienceRecord || model('ExperienceRecord', experienceRecordSchema);
