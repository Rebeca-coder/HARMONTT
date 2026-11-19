import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCIONES, PERMISOS, ROLES } from '../src/config/constants.js';

test('la empresa NO puede preseleccionar ni ver todas las postulaciones', () => {
    const permisos = PERMISOS[ROLES.EMPRESA];
    assert.equal(permisos.includes(ACCIONES.PRESELECCIONAR), false);
    assert.equal(permisos.includes(ACCIONES.VER_TODAS_POSTULACIONES), false);
});

test('la empresa SÍ ve preseleccionados y decide la selección final', () => {
    const permisos = PERMISOS[ROLES.EMPRESA];
    assert.equal(permisos.includes(ACCIONES.VER_PRESELECCIONADOS), true);
    assert.equal(permisos.includes(ACCIONES.SELECCIONAR_FINAL), true);
    assert.equal(permisos.includes(ACCIONES.NO_SELECCIONAR_FINAL), true);
});

test('el admin NO puede hacer la selección final', () => {
    const permisos = PERMISOS[ROLES.ADMIN];
    assert.equal(permisos.includes(ACCIONES.SELECCIONAR_FINAL), false);
    assert.equal(permisos.includes(ACCIONES.NO_SELECCIONAR_FINAL), false);
});

test('el admin tiene la preselección y la publicación', () => {
    const permisos = PERMISOS[ROLES.ADMIN];
    assert.equal(permisos.includes(ACCIONES.PRESELECCIONAR), true);
    assert.equal(permisos.includes(ACCIONES.COMPARTIR_EMPRESA), true);
    assert.equal(permisos.includes(ACCIONES.PUBLICAR_PROYECTO), true);
});

test('el estudiante puede postularse y retirarse, pero no revisar perfiles', () => {
    const permisos = PERMISOS[ROLES.ESTUDIANTE];
    assert.equal(permisos.includes(ACCIONES.POSTULARSE), true);
    assert.equal(permisos.includes(ACCIONES.RETIRARSE), true);
    assert.equal(permisos.includes(ACCIONES.VER_PERFILES_ESTUDIANTES), false);
});
