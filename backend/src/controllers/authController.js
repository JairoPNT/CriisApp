const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

const login = async (req, res) => {
    const usernameParam = req.body.username?.trim();
    const { password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: usernameParam,
                    mode: 'insensitive'
                }
            },
        });

        if (user && (await comparePassword(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { username, email, phone, avatar, password } = req.body;
    try {
        const updateData = { username, email, phone, avatar };
        if (password) {
            updateData.password = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
        });

        res.json({
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true, email: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

const seedUsers = async (req, res) => {
    try {
        const userCount = await prisma.user.count();

        if (userCount > 0) {
            return res.status(400).json({ message: 'Los usuarios ya han sido inicializados' });
        }

        const superAdminPassword = await hashPassword('jairo123');
        const gestorPassword = await hashPassword('cristhel123');

        await prisma.user.createMany({
            data: [
                { username: 'Jairo Pinto', password: superAdminPassword, role: 'SUPERADMIN', email: 'jairo@pnt.com' },
                { username: 'Cristhel Moreno', password: gestorPassword, role: 'GESTOR', email: 'cristhel@crismor.com' },
            ],
        });

        res.json({ message: 'Usuarios inicializados correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al inicializar usuarios', error: error.message });
    }
};

module.exports = {
    login,
    updateProfile,
    getUsers,
    seedUsers,
};
