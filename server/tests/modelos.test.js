import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Application from '../src/models/Application.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import CompanyProfile from '../src/models/CompanyProfile.js';
import ExperienceRecord from '../src/models/ExperienceRecord.js';

const id = () => new mongoose.Types.ObjectId();

async function erroresDe(documento) {
    try {
        await documento.validate();
        return {};
    } catch (error) {
        return error.errors || {};
    }
}

test('una postulación requiere proyecto y estudiante', async () => {
    const errores = await erroresDe(new Application({}));
    assert.ok(errores.proyecto);
    assert.ok(errores.estudiante);
});

test('las decisiones de Harmont y de la empresa empiezan vacías y son independientes', async () => {
    const postulacion = new Application({ proyecto: id(), estudiante: id() });
    assert.deepEqual(await erroresDe(postulacion), {});
    assert.equal(postulacion.estado, 'recibida');
    assert.equal(postulacion.decisionHarmont.estado, null);
    assert.equal(postulacion.decisionEmpresa.estado, null);
});

test('la empresa no puede escribir un estado de decisión de Harmont inventado', async () => {
    const postulacion = new Application({
        proyecto: id(),
        estudiante: id(),
        decisionHarmont: { estado: 'seleccionada' },
    });
    const errores = await erroresDe(postulacion);
    assert.ok(errores['decisionHarmont.estado']);
});

test('existe un índice único para evitar postulaciones duplicadas', () => {
    const indice = Application.schema.indexes().find(
        ([campos]) => campos.proyecto === 1 && campos.estudiante === 1
    );
    assert.ok(indice);
    assert.equal(indice[1].unique, true);
});

test('el hash de contraseña no se devuelve por defecto', () => {
    assert.equal(User.schema.path('passwordHash').options.select, false);
});

test('un proyecto nuevo nace en borrador y la empresa nace pendiente', async () => {
    const proyecto = new Project({
        nombre: 'Reto de prueba',
        categoria: 'diseno',
        origen: 'real',
        tipoEconomico: 'voluntario',
        modalidad: 'remoto',
        creadoPor: id(),
    });
    assert.deepEqual(await erroresDe(proyecto), {});
    assert.equal(proyecto.estado, 'borrador');

    const empresa = new CompanyProfile({
        usuario: id(),
        nombreComercial: 'Empresa S.A.',
        correoEmpresarial: 'hola@empresa.com',
    });
    assert.deepEqual(await erroresDe(empresa), {});
    assert.equal(empresa.estadoVerificacion, 'pendiente');
});

test('la referencia de experiencia queda reservada y vacía', async () => {
    const experiencia = new ExperienceRecord({ estudiante: id(), proyecto: id() });
    assert.deepEqual(await erroresDe(experiencia), {});
    assert.equal(experiencia.estado, 'en_curso');
    assert.equal(experiencia.referencia.evaluador, null);
    assert.equal(experiencia.referencia.calificacion, null);
});
