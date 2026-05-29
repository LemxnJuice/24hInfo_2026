import { Router } from 'express';
import prisma from '../prisma';
import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

const router = Router();

// multer upload config
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// create ad
router.post('/', upload.array('images', 6), async (req: Request, res) => {
  try {
    const { title, description, price, city, region, categories, contact, ownerId } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;
    const images = files && files.length ? files.map(f => '/uploads/' + path.basename(f.path)) : [];
    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        city,
        region,
        categories,
        images,
        contact,
        ownerId: parseInt(ownerId)
      }
    });
    res.json(ad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get ads with search and filters
router.get('/', async (req, res) => {
  try {
    const { q, category, city } = req.query;
    const where: any = { isHidden: false };
    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } }
      ];
    }
    if (category) where.categories = { contains: String(category) };
    if (city) where.city = { equals: String(city), mode: 'insensitive' };
    const ads = await prisma.ad.findMany({ where });
    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get ad by id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) return res.status(404).json({ error: 'Not found' });
    res.json(ad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// edit ad
router.put('/:id', upload.array('images', 6), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data: any = req.body;
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      data.images = (req.files as Express.Multer.File[]).map(f => '/uploads/' + path.basename(f.path));
    }
    if (data.price) data.price = parseFloat(data.price);
    const updated = await prisma.ad.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete ad
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.ad.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
