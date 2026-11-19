import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCIONES, ROLES } from '../src/config/constants.js';
import { puedeTransicionar, transicionesDisponibles } from '../src/utils/transiciones.js';

test('solo el admin puede pasar una postulación de recibida a en revisión', () => {
    assert.equal(
        puedeTransicionar('postulacion', 'recibida', ACCIONES.REVISAR_POSTULACION, ROLES.ADMIN),
        true
    );
    assert.equal(
        puedeTransicionar('postulacion', 'recibida', ACCIONES.REVISAR_POSTULACION, ROLES.EMPRESA),
        false
    );
});

test('solo el admin puede preseleccionar y compartir con la empresa', () => {
    assert.equal(
        puedeTransicionar('postulacion', 'en_revision', ACCIONES.PRESELECCIONAR, ROLES.ADMIN),
        true
    );
    assert.equal(
        puedeTransicionar('postulacion', 'preseleccionada', ACCIONES.COMPARTIR_EMPRESA, ROLES.ADMIN),
        true
    );
    assert.equal(
        puedeTransicionar('postulacion', 'preseleccionada', ACCIONES.COMPARTIR_EMPRESA, ROLES.EMPRESA),
        false
    );
});

test('solo la empresa puede hacer la selección final, y solo desde evaluación', () => {
    assert.equal(
        puedeTransicionar('postulacion', 'en_evaluacion_empresa', ACCIONES.SELECCIONAR_FINAL, ROLES.EMPRESA),
        true
    );
    assert.equal(
        puedeTransicionar('postulacion', 'en_evaluacion_empresa', ACCIONES.SELECCIONAR_FINAL, ROLES.ADMIN),
        false
    );
    assert.equal(
        puedeTransicionar('postulacion', 'preseleccionada', ACCIONES.SELECCIONAR_FINAL, ROLES.EMPRESA),
        false
    );
});

test('el estudiante puede retirarse antes de la decisión final', () => {
    assert.equal(
        puedeTransicionar('postulacion', 'preseleccionada', ACCIONES.RETIRARSE, ROLES.ESTUDIANTE),
        true
    );
    assert.equal(
        puedeTransicionar('postulacion', 'seleccionada', ACCIONES.RETIRARSE, ROLES.ESTUDIANTE),
        false
    );
});

test('un proyecto de empresa no puede publicarse directamente', () => {
    assert.equal(
        puedeTransicionar('proyecto', 'borrador', ACCIONES.ENVIAR_PROYECTO_REVISION, ROLES.EMPRESA),
        true
    );
    assert.equal(
        puedeTransicionar('proyecto', 'borrador', ACCIONES.PUBLICAR_PROYECTO, ROLES.EMPRESA),
        false
    );
    assert.equal(
        puedeTransicionar('proyecto', 'en_revision', ACCIONES.PUBLICAR_PROYECTO, ROLES.ADMIN),
        false
    );
    assert.equal(
        puedeTransicionar('proyecto', 'aprobado', ACCIONES.PUBLICAR_PROYECTO, ROLES.ADMIN),
        true
    );
});

test('transicionesDisponibles devuelve solo lo válido para ese rol', () => {
    const empresas = transicionesDisponibles('proyecto', 'rechazado', ROLES.EMPRESA);
    assert.deepEqual(empresas, [
        { accion: ACCIONES.ENVIAR_PROYECTO_REVISION, hasta: 'pendiente_aprobacion' },
    ]);
});
