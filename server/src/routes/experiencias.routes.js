import { Router } from 'express';
import { ACCIONES, ROLES } from '../config/constants.js';
import { autenticar, requireAccion, requireRol } from '../middleware/auth.js';
import {
    registrarExperiencia,
    misExperiencias,
    listarExperiencias,
    completarExperiencia,
} from '../controllers/experiencias.controller.js';

const router = Router();

router.get(
    '/mias',
    autenticar,
    requireRol(ROLES.ESTUDIANTE),
    misExperiencias
);

router.get(
    '/admin',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.REGISTRAR_EXPERIENCIA),
    listarExperiencias
);

router.post(
    '/',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.REGISTRAR_EXPERIENCIA),
    registrarExperiencia
);

router.post(
    '/:id/completar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.COMPLETAR_EXPERIENCIA),
    completarExperiencia
);

export default router;
