import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '../../generated/prisma';
import { prisma } from '../prisma';

const router = Router();

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev_secret';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env');
}

type TokenPayload = {
    sub: number;
    email: string;
    role: string;
};

type AuthRequest = Request & {
    userId?: number;
};

function signToken(user: {
    id: number;
    email: string;
    role: string;
}) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        } as TokenPayload,
        JWT_SECRET,
        {
            expiresIn: '7d',
        }
    );
}

function authRequired(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization token required',
            });
        }

        const token = authHeader.split(' ')[1];

        const payload = jwt.verify(
            token,
            JWT_SECRET
        ) as unknown as TokenPayload;

        req.userId = payload.sub;

        next();
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
}

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, phone } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                message: 'email, password and fullName are required',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must contain at least 6 characters',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Invalid email format',
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    ...(phone ? [{ phone }] : []),
                ],
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists',
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                phone: phone || null,
            },
        });

        const token = signToken(user);

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error(error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return res.status(409).json({
                message: 'Email or phone already exists',
            });
        }

        return res.status(500).json({
            message: 'Register failed',
        });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'email and password are required',
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: 'User account is disabled',
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        const token = signToken(user);

        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Login failed',
        });
    }
});

router.get(
    '/me',
    authRequired,
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: req.userId,
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
            });

            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                });
            }

            return res.json(user);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: 'Failed to load profile',
            });
        }
    }
);

router.put(
    '/me',
    authRequired,
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { fullName, phone } = req.body;

            const updated = await prisma.user.update({
                where: { id: req.userId },
                data: {
                    ...(fullName !== undefined && { fullName }),
                    ...(phone !== undefined && { phone }),
                },
            });

            return res.json({
                id: updated.id,
                email: updated.email,
                fullName: updated.fullName,
                phone: updated.phone,
                role: updated.role,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update profile' });
        }
    }
);

export default router;