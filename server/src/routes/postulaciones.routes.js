import { Router } from 'express';
import { ACCIONES, ROLES } from '../config/constants.js';
import { autenticar, requireAccion, requireRol } from '../middleware/auth.js';
import {
    crearPostulacion,
    misPostulaciones,
    listarParaAdmin,
    decisionHarmont,
    decisionEmpresa,
    retirarPostulacion,
    detallePostulacion,
} from '../controllers/postulaciones.controller.js';

const router = Router();

router.post(
    '/',
    autenticar,
    requireRol(ROLES.ESTUDIANTE),
    requireAccion(ACCIONES.POSTULARSE),
    crearPostulacion
);

router.get(
    '/mias',
    autenticar,
    requireRol(ROLES.ESTUDIANTE),
    requireAccion(ACCIONES.VER_POSTULACIONES_PROPIAS),
    misPostulaciones
);

router.get(
    '/admin',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.VER_TODAS_POSTULACIONES),
    listarParaAdmin
);

router.get(
    '/:id/historial',
    autenticar,
    requireRol(ROLES.ADMIN),
    detallePostulacion
);

// Etapa 1: decisiones de Harmont.
router.post(
    '/:id/revisar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.REVISAR_POSTULACION),
    decisionHarmont(ACCIONES.REVISAR_POSTULACION)
);
router.post(
    '/:id/preseleccionar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.PRESELECCIONAR),
    decisionHarmont(ACCIONES.PRESELECCIONAR)
);
router.post(
    '/:id/no-preseleccionar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.NO_PRESELECCIONAR),
    decisionHarmont(ACCIONES.NO_PRESELECCIONAR)
);
router.post(
    '/:id/compartir',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.COMPARTIR_EMPRESA),
    decisionHarmont(ACCIONES.COMPARTIR_EMPRESA)
);

// Etapa 2: decisión final de la empresa.
router.post(
    '/:id/seleccionar',
    autenticar,
    requireRol(ROLES.EMPRESA),
    requireAccion(ACCIONES.SELECCIONAR_FINAL),
    decisionEmpresa(ACCIONES.SELECCIONAR_FINAL)
);
router.post(
    '/:id/no-seleccionar',
    autenticar,
    requireRol(ROLES.EMPRESA),
    requireAccion(ACCIONES.NO_SELECCIONAR_FINAL),
    decisionEmpresa(ACCIONES.NO_SELECCIONAR_FINAL)
);

router.post(
    '/:id/retirar',
    autenticar,
    requireRol(ROLES.ESTUDIANTE),
    requireAccion(ACCIONES.RETIRARSE),
    retirarPostulacion
);

export default router;
