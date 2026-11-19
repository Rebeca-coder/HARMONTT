import { useAuth } from '../context/AuthContext.jsx';

export default function Panel() {
    const { usuario, cerrarSesion } = useAuth();

    return (
        <section className="seccion">
            <p className="etiqueta-seccion">Panel</p>
            <h1>Hola, {usuario.nombre}</h1>
            <p className="texto-seccion">
                Has iniciado sesión como <strong>{usuario.rol}</strong>. La cookie de sesión
                es httpOnly: React solo conoce tus datos, nunca el token.
            </p>
            <div className="planes">
                <article className="plan">
                    <h3>Tu rol</h3>
                    <p>{usuario.rol}</p>
                </article>
                <article className="plan">
                    <h3>Correo</h3>
                    <p>{usuario.email}</p>
                </article>
                <article className="plan">
                    <h3>Acceso</h3>
                    <p>Autenticado en la API</p>
                </article>
            </div>
            <button className="pildora" type="button" onClick={cerrarSesion}>Cerrar sesión</button>
        </section>
    );
}
