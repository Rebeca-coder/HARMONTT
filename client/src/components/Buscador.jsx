import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Buscador() {
    // Tres estados: uno por campo del formulario.
    const [q, setQ] = useState('');
    const [categoria, setCategoria] = useState('');
    const [modalidad, setModalidad] = useState('');
    const navigate = useNavigate();

    const manejarEnvio = (evento) => {
        // Evitamos que el navegador recargue la página (comportamiento por defecto).
        evento.preventDefault();
        const parametros = new URLSearchParams({ q, categoria, modalidad });
        navigate(`/proyectos?${parametros.toString()}`);
    };

    return (
        <form className="buscador" onSubmit={manejarEnvio}>
            <div className="campo">
                <label htmlFor="buscar-q">Proyecto o habilidad</label>
                <input
                    id="buscar-q"
                    name="q"
                    type="text"
                    value={q}
                    onChange={(evento) => setQ(evento.target.value)}
                    placeholder="Ej. marketing, React, diseño"
                />
            </div>
            <div className="campo">
                <label htmlFor="buscar-categoria">Categoría</label>
                <select
                    id="buscar-categoria"
                    name="categoria"
                    value={categoria}
                    onChange={(evento) => setCategoria(evento.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    <option value="marketing">Marketing</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="diseno">Diseño</option>
                    <option value="datos">Datos</option>
                </select>
            </div>
            <div className="campo">
                <label htmlFor="buscar-modalidad">Modalidad</label>
                <select
                    id="buscar-modalidad"
                    name="modalidad"
                    value={modalidad}
                    onChange={(evento) => setModalidad(evento.target.value)}
                >
                    <option value="">Cualquier modalidad</option>
                    <option value="remoto">Remoto</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                </select>
            </div>
            <button className="boton-buscar" type="submit" aria-label="Buscar proyectos">⌕</button>
        </form>
    );
}
