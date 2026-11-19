import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { ROLES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NOMBRE, generarToken, opcionesCookie } from '../middleware/auth.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : valor);
const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

function datosPublicos(usuario) {
    return {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
    };
}

export const registrar = asyncHandler(async (req, res) => {
    const {
        nombre,
        email,
        password,
        rol,
        ubicacion,
        formacion,
        institucion,
        areaInteres,
        nombreComercial,
        razonSocial,
        correoEmpresarial,
        personaContacto,
        sector,
        ciudad,
        descripcion,
        sitioWeb,
    } = req.body;

    // El rol admin jamás se crea desde un formulario público.
    if (![ROLES.ESTUDIANTE, ROLES.EMPRESA].includes(rol)) {
        throw new ApiError(403, 'El registro público solo permite estudiantes y empresas');
    }

    if (!texto(nombre) || !texto(email) || !password) {
        throw new ApiError(400, 'Nombre, correo y contraseña son obligatorios');
    }

    if (!correoValido(texto(email))) {
        throw new ApiError(400, 'El correo no tiene un formato válido');
    }

    if (password.length < 8) {
        throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres');
    }

    const emailNormalizado = texto(email).toLowerCase();
    const existe = await User.findOne({ email: emailNormalizado });
    if (existe) {
        throw new ApiError(409, 'Ya existe una cuenta con ese correo');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const usuario = await User.create({
        nombre: texto(nombre),
        email: emailNormalizado,
        passwordHash,
        rol,
    });

    if (rol === ROLES.ESTUDIANTE) {
        await StudentProfile.create({
            usuario: usuario._id,
            ubicacion: texto(ubicacion),
            formacion: texto(formacion),
            institucion: texto(institucion),
            areaInteres: texto(areaInteres),
        });
    } else {
        // La cuenta empresarial nace pendiente: no puede publicar proyectos todavía.
        await CompanyProfile.create({
            usuario: usuario._id,
            nombreComercial: texto(nombreComercial) || texto(nombre),
            razonSocial: texto(razonSocial),
            correoEmpresarial: texto(correoEmpresarial) || emailNormalizado,
            personaContacto: texto(personaContacto) || texto(nombre),
            sector: texto(sector),
            ciudad: texto(ciudad),
            descripcion: texto(descripcion),
            sitioWeb: texto(sitioWeb),
            estadoVerificacion: 'pendiente',
        });
    }

    res.cookie(COOKIE_NOMBRE, generarToken(usuario), opcionesCookie());

    res.status(201).json({
        ok: true,
        mensaje: 'Cuenta creada correctamente',
        usuario: datosPublicos(usuario),
    });
});

export const iniciarSesion = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Correo y contraseña son obligatorios');
    }

    // select:false en el modelo obliga a pedir el hash explícitamente aquí.
    const usuario = await User.findOne({ email: texto(email).toLowerCase() }).select('+passwordHash');

    if (!usuario || !usuario.activo || !(await bcrypt.compare(password, usuario.passwordHash))) {
        throw new ApiError(401, 'Correo o contraseña incorrectos');
    }

    res.cookie(COOKIE_NOMBRE, generarToken(usuario), opcionesCookie());

    res.json({
        ok: true,
        mensaje: 'Sesión iniciada',
        usuario: datosPublicos(usuario),
    });
});

export const cerrarSesion = (req, res) => {
    res.clearCookie(COOKIE_NOMBRE, opcionesCookie());
    res.json({ ok: true, mensaje: 'Sesión cerrada' });
};

export const yo = (req, res) => {
    res.json({ ok: true, usuario: datosPublicos(req.usuario) });
};
