import { Request, Response } from 'express'
import { Prisma } from '../../generated/prisma/client'
import { prisma } from '../prisma'

function log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`)
}

function track(event: string, data?: unknown) {
    console.log(`[ANALYTICS] ${event}`, data ?? '')
}

function toBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return fallback
}

export const getProducts = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string | undefined;

        const where: any = {
            isActive: true,
            category: { isActive: true },
            brand: { isActive: true },
        };

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { shortDescription: { contains: search } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                specifications: true,
                category: true,
                brand: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(products);
    } catch (error) {
        console.error('GET /products ERROR:', error);
        return res.status(500).json({ message: 'Failed to load products' });
    }
};

export const getProductsPaginated = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string | undefined
        const categorySlug = req.query.category as string | undefined
        const brandSlug = req.query.brand as string | undefined
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined
        const color = req.query.color as string | undefined
        const material = req.query.material as string | undefined
        const energyClass = req.query.energyClass as string | undefined
        const minRating = req.query.minRating ? Number(req.query.minRating) : undefined
        const inStockOnly = req.query.inStockOnly === 'true'
        const sort = req.query.sort as string | undefined
        const cursor = req.query.cursor ? Number(req.query.cursor) : undefined
        const take = Math.min(100, Number(req.query.take) || 12)

        const where: any = {
            isActive: true,
            category: { isActive: true },
            brand: { isActive: true },
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { shortDescription: { contains: search } },
            ]
        }
        if (categorySlug) {
            where.category = { ...where.category, slug: categorySlug }
        }
        if (brandSlug) {
            where.brand = { ...where.brand, slug: brandSlug }
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {}
            if (minPrice !== undefined) where.price.gte = minPrice
            if (maxPrice !== undefined) where.price.lte = maxPrice
        }
        if (color && color !== 'all') {
            where.color = color
        }
        if (material && material !== 'all') {
            where.material = material
        }
        if (energyClass && energyClass !== 'all') {
            where.energyClass = energyClass
        }
        if (minRating !== undefined) {
            where.rating = { gte: minRating }
        }
        if (inStockOnly) {
            where.stock = { gt: 0 }
        }

        // Сортування: спочатку за наявністю (stock > 0 – вище), потім за вибраним критерієм
        const orderBy: any[] = [{ stock: 'desc' }]   // товари в наявності перші

        if (sort === 'price-asc') {
            orderBy.push({ price: 'asc' })
        } else if (sort === 'price-desc') {
            orderBy.push({ price: 'desc' })
        } else if (sort === 'rating-desc') {
            orderBy.push({ rating: 'desc' })
        } else if (sort === 'name-asc') {
            orderBy.push({ name: 'asc' })
        } else {
            // default – додаємо сортування за датою, щоб усередині групи був стабільний порядок
            orderBy.push({ createdAt: 'desc' })
        }

        // Завжди останнім – id для стабільності курсорної пагінації
        orderBy.push({ id: 'asc' })

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                specifications: true,
                category: true,
                brand: true,
            },
            orderBy,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            take,
        })

        return res.json(products)
    } catch (error) {
        console.error('GET /products/paginated ERROR:', error)
        return res.status(500).json({ message: 'Failed to load products' })
    }
}

export const getProductById = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product id' })

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                specifications: true,
                category: true,
                brand: true,
            },
        })
        if (!product) return res.status(404).json({ message: 'Product not found' })
        return res.json(product)
    } catch (error) {
        console.error('GET /products/:id ERROR:', error)
        return res.status(500).json({ message: 'Failed to load product' })
    }
}

export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                images: true,
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return res.json(products)
    } catch (error) {
        console.error('GET /products/all ERROR:', error)
        return res.status(500).json({ message: 'Failed to load products' })
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { images, ...data } = req.body;

        const numericFields: Record<string, any> = {
            price: Number(data.price),
            stock: Number(data.stock) || 0,
            categoryId: Number(data.categoryId),
            brandId: Number(data.brandId),
            oldPrice: data.oldPrice != null ? Number(data.oldPrice) : undefined,
            warrantyMonths: data.warrantyMonths != null ? Number(data.warrantyMonths) : undefined,
            powerW: data.powerW != null ? Number(data.powerW) : undefined,
            weightKg: data.weightKg != null ? Number(data.weightKg) : undefined,
        };

        const productData = {
            ...data,
            ...numericFields,
            description: data.description || '',
        };

        const product = await prisma.product.create({
            data: productData,
        });

        if (Array.isArray(images) && images.length > 0) {
            await prisma.productImage.createMany({
                data: images.map((img: any, index: number) => ({
                    url: img.url,
                    alt: img.alt || null,
                    isMain: img.isMain || false,
                    sortOrder: index,
                    productId: product.id,
                })),
            });
        }

        const finalProduct = await prisma.product.findUnique({
            where: { id: product.id },
            include: { images: true, category: true, brand: true },
        });
        return res.status(201).json(finalProduct);
    } catch (error: any) {
        console.error('CREATE PRODUCT ERROR:', error);
        return res.status(500).json({ message: 'Failed to create product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product id' })

    const { images, category, brand, ...data } = req.body
    const numericFields = ['price', 'oldPrice', 'stock', 'categoryId', 'brandId', 'warrantyMonths', 'powerW', 'weightKg']
    numericFields.forEach(field => {
        if (data[field] !== undefined) {
            data[field] = Number(data[field])
            if (isNaN(data[field])) delete data[field]
        }
    })

    try {
        const updated = await prisma.product.update({
            where: { id },
            data,
            include: { images: true, category: true, brand: true },
        })
        if (images !== undefined) {
            await prisma.productImage.deleteMany({ where: { productId: id } })
            if (Array.isArray(images) && images.length > 0) {
                await prisma.productImage.createMany({
                    data: images.map((img: any, index: number) => ({
                        url: img.url,
                        alt: img.alt || null,
                        isMain: img.isMain || false,
                        sortOrder: index,
                        productId: id,
                    })),
                })
            }
        }
        const final = await prisma.product.findUnique({
            where: { id },
            include: { images: true, category: true, brand: true },
        })
        return res.json(final)
    } catch (error: any) {
        console.error('UPDATE PRODUCT ERROR:', error)
        return res.status(500).json({ message: 'Failed to update product' })
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid product id' })
    try {
        await prisma.product.delete({ where: { id } })
        return res.json({ message: 'Product deleted' })
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found' })
        }
        return res.status(500).json({ message: 'Failed to delete product' })
    }
}