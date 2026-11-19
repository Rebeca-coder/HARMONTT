import { useState } from 'react';
import { api } from '../services/api.js';

export default function Contacto() {
    const [formulario, setFormulario] = useState({
        nombre: '',
        correo: '',
        asunto: '',
        mensaje: '',
    });
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario({ ...formulario, [name]: value });
    };

    const manejarEnvio = async (evento) => {
        evento.preventDefault();
        setError('');
        setEnviado(false);
        setEnviando(true);

        try {
            await api.post('/contacto', {
                nombre: formulario.nombre,
                email: formulario.correo,
                asunto: formulario.asunto,
                mensaje: formulario.mensaje,
            });
            setEnviado(true);
            setFormulario({ nombre: '', correo: '', asunto: '', mensaje: '' });
        } catch (fallo) {
            setError(fallo.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            <div className="portada-interna">
                <p className="etiqueta-seccion">Contacto</p>
                <h1>Colabora con Harmont</h1>
                <p>
                    Cuéntanos qué necesita tu empresa. Diseñamos un proyecto práctico,
                    seleccionamos a los participantes y supervisamos las entregas.
                </p>
            </div>

            <section className="seccion contacto">
                <form className="formulario-contacto" onSubmit={manejarEnvio}>
                    <div className="campo-formulario">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            value={formulario.nombre}
                            onChange={manejarCambio}
                            placeholder="Tu nombre completo"
                        />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="correo">Correo electrónico</label>
                        <input
                            id="correo"
                            name="correo"
                            type="email"
                            required
                            value={formulario.correo}
                            onChange={manejarCambio}
                            placeholder="nombre@empresa.com"
                        />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="asunto">Asunto</label>
                        <input
                            id="asunto"
                            name="asunto"
                            type="text"
                            required
                            value={formulario.asunto}
                            onChange={manejarCambio}
                            placeholder="¿En qué podemos ayudarte?"
                        />
                    </div>

                    <div className="campo-formulario">
                        <label htmlFor="mensaje">Mensaje</label>
                        <textarea
                            id="mensaje"
                            name="mensaje"
                            required
                            value={formulario.mensaje}
                            onChange={manejarCambio}
                            placeholder="Cuéntanos tu proyecto o tu consulta"
                        />
                    </div>

                    <button className="pildora" type="submit" disabled={enviando}>
                        {enviando ? 'Enviando…' : 'Enviar mensaje →'}
                    </button>

                    {enviado && (
                        <p className="mensaje-exito">Mensaje guardado correctamente en MongoDB.</p>
                    )}
                    {error && <p className="mensaje-error">{error}</p>}
                </form>

                <aside className="datos-contacto">
                    <h2>Hablemos</h2>
                    <p>Harmont revisa cada solicitud y responde con una propuesta de proyecto adaptada a tu necesidad.</p>
                    <p><strong>Correo:</strong> hola@harmont.example</p>
                    <p><strong>Horario:</strong> lunes a viernes, 9:00 a 18:00</p>
                    <p className="aviso">El correo es ilustrativo: se sustituirá al desplegar.</p>
                </aside>
            </section>
        </>
    );
}
