import test from 'node:test';
import assert from 'node:assert/strict';
import { escaparRegex } from '../src/utils/validacion.js';

test('el texto del buscador no se interpreta como expresión regular', () => {
    const patron = new RegExp(escaparRegex('react.js'), 'i');
    assert.equal(patron.test('React.js'), true);
    assert.equal(patron.test('ReactXjs'), false);
});
