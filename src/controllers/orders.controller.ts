import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json(orders)
    } catch (e) {
        console.error('[getMyOrders]', e)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getAllOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json(orders)
    } catch (e) {
        console.error('[getAllOrders]', e)
        res.status(500).json({ message: 'Server error' })
    }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const orderId = Number(req.params.id)
        const { status } = req.body

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        })

        res.json(order)
    } catch (e) {
        console.error('[updateOrderStatus]', e)
        res.status(500).json({ message: 'Server error' })
    }
}

export const createOrder = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })

    const { customerName, customerPhone, customerEmail, shippingAddress, notes } = req.body

    if (!customerName || !customerPhone || !customerEmail || !shippingAddress) {
        return res.status(400).json({ message: 'All contact and address fields are required' })
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                            },
                        },
                    },
                },
            },
        })

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' })
        }

        const subtotal = cart.items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0
        )
        const totalAmount = subtotal

        const orderNumber = `ORD-${Date.now()}-${userId}`

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerName,
                customerPhone,
                customerEmail,
                shippingAddress,
                subtotal,
                totalAmount,
                notes,
                userId,
                status: 'PENDING',
                items: {
                    create: cart.items.map(item => ({
                        quantity: item.quantity,
                        unitPrice: item.product.price,
                        totalPrice: Number(item.product.price) * item.quantity,
                        productId: item.productId,
                        productNameSnapshot: item.product.name,
                        brandNameSnapshot: item.product.brand?.name || null,
                        skuSnapshot: item.product.sku,
                    })),
                },
            },
            include: {
                items: true,
            },
        })

        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
        await prisma.cart.update({ where: { id: cart.id }, data: { status: 'CONVERTED' } })

        res.status(201).json(order)
    } catch (error) {
        console.error('[createOrder]', error)
        res.status(500).json({ message: 'Failed to create order' })
    }
}

export const getOrderById = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    const role = (req as any).user?.role

    const orderId = Number(req.params.id)
    if (isNaN(orderId)) return res.status(400).json({ message: 'Invalid order ID' })

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                brand: true,
                                category: true,
                            },
                        },
                    },
                },
                user: { select: { id: true, fullName: true, email: true } },
                address: true,
            },
        })

        if (!order) return res.status(404).json({ message: 'Order not found' })

        if (role !== 'ADMIN' && order.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        res.json(order)
    } catch (error) {
        console.error('[getOrderById]', error)
        res.status(500).json({ message: 'Server error' })
    }
}

