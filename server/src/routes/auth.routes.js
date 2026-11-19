import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    registrar,
    iniciarSesion,
    cerrarSesion,
    yo,
} from '../controllers/auth.controller.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// Evita intentos masivos de contraseñas sin necesidad de un servicio externo.
const limiteIngreso = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, mensaje: 'Demasiados intentos. Espera unos minutos.' },
});

router.post('/registro', registrar);
router.post('/login', limiteIngreso, iniciarSesion);
router.post('/logout', cerrarSesion);
router.get('/me', autenticar, yo);

export default router;
