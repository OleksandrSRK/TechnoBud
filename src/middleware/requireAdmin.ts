import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token required' })
    }
    try {
        const token = authHeader.split(' ')[1]
        const payload = jwt.verify(token, JWT_SECRET) as any
        if (payload.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' })
        }
        (req as any).userId = payload.sub
        next()
    } catch {
        return res.status(401).json({ message: 'Invalid token' })
    }
}