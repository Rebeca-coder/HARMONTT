import readline from 'node:readline/promises';
import { stdin as entrada, stdout as salida } from 'node:process';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { ROLES } from '../src/config/constants.js';
import { env } from '../src/config/env.js';
import { conectarBaseDeDatos } from '../src/config/db.js';

// El registro público NO puede crear admins.
// Este script es la única forma controlada de crear la primera cuenta administradora.
async function main() {
    const consola = readline.createInterface({ input: entrada, output: salida });

    try {
        await conectarBaseDeDatos(env.mongoUri);
        console.log('MongoDB conectado.');

        const nombre = process.env.ADMIN_NOMBRE
            || (await consola.question('Nombre del administrador: ')).trim();
        const email = process.env.ADMIN_EMAIL
            || (await consola.question('Correo del administrador: ')).trim();
        const password = process.env.ADMIN_PASSWORD
            || (await consola.question('Contraseña (mínimo 8 caracteres): ')).trim();

        if (!nombre || !email || !password) {
            throw new Error('Nombre, correo y contraseña son obligatorios');
        }
        if (password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        const emailNormalizado = email.toLowerCase();
        const existente = await User.findOne({ email: emailNormalizado });
        if (existente) {
            throw new Error('Ya existe una cuenta con ese correo');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await User.create({
            nombre,
            email: emailNormalizado,
            passwordHash,
            rol: ROLES.ADMIN,
            activo: true,
        });

        console.log('Administrador creado correctamente.');
        console.log('Ahora puedes iniciar sesión en /#/login con ese correo.');
    } finally {
        consola.close();
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error('No se pudo crear el administrador:', error.message);
    process.exitCode = 1;
});
