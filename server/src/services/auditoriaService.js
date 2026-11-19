import DecisionLog from '../models/DecisionLog.js';

// Cada decisión relevante escribe una línea imborrable en decisionlogs.
// Se llama desde los controladores DESPUÉS de validar permisos y transiciones.
export async function registrarDecision({
    recurso,
    recursoId,
    accion,
    actor,
    estadoAnterior,
    estadoNuevo,
    motivo,
}) {
    return DecisionLog.create({
        recurso,
        recursoId,
        accion,
        actor: actor._id || actor,
        rolActor: actor.rol,
        estadoAnterior,
        estadoNuevo,
        motivo: motivo || null,
    });
}
