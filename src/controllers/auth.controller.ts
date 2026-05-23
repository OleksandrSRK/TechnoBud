import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Prisma } from '../../generated/prisma/client'
import { prisma } from '../prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key'

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, phone, password } = req.body

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: 'fullName, email and password are required',
            })
        }

        const existing = await prisma.user.findUnique({
            where: { email: String(email) },
        })

        if (existing) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const passwordHash = await bcrypt.hash(String(password), 10)

        const user = await prisma.user.create({
            data: {
                fullName: String(fullName),
                email: String(email),
                phone: phone ? String(phone) : null,
                passwordHash,
            },
        })

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        })
    } catch (error: any) {
        console.error('REGISTER ERROR:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(400).json({ message: 'Email or phone already exists' })
        }

        return res.status(500).json({
            message: 'Registration failed',
            error: (error as Error).message,
        })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: 'email and password are required',
            })
        }

        const user = await prisma.user.findUnique({
            where: { email: String(email) },
        })

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isValid = await bcrypt.compare(String(password), user.passwordHash)

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('LOGIN ERROR:', error)

        return res.status(500).json({
            message: 'Login failed',
            error: (error as Error).message,
        })
    }
}

export const me = async (req: Request, res: Response) => {
    const userId = (req as any).userId

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        if (req.method === 'PUT') {
            const { fullName, phone } = req.body

            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(fullName !== undefined && { fullName }),
                    ...(phone !== undefined && { phone }),
                },
            })

            return res.json({
                id: updated.id,
                email: updated.email,
                fullName: updated.fullName,
                phone: updated.phone,
                role: updated.role,
            })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.json(user)
    } catch (error) {
        console.error('ME ERROR:', error)
        return res.status(500).json({ message: 'Server error' })
    }
}