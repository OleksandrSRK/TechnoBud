import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const getBrands = async (_req: Request, res: Response) => {
    try {
        const brands = await prisma.brand.findMany({
            where: { isActive: true },
            select: { id: true, name: true, slug: true },
            orderBy: { name: 'asc' },
        })
        res.json(brands)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Failed to load brands' })
    }
}

export const getColors = async (_req: Request, res: Response) => {
    try {
        const colors = await prisma.product.findMany({
            where: { isActive: true, color: { not: null } },
            distinct: ['color'],
            select: { color: true },
            orderBy: { color: 'asc' },
        })
        res.json(colors.map(c => c.color))
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Failed to load colors' })
    }
}

export const getMaterials = async (_req: Request, res: Response) => {
    try {
        const materials = await prisma.product.findMany({
            where: { isActive: true, material: { not: null } },
            distinct: ['material'],
            select: { material: true },
            orderBy: { material: 'asc' },
        })
        res.json(materials.map(m => m.material))
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Failed to load materials' })
    }
}

export const getEnergyClasses = async (_req: Request, res: Response) => {
    try {
        const energyClasses = await prisma.product.findMany({
            where: { isActive: true, energyClass: { not: null } },
            distinct: ['energyClass'],
            select: { energyClass: true },
            orderBy: { energyClass: 'asc' },
        })
        res.json(energyClasses.map(e => e.energyClass))
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Failed to load energy classes' })
    }
}