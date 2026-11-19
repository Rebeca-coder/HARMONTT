import test from 'node:test';
import assert from 'node:assert/strict';
import { parsearPaginacion } from '../src/utils/paginacion.js';

test('sin parámetros devuelve la primera página con el tamaño por defecto', () => {
    assert.deepEqual(parsearPaginacion({}), { pagina: 1, limite: 6, skip: 0 });
});

test('la página 3 con límite 4 salta 8 documentos', () => {
    assert.deepEqual(
        parsearPaginacion({ pagina: '3', limite: '4' }),
        { pagina: 3, limite: 4, skip: 8 }
    );
});

test('valores inválidos, negativos o excesivos se corrigen', () => {
    assert.deepEqual(
        parsearPaginacion({ pagina: '-2', limite: '999' }, { maximo: 20 }),
        { pagina: 1, limite: 20, skip: 0 }
    );
});
