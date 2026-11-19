import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ACCIONES, ROLES, ESTADOS_VISIBLES_EMPRESA } from '../src/config/constants.js';
import {
    aplicarTransicionProyecto,
    aplicarTransicionPostulacion,
    aplicarTransicionEmpresa,
} from '../src/services/estadosService.js';
import {
    esPropietarioPostulacion,
    esPropietarioProyecto,
    filtroPostulacionesVisiblesParaEmpresa,
    filtroPostulacionesParaAdmin,
} from '../src/services/propiedadService.js';

const id = () => new mongoose.Types.ObjectId();

const admin = { _id: id(), rol: ROLES.ADMIN };
const empresa = { _id: id(), rol: ROLES.EMPRESA };
const estudiante = { _id: id(), rol: ROLES.ESTUDIANTE };

function nuevaPostulacion(estado = 'recibida') {
    return {
        estado,
        decisionHarmont: { estado: null, por: null, fecha: null, motivo: null },
        decisionEmpresa: { estado: null, por: null, fecha: null, motivo: null },
    };
}

test('el admin revisa y deja constancia en decisionHarmont', () => {
    const postulacion = nuevaPostulacion();
    const resultado = aplicarTransicionPostulacion({
        postulacion,
        accion: ACCIONES.REVISAR_POSTULACION,
        actor: admin,
    });

    assert.equal(resultado.estadoNuevo, 'en_revision');
    assert.equal(postulacion.decisionHarmont.estado, 'en_revision');
    assert.equal(postulacion.decisionHarmont.por.toString(), admin._id.toString());
    assert.equal(postulacion.decisionEmpresa.estado, null);
});

test('la empresa no puede preseleccionar y el admin no puede seleccionar', () => {
    assert.throws(
        () => aplicarTransicionPostulacion({
            postulacion: nuevaPostulacion('en_revision'),
            accion: ACCIONES.PRESELECCIONAR,
            actor: empresa,
        }),
        (error) => error.status === 403
    );

    assert.throws(
        () => aplicarTransicionPostulacion({
            postulacion: nuevaPostulacion('en_evaluacion_empresa'),
            accion: ACCIONES.SELECCIONAR_FINAL,
            actor: admin,
        }),
        (error) => error.status === 403
    );
});

test('la empresa decide sin poder tocar la evaluación de Harmont', () => {
    const postulacion = nuevaPostulacion('en_evaluacion_empresa');
    postulacion.decisionHarmont = {
        estado: 'en_evaluacion_empresa',
        por: admin._id,
        fecha: new Date(),
        motivo: null,
    };
    const evaluacionOriginal = postulacion.decisionHarmont;

    aplicarTransicionPostulacion({
        postulacion,
        accion: ACCIONES.SELECCIONAR_FINAL,
        actor: empresa,
    });

    assert.equal(postulacion.estado, 'seleccionada');
    assert.equal(postulacion.decisionEmpresa.estado, 'seleccionada');
    assert.equal(postulacion.decisionHarmont, evaluacionOriginal);
});

test('la empresa no puede superar el número de participantes', () => {
    assert.throws(
        () => aplicarTransicionPostulacion({
            postulacion: nuevaPostulacion('en_evaluacion_empresa'),
            accion: ACCIONES.SELECCIONAR_FINAL,
            actor: empresa,
            seleccionados: 2,
            participantes: 2,
        }),
        (error) => error.status === 409
    );
});

test('el estudiante puede retirarse desde preseleccionada', () => {
    const postulacion = nuevaPostulacion('preseleccionada');
    aplicarTransicionPostulacion({
        postulacion,
        accion: ACCIONES.RETIRARSE,
        actor: estudiante,
    });
    assert.equal(postulacion.estado, 'retirada');
    assert.equal(postulacion.decisionHarmont.estado, null);
});

test('el proyecto no salta etapas de aprobación', () => {
    const proyecto = { estado: 'pendiente_aprobacion', revision: {} };

    assert.throws(
        () => aplicarTransicionProyecto({
            proyecto,
            accion: ACCIONES.PUBLICAR_PROYECTO,
            actor: admin,
        }),
        (error) => error.status === 409
    );
    assert.equal(proyecto.estado, 'pendiente_aprobacion');
});

test('rechazar un proyecto guarda motivo y revisor', () => {
    const proyecto = { estado: 'en_revision', revision: {} };
    aplicarTransicionProyecto({
        proyecto,
        accion: ACCIONES.RECHAZAR_PROYECTO,
        actor: admin,
        motivo: 'Faltan entregables',
    });

    assert.equal(proyecto.estado, 'rechazado');
    assert.equal(proyecto.revision.motivo, 'Faltan entregables');
    assert.equal(proyecto.revision.revisadoPor.toString(), admin._id.toString());
});

test('la propiedad se compara por ObjectId', () => {
    const empresaId = id();
    const perfil = { _id: empresaId };
    assert.equal(esPropietarioProyecto({ empresa: empresaId }, perfil), true);
    assert.equal(esPropietarioProyecto({ empresa: id() }, perfil), false);

    const estudianteId = id();
    assert.equal(
        esPropietarioPostulacion({ estudiante: estudianteId }, { _id: estudianteId }),
        true
    );
});

test('el filtro empresarial excluye las etapas internas de Harmont', () => {
    const ids = [id(), id()];
    const filtro = filtroPostulacionesVisiblesParaEmpresa(ids);

    assert.deepEqual(filtro.proyecto.$in, ids);
    assert.deepEqual(filtro.estado.$in, ESTADOS_VISIBLES_EMPRESA);
    assert.equal(filtro.estado.$in.includes('preseleccionada'), false);
    assert.equal(filtro.estado.$in.includes('en_revision'), false);
    assert.equal(filtro.estado.$in.includes('recibida'), false);
});

test('el filtro de admin respeta los parámetros recibidos', () => {
    const proyecto = id();
    const filtro = filtroPostulacionesParaAdmin({ proyecto, estado: 'recibida' });
    assert.equal(filtro.proyecto, proyecto);
    assert.equal(filtro.estado, 'recibida');
    assert.deepEqual(filtroPostulacionesParaAdmin({}), {});
});

test('el admin aprueba una empresa pendiente y deja quién y cuándo', () => {
    const empresa = { estadoVerificacion: 'pendiente', verificadoPor: null, verificadoEn: null };
    const resultado = aplicarTransicionEmpresa({
        empresa,
        accion: ACCIONES.APROBAR_EMPRESA,
        actor: admin,
    });

    assert.equal(resultado.estadoNuevo, 'aprobada');
    assert.equal(empresa.estadoVerificacion, 'aprobada');
    assert.equal(empresa.verificadoPor.toString(), admin._id.toString());
    assert.ok(empresa.verificadoEn instanceof Date);
    assert.equal(empresa.motivoRechazo, null);
});

test('rechazar empresa guarda el motivo; una empresa ya aprobada no cambia', () => {
    const empresa = { estadoVerificacion: 'pendiente', verificadoPor: null, verificadoEn: null };
    aplicarTransicionEmpresa({
        empresa,
        accion: ACCIONES.RECHAZAR_EMPRESA,
        actor: admin,
        motivo: 'No se pudo verificar',
    });

    assert.equal(empresa.estadoVerificacion, 'rechazada');
    assert.equal(empresa.motivoRechazo, 'No se pudo verificar');

    assert.throws(
        () => aplicarTransicionEmpresa({
            empresa,
            accion: ACCIONES.APROBAR_EMPRESA,
            actor: admin,
        }),
        (error) => error.status === 409
    );
});

test('la empresa no puede aprobarse a sí misma', () => {
    assert.throws(
        () => aplicarTransicionEmpresa({
            empresa: { estadoVerificacion: 'pendiente' },
            accion: ACCIONES.APROBAR_EMPRESA,
            actor: empresa,
        }),
        (error) => error.status === 403
    );
});
