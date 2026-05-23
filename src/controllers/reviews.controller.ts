import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'

export const getProductReviews = async (req: Request, res: Response) => {
    const productId = Number(req.params.productId)
    if (isNaN(productId)) return res.status(400).json({ message: 'Invalid product ID' })

    try {
        const reviews = await prisma.review.findMany({
            where: { productId, parentId: null },
            include: {
                user: { select: { id: true, fullName: true, role: true } },
                replies: {
                    include: {
                        user: { select: { id: true, fullName: true, role: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
        return res.json(reviews)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Failed to load reviews' })
    }
}

export const createReview = async (req: Request, res: Response) => {
    const currentUser = (req as any).user
    if (!currentUser || !currentUser.userId) {
        return res.status(401).json({ message: 'Auth required' })
    }
    const userId = currentUser.userId

    const productId = Number(req.params.productId)
    if (isNaN(productId)) return res.status(400).json({ message: 'Invalid product ID' })

    const { rating, title, comment, parentId } = req.body

    try {
        if (!parentId) {
            const existingRoot = await prisma.review.findFirst({
                where: { userId, productId, parentId: null },
            })
            if (existingRoot) {
                return res.status(400).json({ message: 'You already reviewed this product' })
            }
        }

        const reviewRating = parentId ? 0 : Math.min(5, Math.max(1, Number(rating) || 0))

        const review = await prisma.review.create({
            data: {
                rating: reviewRating,
                title: title || null,
                comment: String(comment || ''),
                userId,
                productId,
                parentId: parentId ? Number(parentId) : null,
            },
            include: {
                user: { select: { id: true, fullName: true, role: true } },
                replies: {
                    include: {
                        user: { select: { id: true, fullName: true, role: true } },
                    },
                },
            },
        })

        if (!parentId) {
            const reviewsForProduct = await prisma.review.findMany({
                where: { productId, parentId: null },
                select: { rating: true },
            })
            const totalReviews = reviewsForProduct.length
            const avgRating = totalReviews > 0
                ? reviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0

            await prisma.product.update({
                where: { id: productId },
                data: {
                    rating: avgRating,
                    reviewCount: totalReviews,
                },
            })
        }

        return res.status(201).json(review)
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ message: 'Failed to create review' })
    }
}