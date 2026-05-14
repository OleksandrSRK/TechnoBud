import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
}
log("Server started");

/**
 * GET all products
 */
app.get('/products', async (_req, res) => {
    log("GET /products");

    const data = await prisma.product.findMany();
    res.json(data);
});

/**
 * CREATE product
 */
app.post('/products', async (req, res) => {
    log("POST /products");

    const item = await prisma.product.create({
        data: req.body
    });

    log("Product created");

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


function track(event: string, data?: any) {
    console.log(`[ANALYTICS] ${event}`, data || "");
}

