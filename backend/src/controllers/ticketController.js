const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const { triggerN8nWebhook } = require('../utils/n8n');

// Generate unique ticket ID (e.g., PQR1A2B3)
const generateTicketId = () => {
    return `PQR${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const createTicket = async (req, res) => {
    try {
        const { patientName, contactMethod, city, phone, email, description } = req.body;

        // Validation
        if (!patientName || !city || !phone || !description) {
            return res.status(400).json({ message: 'Nombre, ciudad, teléfono y descripción son obligatorios' });
        }

        const ticketId = generateTicketId();

        const ticket = await prisma.ticket.create({
            data: {
                id: ticketId,
                patientName,
                contactMethod,
                city,
                phone,
                email,
                description,
                status: 'INICIADO',
                revenue: 70000,
                assignedToId: req.user.id, // Assigned to the creator
                media: {
                    create: req.files ? req.files.map(file => ({ url: file.path })) : [],
                },
            },
            include: { media: true, assignedTo: true },
        });

        // Trigger n8n notification
        triggerN8nWebhook(ticket, 'NEW_TICKET');

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ message: 'Error interno al crear el ticket', error: error.message });
    }
};

const getTickets = async (req, res) => {
    try {
        const query = {
            orderBy: { createdAt: 'desc' },
            include: { followUps: true, media: true, assignedTo: true },
        };

        // If not SUPERADMIN, only show assigned tickets
        if (req.user.role !== 'SUPERADMIN') {
            query.where = { assignedToId: req.user.id };
        }

        const tickets = await prisma.ticket.findMany(query);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tickets', error: error.message });
    }
};

const getTicketByPublicId = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'ID de ticket es requerido' });

    const normalizedId = id.trim().toUpperCase().replace(/-/g, '');

    try {
        const ticket = await prisma.ticket.findFirst({
            where: {
                OR: [
                    { id: normalizedId },
                    { id: id.trim().toUpperCase() }
                ]
            },
            include: {
                followUps: { orderBy: { createdAt: 'desc' } },
                media: true,
                assignedTo: { select: { username: true } } // ONLY include the name for privacy
            },
        });

        if (!ticket) {
            return res.status(404).json({ message: 'No encontramos ningún caso con ese código. Por favor, verifica el número e intenta de nuevo.' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar el ticket', error: error.message });
    }
};

const reassignTicket = async (req, res) => {
    const { id } = req.params;
    const { assignedToId } = req.body;

    try {
        if (req.user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Solo el administrador puede reasignar tickets' });
        }

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { assignedToId: parseInt(assignedToId) },
            include: { assignedTo: true }
        });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al reasignar ticket', error: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const totalTickets = await prisma.ticket.count();
        const resolvedTickets = await prisma.ticket.count({ where: { status: 'FINALIZADO' } });
        const revenue = await prisma.ticket.aggregate({
            _sum: { revenue: true }
        });

        const cityStats = await prisma.ticket.groupBy({
            by: ['city'],
            _count: { _all: true }
        });

        res.json({
            totalTickets,
            resolvedTickets,
            totalRevenue: revenue._sum.revenue || 0,
            cityStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketByPublicId,
    addFollowUp,
    getStats,
    reassignTicket
};
