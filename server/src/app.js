import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import contactoRoutes from './routes/contacto.routes.js';
import proyectosRoutes from './routes/proyectos.routes.js';
import postulacionesRoutes from './routes/postulaciones.routes.js';
import perfilesRoutes from './routes/perfiles.routes.js';
import experienciasRoutes from './routes/experiencias.routes.js';
import { ApiError, manejarErrores } from './utils/apiError.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
    origin: env.clientUrl,
    credentials: true, // necesario para que el navegador envíe la cookie httpOnly
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/salud', (req, res) => {
    res.json({ ok: true, servicio: 'harmont-api' });
});

// Liveness (arriba) vs readiness (aquí): este endpoint sí exige MongoDB.
app.get('/api/salud/base', asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        throw new ApiError(503, 'Base de datos no conectada');
    }
    await mongoose.connection.db.admin().ping();
    res.json({ ok: true, base: 'conectada' });
}));

app.use('/api/auth', authRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/postulaciones', postulacionesRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/experiencias', experienciasRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

app.use(manejarErrores);

export default app;
