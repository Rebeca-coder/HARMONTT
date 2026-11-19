import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularCompletitud, camposFaltantesParaPostular, puedePostularse } from '../src/services/perfilService.js';

test('un perfil vacío no alcanza el mínimo para postularse', () => {
    const resultado = puedePostularse({}, { nombre: 'Ana' });
    assert.equal(resultado.ok, false);
    assert.ok(resultado.faltantes.includes('ubicacion'));
    assert.ok(resultado.faltantes.includes('habilidades'));
});

test('no se exige experiencia previa para postularse', () => {
    const perfil = {
        ubicacion: 'Bogotá',
        formacion: 'Diseño',
        areaInteres: 'tecnologia',
        descripcion: 'Me interesa aprender',
        habilidadesTecnicas: ['Figma'],
        experienciaPrevia: [],
    };
    const resultado = puedePostularse(perfil, { nombre: 'Ana' });
    assert.deepEqual(resultado.faltantes, []);
    assert.equal(resultado.ok, true);
});

test('el porcentaje de completitud se calcula y está entre 0 y 100', () => {
    const vacio = calcularCompletitud({}, {});
    const completo = calcularCompletitud(
        {
            ubicacion: 'Bogotá',
            formacion: 'Diseño',
            areaInteres: 'tecnologia',
            descripcion: 'Perfil completo',
            herramientas: ['Figma'],
            habilidadesTecnicas: ['React'],
            portafolio: ['https://example.com'],
            disponibilidad: 'Remoto',
        },
        { nombre: 'Ana' }
    );
    assert.equal(vacio, 0);
    assert.equal(completo, 100);
});

test('camposFaltantesParaPostular devuelve nombres entendibles', () => {
    const faltantes = camposFaltantesParaPostular(
        { ubicacion: 'Medellín', descripcion: 'Hola' },
        { nombre: 'Luis' }
    );
    assert.deepEqual(faltantes, ['formacion', 'areaInteres', 'habilidades']);
});
