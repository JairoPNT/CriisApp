const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkAvailability, createCalendarEvent, getBusySlots, getAvailableSlots } = require('../utils/googleCalendar');

const getAvailability = async (req, res) => {
    const { start, end, managerId } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'Faltan fechas de inicio o fin' });

    try {
        let calendarId = null;
        if (managerId) {
            const manager = await prisma.user.findUnique({ where: { id: parseInt(managerId) } });
            calendarId = manager?.calendarId;
        }
        const result = await checkAvailability(start, end, calendarId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error consultando disponibilidad', error: error.message });
    }
};

const getBusySchedule = async (req, res) => {
    const { start, end, managerId } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'Faltan fechas de inicio o fin' });

    try {
        let calendarId = null;
        if (managerId) {
            const manager = await prisma.user.findUnique({ where: { id: parseInt(managerId) } });
            calendarId = manager?.calendarId;
        }
        const busy = await getBusySlots(start, end, calendarId);
        res.json(busy);
    } catch (error) {
        res.status(500).json({ message: 'Error consultando agenda', error: error.message });
    }
};

const bookTraining = async (req, res) => {
    const { startTime, endTime, authCode, description, managerId } = req.body;

    if (!startTime || !endTime || !authCode) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        // Validar código de autorización (Código Autorizado)
        const user = await prisma.user.findUnique({
            where: { authCode }
        });

        if (!user || user.role !== 'ENTIDAD') {
            return res.status(401).json({ message: 'Código de autorización inválido o no autorizado' });
        }

        let calendarId = null;
        if (managerId) {
            const manager = await prisma.user.findUnique({ where: { id: parseInt(managerId) } });
            calendarId = manager?.calendarId;
        }

        // Validar disponibilidad de nuevo
        const availability = await checkAvailability(startTime, endTime, calendarId);
        if (!availability.available) {
            return res.status(409).json({ message: 'El horario ya no está disponible' });
        }

        // Crear registro en DB
        const training = await prisma.training.create({
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                entityId: user.id,
                managerId: managerId ? parseInt(managerId) : null,
                description: description || null,
                status: 'CONFIRMADA'
            }
        });

        // Intentar crear evento en Google Calendar
        const calendarEventId = await createCalendarEvent({
            id: training.id,
            startTime,
            endTime,
            description: description || `Capacitación para ${user.businessName || user.username}`
        }, calendarId);

        if (calendarEventId) {
            await prisma.training.update({
                where: { id: training.id },
                data: { calendarEventId }
            });
        }

        res.status(201).json({
            message: 'Capacitación reservada con éxito',
            training
        });

    } catch (error) {
        console.error('Error booking training:', error);
        res.status(500).json({ message: 'Error al procesar la reserva', error: error.message });
    }
};

const getAllTrainings = async (req, res) => {
    try {
        const where = {};
        if (req.user.role === 'GESTOR') {
            where.managerId = req.user.id;
        } else if (req.user.role === 'ENTIDAD') {
            where.entityId = req.user.id;
        } else if (req.user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const trainings = await prisma.training.findMany({
            where,
            include: {
                entity: { select: { name: true, username: true, businessName: true } },
                manager: { select: { name: true, username: true } }
            },
            orderBy: { startTime: 'desc' }
        });
        res.json(trainings);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener capacitaciones', error: error.message });
    }
};

const deleteTraining = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'GESTOR') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        await prisma.training.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Capacitación eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar capacitación', error: error.message });
    }
};

const getAvailableTimeSlots = async (req, res) => {
    const { date, duration, managerId } = req.query;
    if (!date || !duration) return res.status(400).json({ message: 'Faltan fecha o duración' });

    try {
        let calendarId = null;
        if (managerId) {
            const manager = await prisma.user.findUnique({ where: { id: parseInt(managerId) } });
            calendarId = manager?.calendarId;
        }
        const slots = await getAvailableSlots(date, parseInt(duration), calendarId);
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Error consultando slots', error: error.message });
    }
};

const getManagers = async (req, res) => {
    try {
        const managers = await prisma.user.findMany({
            where: { role: 'GESTOR' },
            select: { id: true, name: true, username: true, avatar: true }
        });
        res.json(managers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener gestores', error: error.message });
    }
};

const updateTrainingProgress = async (req, res) => {
    const { id } = req.params;
    const { attendance, salesVolume, notesPre, notesPost, isCompleted, status, startTime, endTime } = req.body;

    try {
        const training = await prisma.training.findUnique({ where: { id: parseInt(id) } });
        if (!training) return res.status(404).json({ message: 'Capacitación no encontrada' });

        if (req.user.role !== 'SUPERADMIN' && req.user.id !== training.managerId) {
            return res.status(403).json({ message: 'No autorizado para actualizar esta capacitación' });
        }

        const updated = await prisma.training.update({
            where: { id: parseInt(id) },
            data: {
                attendance: attendance !== undefined ? parseInt(attendance) : undefined,
                salesVolume: salesVolume !== undefined ? parseFloat(salesVolume) : undefined,
                notesPre,
                notesPost,
                isCompleted,
                status,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                updatedAt: new Date()
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar progreso', error: error.message });
    }
};

module.exports = {
    getAvailability,
    bookTraining,
    getAllTrainings,
    deleteTraining,
    getBusySchedule,
    getAvailableTimeSlots,
    getManagers,
    updateTrainingProgress
};
