import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { conectarBaseDeDatos } from '../src/config/db.js';

// Prueba rápida antes de iniciar la app: resuelve dudas de URI, IP o credenciales.
async function main() {
    const conexion = await conectarBaseDeDatos(env.mongoUri);
    await conexion.db.admin().ping();

    const colecciones = await conexion.db.listCollections().toArray();
    console.log('Conexión correcta a MongoDB.');
    console.log(`Base de datos: ${conexion.db.databaseName}`);
    console.log(`Colecciones existentes: ${colecciones.length}`);
}

main()
    .catch((error) => {
        console.error('No se pudo conectar a MongoDB:', error.message);
        console.error('Revisa MONGO_URI, el usuario, la contraseña y la IP autorizada.');
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
