import { Router } from 'express';
import { crearMensaje } from '../controllers/contacto.controller.js';

const router = Router();

router.post('/', crearMensaje);

export default router;
