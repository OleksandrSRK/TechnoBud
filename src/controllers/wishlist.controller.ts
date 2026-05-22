import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const getWishlist = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    try {
        let wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                                brand: true,
                            },
                        },
                    },
                },
            },
        })

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                    category: true,
                                    brand: true,
                                },
                            },
                        },
                    },
                },
            })
        }

        const products = wishlist.items.map(item => ({
            ...item.product,
            wishlistItemId: item.id,
        }))
        return res.json(products)
    } catch (error) {
        console.error('GET /wishlist ERROR:', error)
        return res.status(500).json({ message: 'Failed to load wishlist' })
    }
}

export const addToWishlist = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    const productId = Number(req.params.productId)
    if (isNaN(productId)) return res.status(400).json({ message: 'Invalid product id' })

    try {
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } })
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId } })
        }

        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId,
            },
        })

        return res.json({ success: true })
    } catch (error: any) {
        console.error('POST /wishlist ERROR:', error)
        return res.status(500).json({ message: 'Failed to add to wishlist' })
    }
}

export const removeFromWishlist = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    const productId = Number(req.params.productId)
    if (isNaN(productId)) return res.status(400).json({ message: 'Invalid product id' })

    try {
        const wishlist = await prisma.wishlist.findUnique({ where: { userId } })
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' })

        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId,
            },
        })

        return res.json({ success: true })
    } catch (error: any) {
        console.error('DELETE /wishlist ERROR:', error)
        return res.status(500).json({ message: 'Failed to remove from wishlist' })
    }
}