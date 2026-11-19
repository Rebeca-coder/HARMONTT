import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Buscador from '../components/Buscador.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

// Datos provisionales para maquetar. En la FASE 5 vendrán de la API.
const proyectos = [
    {
        imagen: '/img/proyecto-marketing.jpg',
        etiqueta: 'Marketing · Simulado',
        meta: '4 semanas · Remoto · Harmont selecciona',
        titulo: 'Estrategia de marketing para una marca ficticia',
        descripcion: 'Diseña una estrategia completa de lanzamiento y presenta tus entregables.',
    },
    {
        imagen: '/img/proyecto-datos.jpg',
        etiqueta: 'Datos · Voluntario',
        meta: '6 semanas · Híbrido · Harmont selecciona',
        titulo: 'Dashboard de impacto para una organización social',
        descripcion: 'Convierte datos reales en un panel claro para medir resultados.',
    },
    {
        imagen: '/img/proyecto-diseno.jpg',
        etiqueta: 'Diseño · Remunerado',
        meta: '3 semanas · Remoto · Harmont selecciona',
        titulo: 'Rediseño de la experiencia de usuario',
        descripcion: 'Investiga, propón mejoras y entrega un prototipo justificado.',
    },
];

export default function Home() {
    const location = useLocation();

    //Si venimos desde el menú con un destino, desplazamos la página a esa sección.
    useEffect(() => {
        const seccion = location.state?.seccion;
        if (seccion) {
            document.getElementById(seccion)?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state]);

    const irASeccion = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            {/* 1. Hero */}
            <section className="hero" id="inicio">
                <div className="hero-marco">
                    <img
                        className="hero-imagen"
                        src="/img/hero.jpg"
                        alt="Equipo diverso colaborando con laptops en un espacio de trabajo luminoso"
                    />
                    <div className="hero-velo" aria-hidden="true"></div>

                    <h1 className="hero-titulo">HARMONT</h1>

                    <p className="hero-titular">
                        EXPERIENCIA DEMOSTRABLE<br />PARA JÓVENES TALENTOSOS
                    </p>

                    <p className="hero-texto">
                        Conectamos a estudiantes con proyectos reales y simulados para que
                        demuestren lo que saben hacer y construyan un portafolio con evidencia.
                    </p>

                    <Link className="hero-accion" to="/proyectos">
                        <span className="circulo-flecha" aria-hidden="true">→</span>
                        EXPLORA LOS PROYECTOS
                    </Link>

                    <button
                        type="button"
                        className="hero-deslizamiento"
                        onClick={() => irASeccion('proyectos')}
                    >
                        DESLIZA PARA DESCUBRIR ↓
                    </button>

                    <div className="hero-tarjeta">
                        <img
                            src="/img/miniatura.jpg"
                            alt="Detalle de una persona tomando notas en un proyecto"
                        />
                        <div>
                            <strong>Proyecto destacado</strong>
                            <span>Marketing · Remoto</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Buscador */}
            <Buscador />

            {/* 3. Proyectos destacados */}
            <section className="seccion" id="proyectos">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">01 / Oportunidades</p>
                        <h2 className="titulo-seccion">Proyectos recomendados</h2>
                        <p className="texto-seccion">
                            Retos con objetivos, tareas y entregables definidos. Elige uno y empieza a construir tu experiencia.
                        </p>
                    </div>
                    <Link className="enlace-con-flecha" to="/proyectos">Ver todos los proyectos →</Link>
                </div>

                <div className="lista-tarjetas">
                    {proyectos.map((proyecto) => (
                        <ProjectCard key={proyecto.titulo} {...proyecto} />
                    ))}
                </div>
            </section>

            {/* 4. Beneficios */}
            <section className="seccion por-que">
                <div>
                    <p className="etiqueta-seccion">02 / Por qué Harmont</p>
                    <h2 className="titulo-seccion">No somos una bolsa de empleo ni una plataforma de cursos</h2>
                    <p className="texto-seccion">
                        Aquí demuestras lo que sabes hacer con trabajos concretos. Las empresas conocen talento joven por lo que produce, no solo por un currículum.
                    </p>

                    <div className="estadisticas">
                        <div><strong>Gratis</strong><span>para estudiantes</span></div>
                        <div><strong>9</strong><span>categorías de proyectos</span></div>
                        <div><strong>3</strong><span>tipos de proyecto</span></div>
                    </div>
                </div>

                <div className="tres">
                    <div className="carta-servicio">
                        <span className="icono" aria-hidden="true">💼</span>
                        <div>
                            <h3>Proyectos prácticos</h3>
                            <p>Retos con objetivos, instrucciones y entregables claros para practicar de verdad.</p>
                        </div>
                    </div>
                    <div className="carta-servicio">
                        <span className="icono" aria-hidden="true">✅</span>
                        <div>
                            <h3>Selección supervisada</h3>
                            <p>Harmont revisa cada perfil con criterios claros; la decisión no es automática.</p>
                        </div>
                    </div>
                    <div className="carta-servicio">
                        <span className="icono" aria-hidden="true">🎓</span>
                        <div>
                            <h3>Portafolio y referencias</h3>
                            <p>Tus trabajos aprobados se convierten en evidencia de tus habilidades.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Categorías */}
            <section className="seccion">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">03 / Categorías</p>
                        <h2 className="titulo-seccion">Encuentra tu espacio</h2>
                    </div>
                </div>
                <div className="lista-categorias">
                    <Link className="chip" to="/proyectos?categoria=marketing">Marketing</Link>
                    <Link className="chip" to="/proyectos?categoria=tecnologia">Tecnología</Link>
                    <Link className="chip" to="/proyectos?categoria=diseno">Diseño</Link>
                    <Link className="chip" to="/proyectos?categoria=datos">Datos</Link>
                    <Link className="chip" to="/proyectos?categoria=comunicacion">Comunicación</Link>
                    <Link className="chip" to="/proyectos?categoria=finanzas">Finanzas</Link>
                    <Link className="chip" to="/proyectos?categoria=rrhh">Recursos Humanos</Link>
                    <Link className="chip" to="/proyectos?categoria=logistica">Logística</Link>
                    <Link className="chip" to="/proyectos?categoria=educacion">Educación</Link>
                </div>
            </section>

            {/* 6. Experiencia en dos columnas */}
            <section className="seccion experiencia">
                <div>
                    <p className="etiqueta-seccion">04 / Experiencia real</p>
                    <h2 className="titulo-seccion">Eleva tu experiencia</h2>
                    <p className="texto-seccion">
                        Cada proyecto es una oportunidad para practicar, recibir retroalimentación y dejar una huella verificable de tu trabajo.
                    </p>

                    <div className="tres tres-con-margen">
                        <div className="carta-servicio">
                            <span className="icono" aria-hidden="true">◎</span>
                            <div>
                                <h3>Retos con entregables claros</h3>
                                <p>Sabes desde el principio qué debes producir y cómo se evaluará.</p>
                            </div>
                        </div>
                        <div className="carta-servicio">
                            <span className="icono" aria-hidden="true">✦</span>
                            <div>
                                <h3>Acompañamiento de Harmont</h3>
                                <p>Revisamos las postulaciones y preseleccionamos a los candidatos.</p>
                            </div>
                        </div>
                        <div className="carta-servicio">
                            <span className="icono" aria-hidden="true">▣</span>
                            <div>
                                <h3>Evidencia para tu portafolio</h3>
                                <p>Tus entregables aprobados se convierten en pruebas de tus habilidades.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="experiencia-imagen">
                    <img
                        src="/img/experiencia.jpg"
                        alt="Joven profesional sentada con luz natural en una oficina"
                    />
                    <div className="etiqueta-flotante">
                        <strong>Proyecto destacado</strong>
                        <span>Diseño · Modalidad remota</span>
                    </div>
                </div>
            </section>

            {/* 7. Cómo funciona */}
            <section className="seccion" id="como-funciona">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">05 / Cómo funciona</p>
                        <h2 className="titulo-seccion">Empezar es así de fácil</h2>
                    </div>
                </div>
                <ol className="pasos">
                    <li><b>1</b><h3>Crea tu perfil</h3><p>Cuenta quién eres, qué sabes hacer y qué te interesa.</p></li>
                    <li><b>2</b><h3>Encuentra proyectos</h3><p>Busca por categoría, modalidad, duración y habilidades.</p></li>
                    <li><b>3</b><h3>Demuestra tus habilidades</h3><p>Entrega tu trabajo y recibe retroalimentación.</p></li>
                    <li><b>4</b><h3>Construye tu experiencia</h3><p>Suma evidencia real a tu portafolio profesional.</p></li>
                </ol>
            </section>

            {/* 8. Empresas */}
            <section className="seccion" id="empresas">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">06 / Para empresas</p>
                        <h2 className="titulo-seccion">Descubre talento viéndolo trabajar</h2>
                        <p className="texto-seccion">
                            Conviertes tu necesidad en un reto con entregables definidos. Harmont revisa la propuesta, preselecciona candidatos y supervisa el proceso.
                        </p>
                    </div>
                    <Link className="pildora" to="/contacto">Publicar un proyecto</Link>
                </div>
            </section>

            {/* 9. Modelo de negocio */}
            <section className="seccion" id="modelo">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">07 / Modelo de negocio</p>
                        <h2 className="titulo-seccion">Un modelo sostenible para todas las partes</h2>
                        <p className="texto-seccion">
                            Los estudiantes participan gratis. Harmont genera ingresos con servicios para empresas, sin cobros automáticos en esta versión.
                        </p>
                    </div>
                </div>
                <div className="planes">
                    <article className="plan">
                        <h3>Publicación de proyectos</h3>
                        <p>La empresa propone un reto con entregables definidos. Harmont lo revisa antes de publicarlo.</p>
                    </article>
                    <article className="plan">
                        <h3>Preselección de talento</h3>
                        <p>Harmont evalúa los perfiles y presenta a la empresa solo los candidatos preseleccionados.</p>
                    </article>
                    <article className="plan">
                        <h3>Planes empresariales</h3>
                        <p>Paquetes con distintos beneficios: número de proyectos, informes y acompañamiento.</p>
                    </article>
                </div>
            </section>

            {/* 10. Llamada a la acción */}
            <section className="seccion">
                <div className="llamada">
                    <h2>Tu primera oportunidad empieza con una entrega</h2>
                    <p>Explora los proyectos disponibles o cuéntanos qué necesita tu empresa. Nosotros nos encargamos del resto.</p>
                    <Link className="pildora" to="/proyectos">Explorar proyectos →</Link>
                </div>
            </section>

            {/* 11. Contacto */}
            <section className="seccion" id="contacto">
                <div className="cabecera-seccion">
                    <div>
                        <p className="etiqueta-seccion">08 / Contacto</p>
                        <h2 className="titulo-seccion">Hablemos de tu próximo proyecto</h2>
                        <p className="texto-seccion">
                            Cuéntanos qué necesitas y diseñamos juntos un reto con objetivos y entregables claros.
                        </p>
                    </div>
                    <Link className="pildora" to="/contacto">Enviar un mensaje</Link>
                </div>
            </section>
        </>
    );
}
