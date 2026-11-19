// El usuario puede escribir caracteres como . o * en el buscador.
// Escaparlos evita que su texto se interprete como una expresión regular.
export function escaparRegex(valor) {
    return String(valor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
