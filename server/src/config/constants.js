// Todas las palabras clave del negocio viven aquí.
// Si mañana cambia un estado, se cambia en un solo sitio.

export const ROLES = {
    ESTUDIANTE: 'estudiante',
    EMPRESA: 'empresa',
    ADMIN: 'admin',
};

export const ESTADOS_EMPRESA = ['pendiente', 'aprobada', 'rechazada'];

export const ESTADOS_PROYECTO = [
    'borrador',
    'pendiente_aprobacion',
    'en_revision',
    'aprobado',
    'publicado',
    'en_desarrollo',
    'finalizado',
    'rechazado',
];

export const ESTADOS_POSTULACION = [
    'recibida',
    'en_revision',
    'preseleccionada',
    'no_preseleccionada',
    'en_evaluacion_empresa',
    'seleccionada',
    'no_seleccionada',
    'retirada',
];

export const ORIGENES_PROYECTO = ['real', 'simulado'];
export const TIPOS_ECONOMICOS = ['remunerado', 'voluntario', 'formativo'];
export const MODALIDADES = ['remoto', 'presencial', 'hibrido'];
export const NIVELES_DIFICULTAD = ['principiante', 'intermedio', 'avanzado'];

export const CATEGORIAS = [
    'marketing',
    'tecnologia',
    'diseno',
    'datos',
    'comunicacion',
    'finanzas',
    'rrhh',
    'logistica',
    'educacion',
];

// Cada acción tiene un nombre explícito. No existe un "admin lo puede todo".
export const ACCIONES = {
    EDITAR_PERFIL_PROPIO: 'editar_perfil_propio',
    POSTULARSE: 'postularse',
    RETIRARSE: 'retirarse',
    VER_POSTULACIONES_PROPIAS: 'ver_postulaciones_propias',

    CREAR_PROYECTO: 'crear_proyecto',
    EDITAR_PROYECTO_PROPIO: 'editar_proyecto_propio',
    ENVIAR_PROYECTO_REVISION: 'enviar_proyecto_revision',
    VER_PRESELECCIONADOS: 'ver_preseleccionados',
    SELECCIONAR_FINAL: 'seleccionar_final',
    NO_SELECCIONAR_FINAL: 'no_seleccionar_final',

    CREAR_PROYECTO_SIMULADO: 'crear_proyecto_simulado',
    EDITAR_CUALQUIER_PROYECTO: 'editar_cualquier_proyecto',
    TOMAR_REVISION: 'tomar_revision',
    APROBAR_PROYECTO: 'aprobar_proyecto',
    RECHAZAR_PROYECTO: 'rechazar_proyecto',
    PUBLICAR_PROYECTO: 'publicar_proyecto',
    INICIAR_PROYECTO: 'iniciar_proyecto',
    FINALIZAR_PROYECTO: 'finalizar_proyecto',

    VER_TODAS_POSTULACIONES: 'ver_todas_postulaciones',
    REVISAR_POSTULACION: 'revisar_postulacion',
    PRESELECCIONAR: 'preseleccionar',
    NO_PRESELECCIONAR: 'no_preseleccionar',
    COMPARTIR_EMPRESA: 'compartir_empresa',

    APROBAR_EMPRESA: 'aprobar_empresa',
    RECHAZAR_EMPRESA: 'rechazar_empresa',
    VER_PERFILES_ESTUDIANTES: 'ver_perfiles_estudiantes',
    REGISTRAR_EXPERIENCIA: 'registrar_experiencia',
    COMPLETAR_EXPERIENCIA: 'completar_experiencia',
};

// Matriz de permisos por rol. El frontend la usa para ocultar botones,
// pero quien decide de verdad es el middleware del servidor.
export const PERMISOS = {
    [ROLES.ESTUDIANTE]: [
        ACCIONES.EDITAR_PERFIL_PROPIO,
        ACCIONES.POSTULARSE,
        ACCIONES.RETIRARSE,
        ACCIONES.VER_POSTULACIONES_PROPIAS,
    ],
    [ROLES.EMPRESA]: [
        ACCIONES.EDITAR_PERFIL_PROPIO,
        ACCIONES.CREAR_PROYECTO,
        ACCIONES.EDITAR_PROYECTO_PROPIO,
        ACCIONES.ENVIAR_PROYECTO_REVISION,
        ACCIONES.VER_PRESELECCIONADOS,
        ACCIONES.SELECCIONAR_FINAL,
        ACCIONES.NO_SELECCIONAR_FINAL,
    ],
    [ROLES.ADMIN]: [
        ACCIONES.CREAR_PROYECTO_SIMULADO,
        ACCIONES.EDITAR_CUALQUIER_PROYECTO,
        ACCIONES.TOMAR_REVISION,
        ACCIONES.APROBAR_PROYECTO,
        ACCIONES.RECHAZAR_PROYECTO,
        ACCIONES.PUBLICAR_PROYECTO,
        ACCIONES.INICIAR_PROYECTO,
        ACCIONES.FINALIZAR_PROYECTO,
        ACCIONES.VER_TODAS_POSTULACIONES,
        ACCIONES.REVISAR_POSTULACION,
        ACCIONES.PRESELECCIONAR,
        ACCIONES.NO_PRESELECCIONAR,
        ACCIONES.COMPARTIR_EMPRESA,
        ACCIONES.APROBAR_EMPRESA,
        ACCIONES.RECHAZAR_EMPRESA,
        ACCIONES.VER_PERFILES_ESTUDIANTES,
        ACCIONES.REGISTRAR_EXPERIENCIA,
        ACCIONES.COMPLETAR_EXPERIENCIA,
    ],
};

// Flujos: desde qué estado, con qué acción y qué rol, se llega a qué estado.
export const TRANSICIONES = {
    proyecto: [
        {
            desde: 'borrador',
            accion: ACCIONES.ENVIAR_PROYECTO_REVISION,
            rol: ROLES.EMPRESA,
            hasta: 'pendiente_aprobacion',
        },
        {
            desde: 'pendiente_aprobacion',
            accion: ACCIONES.TOMAR_REVISION,
            rol: ROLES.ADMIN,
            hasta: 'en_revision',
        },
        {
            desde: 'en_revision',
            accion: ACCIONES.APROBAR_PROYECTO,
            rol: ROLES.ADMIN,
            hasta: 'aprobado',
        },
        {
            desde: 'en_revision',
            accion: ACCIONES.RECHAZAR_PROYECTO,
            rol: ROLES.ADMIN,
            hasta: 'rechazado',
        },
        {
            desde: 'aprobado',
            accion: ACCIONES.PUBLICAR_PROYECTO,
            rol: ROLES.ADMIN,
            hasta: 'publicado',
        },
        {
            desde: 'publicado',
            accion: ACCIONES.INICIAR_PROYECTO,
            rol: ROLES.ADMIN,
            hasta: 'en_desarrollo',
        },
        {
            desde: 'en_desarrollo',
            accion: ACCIONES.FINALIZAR_PROYECTO,
            rol: ROLES.ADMIN,
            hasta: 'finalizado',
        },
        {
            desde: 'rechazado',
            accion: ACCIONES.ENVIAR_PROYECTO_REVISION,
            rol: ROLES.EMPRESA,
            hasta: 'pendiente_aprobacion',
        },
    ],

    empresa: [
        {
            desde: 'pendiente',
            accion: ACCIONES.APROBAR_EMPRESA,
            rol: ROLES.ADMIN,
            hasta: 'aprobada',
        },
        {
            desde: 'pendiente',
            accion: ACCIONES.RECHAZAR_EMPRESA,
            rol: ROLES.ADMIN,
            hasta: 'rechazada',
        },
    ],

    postulacion: [
        {
            desde: 'recibida',
            accion: ACCIONES.REVISAR_POSTULACION,
            rol: ROLES.ADMIN,
            hasta: 'en_revision',
        },
        {
            desde: 'en_revision',
            accion: ACCIONES.PRESELECCIONAR,
            rol: ROLES.ADMIN,
            hasta: 'preseleccionada',
        },
        {
            desde: 'en_revision',
            accion: ACCIONES.NO_PRESELECCIONAR,
            rol: ROLES.ADMIN,
            hasta: 'no_preseleccionada',
        },
        {
            desde: 'preseleccionada',
            accion: ACCIONES.COMPARTIR_EMPRESA,
            rol: ROLES.ADMIN,
            hasta: 'en_evaluacion_empresa',
        },
        {
            desde: 'en_evaluacion_empresa',
            accion: ACCIONES.SELECCIONAR_FINAL,
            rol: ROLES.EMPRESA,
            hasta: 'seleccionada',
        },
        {
            desde: 'en_evaluacion_empresa',
            accion: ACCIONES.NO_SELECCIONAR_FINAL,
            rol: ROLES.EMPRESA,
            hasta: 'no_seleccionada',
        },
        // El estudiante puede retirarse antes de la decisión final.
        ...['recibida', 'en_revision', 'preseleccionada', 'no_preseleccionada', 'en_evaluacion_empresa'].map(
            (desde) => ({
                desde,
                accion: ACCIONES.RETIRARSE,
                rol: ROLES.ESTUDIANTE,
                hasta: 'retirada',
            })
        ),
    ],
};

// La empresa NUNCA ve postulaciones en etapas de Harmont.
export const ESTADOS_VISIBLES_EMPRESA = [
    'en_evaluacion_empresa',
    'seleccionada',
    'no_seleccionada',
];

// Campos mínimos para postularse. Experiencia previa NO aparece aquí.
export const CAMPOS_MINIMOS_ESTUDIANTE = [
    'nombre',
    'ubicacion',
    'formacion',
    'areaInteres',
    'descripcion',
    'habilidades',
];
