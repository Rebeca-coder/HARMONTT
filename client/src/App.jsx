import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Proyectos from './pages/Proyectos.jsx';
import Contacto from './pages/Contacto.jsx';

// HashRouter produce URLs como /#/proyectos.
// GitHub Pages es un servidor de archivos estáticos: no sabe redirigir /proyectos,
// pero sí encuentra index.html cuando la ruta va después del '#'.
export default function App() {
    return (
        <HashRouter>
            <Routes>
                {/* Layout envuelve a todas las páginas: dibuja navbar y footer una sola vez */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/proyectos" element={<Proyectos />} />
                    <Route path="/contacto" element={<Contacto />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}
