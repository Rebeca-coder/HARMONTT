import mongoose from 'mongoose';

export async function conectarBaseDeDatos(uri) {
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });
    return mongoose.connection;
}
