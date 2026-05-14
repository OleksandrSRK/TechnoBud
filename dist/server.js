"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./prisma");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
/**
 * GET all products
 */
app.get('/products', async (_req, res) => {
    const data = await prisma_1.prisma.product.findMany();
    res.json(data);
});
/**
 * CREATE product
 */
app.post('/products', async (req, res) => {
    const item = await prisma_1.prisma.product.create({
        data: req.body
    });
    res.json(item);
});
/**
 * UPDATE product
 */
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const updated = await prisma_1.prisma.product.update({
        where: {
            id: Number(id)
        },
        data: req.body
    });
    res.json(updated);
});
/**
 * DELETE product
 */
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deleted = await prisma_1.prisma.product.delete({
        where: {
            id: Number(id)
        }
    });
    res.json(deleted);
});
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});
