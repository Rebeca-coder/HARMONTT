import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const proyectoPersonalSchema = new Schema(
    {
        nombre: String,
        descripcion: String,
        url: String,
    },
    { _id: false }
);

const studentProfileSchema = new Schema(
    {
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        foto: String,
        descripcion: String,
        ubicacion: String,
        formacion: String,
        institucion: String,
        areaInteres: String,
        habilidadesTecnicas: [String],
        habilidadesBlandas: [String],
        intereses: [String],
        herramientas: [String],
        // Opcional: Harmont está pensado para quien todavía no tiene experiencia laboral.
        experienciaPrevia: [String],
        proyectosPersonales: [proyectoPersonalSchema],
        portafolio: [String],
        disponibilidad: String,
    },
    {
        timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    }
);

export default models.StudentProfile || model('StudentProfile', studentProfileSchema);
