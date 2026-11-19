// Convierte parámetros de la URL en números seguros para MongoDB.
// Los valores de req.query siempre llegan como texto, por eso hay que validarlos.
export function parsearPaginacion(query = {}, { porDefecto = 6, maximo = 48 } = {}) {
    const enteroPositivo = (valor, alternativa) => {
        const numero = Number(valor);
        return Number.isFinite(numero) && numero > 0 ? Math.floor(numero) : alternativa;
    };

    const pagina = enteroPositivo(query.pagina, 1);
    const limiteMaximo = enteroPositivo(maximo, 48);
    const limiteBase = Math.min(enteroPositivo(porDefecto, 6), limiteMaximo);
    const limite = Math.min(enteroPositivo(query.limite, limiteBase), limiteMaximo);

    return {
        pagina,
        limite,
        skip: (pagina - 1) * limite,
    };
}
