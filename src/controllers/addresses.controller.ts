import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const getAddresses = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })
    try {
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
        return res.json(addresses)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Failed to load addresses' })
    }
}

export const createAddress = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ message: 'Auth required' })
    const { label, country, city, street, house, apartment, postalCode, isDefault } = req.body
    try {
        const address = await prisma.address.create({
            data: {
                userId,
                label: label || null,
                country: country || 'Ukraine',
                city,
                street,
                house,
                apartment: apartment || null,
                postalCode: postalCode || null,
                isDefault: !!isDefault,
            },
        })
        return res.status(201).json(address)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Failed to create address' })
    }
}