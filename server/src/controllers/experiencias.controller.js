import mongoose from 'mongoose';
import Application from '../models/Application.js';
import CompanyProfile from '../models/CompanyProfile.js';
import ExperienceRecord from '../models/ExperienceRecord.js';
import Project from '../models/Project.js';
import StudentProfile from '../models/StudentProfile.js';
import { ROLES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { perfilEstudianteDe } from '../services/propiedadService.js';
import { registrarDecision } from '../services/auditoriaService.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : valor);
const lista = (valor) => (Array.isArray(valor) ? valor.map(texto).filter(Boolean) : []);

// La experiencia nace de una postulación seleccionada, no de un formulario libre.
export const registrarExperiencia = asyncHandler(async (req, res) => {
    const { estudiante: estudianteId, proyecto: proyectoId } = req.body;

    if (!mongoose.isValidObjectId(estudianteId) || !mongoose.isValidObjectId(proyectoId)) {
        throw new ApiError(400, 'Estudiante y proyecto deben ser identificadores válidos');
    }

    const [estudiante, proyecto] = await Promise.all([
        StudentProfile.findById(estudianteId),
        Project.findById(proyectoId),
    ]);

    if (!estudiante || !proyecto) {
        throw new ApiError(404, 'Estudiante o proyecto no encontrados');
    }

    const postulacion = await Application.findOne({
        estudiante: estudiante._id,
        proyecto: proyecto._id,
    });

    if (!postulacion || postulacion.estado !== 'seleccionada') {
        throw new ApiError(
            409,
            'Solo se puede registrar experiencia de una postulación seleccionada por la empresa'
        );
    }

    const existente = await ExperienceRecord.findOne({
        estudiante: estudiante._id,
        proyecto: proyecto._id,
    });
    if (existente) {
        throw new ApiError(409, 'Esta experiencia ya fue registrada');
    }

    let organizacion = 'Harmont';
    if (proyecto.empresa) {
        const empresa = await CompanyProfile.findById(proyecto.empresa);
        organizacion = empresa?.nombreComercial || organizacion;
    }

    const experiencia = await ExperienceRecord.create({
        estudiante: estudiante._id,
        proyecto: proyecto._id,
        organizacion,
        fechaInicio: req.body.fechaInicio || new Date(),
        fechaFin: req.body.fechaFin || null,
        funcion: texto(req.body.funcion) || 'Participante del proyecto',
        habilidadesDesarrolladas: lista(req.body.habilidadesDesarrolladas),
        entregables: lista(req.body.entregables),
        estado: 'en_curso',
    });

    await registrarDecision({
        recurso: 'experiencerecord',
        recursoId: experiencia._id,
        accion: 'registrar_experiencia',
        actor: req.usuario,
        estadoAnterior: null,
        estadoNuevo: 'en_curso',
    });

    res.status(201).json({ ok: true, mensaje: 'Experiencia registrada', experiencia });
});

export const misExperiencias = asyncHandler(async (req, res) => {
    const perfil = await perfilEstudianteDe(req.usuario._id);
    if (!perfil) {
        throw new ApiError(403, 'No tienes un perfil de estudiante');
    }

    const experiencias = await ExperienceRecord.find({ estudiante: perfil._id })
        .populate('proyecto', 'nombre categoria imagen')
        .sort({ fechaInicio: -1 });

    res.json({ ok: true, experiencias });
});

export const listarExperiencias = asyncHandler(async (req, res) => {
    const experiencias = await ExperienceRecord.find()
        .populate({
            path: 'estudiante',
            select: 'usuario',
            populate: { path: 'usuario', select: 'nombre email' },
        })
        .populate('proyecto', 'nombre')
        .sort({ creadoEn: -1 });

    res.json({ ok: true, total: experiencias.length, experiencias });
});

export const completarExperiencia = asyncHandler(async (req, res) => {
    if (req.usuario.rol !== ROLES.ADMIN) {
        throw new ApiError(403, 'Solo la administración puede completar experiencias');
    }

    const experiencia = await ExperienceRecord.findById(req.params.id);
    if (!experiencia) {
        throw new ApiError(404, 'Experiencia no encontrada');
    }

    if (experiencia.estado === 'completado') {
        throw new ApiError(409, 'La experiencia ya está completada');
    }

    const estadoAnterior = experiencia.estado;
    experiencia.estado = 'completado';
    experiencia.fechaFin = req.body?.fechaFin || new Date();
    await experiencia.save();

    await registrarDecision({
        recurso: 'experiencerecord',
        recursoId: experiencia._id,
        accion: 'completar_experiencia',
        actor: req.usuario,
        estadoAnterior,
        estadoNuevo: 'completado',
    });

    res.json({ ok: true, mensaje: 'Experiencia completada', experiencia });
});
