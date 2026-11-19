import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const etiquetasEstado = {
    recibida: 'Recibida',
    en_revision: 'En revisión de Harmont',
    preseleccionada: 'Preseleccionada por Harmont',
    no_preseleccionada: 'No preseleccionada',
    en_evaluacion_empresa: 'En evaluación de la empresa',
    seleccionada: 'Seleccionada',
    no_seleccionada: 'No seleccionada',
    retirada: 'Retirada',
};

const texto = (valor) => (Array.isArray(valor) ? valor.join(', ') : valor || '');

export default function PanelEstudiante() {
    const { usuario } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [postulaciones, setPostulaciones] = useState([]);
    const [experiencias, setExperiencias] = useState([]);
    const [formulario, setFormulario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [recargar, setRecargar] = useState(0);

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        setError('');

        Promise.all([
            api.get('/perfiles/mio'),
            api.get('/postulaciones/mias'),
            api.get('/experiencias/mias'),
        ])
            .then(([datosPerfil, datosPostulaciones, datosExperiencias]) => {
                if (cancelado) return;
                setPerfil(datosPerfil);
                setPostulaciones(datosPostulaciones.postulaciones || []);
                setExperiencias(datosExperiencias.experiencias || []);
                setFormulario({
                    descripcion: datosPerfil.perfil.descripcion || '',
                    ubicacion: datosPerfil.perfil.ubicacion || '',
                    formacion: datosPerfil.perfil.formacion || '',
                    institucion: datosPerfil.perfil.institucion || '',
                    areaInteres: datosPerfil.perfil.areaInteres || '',
                    habilidadesTecnicas: texto(datosPerfil.perfil.habilidadesTecnicas),
                    habilidadesBlandas: texto(datosPerfil.perfil.habilidadesBlandas),
                    herramientas: texto(datosPerfil.perfil.herramientas),
                    portafolio: texto(datosPerfil.perfil.portafolio),
                    disponibilidad: datosPerfil.perfil.disponibilidad || '',
                });
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

    const guardarPerfil = async (evento) => {
        evento.preventDefault();
        setError('');
        setMensaje('');
        try {
            const datos = await api.patch('/perfiles/mio', formulario);
            setPerfil((anterior) => ({ ...anterior, ...datos }));
            setMensaje('Perfil guardado correctamente.');
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    const retirar = async (id) => {
        setError('');
        setMensaje('');
        try {
            await api.post(`/postulaciones/${id}/retirar`);
            setMensaje('Postulación retirada.');
            setRecargar((valor) => valor + 1);
        } catch (fallo) {
            setError(fallo.message);
        }
    };

    if (cargando) {
        return <section className="seccion"><p className="aviso">Cargando tu panel…</p></section>;
    }

    return (
        <section className="seccion panel">
            <div className="cabecera-seccion">
                <div>
                    <p className="etiqueta-seccion">Entorno estudiantes</p>
                    <h1 className="titulo-seccion">Hola, {usuario.nombre}</h1>
                    <p className="texto-seccion">
                        Tu perfil,
                        tus postulaciones y la experiencia que vas construyendo.
                    </p>
                </div>
                <Link className="enlace-con-flecha" to="/proyectos">Explorar proyectos →</Link>
            </div>

            {error && <p className="mensaje-error">{error}</p>}
            {mensaje && <p className="mensaje-exito">{mensaje}</p>}

            {perfil && (
                <div className="panel-grid">
                    <article className="plan">
                        <h3>Tu perfil</h3>
                        <p className="texto-suave">{perfil.completitud}% completado</p>
                        <div className="barra-progreso">
                            <span style={{ width: `${perfil.completitud}%` }}></span>
                        </div>
                        {perfil.faltantes?.length > 0 ? (
                            <p className="aviso">
                                Para postularte completa: {perfil.faltantes.join(', ')}.
                            </p>
                        ) : (
                            <p className="mensaje-exito">Ya puedes postularte.</p>
                        )}
                    </article>

                    <article className="plan">
                        <h3>Postulaciones</h3>
                        <p className="texto-suave">{postulaciones.length} en total</p>
                        <p>
                            Harmont revisa cada postulación. Solo comparte con la empresa
                            los candidatos preseleccionados.
                        </p>
                    </article>

                    <article className="plan">
                        <h3>Experiencia</h3>
                        <p className="texto-suave">{experiencias.length} registro(s)</p>
                        <p>
                            La experiencia se registra cuando una empresa te selecciona.
                            No se exige experiencia previa para empezar.
                        </p>
                    </article>
                </div>
            )}

            {formulario && (
                <form className="formulario-contacto panel-formulario" onSubmit={guardarPerfil}>
                    <h2>Editar mi perfil</h2>

                    <div className="campo-formulario">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea id="descripcion" name="descripcion" value={formulario.descripcion}
                                  onChange={manejarCambio} placeholder="Cuéntale a Harmont qué te interesa" />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="ubicacion">Ubicación</label>
                        <input id="ubicacion" name="ubicacion" value={formulario.ubicacion}
                               onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="formacion">Formación</label>
                        <input id="formacion" name="formacion" value={formulario.formacion}
                               onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="institucion">Institución</label>
                        <input id="institucion" name="institucion" value={formulario.institucion}
                               onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="areaInteres">Área de interés</label>
                        <input id="areaInteres" name="areaInteres" value={formulario.areaInteres}
                               onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="habilidadesTecnicas">Habilidades técnicas (separadas por coma)</label>
                        <input id="habilidadesTecnicas" name="habilidadesTecnicas"
                               value={formulario.habilidadesTecnicas} onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="habilidadesBlandas">Habilidades blandas (separadas por coma)</label>
                        <input id="habilidadesBlandas" name="habilidadesBlandas"
                               value={formulario.habilidadesBlandas} onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="herramientas">Herramientas (separadas por coma)</label>
                        <input id="herramientas" name="herramientas" value={formulario.herramientas}
                               onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="portafolio">Portafolio (separado por coma)</label>
                        <input id="portafolio" name="portafolio" value={formulario.portafolio}
                               onChange={manejarCambio} />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="disponibilidad">Disponibilidad</label>
                        <input id="disponibilidad" name="disponibilidad" value={formulario.disponibilidad}
                               onChange={manejarCambio} placeholder="Ej. 10 horas por semana" />
                    </div>

                    <button className="pildora" type="submit">Guardar perfil</button>
                </form>
            )}

            <div className="panel-bloque">
                <h2>Mis postulaciones</h2>
                {postulaciones.length === 0 ? (
                    <p className="aviso">Todavía no te has postulado a ningún proyecto.</p>
                ) : (
                    <div className="lista-panel">
                        {postulaciones.map((postulacion) => (
                            <article className="item-panel" key={postulacion._id}>
                                <div>
                                    <h3>{postulacion.proyecto?.nombre || 'Proyecto'}</h3>
                                    <p className="texto-suave">
                                        {postulacion.proyecto?.categoria || '—'} ·{' '}
                                        {postulacion.proyecto?.modalidad || '—'}
                                    </p>
                                </div>
                                <span className={`etiqueta-estado estado-${postulacion.estado}`}>
                                    {etiquetasEstado[postulacion.estado] || postulacion.estado}
                                </span>
                                {!['seleccionada', 'no_seleccionada', 'retirada'].includes(postulacion.estado) && (
                                    <button
                                        className="pildora pildora-pequena"
                                        type="button"
                                        onClick={() => retirar(postulacion._id)}
                                    >
                                        Retirar
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-bloque">
                <h2>Mi experiencia verificable</h2>
                {experiencias.length === 0 ? (
                    <p className="aviso">Todavía no hay experiencia registrada.</p>
                ) : (
                    <div className="lista-panel">
                        {experiencias.map((experiencia) => (
                            <article className="item-panel" key={experiencia._id}>
                                <div>
                                    <h3>{experiencia.proyecto?.nombre || 'Proyecto'}</h3>
                                    <p className="texto-suave">
                                        {experiencia.organizacion} · {experiencia.funcion}
                                    </p>
                                    <p>{(experiencia.habilidadesDesarrolladas || []).join(', ')}</p>
                                </div>
                                <span className="etiqueta-estado">{experiencia.estado}</span>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
