import { Request, Response } from 'express'
import { Prisma } from '../../generated/prisma/client'
import { prisma } from '../prisma'

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return res.json(users)
    } catch (error) {
        console.error('GET /users ERROR:', error)
        return res.status(500).json({ message: 'Failed to load users' })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { fullName, email, phone, role, isActive } = req.body

    try {
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                ...(fullName !== undefined && { fullName }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(role !== undefined && { role }),
                ...(isActive !== undefined && { isActive }),
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        })
        return res.json(user)
    } catch (error: any) {
        console.error('PUT /users/:id ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'User not found' })
            }
            if (error.code === 'P2002') {
                return res.status(400).json({ message: 'Email or phone already exists' })
            }
        }

        return res.status(500).json({ message: 'Failed to update user' })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        await prisma.user.delete({ where: { id: Number(id) } })
        return res.json({ success: true })
    } catch (error: any) {
        console.error('DELETE /users/:id ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(500).json({ message: 'Failed to delete user' })
    }
}