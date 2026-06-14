const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'success', data: jobs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });
    if (!job) return res.status(404).json({ status: 'error', message: 'Job not found' });
    res.json({ status: 'success', data: job });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createJob = async (req, res) => {
  try {
    const { title, company, location, description, deadline } = req.body;
    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        description,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    res.status(201).json({ status: 'success', data: job });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { title, company, location, description, deadline } = req.body;
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title,
        company,
        location,
        description,
        deadline: deadline ? new Date(deadline) : undefined
      }
    });
    res.json({ status: 'success', data: job });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
