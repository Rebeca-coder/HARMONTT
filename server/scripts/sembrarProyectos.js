import mongoose from 'mongoose';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';
import { registrarDecision } from '../src/services/auditoriaService.js';
import { ACCIONES, ROLES } from '../src/config/constants.js';
import { env } from '../src/config/env.js';
import { conectarBaseDeDatos } from '../src/config/db.js';

// Crea retos formativos de catálogo publicados por Harmont.
// Se usa para que el catálogo tenga contenido real desde el primer arranque.
// Es idempotente: si el proyecto ya existe, solo refresca su disponibilidad.
const proyectos = [
    {
        nombre: 'Reto formativo · Estrategia de contenido para una marca local',
        categoria: 'marketing',
        descripcion: 'Reto formativo creado por Harmont. Define una audiencia, propón un calendario editorial y entrega una estrategia de contenido justificada.',
        objetivo: 'Diseñar una estrategia de contenido aplicable a una marca local ficticia.',
        imagen: '/img/proyecto-marketing.jpg',
        actividades: ['Investigar la audiencia', 'Definir pilares de contenido', 'Construir un calendario editorial'],
        responsabilidades: ['Entregar el documento de estrategia', 'Explicar las decisiones tomadas'],
        entregables: ['Documento de audiencia', 'Calendario de 4 semanas', 'Justificación de canales'],
        habilidadesTecnicas: ['marketing', 'comunicacion', 'investigacion'],
        habilidadesBlandas: ['creatividad', 'organizacion'],
        habilidadesADesarrollar: ['marketing digital', 'planificacion'],
        nivelDificultad: 'principiante',
        tipoEconomico: 'formativo',
        compensacion: 'Certificado de participación y evidencia para portafolio',
        modalidad: 'remoto',
        duracionSemanas: 4,
        participantes: 1,
        diasLimite: 45,
    },
    {
        nombre: 'Reto formativo · Dashboard de impacto para una organización social',
        categoria: 'datos',
        descripcion: 'Reto formativo creado por Harmont. Convierte un conjunto de datos de impacto en un panel claro y útil para tomar decisiones.',
        objetivo: 'Presentar indicadores de impacto en un panel comprensible.',
        imagen: '/img/proyecto-datos.jpg',
        actividades: ['Limpiar el conjunto de datos', 'Calcular indicadores', 'Diseñar visualizaciones'],
        responsabilidades: ['Documentar las fuentes', 'Explicar cada indicador'],
        entregables: ['Cuaderno de análisis', 'Panel visual', 'Documento de hallazgos'],
        habilidadesTecnicas: ['datos', 'excel', 'visualizacion'],
        habilidadesBlandas: ['analisis', 'curiosidad'],
        habilidadesADesarrollar: ['analisis de datos', 'storytelling'],
        nivelDificultad: 'intermedio',
        tipoEconomico: 'voluntario',
        compensacion: 'Evidencia de impacto social para portafolio',
        modalidad: 'hibrido',
        duracionSemanas: 6,
        participantes: 2,
        diasLimite: 52,
    },
    {
        nombre: 'Reto formativo · Rediseño de la experiencia de usuario',
        categoria: 'diseno',
        descripcion: 'Reto formativo creado por Harmont. Investiga un flujo con problemas, propón mejoras y entrega un prototipo justificado.',
        objetivo: 'Mejorar la experiencia de un producto digital a partir de evidencia.',
        imagen: '/img/proyecto-diseno.jpg',
        actividades: ['Analizar el flujo actual', 'Proponer mejoras', 'Construir un prototipo'],
        responsabilidades: ['Justificar cada decisión de diseño', 'Presentar el prototipo'],
        entregables: ['Mapa de usuario', 'Prototipo en papel o digital', 'Informe de decisiones'],
        habilidadesTecnicas: ['diseno', 'ux', 'prototipado'],
        habilidadesBlandas: ['empatia', 'comunicacion'],
        habilidadesADesarrollar: ['investigacion de usuarios', 'design thinking'],
        nivelDificultad: 'intermedio',
        tipoEconomico: 'formativo',
        compensacion: 'Certificado de participación y evidencia para portafolio',
        modalidad: 'remoto',
        duracionSemanas: 3,
        participantes: 1,
        diasLimite: 38,
    },
    {
        nombre: 'Reto formativo · Automatización de reportes con hojas de cálculo',
        categoria: 'tecnologia',
        descripcion: 'Reto formativo creado por Harmont. Convierte un proceso manual de reportes en una plantilla automatizada y documentada.',
        objetivo: 'Reducir el trabajo repetitivo en la generación de reportes.',
        imagen: '/img/miniatura.jpg',
        actividades: ['Analizar el proceso manual', 'Diseñar la plantilla', 'Probar con datos de ejemplo'],
        responsabilidades: ['Documentar el uso de la plantilla', 'Explicar los ahorros de tiempo'],
        entregables: ['Plantilla automatizada', 'Guía de uso', 'Comparativa antes y después'],
        habilidadesTecnicas: ['excel', 'automatizacion', 'tecnologia'],
        habilidadesBlandas: ['orden', 'paciencia'],
        habilidadesADesarrollar: ['automatizacion', 'documentacion'],
        nivelDificultad: 'principiante',
        tipoEconomico: 'formativo',
        compensacion: 'Evidencia de trabajo técnico para portafolio',
        modalidad: 'remoto',
        duracionSemanas: 2,
        participantes: 1,
        diasLimite: 31,
    },
    {
        nombre: 'Reto formativo · Comunicación para una campaña educativa',
        categoria: 'comunicacion',
        descripcion: 'Reto formativo creado por Harmont. Prepara los mensajes de una campaña educativa para estudiantes y sus familias.',
        objetivo: 'Diseñar un plan de comunicación claro, preciso y accesible.',
        imagen: '/img/experiencia.jpg',
        actividades: ['Definir los públicos', 'Redactar mensajes', 'Proponer canales'],
        responsabilidades: ['Entregar el plan de comunicación', 'Revisar el tono y la claridad'],
        entregables: ['Mapa de públicos', 'Borrador de mensajes', 'Plan de canales'],
        habilidadesTecnicas: ['comunicacion', 'redaccion', 'educacion'],
        habilidadesBlandas: ['escucha', 'claridad'],
        habilidadesADesarrollar: ['comunicacion educativa', 'redaccion'],
        nivelDificultad: 'principiante',
        tipoEconomico: 'voluntario',
        compensacion: 'Evidencia de impacto social para portafolio',
        modalidad: 'remoto',
        duracionSemanas: 3,
        participantes: 2,
        diasLimite: 59,
    },
    {
        nombre: 'Reto formativo · Investigación de mercado para un producto local',
        categoria: 'finanzas',
        descripcion: 'Reto formativo creado por Harmont. Investiga una necesidad local, estima su tamaño y presenta conclusiones accionables.',
        objetivo: 'Aplicar métodos de investigación de mercado a un caso concreto.',
        imagen: '/img/hero.jpg',
        actividades: ['Diseñar una encuesta', 'Analizar respuestas', 'Presentar conclusiones'],
        responsabilidades: ['Cuidar el manejo de la información', 'Explicar limitaciones del estudio'],
        entregables: ['Cuestionario', 'Resumen de resultados', 'Informe final'],
        habilidadesTecnicas: ['investigacion', 'datos', 'finanzas'],
        habilidadesBlandas: ['analisis', 'responsabilidad'],
        habilidadesADesarrollar: ['investigacion de mercado', 'interpretacion de datos'],
        nivelDificultad: 'avanzado',
        tipoEconomico: 'formativo',
        compensacion: 'Certificado de participación y evidencia para portafolio',
        modalidad: 'presencial',
        duracionSemanas: 5,
        participantes: 3,
        diasLimite: 66,
    },
];

async function main() {
    await conectarBaseDeDatos(env.mongoUri);
    console.log('MongoDB conectado.');

    const admin = await User.findOne({ rol: ROLES.ADMIN, activo: true });
    if (!admin) {
        throw new Error('No hay administrador activo. Crea uno con npm run crear:admin antes de sembrar.');
    }

    const ahora = new Date();
    const motivo = 'Retos formativos de catálogo publicados por Harmont para permitir primeras postulaciones.';
    let creados = 0;
    let actualizados = 0;

    for (const datos of proyectos) {
        const { diasLimite, ...campos } = datos;
        const fechaLimite = new Date(ahora.getTime() + diasLimite * 24 * 60 * 60 * 1000);

        const existente = await Project.findOne({ nombre: datos.nombre });

        if (existente) {
            existente.estado = 'publicado';
            existente.fechaLimite = fechaLimite;
            await existente.save();
            actualizados += 1;
            console.log(`Actualizado: ${datos.nombre}`);
            continue;
        }

        const proyecto = await Project.create({
            ...campos,
            origen: 'simulado',
            empresa: null,
            creadoPor: admin._id,
            estado: 'publicado',
            fechaInicio: ahora,
            fechaLimite,
            revision: {
                motivo,
                revisadoPor: admin._id,
                revisadoEn: ahora,
            },
        });

        await registrarDecision({
            recurso: 'project',
            recursoId: proyecto._id,
            accion: ACCIONES.CREAR_PROYECTO_SIMULADO,
            actor: admin,
            estadoAnterior: null,
            estadoNuevo: 'borrador',
            motivo,
        });

        await registrarDecision({
            recurso: 'project',
            recursoId: proyecto._id,
            accion: ACCIONES.PUBLICAR_PROYECTO,
            actor: admin,
            estadoAnterior: 'aprobado',
            estadoNuevo: 'publicado',
            motivo,
        });

        creados += 1;
        console.log(`Creado: ${datos.nombre}`);
    }

    console.log(`Listo. ${creados} creados, ${actualizados} actualizados.`);
    console.log('Los proyectos ya deberían aparecer en /#/proyectos.');
}

main()
    .catch((error) => {
        console.error('No se pudieron sembrar los proyectos:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
