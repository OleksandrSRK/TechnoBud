import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
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
        const search = req.query.search as string | undefined

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

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                specifications: true,
                category: true,
                brand: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return res.json(products)
    } catch (error) {
        console.error('GET /products ERROR:', error)
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
        const { images, ...data } = req.body
        const product = await prisma.product.create({
            data: {
                ...data,
                price: Number(data.price),
                stock: Number(data.stock) || 0,
                categoryId: Number(data.categoryId),
                brandId: Number(data.brandId),
            },
        })
        if (Array.isArray(images) && images.length > 0) {
            await prisma.productImage.createMany({
                data: images.map((img: any, index: number) => ({
                    url: img.url,
                    alt: img.alt || null,
                    isMain: img.isMain || false,
                    sortOrder: index,
                    productId: product.id,
                })),
            })
        }
        const finalProduct = await prisma.product.findUnique({
            where: { id: product.id },
            include: { images: true, category: true, brand: true },
        })
        return res.status(201).json(finalProduct)
    } catch (error: any) {
        console.error('CREATE PRODUCT ERROR:', error)
        return res.status(500).json({ message: 'Failed to create product' })
    }
}

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