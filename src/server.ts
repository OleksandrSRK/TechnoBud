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
 * ==========================================
 * PRODUCTS ENDPOINTS
 * ==========================================
 */

/**
 * GET all products
 */
app.get('/products', async (_req: Request, res: Response) => {
    try {
        log('GET /products');
        track('products_viewed');

        const products = await prisma.product.findMany({
            include: { images: true }
        });

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

        const { name, price, images, ProductImage, category, brand, specifications, ...productData } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: 'name and price are required',
            });
        }

        const incomingImages: string[] = images || ProductImage;

        const product = await prisma.product.create({
            data: {
                name,
                price,
                ...productData,
                images: Array.isArray(incomingImages) ? {
                    create: incomingImages.map((url: string) => ({ url }))
                } : undefined
            },
            include: { images: true }
        });

        track('product_created', product);
        log('Product created');

        return res.status(201).json(product);
    } catch (error) {
        console.error(error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return res.status(400).json({
                message: 'Foreign key constraint failed. Double check your categoryId and brandId.',
            });
        }

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
        track('product_updated_attempt', { id, body: req.body });

        const { images, ProductImage, category, brand, specifications, cartItems, wishlistItems, orderItems, reviews, movements, ...productData } = req.body;

        const incomingImages: string[] = images || ProductImage;
        const updateData: Prisma.ProductUpdateInput = { ...productData };

        if (Array.isArray(incomingImages)) {
            updateData.images = {
                deleteMany: {},
                create: incomingImages.map((url: string) => ({ url }))
            };
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { images: true }
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
            where: { id },
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


/**
 * ==========================================
 * BRANDS ENDPOINTS
 * ==========================================
 */

/**
 * GET all brands
 */
app.get('/brands', async (_req: Request, res: Response) => {
    try {
        log('GET /brands');
        track('brands_viewed');
        const brands = await prisma.brand.findMany();
        return res.json(brands);
    } catch (error) {
        console.error(error);
        log(`Error in GET /brands: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to load brands' });
    }
});

/**
 * CREATE brand
 */
app.post('/brands', async (req: Request, res: Response) => {
    try {
        log('POST /brands');
        track('brand_created_attempt', req.body);
        const { name, slug, products, ...brandData } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: 'name and slug are required' });
        }

        const brand = await prisma.brand.create({
            data: { name, slug, ...brandData },
        });

        track('brand_created', brand);
        log('Brand created');
        return res.status(201).json(brand);
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: 'Brand with this slug already exists' });
        }
        log(`Error in POST /brands: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to create brand' });
    }
});

/**
 * UPDATE brand
 */
app.put('/brands/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid brand id' });

        log(`PUT /brands/${id}`);
        track('brand_updated_attempt', { id, body: req.body });
        const { products, ...brandData } = req.body;

        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: brandData,
        });

        track('brand_updated', updatedBrand);
        return res.json(updatedBrand);
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Brand not found' });
            if (error.code === 'P2002') return res.status(400).json({ message: 'Brand with this slug already exists' });
        }
        log(`Error in PUT /brands/${req.params.id}: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to update brand' });
    }
});

/**
 * DELETE brand
 */
app.delete('/brands/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid brand id' });

        log(`DELETE /brands/${id}`);
        track('brand_deleted_attempt', { id });

        const deletedBrand = await prisma.brand.delete({ where: { id } });
        track('brand_deleted', deletedBrand);

        return res.json({ message: 'Brand deleted', product: deletedBrand });
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Brand not found' });
            if (error.code === 'P2003') return res.status(400).json({ message: 'Cannot delete brand because it has associated products' });
        }
        log(`Error in DELETE /brands/${req.params.id}: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to delete brand' });
    }
});


/**
 * ==========================================
 * CATEGORIES ENDPOINTS
 * ==========================================
 */

/**
 * GET all categories
 */
app.get('/categories', async (_req: Request, res: Response) => {
    try {
        log('GET /categories');
        track('categories_viewed');
        const categories = await prisma.category.findMany();
        return res.json(categories);
    } catch (error) {
        console.error(error);
        log(`Error in GET /categories: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to load categories' });
    }
});

/**
 * CREATE category
 */
app.post('/categories', async (req: Request, res: Response) => {
    try {
        log('POST /categories');
        track('category_created_attempt', req.body);
        const { name, slug, parent, children, products, ...categoryData } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: 'name and slug are required' });
        }

        const category = await prisma.category.create({
            data: { name, slug, ...categoryData },
        });

        track('category_created', category);
        log('Category created');
        return res.status(201).json(category);
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: 'Category with this slug already exists' });
        }
        log(`Error in POST /categories: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to create category' });
    }
});

/**
 * UPDATE category
 */
app.put('/categories/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid category id' });

        log(`PUT /categories/${id}`);
        track('category_updated_attempt', { id, body: req.body });
        const { parent, children, products, ...categoryData } = req.body;

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: categoryData,
        });

        track('category_updated', updatedCategory);
        return res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Category not found' });
            if (error.code === 'P2002') return res.status(400).json({ message: 'Category with this slug already exists' });
        }
        log(`Error in PUT /categories/${req.params.id}: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to update category' });
    }
});

/**
 * DELETE category
 */
app.delete('/categories/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid category id' });

        log(`DELETE /categories/${id}`);
        track('category_deleted_attempt', { id });

        const deletedCategory = await prisma.category.delete({ where: { id } });
        track('category_deleted', deletedCategory);

        return res.json({ message: 'Category deleted', category: deletedCategory });
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Category not found' });
            if (error.code === 'P2003') return res.status(400).json({ message: 'Cannot delete category because it has associated products' });
        }
        log(`Error in DELETE /categories/${req.params.id}: ${(error as Error).message}`);
        return res.status(500).json({ message: 'Failed to delete category' });
    }
});


/**
 * ==========================================
 * SYSTEM ENDPOINTS
 * ==========================================
 */

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