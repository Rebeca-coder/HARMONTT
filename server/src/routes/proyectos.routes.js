import { Router } from 'express';
import {
    ACCIONES,
    ROLES,
} from '../config/constants.js';
import {
    autenticar,
    requireAccion,
    requireRol,
} from '../middleware/auth.js';
import {
    crearProyectoEmpresa,
    crearProyectoSimulado,
    listarProyectos,
    misProyectos,
    obtenerProyecto,
    editarProyecto,
    enviarRevision,
    cambiarEstado,
    postulacionesVisibles,
} from '../controllers/proyectos.controller.js';

const router = Router();

// Rutas públicas
router.get('/', listarProyectos);
router.get('/:id', obtenerProyecto);

// Rutas de empresa (specific antes que '/:id' por claridad)
router.get('/mia/lista', autenticar, requireRol(ROLES.EMPRESA), misProyectos);

// El admin crea los proyectos simulados; la empresa, los reales.
router.post(
    '/simulados',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.CREAR_PROYECTO_SIMULADO),
    crearProyectoSimulado
);
router.post(
    '/',
    autenticar,
    requireRol(ROLES.EMPRESA),
    requireAccion(ACCIONES.CREAR_PROYECTO),
    crearProyectoEmpresa
);

router.patch('/:id', autenticar, editarProyecto);

router.post(
    '/:id/enviar-revision',
    autenticar,
    requireRol(ROLES.EMPRESA),
    requireAccion(ACCIONES.ENVIAR_PROYECTO_REVISION),
    enviarRevision
);

// Administración: cada transición tiene su propia ruta y su propio permiso.
router.post(
    '/:id/tomar-revision',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.TOMAR_REVISION),
    cambiarEstado(ACCIONES.TOMAR_REVISION)
);
router.post(
    '/:id/aprobar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.APROBAR_PROYECTO),
    cambiarEstado(ACCIONES.APROBAR_PROYECTO)
);
router.post(
    '/:id/rechazar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.RECHAZAR_PROYECTO),
    cambiarEstado(ACCIONES.RECHAZAR_PROYECTO)
);
router.post(
    '/:id/publicar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.PUBLICAR_PROYECTO),
    cambiarEstado(ACCIONES.PUBLICAR_PROYECTO)
);
router.post(
    '/:id/iniciar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.INICIAR_PROYECTO),
    cambiarEstado(ACCIONES.INICIAR_PROYECTO)
);
router.post(
    '/:id/finalizar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.FINALIZAR_PROYECTO),
    cambiarEstado(ACCIONES.FINALIZAR_PROYECTO)
);

// La empresa ve solo los candidatos que Harmont compartió.
router.get(
    '/:id/postulaciones',
    autenticar,
    requireRol(ROLES.EMPRESA),
    requireAccion(ACCIONES.VER_PRESELECCIONADOS),
    postulacionesVisibles
);

export default router;
