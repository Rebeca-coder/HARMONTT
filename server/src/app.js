import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import contactoRoutes from './routes/contacto.routes.js';
import { manejarErrores } from './utils/apiError.js';

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

app.use('/api/auth', authRoutes);
app.use('/api/contacto', contactoRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

app.use(manejarErrores);

export default app;
