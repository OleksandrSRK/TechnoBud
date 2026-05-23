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

export const getCategories = async (req: Request, res: Response) => {
    try {
        const showAll = req.query.all === 'true'
        log('GET /categories' + (showAll ? ' (all)' : ''))
        track('categories_viewed')

        const categories = await prisma.category.findMany({
            where: showAll ? {} : { isActive: true },
            orderBy: { name: 'asc' },
        })

        return res.json(categories)
    } catch (error) {
        console.error('GET /categories ERROR:', error)
        return res.status(500).json({
            message: 'Failed to load categories',
            error: (error as Error).message,
        })
    }
}

export const getCategoryBySlug = async (req: Request, res: Response) => {
    try {
        const slug = Array.isArray(req.params.slug)
            ? req.params.slug[0]
            : req.params.slug

        if (!slug) {
            return res.status(400).json({ message: 'Slug is required' })
        }

        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                products: {
                    where: {
                        isActive: true,
                        brand: { isActive: true },
                    },
                    include: {
                        images: true,
                        brand: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!category) {
            return res.status(404).json({ message: 'Category not found' })
        }

        const brandsMap = new Map<
            number,
            { id: number; name: string; slug: string }
        >()
        for (const product of category.products) {
            if (product.brand && !brandsMap.has(product.brand.id)) {
                brandsMap.set(product.brand.id, {
                    id: product.brand.id,
                    name: product.brand.name,
                    slug: product.brand.slug,
                })
            }
        }
        const brands = Array.from(brandsMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        )

        return res.json({
            ...category,
            brands,
        })
    } catch (error) {
        console.error('GET /categories/:slug ERROR:', error)
        return res.status(500).json({ message: 'Server error' })
    }
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        log('POST /categories')
        track('category_created_attempt', req.body)

        const { name, slug, description, imageUrl, isActive, parentId } = req.body

        if (!name || !slug) {
            return res.status(400).json({ message: 'name and slug are required' })
        }

        const category = await prisma.category.create({
            data: {
                name: String(name),
                slug: String(slug),
                description: description ? String(description) : null,
                imageUrl: imageUrl ? String(imageUrl) : null,
                isActive: toBoolean(isActive, true),
                parentId:
                    parentId !== undefined && parentId !== null
                        ? Number(parentId)
                        : null,
            },
        })

        track('category_created', category)
        return res.status(201).json(category)
    } catch (error: any) {
        console.error('POST /categories ERROR:', error)

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return res
                .status(400)
                .json({ message: 'Category with this slug already exists' })
        }

        return res.status(500).json({
            message: 'Failed to create category',
            error: (error as Error).message,
        })
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid category id' })
        }

        log(`PUT /categories/${id}`)
        track('category_updated_attempt', { id, body: req.body })

        const { name, slug, description, imageUrl, isActive, parentId } = req.body

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name: String(name) } : {}),
                ...(slug !== undefined ? { slug: String(slug) } : {}),
                ...(description !== undefined
                    ? { description: description ? String(description) : null }
                    : {}),
                ...(imageUrl !== undefined
                    ? { imageUrl: imageUrl ? String(imageUrl) : null }
                    : {}),
                ...(isActive !== undefined
                    ? { isActive: toBoolean(isActive, true) }
                    : {}),
                ...(parentId !== undefined
                    ? {
                        parentId:
                            parentId !== null ? Number(parentId) : null,
                    }
                    : {}),
            },
        })

        track('category_updated', updatedCategory)
        return res.json(updatedCategory)
    } catch (error: any) {
        console.error('PUT /categories/:id ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: 'Category not found' })
            if (error.code === 'P2002')
                return res
                    .status(400)
                    .json({ message: 'Category with this slug already exists' })
        }

        return res.status(500).json({
            message: 'Failed to update category',
            error: (error as Error).message,
        })
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid category id' })
        }

        log(`DELETE /categories/${id}`)
        track('category_deleted_attempt', { id })

        const deletedCategory = await prisma.category.delete({ where: { id } })

        track('category_deleted', deletedCategory)

        return res.json({
            message: 'Category deleted',
            category: deletedCategory,
        })
    } catch (error: any) {
        console.error('DELETE /categories/:id ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: 'Category not found' })
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message:
                        'Cannot delete category because it has associated products',
                })
            }
        }

        return res.status(500).json({
            message: 'Failed to delete category',
            error: (error as Error).message,
        })
    }
}