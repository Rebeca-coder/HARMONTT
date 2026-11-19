// Express 5 ya captura promesas rechazadas, pero este wrapper hace explícita la intención
// y mantiene los controladores limpios.
export function asyncHandler(funcion) {
    return (req, res, next) => Promise.resolve(funcion(req, res, next)).catch(next);
}
