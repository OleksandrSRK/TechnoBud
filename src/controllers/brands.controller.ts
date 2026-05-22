import { Request, Response } from 'express'
import { Prisma } from '../../generated/prisma';
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

export const getBrands = async (req: Request, res: Response) => {
    try {
        const showAll = req.query.all === 'true'
        const search = req.query.search as string | undefined

        const where: Prisma.BrandWhereInput = {
            isActive: showAll ? undefined : true,
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ]
        }

        const brands = await prisma.brand.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { products: true } },
            },
        })

        return res.json(brands)
    } catch (error) {
        console.error('GET /brands ERROR:', error)
        return res.status(500).json({
            message: 'Failed to load brands',
            error: (error as Error).message,
        })
    }
}

export const getBrandBySlug = async (req: Request, res: Response) => {
    try {
        const slug = Array.isArray(req.params.slug)
            ? req.params.slug[0]
            : req.params.slug;

        if (!slug) {
            return res.status(400).json({ message: 'Slug is required' });
        }

        const brand = await prisma.brand.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isActive: true },
                    include: {
                        images: true,
                        category: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        }) as Prisma.BrandGetPayload<{
            include: {
                products: {
                    include: {
                        images: true;
                        category: true;
                    };
                };
            };
        }> | null;

        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        const categoriesMap = new Map<number, { id: number; name: string; slug: string }>();
        brand.products.forEach((product) => {
            if (product.category && !categoriesMap.has(product.category.id)) {
                categoriesMap.set(product.category.id, {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                });
            }
        });
        const categories = Array.from(categoriesMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        return res.json({
            ...brand,
            categories,
        });
    } catch (error) {
        console.error('GET /brands/:slug ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const createBrand = async (req: Request, res: Response) => {
    try {
        log('POST /brands')
        track('brand_created_attempt', req.body)

        const { name, slug, logoUrl, description, websiteUrl, isActive } = req.body

        if (!name || !slug) {
            return res.status(400).json({ message: 'name and slug are required' })
        }

        const brand = await prisma.brand.create({
            data: {
                name: String(name),
                slug: String(slug),
                logoUrl: logoUrl ? String(logoUrl) : null,
                websiteUrl: websiteUrl ? String(websiteUrl) : null,
                description: description ? String(description) : null,
                isActive: toBoolean(isActive, true),
            },
        })

        track('brand_created', brand)
        return res.status(201).json(brand)
    } catch (error: any) {
        console.error('POST /brands ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: 'Brand with this slug already exists' })
        }

        return res.status(500).json({
            message: 'Failed to create brand',
            error: (error as Error).message,
        })
    }
}

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid brand id' })
        }

        log(`PUT /brands/${id}`)
        track('brand_updated_attempt', { id, body: req.body })

        const { name, slug, logoUrl, description, websiteUrl, isActive } = req.body

        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name: String(name) } : {}),
                ...(slug !== undefined ? { slug: String(slug) } : {}),
                ...(logoUrl !== undefined ? { logoUrl: logoUrl ? String(logoUrl) : null } : {}),
                ...(websiteUrl !== undefined ? { websiteUrl: websiteUrl ? String(websiteUrl) : null } : {}),
                ...(description !== undefined ? { description: description ? String(description) : null } : {}),
                ...(isActive !== undefined ? { isActive: toBoolean(isActive, true) } : {}),
            },
        })

        track('brand_updated', updatedBrand)
        return res.json(updatedBrand)
    } catch (error: any) {
        console.error('PUT /brands/:id ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Brand not found' })
            if (error.code === 'P2002') return res.status(400).json({ message: 'Brand with this slug already exists' })
        }

        return res.status(500).json({
            message: 'Failed to update brand',
            error: (error as Error).message,
        })
    }
}

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid brand id' })
        }

        log(`DELETE /brands/${id}`)
        track('brand_deleted_attempt', { id })

        const deletedBrand = await prisma.brand.delete({ where: { id } })

        track('brand_deleted', deletedBrand)

        return res.json({
            message: 'Brand deleted',
            brand: deletedBrand,
        })
    } catch (error: any) {
        console.error('DELETE /brands/:id ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') return res.status(404).json({ message: 'Brand not found' })
            if (error.code === 'P2003') {
                return res.status(400).json({
                    message: 'Cannot delete brand because it has associated products',
                })
            }
        }

        return res.status(500).json({
            message: 'Failed to delete brand',
            error: (error as Error).message,
        })
    }
}