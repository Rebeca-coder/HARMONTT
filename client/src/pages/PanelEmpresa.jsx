import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    requisitosPostulacion: '',
};

const convertirLista = (valor) => valor.split(',').map((parte) => parte.trim()).filter(Boolean);

const etiquetasProyecto = {
    borrador: 'Borrador',
    pendiente_aprobacion: 'Pendiente de aprobación',
    en_revision: 'En revisión',
    aprobado: 'Aprobado',
    publicado: 'Publicado',
    en_desarrollo: 'En desarrollo',
    finalizado: 'Finalizado',
    rechazado: 'Rechazado',
};

export default function PanelEmpresa() {
    const { usuario } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [proyectos, setProyectos] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [proyectoActivo, setProyectoActivo] = useState(null);
    const [candidatos, setCandidatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [recargar, setRecargar] = useState(0);

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError('');

        Promise.all([api.get('/perfiles/mio'), api.get('/proyectos/mia/lista')])
            .then(([datosPerfil, datosProyectos]) => {
                if (cancelado) return;
                setPerfil(datosPerfil);
                setProyectos(datosProyectos.proyectos || []);
            })
            .catch((fallo) => {
                if (!cancelado) setError(fallo.message);
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => { cancelado = true; };
    }, [recargar]);

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario({ ...formulario, [name]: value });
    };

    const crearProyecto = async (evento) => {
        evento.preventDefault();
        setError('');
        setMensaje('');

        try {
            await api.post('/proyectos', {
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
            setMensaje('Borrador creado. Envíalo a revisión cuando esté listo.');
            setRecargar((valor) => valor + 1);
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    const enviarRevision = async (id) => {
        setError('');
        setMensaje('');
        try {
            await api.post(`/proyectos/${id}/enviar-revision`);
            setMensaje('Proyecto enviado a Harmont.');
            setRecargar((valor) => valor + 1);
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    const verCandidatos = async (proyecto) => {
        setError('');
        setMensaje('');
        setProyectoActivo(proyecto);
        setCandidatos([]);
        try {
            const datos = await api.get(`/proyectos/${proyecto._id}/postulaciones`);
            setCandidatos(datos.postulaciones || []);
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    const decidir = async (postulacionId, accion) => {
        setError('');
        setMensaje('');
        try {
            await api.post(`/postulaciones/${postulacionId}/${accion}`);
            setMensaje('Decisión registrada.');
            if (proyectoActivo) await verCandidatos(proyectoActivo);
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    if (cargando) {
        return <section className="seccion"><p className="aviso">Cargando tu panel…</p></section>;
    }

    const verificado = perfil?.perfil?.estadoVerificacion === 'aprobada';

    return (
        <section className="seccion panel">
            <div className="cabecera-seccion">
                <div>
                    <p className="etiqueta-seccion">Entorno empresas</p>
                    <h1 className="titulo-seccion">Hola, {usuario.nombre}</h1>
                    <p className="texto-seccion">
                        Propón proyectos, espera la aprobación de Harmont y decide
                        entre los candidatos preseleccionados.
                    </p>
                </div>
                <Link className="enlace-con-flecha" to="/contacto">Solicitar colaboración →</Link>
            </div>

            {error && <p className="mensaje-error">{error}</p>}
            {mensaje && <p className="mensaje-exito">{mensaje}</p>}

            <div className="panel-grid">
                <article className="plan">
                    <h3>Verificación</h3>
                    <span className={`etiqueta-estado ${verificado ? 'estado-aprobado' : 'estado-pendiente'}`}>
                        {perfil?.perfil?.estadoVerificacion || 'pendiente'}
                    </span>
                    <p className="texto-suave">
                        {verificado
                            ? 'Tu empresa puede crear proyectos.'
                            : 'Harmont debe aprobar tu empresa antes de que publishes proyectos.'}
                    </p>
                </article>
                <article className="plan">
                    <h3>Proyectos</h3>
                    <p className="texto-suave">{proyectos.length} propuesta(s)</p>
                    <p>Ningún proyecto aparece en el catálogo hasta que Harmont lo apruebe y publique.</p>
                </article>
                <article className="plan">
                    <h3>Decisión final</h3>
                    <p>
                        Recibes únicamente candidatos que Harmont ya preseleccionó
                        y compartió contigo.
                    </p>
                </article>
            </div>

            <form className="formulario-contacto panel-formulario" onSubmit={crearProyecto}>
                <h2>Proponer un proyecto</h2>

                <div className="campo-formulario">
                    <label htmlFor="nombre">Nombre del proyecto</label>
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
                        <option value="finanzas">Finanzas</option>
                        <option value="rrhh">RRHH</option>
                        <option value="logistica">Logística</option>
                        <option value="educacion">Educación</option>
                    </select>
                </div>

                <div className="campo-formulario">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" required value={formulario.descripcion}
                              onChange={manejarCambio} />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="objetivo">Objetivo</label>
                    <textarea id="objetivo" name="objetivo" value={formulario.objetivo}
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
                    <label htmlFor="habilidadesTecnicas">Habilidades técnicas (separadas por coma)</label>
                    <input id="habilidadesTecnicas" name="habilidadesTecnicas"
                           value={formulario.habilidadesTecnicas} onChange={manejarCambio} />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="entregables">Entregables (separados por coma)</label>
                    <input id="entregables" name="entregables" value={formulario.entregables}
                           onChange={manejarCambio} />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="requisitosPostulacion">Requisitos de postulación</label>
                    <input id="requisitosPostulacion" name="requisitosPostulacion"
                           value={formulario.requisitosPostulacion} onChange={manejarCambio} />
                </div>

                <button className="pildora" type="submit" disabled={!verificado}>
                    {verificado ? 'Crear borrador' : 'Empresa pendiente de verificación'}
                </button>
            </form>

            <div className="panel-bloque">
                <h2>Mis proyectos</h2>
                {proyectos.length === 0 ? (
                    <p className="aviso">Todavía no has propuesto proyectos.</p>
                ) : (
                    <div className="lista-panel">
                        {proyectos.map((proyecto) => (
                            <article className="item-panel" key={proyecto._id}>
                                <div>
                                    <h3>{proyecto.nombre}</h3>
                                    <p className="texto-suave">
                                        {proyecto.categoria} · {proyecto.modalidad} ·{' '}
                                        {proyecto.participantes} participante(s)
                                    </p>
                                </div>
                                <span className={`etiqueta-estado estado-${proyecto.estado}`}>
                                    {etiquetasProyecto[proyecto.estado] || proyecto.estado}
                                </span>
                                <div className="acciones-item">
                                    {['borrador', 'rechazado'].includes(proyecto.estado) && (
                                        <button className="pildora pildora-pequena" type="button"
                                                onClick={() => enviarRevision(proyecto._id)}>
                                            Enviar a revisión
                                        </button>
                                    )}
                                    <button className="pildora pildora-pequena" type="button"
                                            onClick={() => verCandidatos(proyecto)}>
                                        Ver candidatos
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {proyectoActivo && (
                <div className="panel-bloque">
                    <h2>Candidatos de “{proyectoActivo.nombre}”</h2>
                    <p className="aviso">
                        Harmont decide quién llega a esta etapa. Solo ves postulaciones
                        ya compartidas; no puedes modificar su evaluación.
                    </p>
                    {candidatos.length === 0 ? (
                        <p className="aviso">Todavía no hay candidatos en evaluación.</p>
                    ) : (
                        <div className="lista-panel">
                            {candidatos.map((postulacion) => (
                                <article className="item-panel" key={postulacion._id}>
                                    <div>
                                        <h3>
                                            {postulacion.estudiante?.usuario?.nombre || 'Estudiante'}
                                        </h3>
                                        <p className="texto-suave">
                                            {postulacion.estudiante?.ubicacion || '—'} ·{' '}
                                            {(postulacion.estudiante?.habilidadesTecnicas || []).join(', ')}
                                        </p>
                                        <p>{postulacion.cartaPresentacion}</p>
                                        <p className="texto-suave">{postulacion.enlacePortafolio}</p>
                                    </div>
                                    <span className="etiqueta-estado">
                                        {postulacion.estado.replaceAll('_', ' ')}
                                    </span>
                                    {postulacion.estado === 'en_evaluacion_empresa' && (
                                        <div className="acciones-item">
                                            <button className="pildora pildora-pequena" type="button"
                                                    onClick={() => decidir(postulacion._id, 'seleccionar')}>
                                                Seleccionar
                                            </button>
                                            <button className="pildora pildora-pequena" type="button"
                                                    onClick={() => decidir(postulacion._id, 'no-seleccionar')}>
                                                No seleccionar
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
