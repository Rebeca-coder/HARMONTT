import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { rutaImagen } from '../services/imagen.js';

export default function DetalleProyecto() {
    const { id } = useParams();
    const { usuario, cargando: cargandoSesion } = useAuth();
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [error, setError] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [formulario, setFormulario] = useState({
        cartaPresentacion: '',
        habilidadesDeclaradas: '',
        enlacePortafolio: '',
    });
    const [resultado, setResultado] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [faltantes, setFaltantes] = useState([]);

    useEffect(() => {
        let cancelado = false;
        api.get(`/proyectos/${id}`)
            .then((datos) => { if (!cancelado) setProyecto(datos.proyecto); })
            .catch((fallo) => { if (!cancelado) setError(fallo.message); });
        return () => { cancelado = true; };
    }, [id]);

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario({ ...formulario, [name]: value });
    };

    const empezarPostulacion = () => {
        if (cargandoSesion) return;
        if (!usuario) {
            navigate('/login', { state: { desde: `/proyectos/${id}` } });
            return;
        }
        if (usuario.rol !== 'estudiante') {
            setError('Solo los estudiantes pueden postularse a proyectos.');
            return;
        }
        setMostrarFormulario(true);
    };

    const manejarEnvio = async (evento) => {
        evento.preventDefault();
        setError('');
        setResultado('');
        setFaltantes([]);
        setEnviando(true);

        try {
            const habilidades = formulario.habilidadesDeclaradas
                .split(',')
                .map((valor) => valor.trim())
                .filter(Boolean);

            await api.post('/postulaciones', {
                proyecto: id,
                cartaPresentacion: formulario.cartaPresentacion,
                habilidadesDeclaradas: habilidades,
                enlacePortafolio: formulario.enlacePortafolio,
            });

            setResultado('Postulación recibida. Harmont la revisará.');
            setMostrarFormulario(false);
        } catch (fallo) {
            if (fallo.detalles?.faltantes) {
                setFaltantes(fallo.detalles.faltantes);
            } else {
                setError(fallo.message);
            }
        } finally {
            setEnviando(false);
        }
    };

    if (error && !proyecto) {
        return (
            <section className="seccion">
                <p className="mensaje-error">{error}</p>
                <Link className="enlace-con-flecha" to="/proyectos">Volver al catálogo →</Link>
            </section>
        );
    }

    if (!proyecto) {
        return <section className="seccion"><p className="aviso">Cargando proyecto…</p></section>;
    }

    return (
        <>
            <section className="seccion" id="detalle">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">Detalle del proyecto</p>
                        <h1 className="titulo-seccion">{proyecto.nombre}</h1>
                        <p className="texto-seccion">
                            {proyecto.empresa?.nombreComercial || 'Harmont'} · {proyecto.categoria} ·{' '}
                            {proyecto.origen === 'simulado' ? 'Simulado' : proyecto.tipoEconomico}
                        </p>
                    </div>
                    <Link className="enlace-con-flecha" to="/proyectos">← Volver al catálogo</Link>
                </div>

                {proyecto.imagen && (
                    <img className="carta-imagen" src={rutaImagen(proyecto.imagen)} alt={proyecto.nombre} />
                )}

                <div className="planes">
                    <article className="plan">
                        <h3>Objetivo</h3>
                        <p>{proyecto.objetivo || 'No especificado'}</p>
                    </article>
                    <article className="plan">
                        <h3>Condiciones</h3>
                        <p>
                            {proyecto.modalidad} · {proyecto.duracionSemanas || '—'} semanas ·{' '}
                            {proyecto.participantes} participante(s)
                        </p>
                    </article>
                    <article className="plan">
                        <h3>Habilidades solicitadas</h3>
                        <p>{(proyecto.habilidadesTecnicas || []).join(', ') || 'No especificadas'}</p>
                    </article>
                    <article className="plan">
                        <h3>Entregables</h3>
                        <p>{(proyecto.entregables || []).join(', ') || 'No especificados'}</p>
                    </article>
                </div>

                <p className="texto-seccion texto-seccion-con-margen">
                    {proyecto.descripcion}
                </p>

                <p className="aviso">
                    {cargandoSesion
                        ? 'Comprobando tu sesión…'
                        : usuario
                            ? `Sesión activa: ${usuario.nombre} · ${usuario.rol}`
                            : 'Inicia sesión como estudiante para poder postularte.'}
                </p>

                <button
                    className="pildora"
                    type="button"
                    onClick={empezarPostulacion}
                    disabled={cargandoSesion}
                >
                    {cargandoSesion ? 'Comprobando sesión…' : 'Postularme →'}
                </button>

                {resultado && <p className="mensaje-exito">{resultado}</p>}
                {error && <p className="mensaje-error">{error}</p>}
                {faltantes.length > 0 && (
                    <p className="mensaje-error">
                        Para postularte completa tu perfil: {faltantes.join(', ')}.{' '}
                        <Link className="enlace-con-flecha" to="/panel">Ir a mi panel →</Link>
                    </p>
                )}
            </section>

            {mostrarFormulario && (
                <section className="seccion contacto">
                    <form className="formulario-contacto" onSubmit={manejarEnvio}>
                        <div className="campo-formulario">
                            <label htmlFor="cartaPresentacion">¿Por qué te interesa?</label>
                            <textarea
                                id="cartaPresentacion"
                                name="cartaPresentacion"
                                required
                                value={formulario.cartaPresentacion}
                                onChange={manejarCambio}
                                placeholder="Explica brevemente tu interés"
                            />
                        </div>

                        <div className="campo-formulario">
                            <label htmlFor="habilidadesDeclaradas">Habilidades relevantes</label>
                            <input
                                id="habilidadesDeclaradas"
                                name="habilidadesDeclaradas"
                                value={formulario.habilidadesDeclaradas}
                                onChange={manejarCambio}
                                placeholder="Ej. Figma, investigación, React"
                            />
                        </div>

                        <div className="campo-formulario">
                            <label htmlFor="enlacePortafolio">Enlace a tu portafolio (opcional)</label>
                            <input
                                id="enlacePortafolio"
                                name="enlacePortafolio"
                                type="url"
                                value={formulario.enlacePortafolio}
                                onChange={manejarCambio}
                                placeholder="https://..."
                            />
                        </div>

                        <button className="pildora" type="submit" disabled={enviando}>
                            {enviando ? 'Enviando…' : 'Enviar postulación →'}
                        </button>
                    </form>

                    <aside className="datos-contacto">
                        <h2>Dos etapas claras</h2>
                        <p>Harmont revisa tu perfil y puede preseleccionarte. Después la empresa decide entre los candidatos presentados.</p>
                        <p>Postularse no significa haber sido seleccionado automáticamente.</p>
                    </aside>
                </section>
            )}
        </>
    );
}
