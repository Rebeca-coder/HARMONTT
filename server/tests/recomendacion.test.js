import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calcularPuntaje,
    normalizar,
    ordenarRecomendaciones,
} from '../src/services/recomendacionService.js';

test('la normalización ignora tildes, mayúsculas y signos', () => {
    assert.equal(normalizar('  Diseño de UI/UX '), 'diseno de ui ux');
});

test('una coincidencia total suma 50% + 30% + 20%', () => {
    const perfil = {
        areaInteres: 'tecnologia',
        intereses: ['react'],
        habilidadesTecnicas: ['react'],
        habilidadesBlandas: [],
        herramientas: [],
    };
    const proyecto = {
        categoria: 'tecnologia',
        nombre: 'Aplicación React',
        descripcion: 'Construir una interfaz con React',
        habilidadesTecnicas: ['react'],
        habilidadesBlandas: [],
        habilidadesADesarrollar: [],
    };

    const resultado = calcularPuntaje(perfil, proyecto);
    assert.equal(resultado.puntaje, 1);
    assert.equal(resultado.porcentaje, 100);
    assert.deepEqual(resultado.desglose, { habilidades: 100, intereses: 100, categoria: 100 });
});

test('un proyecto sin habilidades declaradas se considera neutro, no negativo', () => {
    const perfil = { areaInteres: 'diseno', intereses: [], habilidadesTecnicas: [] };
    const proyecto = {
        categoria: 'diseno',
        nombre: 'Rediseño de marca',
        descripcion: 'Proyecto de identidad visual',
        habilidadesTecnicas: [],
        habilidadesBlandas: [],
    };

    const resultado = calcularPuntaje(perfil, proyecto);
    assert.equal(resultado.desglose.habilidades, 50);
    assert.equal(resultado.desglose.categoria, 100);
});

test('las recomendaciones se ordenan de mayor a menor puntaje', () => {
    const perfil = {
        areaInteres: 'datos',
        intereses: ['python'],
        habilidadesTecnicas: ['python'],
    };
    const proyectos = [
        {
            categoria: 'marketing',
            nombre: 'Campaña',
            descripcion: 'Sin relación',
            habilidadesTecnicas: ['copywriting'],
            fechaLimite: new Date('2026-12-01'),
        },
        {
            categoria: 'datos',
            nombre: 'Análisis con Python',
            descripcion: 'Python para datos',
            habilidadesTecnicas: ['python'],
            fechaLimite: new Date('2026-12-20'),
        },
    ];

    const ordenadas = ordenarRecomendaciones(perfil, proyectos);
    assert.equal(ordenadas[0].proyecto.nombre, 'Análisis con Python');
    assert.ok(ordenadas[0].puntaje > ordenadas[1].puntaje);
});
