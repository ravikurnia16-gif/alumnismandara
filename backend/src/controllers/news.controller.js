const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
};

const getAllNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'success', data: news });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const news = await prisma.news.create({
      data: {
        title,
        slug: generateSlug(title),
        content,
        image
      }
    });
    res.status(201).json({ status: 'success', data: news });
  } catch (error) {
    console.error("CREATE NEWS ERROR:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const updateData = {
      ...(title && { title, slug: generateSlug(title) }),
      ...(content && { content })
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData
    });
    res.json({ status: 'success', data: news });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.news.delete({ where: { id } });
    res.json({ status: 'success', message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getAllNews, createNews, updateNews, deleteNews };
