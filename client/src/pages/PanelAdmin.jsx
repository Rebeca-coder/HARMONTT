import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const formularioInicial = {
    nombre: '',
    categoria: 'tecnologia',
    descripcion: '',
    objetivo: '',
    tipoEconomico: 'formativo',
    modalidad: 'remoto',
    duracionSemanas: 4,
    participantes: 1,
    fechaLimite: '',
    habilidadesTecnicas: '',
    entregables: '',
};

const convertirLista = (valor) => valor.split(',').map((parte) => parte.trim()).filter(Boolean);
const idDe = (valor) => (valor && typeof valor === 'object' ? valor._id : valor);

export default function PanelAdmin() {
    const { usuario } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [postulaciones, setPostulaciones] = useState([]);
    const [experiencias, setExperiencias] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [historial, setHistorial] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [recargar, setRecargar] = useState(0);

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError('');

        Promise.all([
            api.get('/perfiles/empresas?estado=pendiente'),
            api.get('/proyectos/admin/lista'),
            api.get('/postulaciones/admin'),
            api.get('/experiencias/admin'),
        ])
            .then(([datosEmpresas, datosProyectos, datosPostulaciones, datosExperiencias]) => {
                if (cancelado) return;
                setEmpresas(datosEmpresas.empresas || []);
                setProyectos(datosProyectos.proyectos || []);
                setPostulaciones(datosPostulaciones.postulaciones || []);
                setExperiencias(datosExperiencias.experiencias || []);
            })
            .catch((fallo) => {
                if (!cancelado) setError(fallo.message);
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => { cancelado = true; };
    }, [recargar]);

    const actualizar = () => setRecargar((valor) => valor + 1);

    const ejecutar = async (url, cuerpo, texto) => {
        setError('');
        setMensaje('');
        try {
            await api.post(url, cuerpo);
            setMensaje(texto);
            actualizar();
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    const decidirEmpresa = (id, accion) => {
        const motivo = accion === 'rechazar'
            ? window.prompt('Motivo del rechazo:', '')
            : undefined;
        if (accion === 'rechazar' && !motivo) return;
        ejecutar(`/perfiles/empresas/${id}/${accion}`, { motivo }, `Empresa ${accion}da.`);
    };

    const accionProyecto = (id, accion) => {
        const motivo = accion === 'rechazar'
            ? window.prompt('Motivo del rechazo:', '')
            : undefined;
        if (accion === 'rechazar' && !motivo) return;
        ejecutar(`/proyectos/${id}/${accion}`, { motivo }, `Proyecto ${accion.replace('-', ' ')}.`);
    };

    const accionPostulacion = (id, accion) => {
        ejecutar(
            `/postulaciones/${id}/${accion}`,
            undefined,
            `Postulación ${accion.replaceAll('-', ' ')}.`
        );
    };

    const registrarExperiencia = (postulacion) => {
        ejecutar(
            '/experiencias',
            {
                estudiante: idDe(postulacion.estudiante),
                proyecto: idDe(postulacion.proyecto),
                funcion: 'Participante del proyecto',
            },
            'Experiencia registrada para el estudiante.'
        );
    };

    const verHistorial = async (id) => {
        setError('');
        setHistorial(null);
        try {
            const datos = await api.get(`/postulaciones/${id}/historial`);
            setHistorial(datos);
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario({ ...formulario, [name]: value });
    };

    const crearSimulado = async (evento) => {
        evento.preventDefault();
        setError('');
        setMensaje('');
        try {
            await api.post('/proyectos/simulados', {
                ...formulario,
                duracionSemanas: Number(formulario.duracionSemanas),
                participantes: Number(formulario.participantes),
                fechaLimite: formulario.fechaLimite
                    ? new Date(formulario.fechaLimite).toISOString()
                    : undefined,
                habilidadesTecnicas: convertirLista(formulario.habilidadesTecnicas),
                entregables: convertirLista(formulario.entregables),
            });
            setFormulario(formularioInicial);
            setMensaje('Proyecto simulado creado como borrador. Ahora debe revisarse y publicarse.');
            actualizar();
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    if (cargando) {
        return <section className="seccion"><p className="aviso">Cargando panel de administración…</p></section>;
    }

    return (
        <section className="seccion panel">
            <div className="cabecera-seccion">
                <div>
                    <p className="etiqueta-seccion">Entorno administración</p>
                    <h1 className="titulo-seccion">Panel de Harmont</h1>
                    <p className="texto-seccion">
                        Revisas empresas y proyectos, preseleccionas candidatos y
                        dejas constancia de cada decisión. La selección final es de la empresa.
                    </p>
                </div>
                <span className="etiqueta-estado estado-aprobado">{usuario.rol}</span>
            </div>

            {error && <p className="mensaje-error">{error}</p>}
            {mensaje && <p className="mensaje-exito">{mensaje}</p>}

            <div className="panel-grid">
                <article className="plan"><h3>Empresas pendientes</h3><p>{empresas.length}</p></article>
                <article className="plan"><h3>Proyectos</h3><p>{proyectos.length}</p></article>
                <article className="plan"><h3>Postulaciones</h3><p>{postulaciones.length}</p></article>
                <article className="plan"><h3>Experiencias</h3><p>{experiencias.length}</p></article>
            </div>

            <div className="panel-bloque">
                <h2>Verificación de empresas</h2>
                {empresas.length === 0 ? (
                    <p className="aviso">No hay empresas pendientes.</p>
                ) : (
                    <div className="lista-panel">
                        {empresas.map((empresa) => (
                            <article className="item-panel" key={empresa._id}>
                                <div>
                                    <h3>{empresa.nombreComercial}</h3>
                                    <p className="texto-suave">
                                        {empresa.usuario?.nombre} · {empresa.usuario?.email}
                                    </p>
                                    <p>{empresa.sector} · {empresa.ciudad}</p>
                                </div>
                                <div className="acciones-item">
                                    <button className="pildora pildora-pequena" type="button"
                                            onClick={() => decidirEmpresa(empresa._id, 'aprobar')}>
                                        Aprobar
                                    </button>
                                    <button className="pildora pildora-pequena" type="button"
                                            onClick={() => decidirEmpresa(empresa._id, 'rechazar')}>
                                        Rechazar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-bloque">
                <h2>Revisión de proyectos</h2>
                {proyectos.length === 0 ? (
                    <p className="aviso">Todavía no hay proyectos.</p>
                ) : (
                    <div className="lista-panel">
                        {proyectos.map((proyecto) => (
                            <article className="item-panel" key={proyecto._id}>
                                <div>
                                    <h3>{proyecto.nombre}</h3>
                                    <p className="texto-suave">
                                        {proyecto.origen} · {proyecto.empresa?.nombreComercial || 'Harmont'} ·{' '}
                                        {proyecto.creadoPor?.nombre || '—'}
                                    </p>
                                    <p>{proyecto.descripcion}</p>
                                    {proyecto.revision?.motivo && (
                                        <p className="aviso">Motivo: {proyecto.revision.motivo}</p>
                                    )}
                                </div>
                                <span className="etiqueta-estado">{proyecto.estado.replaceAll('_', ' ')}</span>
                                <div className="acciones-item">
                                    {proyecto.estado === 'pendiente_aprobacion' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => accionProyecto(proyecto._id, 'tomar-revision')}>
                                            Tomar revisión
                                        </button>
                                    )}
                                    {proyecto.estado === 'en_revision' && (
                                        <>
                                            <button className="pildora pildora-pequena" type="button"
                                                    onClick={() => accionProyecto(proyecto._id, 'aprobar')}>
                                                Aprobar
                                            </button>
                                            <button className="pildora pildora-pequena" type="button"
                                                    onClick={() => accionProyecto(proyecto._id, 'rechazar')}>
                                                Rechazar
                                            </button>
                                        </>
                                    )}
                                    {proyecto.estado === 'aprobado' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => accionProyecto(proyecto._id, 'publicar')}>
                                            Publicar
                                        </button>
                                    )}
                                    {proyecto.estado === 'publicado' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => accionProyecto(proyecto._id, 'iniciar')}>
                                            Iniciar
                                        </button>
                                    )}
                                    {proyecto.estado === 'en_desarrollo' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => accionProyecto(proyecto._id, 'finalizar')}>
                                            Finalizar
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-bloque">
                <h2>Postulaciones: preselección Harmont</h2>
                {postulaciones.length === 0 ? (
                    <p className="aviso">Todavía no hay postulaciones.</p>
                ) : (
                    <div className="lista-panel">
                        {postulaciones.map((postulacion) => (
                            <article className="item-panel" key={postulacion._id}>
                                <div>
                                    <h3>
                                        {postulacion.estudiante?.usuario?.nombre || 'Estudiante'} →{' '}
                                        {postulacion.proyecto?.nombre || 'Proyecto'}
                                    </h3>
                                    <p className="texto-suave">
                                        {postulacion.estudiante?.ubicacion || '—'} ·{' '}
                                        {(postulacion.estudiante?.habilidadesTecnicas || []).join(', ')}
                                    </p>
                                    <p>{postulacion.cartaPresentacion}</p>
                                </div>
                                <span className="etiqueta-estado">
                                    {postulacion.estado.replaceAll('_', ' ')}
                                </span>
                                <div className="acciones-item">
                                    {postulacion.estado === 'recibida' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => accionPostulacion(postulacion._id, 'revisar')}>
                                            Revisar
                                        </button>
                                    )}
                                    {postulacion.estado === 'en_revision' && (
                                        <>
                                            <button className="pildora pildora-pequena" type="button"
                                                    onClick={() => accionPostulacion(postulacion._id, 'preseleccionar')}>
                                                Preseleccionar
                                            </button>
                                            <button className="pildora pildora-pequena" type="button"
                                                    onClick={() => accionPostulacion(postulacion._id, 'no-preseleccionar')}>
                                                No preseleccionar
                                            </button>
                                        </>
                                    )}
                                    {postulacion.estado === 'preseleccionada' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => accionPostulacion(postulacion._id, 'compartir')}>
                                            Compartir con empresa
                                        </button>
                                    )}
                                    {postulacion.estado === 'seleccionada' && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => registrarExperiencia(postulacion)}>
                                            Registrar experiencia
                                        </button>
                                    )}
                                    <button className="pildora pildora-pequena" type="button"
                                            onClick={() => verHistorial(postulacion._id)}>
                                        Historial
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {historial && (
                <div className="panel-bloque">
                    <h2>Historial de decisiones</h2>
                    <ul className="lista-historial">
                        {historial.decisiones.map((decision) => (
                            <li key={decision._id}>
                                <strong>{decision.accion}</strong>: {decision.estadoAnterior || 'inicio'} →{' '}
                                {decision.estadoNuevo} · {decision.rolActor} ·{' '}
                                {new Date(decision.fecha).toLocaleString()}
                                {decision.motivo && ` · Motivo: ${decision.motivo}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="panel-bloque">
                <h2>Experiencia registrada</h2>
                {experiencias.length === 0 ? (
                    <p className="aviso">Todavía no hay experiencias registradas.</p>
                ) : (
                    <div className="lista-panel">
                        {experiencias.map((experiencia) => (
                            <article className="item-panel" key={experiencia._id}>
                                <div>
                                    <h3>
                                        {experiencia.estudiante?.usuario?.nombre || 'Estudiante'} ·{' '}
                                        {experiencia.proyecto?.nombre || 'Proyecto'}
                                    </h3>
                                    <p className="texto-suave">{experiencia.organizacion}</p>
                                </div>
                                <span className="etiqueta-estado">{experiencia.estado}</span>
                                {experiencia.estado === 'en_curso' && (
                                    <button className="pildora pildora-pequena" type="button"
                                            onClick={() => ejecutar(
                                                `/experiencias/${experiencia._id}/completar`,
                                                {},
                                                'Experiencia completada.'
                                            )}>
                                        Completar
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <form className="formulario-contacto panel-formulario" onSubmit={crearSimulado}>
                <h2>Crear proyecto simulado</h2>
                <p className="aviso">
                    Los proyectos simulados permiten practicar cuando hay pocas propuestas reales.
                    También requieren aprobación y publicación.
                </p>

                <div className="campo-formulario">
                    <label htmlFor="nombre">Nombre</label>
                    <input id="nombre" name="nombre" required value={formulario.nombre}
                           onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="categoria">Categoría</label>
                    <select id="categoria" name="categoria" value={formulario.categoria}
                            onChange={manejarCambio}>
                        <option value="tecnologia">Tecnología</option>
                        <option value="diseno">Diseño</option>
                        <option value="marketing">Marketing</option>
                        <option value="datos">Datos</option>
                        <option value="comunicacion">Comunicación</option>
                    </select>
                </div>
                <div className="campo-formulario">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" required value={formulario.descripcion}
                              onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="objetivo">Objetivo</label>
                    <input id="objetivo" name="objetivo" value={formulario.objetivo}
                           onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="tipoEconomico">Tipo económico</label>
                    <select id="tipoEconomico" name="tipoEconomico" value={formulario.tipoEconomico}
                            onChange={manejarCambio}>
                        <option value="remunerado">Remunerado</option>
                        <option value="voluntario">Voluntario</option>
                        <option value="formativo">Formativo</option>
                    </select>
                </div>
                <div className="campo-formulario">
                    <label htmlFor="modalidad">Modalidad</label>
                    <select id="modalidad" name="modalidad" value={formulario.modalidad}
                            onChange={manejarCambio}>
                        <option value="remoto">Remoto</option>
                        <option value="presencial">Presencial</option>
                        <option value="hibrido">Híbrido</option>
                    </select>
                </div>
                <div className="campo-formulario">
                    <label htmlFor="duracionSemanas">Duración (semanas)</label>
                    <input id="duracionSemanas" name="duracionSemanas" type="number" min="1"
                           value={formulario.duracionSemanas} onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="participantes">Participantes</label>
                    <input id="participantes" name="participantes" type="number" min="1"
                           value={formulario.participantes} onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="fechaLimite">Fecha límite</label>
                    <input id="fechaLimite" name="fechaLimite" type="date"
                           value={formulario.fechaLimite} onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="habilidadesTecnicas">Habilidades (separadas por coma)</label>
                    <input id="habilidadesTecnicas" name="habilidadesTecnicas"
                           value={formulario.habilidadesTecnicas} onChange={manejarCambio} />
                </div>
                <div className="campo-formulario">
                    <label htmlFor="entregables">Entregables (separados por coma)</label>
                    <input id="entregables" name="entregables" value={formulario.entregables}
                           onChange={manejarCambio} />
                </div>

                <button className="pildora" type="submit">Crear proyecto simulado</button>
            </form>
        </section>
    );
}
