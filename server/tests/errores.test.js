import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, manejarErrores } from '../src/utils/apiError.js';

function respuestaFalsa() {
    return {
        status: function (codigo) {
            this.codigo = codigo;
            return this;
        },
        json: function (cuerpo) {
            this.cuerpo = cuerpo;
            return this;
        },
    };
}

test('un ApiError conserva su código y su mensaje', () => {
    const res = respuestaFalsa();
    manejarErrores(new ApiError(403, 'Acción no permitida'), {}, res, () => {});

    assert.equal(res.codigo, 403);
    assert.equal(res.cuerpo.mensaje, 'Acción no permitida');
});

test('un identificador mal escrito devuelve 400, no 500', () => {
    const res = respuestaFalsa();
    const error = new Error('Cast to ObjectId failed');
    error.name = 'CastError';

    manejarErrores(error, {}, res, () => {});

    assert.equal(res.codigo, 400);
    assert.equal(res.cuerpo.mensaje, 'Identificador no válido');
});

test('MongoDB caído devuelve 503 con mensaje entendible', () => {
    const res = respuestaFalsa();
    const error = new Error('Operation buffering timed out after 10000ms');
    error.name = 'MongooseError';

    manejarErrores(error, {}, res, () => {});

    assert.equal(res.codigo, 503);
    assert.equal(res.cuerpo.mensaje, 'Base de datos no disponible');
});
