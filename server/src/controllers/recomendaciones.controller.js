import Application from '../models/Application.js';
import Project from '../models/Project.js';
import { PESOS_RECOMENDACION } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { perfilEstudianteDe } from '../services/propiedadService.js';
import { ordenarRecomendaciones } from '../services/recomendacionService.js';

export const recomendadosParaEstudiante = asyncHandler(async (req, res) => {
    const perfil = await perfilEstudianteDe(req.usuario._id);
    if (!perfil) {
        throw new ApiError(403, 'Necesitas un perfil de estudiante');
    }

    // No recomendamos proyectos a los que el estudiante ya se postuló.
    const postuladas = await Application.find({ estudiante: perfil._id }).select('proyecto');
    const excluidas = postuladas.map((postulacion) => postulacion.proyecto);

    const proyectos = await Project.find({
        estado: 'publicado',
        fechaLimite: { $gt: new Date() },
        _id: { $nin: excluidas },
    }).populate('empresa', 'nombreComercial');

    const limite = Math.min(Number(req.query.limite) || 10, 50);
    const recomendaciones = ordenarRecomendaciones(perfil, proyectos)
        .slice(0, limite)
        .map(({ proyecto, puntaje, porcentaje, desglose, motivos }) => ({
            id: proyecto._id,
            nombre: proyecto.nombre,
            categoria: proyecto.categoria,
            descripcion: proyecto.descripcion,
            imagen: proyecto.imagen,
            origen: proyecto.origen,
            tipoEconomico: proyecto.tipoEconomico,
            modalidad: proyecto.modalidad,
            duracionSemanas: proyecto.duracionSemanas,
            fechaLimite: proyecto.fechaLimite,
            empresa: proyecto.empresa?.nombreComercial || 'Harmont',
            puntaje,
            porcentaje,
            desglose,
            motivos,
        }));

    res.json({ ok: true, pesos: PESOS_RECOMENDACION, recomendaciones });
});
