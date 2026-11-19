# Harmont

Plataforma que conecta jóvenes con empresas mediante **proyectos prácticos**. No es una bolsa de empleo ni una red social profesional: el estudiante demuestra lo que sabe hacer con entregables concretos y construye experiencia verificable.

Harmont actúa como intermediario: revisa las propuestas de las empresas, las publica, recibe las postulaciones, **preselecciona** candidatos y se los presenta a la empresa, que toma la **decisión final**.

> MongoDB es la fuente de la verdad. Express valida permisos y reglas de negocio. React solo presenta.

---

## Estado del proyecto

| Parte | Estado |
|---|---|
| Prototipo HTML original (`index.html`, `catalogo.html`, `contacto.html`) | Conservado en la raíz |
| Maqueta visual responsiva | `maquetas/` |
| Landing React + rutas + componentes | `client/` |
| API Express + modelos + auth + flujo de proyectos/postulaciones | `server/` |
| Paneles por rol | Pendiente |
| MongoDB Atlas / despliegue | Pendiente |

---

## Estructura

```
Harmont-Ashley-Tobar/
├── client/                 React + Vite (landing pública)
│   ├── public/favicon.png
│   └── src/
│       ├── components/     Layout, Navbar, Footer, Buscador, ProjectCard
│       ├── pages/          Home, Proyectos, Contacto
│       ├── styles/         styles.css (comparte diseño con la maqueta)
│       ├── App.jsx         rutas HashRouter
│       └── main.jsx        punto de entrada
├── server/                 Node + Express + MongoDB
│   ├── src/
│   │   ├── config/         constants.js, env.js, db.js
│   │   ├── models/         8 esquemas Mongoose
│   │   ├── middleware/     auth.js (cookie, JWT, requireRol, requireAccion)
│   │   ├── services/       estados, propiedad, perfil, auditoría
│   │   ├── controllers/    auth, contacto, proyectos, postulaciones
│   │   ├── routes/         /api/...
│   │   ├── app.js
│   │   └── server.js
│   └── tests/              pruebas con node:test
├── maquetas/               HTML/CSS estático de referencia
├── img/                    favicon original
└── README.md
```

---

## Requisitos

- Node.js 20 o superior (se desarrolló con Node 26).
- npm 10 o superior.
- MongoDB Atlas (o un MongoDB local). Todavía no hay cuenta configurada.

---

## Puesta en marcha

### Backend

```bash
cd server
cp .env.example .env
# Edita .env con tu MONGO_URI y tu JWT_SECRET
npm install
npm run dev        # node --watch, reinicia al cambiar archivos
npm start          # forma de producción
npm test           # pruebas sin base de datos
```

La API queda en `http://localhost:4000`. Comprueba que responde:

```
GET http://localhost:4000/api/salud
→ { "ok": true, "servicio": "harmont-api" }
```

### Frontend

```bash
cd client
npm install
npm run dev
```

La landing queda en `http://localhost:5173`. Las rutas son de hash:

```
http://localhost:5173/#/
http://localhost:5173/#/proyectos
http://localhost:5173/#/contacto
```

`HashRouter` se usa porque GitHub Pages es un servidor de archivos estáticos: no sabe responder a `/proyectos`, pero sí encuentra `index.html` cuando la ruta va después de `#`.

### Variables de entorno

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://...` | Conexión a MongoDB |
| `JWT_SECRET` | cadena larga y aleatoria | Firma del token de sesión |
| `JWT_EXPIRES_IN` | `7d` | Duración del token |
| `CLIENT_URL` | `http://localhost:5173` | Origen permitido por CORS |
| `PORT` | `4000` | Puerto de la API |
| `NODE_ENV` | `development` | Controla cookies y mensajes de error |

---

## API REST

### Públicas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/salud` | Comprobación de vida |
| GET | `/api/proyectos` | Catálogo: `q`, `categoria`, `modalidad`, `origen`, `tipoEconomico` |
| GET | `/api/proyectos/:id` | Detalle |
| POST | `/api/auth/registro` | Registro de estudiante o empresa |
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/auth/logout` | Cierre de sesión |
| POST | `/api/contacto` | Guarda un mensaje |

### Autenticadas

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/auth/me` | cualquiera |
| GET | `/api/proyectos/mia/lista` | empresa |
| POST | `/api/proyectos` | empresa verificada |
| POST | `/api/proyectos/simulados` | admin |
| PATCH | `/api/proyectos/:id` | dueño o admin |
| POST | `/api/proyectos/:id/enviar-revision` | empresa |
| POST | `/api/proyectos/:id/{tomar-revision,aprobar,rechazar,publicar,iniciar,finalizar}` | admin |
| GET | `/api/proyectos/:id/postulaciones` | empresa dueña |
| POST | `/api/postulaciones` | estudiante |
| GET | `/api/postulaciones/mias` | estudiante |
| GET | `/api/postulaciones/admin` | admin |
| GET | `/api/postulaciones/:id/historial` | admin |
| POST | `/api/postulaciones/:id/{revisar,preseleccionar,no-preseleccionar,compartir}` | admin |
| POST | `/api/postulaciones/:id/{seleccionar,no-seleccionar}` | empresa |
| POST | `/api/postulaciones/:id/retirar` | estudiante |

Todas las respuestas usan `{ "ok": true/false, ... }`. Los errores incluyen `mensaje` y, cuando aplica, `detalles`.

---

## Flujo de selección: dos etapas

```
EMPRESA              HARMONT (admin)              ESTUDIANTE
   │                       │                            │
   ├─ propone proyecto ───►│                            │
   │                       ├─ revisa / aprueba          │
   │                       ├─ publica ─────────────────►├─ se postula
   │◄──────────────────────┤ recibe TODAS               │
   │                       ├─ revisa                    │
   │                       ├─ preselecciona ───────────►├─ ve "Preseleccionada"
   │◄──────────────────────┤ comparte SOLO esos         │
   ├─ decide final ───────►│                            │
   │                       ├─ registra ────────────────►├─ ve "Seleccionada"
```

### Estados de postulación

`recibida` → `en_revision` → `preseleccionada` → `en_evaluacion_empresa` → `seleccionada`

Ramas: `no_preseleccionada`, `no_seleccionada`, `retirada`.

### Reglas que el backend hace cumplir

- La empresa **no puede** preseleccionar ni ver postulaciones que no estén en `en_evaluacion_empresa`, `seleccionada` o `no_seleccionada`.
- El administrador **no puede** marcar la selección final.
- Cada decisión tiene su propio campo (`decisionHarmont` / `decisionEmpresa`) y se escribe en `decisionlogs`.
- La empresa no puede seleccionar más estudiantes que `project.participantes`.
- Un estudiante no puede postularse dos veces al mismo proyecto (índice único).
- No se exige experiencia previa para crear cuenta ni para postularse.

---

## Matriz de permisos

| Acción | Estudiante | Empresa | Admin |
|---|:---:|:---:|:---:|
| Postularse | ✅ | ❌ | ❌ |
| Ver sus postulaciones | ✅ | ❌ | ✅ |
| Crear proyecto | ❌ | ✅ | ✅ (simulado) |
| Enviar a revisión | ❌ | ✅ | ❌ |
| Aprobar / publicar | ❌ | ❌ | ✅ |
| Ver todas las postulaciones | ❌ | ❌ | ✅ |
| Preseleccionar | ❌ | ❌ | ✅ |
| Ver preseleccionados | ❌ | ✅ | ✅ |
| Selección final | ❌ | ✅ | ❌ |

La interfaz oculta botones, pero la autoridad está en `requireAccion()` del servidor: si alguien escribe la URL a mano, recibe `403`.

---

## Modelos de datos

| Colección | Contenido |
|---|---|
| `users` | Credenciales, rol, activo |
| `studentprofiles` | Perfil del joven (1:1 con user) |
| `companyprofiles` | Perfil empresarial + verificación |
| `projects` | Proyectos con `origen` y `tipoEconomico` como dos ejes |
| `applications` | Postulaciones con dos decisiones separadas |
| `experiencerecords` | Historial; `referencia` reservada para el futuro |
| `decisionlogs` | Auditoría de decisiones |
| `contactmessages` | Mensajes del formulario |

`origen` = `real` / `simulado`. `tipoEconomico` = `remunerado` / `voluntario` / `formativo`.

El porcentaje de perfil **se calcula** (`perfilService.js`), no se guarda.

---

## Decisiones técnicas

- **`:root` en CSS**: es el elemento `<html>`; permite cambiar toda la paleta desde un solo sitio.
- **Cookie `httpOnly`**: React nunca guarda el token en `localStorage`.
- **`sameSite: none` + `secure`** en producción, para frontend y backend en dominios distintos.
- **Intentos de login limitados** con `express-rate-limit`.
- **`helmet`** añade cabeceras de seguridad.
- **Lista blanca de campos** al crear/editar proyectos: `req.body` nunca se copia completo.
- **Errores 503** cuando MongoDB no está disponible, en vez de un 500 opaco.

---

## Pruebas

```bash
cd server && npm test
```

Actualmente: **33 pruebas, 33 en verde**. Cubren permisos, transiciones, cupo, filtros de visibilidad, validación de modelos y escapado del buscador.

```bash
cd client && npm run build && npm audit
```

Compilación limpia y **0 vulnerabilidades**.

---

## Pendiente

- Conectar React con la API (registro, login, contacto, catálogo).
- Paneles de estudiante, empresa y administrador.
- Recomendador ponderado (habilidades 50%, intereses 30%, categoría 20%).
- MongoDB Atlas y despliegue (GitHub Pages + servicio de backend).
- Transacciones para el control de cupo.
- Sustituir las fotos provisionales de `picsum.photos`.
- Funcionalidades fuera de esta versión: chat, videollamadas, pagos, suscripciones, notificaciones avanzadas, app móvil.
