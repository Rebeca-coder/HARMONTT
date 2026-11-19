import { TRANSICIONES } from '../config/constants.js';

// Busca una regla exacta: flujo + estado actual + acción + rol.
export function buscarTransicion(flujo, desde, accion, rol) {
    const reglas = TRANSICIONES[flujo] || [];
    return reglas.find(
        (regla) => regla.desde === desde && regla.accion === accion && regla.rol === rol
    );
}

export function puedeTransicionar(flujo, desde, accion, rol) {
    return Boolean(buscarTransicion(flujo, desde, accion, rol));
}

// Útil para el frontend: preguntar "¿qué puedo hacer yo desde aquí?".
export function transicionesDisponibles(flujo, estado, rol) {
    const reglas = TRANSICIONES[flujo] || [];
    return reglas
        .filter((regla) => regla.desde === estado && regla.rol === rol)
        .map((regla) => ({ accion: regla.accion, hasta: regla.hasta }));
}
