const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { uploadToMinio } = require('../config/minio');
const prisma = new PrismaClient();

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.json({ status: 'success', data: events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });
    res.json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate } = req.body;
    let imagePath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `event-${Date.now()}${ext}`;
      imagePath = await uploadToMinio(req.file.buffer, filename, req.file.mimetype);
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        ...(imagePath && { image: imagePath })
      }
    });
    res.status(201).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate } = req.body;
    let imagePath = undefined;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `event-${Date.now()}${ext}`;
      imagePath = await uploadToMinio(req.file.buffer, filename, req.file.mimetype);
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        ...(imagePath && { image: imagePath })
      }
    });
    res.json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
