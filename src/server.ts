import express, { Request, Response } from 'express';
import cors from 'cors';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import authRouter from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

function log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
}

function track(event: string, data?: unknown) {
    console.log(`[ANALYTICS] ${event}`, data ?? '');
}

log('Server started');

/**
 * GET all products
 */
app.get('/products', async (_req: Request, res: Response) => {
    try {
        log('GET /products');
        track('products_viewed');

        const products = await prisma.product.findMany();

        return res.json(products);
    } catch (error) {
        console.error(error);

        log(`Error in GET /products: ${(error as Error).message}`);

        return res.status(500).json({
            message: 'Failed to load products',
        });
    }
});

/**
 * CREATE product
 */
app.post('/products', async (req: Request, res: Response) => {
    try {
        log('POST /products');
        track('product_created_attempt', req.body);

        const { name, price } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: 'name and price are required',
            });
        }

        const product = await prisma.product.create({
            data: req.body,
        });

        track('product_created', product);

        log('Product created');

        return res.status(201).json(product);
    } catch (error) {
        console.error(error);

        log(`Error in POST /products: ${(error as Error).message}`);

        return res.status(500).json({
            message: 'Failed to create product',
        });
    }
});

/**
 * UPDATE product
 */
app.put('/products/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: 'Invalid product id',
            });
        }

        log(`PUT /products/${id}`);
        track('product_updated_attempt', {
            id,
            body: req.body,
        });

        const updatedProduct = await prisma.product.update({
            where: {
                id,
            },
            data: req.body,
        });

        track('product_updated', updatedProduct);

        return res.json(updatedProduct);
    } catch (error) {
        console.error(error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        log(`Error in PUT /products/${req.params.id}: ${(error as Error).message}`);

        return res.status(500).json({
            message: 'Failed to update product',
        });
    }
});

/**
 * DELETE product
 */
app.delete('/products/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: 'Invalid product id',
            });
        }

        log(`DELETE /products/${id}`);
        track('product_deleted_attempt', { id });

        const deletedProduct = await prisma.product.delete({
            where: {
                id,
            },
        });

        track('product_deleted', deletedProduct);

        return res.json({
            message: 'Product deleted',
            product: deletedProduct,
        });
    } catch (error) {
        console.error(error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        log(`Error in DELETE /products/${req.params.id}: ${(error as Error).message}`);

        return res.status(500).json({
            message: 'Failed to delete product',
        });
    }
});

app.get('/', (_req: Request, res: Response) => {
    return res.send('API is working');
});

app.use((_req: Request, res: Response) => {
    return res.status(404).json({
        message: 'Route not found',
    });
});

app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});