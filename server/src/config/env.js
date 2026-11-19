import dotenv from 'dotenv';

dotenv.config();

// Validar la configuración al arrancar evita descubrir errores de despliegue horas después.
const requeridas = ['MONGO_URI', 'JWT_SECRET'];
const faltantes = requeridas.filter((clave) => !process.env[clave]);

if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}. Copia .env.example como .env.`);
}

export const env = {
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    puerto: Number(process.env.PORT) || 4000,
    entorno: process.env.NODE_ENV || 'development',
};
