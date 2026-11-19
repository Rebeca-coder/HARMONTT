import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const { iniciarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formulario, setFormulario] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario({ ...formulario, [name]: value });
    };

    const manejarEnvio = async (evento) => {
        evento.preventDefault();
        setError('');
        setEnviando(true);

        try {
            await iniciarSesion(formulario);
            navigate(location.state?.desde || '/');
        } catch (fallo) {
            setError(fallo.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            <div className="portada-interna">
                <p className="etiqueta-seccion">Acceso</p>
                <h1>Iniciar sesión</h1>
                <p>Entra con tu cuenta de estudiante, empresa o administración.</p>
            </div>

            <section className="seccion contacto">
                <form className="formulario-contacto" onSubmit={manejarEnvio}>
                    <div className="campo-formulario">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formulario.email}
                            onChange={manejarCambio}
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formulario.password}
                            onChange={manejarCambio}
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <button className="pildora" type="submit" disabled={enviando}>
                        {enviando ? 'Entrando…' : 'Entrar →'}
                    </button>

                    {error && <p className="mensaje-error">{error}</p>}
                    <p className="aviso">
                        ¿No tienes cuenta? <Link to="/registro">Crea una aquí</Link>.
                    </p>
                </form>

                <aside className="datos-contacto">
                    <h2>Tres entornos, una sola plataforma</h2>
                    <p><strong>Estudiantes:</strong> explora proyectos, postúlate y construye tu experiencia.</p>
                    <p><strong>Empresas:</strong> propón retos y revisa los candidatos preseleccionados por Harmont.</p>
                    <p><strong>Administración:</strong> aprueba proyectos, preselecciona y registra cada decisión.</p>
                </aside>
            </section>
        </>
    );
}
