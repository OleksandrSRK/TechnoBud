import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/**
 * GET all products
 */
app.get('/products', async (_req, res) => {
    const data = await prisma.product.findMany();
    res.json(data);
});

/**
 * CREATE product
 */
app.post('/products', async (req, res) => {
    const item = await prisma.product.create({
        data: req.body
    });

    res.json(item);
});

/**
 * UPDATE product
 */
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.product.update({
        where: {
            id: Number(id)
        },
        data: req.body
    });

    res.json(updated);
});

/**
 * DELETE product
 */
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    const deleted = await prisma.product.delete({
        where: {
            id: Number(id)
        }
    });

    res.json(deleted);
});

app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});