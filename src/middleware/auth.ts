import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'dev_secret'
            ) as any
        ;(req as any).user = {
            userId: decoded.sub,
            role: decoded.role,
            email: decoded.email,
        }
        next()
    } catch {
        return res.status(401).json({ message: 'Invalid token' })
    }
}