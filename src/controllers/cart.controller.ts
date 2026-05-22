import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const getCart = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    try {
        let cart = await prisma.cart.findUnique({
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

        if (!cart) {
            cart = await prisma.cart.create({
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

        const items = cart.items.map(item => ({
            cartItemId: item.id,
            product: item.product,
            quantity: item.quantity,
        }))

        return res.json({ cartId: cart.id, items })
    } catch (error) {
        console.error('GET /cart ERROR:', error)
        return res.status(500).json({ message: 'Failed to load cart' })
    }
}

export const addToCart = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    const productId = Number(req.params.productId)
    const quantity = Number(req.body.quantity) || 1

    if (isNaN(productId)) return res.status(400).json({ message: 'Invalid product id' })

    try {
        let cart = await prisma.cart.findUnique({ where: { userId } })
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } })
        }

        const existing = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        })

        if (existing) {
            await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
            })
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    unitPrice: 0,
                },
            })
        }

        return res.json({ success: true })
    } catch (error) {
        console.error('POST /cart ERROR:', error)
        return res.status(500).json({ message: 'Failed to add to cart' })
    }
}

export const updateCartItem = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    const itemId = Number(req.params.itemId)
    const { quantity } = req.body

    if (isNaN(itemId) || quantity === undefined) {
        return res.status(400).json({ message: 'Invalid data' })
    }

    try {
        await prisma.cartItem.updateMany({
            where: { id: itemId, cart: { userId } },
            data: { quantity },
        })
        return res.json({ success: true })
    } catch (error) {
        console.error('PATCH /cart/:itemId ERROR:', error)
        return res.status(500).json({ message: 'Failed to update cart item' })
    }
}

export const removeFromCart = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    const itemId = Number(req.params.itemId)
    if (isNaN(itemId)) return res.status(400).json({ message: 'Invalid item id' })

    try {
        await prisma.cartItem.deleteMany({
            where: { id: itemId, cart: { userId } },
        })
        return res.json({ success: true })
    } catch (error) {
        console.error('DELETE /cart/:itemId ERROR:', error)
        return res.status(500).json({ message: 'Failed to remove cart item' })
    }
}