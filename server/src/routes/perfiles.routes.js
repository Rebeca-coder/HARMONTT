import { Router } from 'express';
import { ACCIONES, ROLES } from '../config/constants.js';
import { autenticar, requireAccion, requireRol } from '../middleware/auth.js';
import {
    obtenerMiPerfil,
    actualizarMiPerfil,
    listarEmpresas,
    decidirEmpresa,
    listarEstudiantes,
    verEstudiante,
    listarUsuarios,
} from '../controllers/perfiles.controller.js';

const router = Router();

router.get(
    '/mio',
    autenticar,
    requireRol(ROLES.ESTUDIANTE, ROLES.EMPRESA),
    obtenerMiPerfil
);

router.patch(
    '/mio',
    autenticar,
    requireRol(ROLES.ESTUDIANTE, ROLES.EMPRESA),
    requireAccion(ACCIONES.EDITAR_PERFIL_PROPIO),
    actualizarMiPerfil
);

// Verificación de empresas: solo administración, y con acciones separadas.
router.get(
    '/empresas',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.APROBAR_EMPRESA),
    listarEmpresas
);
router.post(
    '/empresas/:id/aprobar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.APROBAR_EMPRESA),
    decidirEmpresa(ACCIONES.APROBAR_EMPRESA)
);
router.post(
    '/empresas/:id/rechazar',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.RECHAZAR_EMPRESA),
    decidirEmpresa(ACCIONES.RECHAZAR_EMPRESA)
);

router.get(
    '/estudiantes',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.VER_PERFILES_ESTUDIANTES),
    listarEstudiantes
);
router.get(
    '/estudiantes/:id',
    autenticar,
    requireRol(ROLES.ADMIN),
    requireAccion(ACCIONES.VER_PERFILES_ESTUDIANTES),
    verEstudiante
);
router.get('/usuarios', autenticar, requireRol(ROLES.ADMIN), listarUsuarios);

export default router;
