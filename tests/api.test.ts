process.env.JWT_SECRET = 'dev_secret';

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import productsRoutes from '../src/routes/products.routes';
import authRouter from '../src/routes/auth.routes';
import cartRoutes from '../src/routes/cart.routes';
import { prisma } from '../src/prisma';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/products', productsRoutes);
app.use('/auth', authRouter);
app.use('/cart', cartRoutes);

describe('REST API Tests', () => {
    let customerToken: string;
    let adminToken: string;
    let adminEmail: string;

    beforeAll(async () => {
        const uniqueEmail = `testuser${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/auth/register')
            .send({ fullName: 'Test Customer', email: uniqueEmail, password: 'test123' });
        customerToken = registerRes.body.token;

        adminEmail = `admin${Date.now()}@example.com`;
        const bcryptjs = require('bcryptjs');
        const passwordHash = await bcryptjs.hash('admin123', 10);
        const adminUser = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                fullName: 'Test Admin',
                role: 'ADMIN',
            },
        });

        adminToken = jwt.sign(
            {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
            },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: { contains: 'testuser' },
            },
        });
        await prisma.user.deleteMany({
            where: {
                email: { contains: 'admin' },
            },
        });
        await prisma.$disconnect();
    });

    it('GET /products повертає список товарів (200)', async () => {
        const res = await request(app).get('/products');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('GET /products/paginated?category=coffee-machines фільтрує за категорією', async () => {
        const res = await request(app).get('/products/paginated?category=coffee-machines&take=5');
        expect(res.status).toBe(200);
        res.body.forEach((product: any) => {
            expect(product.category?.slug).toBe('coffee-machines');
        });
    });

    it('POST /auth/register створює нового користувача (201)', async () => {
        const newEmail = `newuser${Date.now()}@example.com`;
        const res = await request(app)
            .post('/auth/register')
            .send({ fullName: 'New User', email: newEmail, password: 'test123' });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
    });

    it('POST /auth/register без email повертає 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ fullName: 'No Email', password: 'test123' });
        expect(res.status).toBe(400);
    });

    it('GET /cart без токену повертає 401', async () => {
        const res = await request(app).get('/cart');
        expect(res.status).toBe(401);
    });

    it('POST /auth/login адміністратора повертає 200 та токен', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: adminEmail, password: 'admin123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('GET /auth/me з токеном покупця повертає 200 та профіль', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(res.status).toBe(200);
        expect(res.body.email).toBeDefined();
    });

    it('POST /products з роллю CUSTOMER повертає 403', async () => {
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ name: 'Test Product', price: 100, categoryId: 1, brandId: 1 });
        expect(res.status).toBe(403);
    });

    it('POST /products з роллю ADMIN створює товар (201)', async () => {
        const res = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Jest Product',
                price: 999,
                categoryId: 30005,
                brandId: 30001,
                sku: `JEST-${Date.now()}`,
                slug: `jest-product-${Date.now()}`,
                description: 'Created by automated test',
            });
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
    });

    it('DELETE /products/:id з роллю ADMIN видаляє товар (200)', async () => {
        const createRes = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Product to delete',
                price: 50,
                categoryId: 30005,
                brandId: 30001,
                sku: `DEL-${Date.now()}`,
                slug: `delete-me-${Date.now()}`,
                description: 'Will be deleted',
            });
        const productId = createRes.body.id;

        const deleteRes = await request(app)
            .delete(`/products/${productId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(deleteRes.status).toBe(200);
    });
});