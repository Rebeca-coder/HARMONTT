import app from './app.js';
import { env } from './config/env.js';
import { conectarBaseDeDatos } from './config/db.js';

async function iniciar() {
    await conectarBaseDeDatos(env.mongoUri);
    console.log('MongoDB conectado');

    app.listen(env.puerto, () => {
        console.log(`API Harmont escuchando en http://localhost:${env.puerto}`);
    });
}

iniciar().catch((error) => {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
});
