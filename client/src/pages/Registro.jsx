import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const formularioInicial = {
    nombre: '',
    email: '',
    password: '',
    rol: 'estudiante',
    ubicacion: '',
    formacion: '',
    areaInteres: '',
    nombreComercial: '',
    correoEmpresarial: '',
    sector: '',
    ciudad: '',
};

export default function Registro() {
    const { registrar } = useAuth();
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState(formularioInicial);
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
            await registrar(formulario);
            navigate('/');
        } catch (fallo) {
            setError(fallo.message);
        } finally {
            setEnviando(false);
        }
    };

    const esEstudiante = formulario.rol === 'estudiante';

    return (
        <>
            <div className="portada-interna">
                <p className="etiqueta-seccion">Registro</p>
                <h1>Crea tu cuenta</h1>
                <p>Gratis para estudiantes. Las empresas se verifican antes de publicar proyectos.</p>
            </div>

            <section className="seccion contacto">
                <form className="formulario-contacto" onSubmit={manejarEnvio}>
                    <div className="campo-formulario">
                        <label htmlFor="rol">Quiero registrarme como</label>
                        <select id="rol" name="rol" value={formulario.rol} onChange={manejarCambio}>
                            <option value="estudiante">Estudiante</option>
                            <option value="empresa">Empresa</option>
                        </select>
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="nombre">
                            {esEstudiante ? 'Nombre completo' : 'Nombre de la persona de contacto'}
                        </label>
                        <input id="nombre" name="nombre" required value={formulario.nombre}
                               onChange={manejarCambio} placeholder="Tu nombre" />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="email">Correo electrónico</label>
                        <input id="email" name="email" type="email" required value={formulario.email}
                               onChange={manejarCambio} placeholder="tu@correo.com" />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="password">Contraseña</label>
                        <input id="password" name="password" type="password" required
                               minLength="8" value={formulario.password}
                               onChange={manejarCambio} placeholder="Mínimo 8 caracteres" />
                    </div>

                    {esEstudiante ? (
                        <>
                            <div className="campo-formulario">
                                <label htmlFor="ubicacion">Ciudad o ubicación</label>
                                <input id="ubicacion" name="ubicacion" required value={formulario.ubicacion}
                                       onChange={manejarCambio} placeholder="Ej. Bogotá" />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="formacion">Formación académica</label>
                                <input id="formacion" name="formacion" required value={formulario.formacion}
                                       onChange={manejarCambio} placeholder="Ej. Diseño gráfico" />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="areaInteres">Área de interés</label>
                                <input id="areaInteres" name="areaInteres" required value={formulario.areaInteres}
                                       onChange={manejarCambio} placeholder="Ej. tecnologia" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="campo-formulario">
                                <label htmlFor="nombreComercial">Nombre comercial</label>
                                <input id="nombreComercial" name="nombreComercial" required
                                       value={formulario.nombreComercial} onChange={manejarCambio} />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="correoEmpresarial">Correo empresarial</label>
                                <input id="correoEmpresarial" name="correoEmpresarial" type="email" required
                                       value={formulario.correoEmpresarial} onChange={manejarCambio} />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="sector">Sector</label>
                                <input id="sector" name="sector" value={formulario.sector}
                                       onChange={manejarCambio} />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="ciudad">Ciudad</label>
                                <input id="ciudad" name="ciudad" value={formulario.ciudad}
                                       onChange={manejarCambio} />
                            </div>
                        </>
                    )}

                    <button className="pildora" type="submit" disabled={enviando}>
                        {enviando ? 'Creando cuenta…' : 'Crear cuenta →'}
                    </button>

                    {error && <p className="mensaje-error">{error}</p>}
                    <p className="aviso">
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>.
                    </p>
                </form>

                <aside className="datos-contacto">
                    <h2>Sin experiencia previa</h2>
                    <p>Harmont está pensado para jóvenes que todavía no tienen experiencia laboral. No te pedimos nada que aún no puedas tener.</p>
                    <p>Después de registrarte podrás completar tu perfil y postularte a proyectos que admitan principiantes.</p>
                </aside>
            </section>
        </>
    );
}
