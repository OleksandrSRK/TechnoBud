import { PrismaClient, Prisma } from '../generated/prisma';

const prisma = new PrismaClient();

const brandsData = [
    {
        id: 1,
        name: 'LG',
        slug: 'lg',
        websiteUrl: 'https://www.lg.com/',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/960px-LG_symbol.svg.png',
        description: 'Global developer of home appliances and consumer electronics.',
        isActive: true
    },
];

const categoriesData = [
    {
        id: 1,
        name: 'Microwave Ovens',
        slug: 'microwave-ovens',
        description: 'Solo, grill, and convection microwave ovens for your kitchen.',
        imageUrl: 'https://pngimg.com/uploads/microwave/microwave_PNG15732.png',
        isActive: true
    }
];

const usersData = [
    {
        id: 1111,
        email: 'admin1@gmail.com',
        passwordHash: '123123',
        fullName: 'AdminAdmin',
        phone: '+380991112233',
        role: 'ADMIN' as const
    },
    {
        id: 2222,
        email: 'user1@gmail.com',
        passwordHash: '123123',
        fullName: 'UserUser',
        phone: '+380111223399',
        role: 'CUSTOMER' as const
    }
];

const productsData: Prisma.ProductCreateInput[] = [
    {
        sku: 'MW-LG-NEOCHEF-23',
        slug: 'lg-neochef-23l-microwave',
        name: 'LG NeoChef 23L Microwave Oven',
        shortDescription: 'Smart inverter microwave oven with precise temperature control.',
        description: 'The LG NeoChef is a 23L microwave featuring Smart Inverter technology for precise cooking and defrosting. Its EasyClean interior makes maintenance effortless, while the sleek minimalist design fits perfectly in any modern kitchen.',
        price: new Prisma.Decimal('4999'),
        oldPrice: new Prisma.Decimal('1000'),
        currency: 'UAH',
        stock: 0,
        reservedStock: 0,
        rating: 0,
        reviewCount: 0,
        warrantyMonths: 121,
        powerW: 1000,
        color: 'Black',
        weightKg: new Prisma.Decimal('9.5'),
        isFeatured: true,
        isActive: true,
        createdAt: new Date('2026-05-18T02:53:06.287Z'),
        updatedAt: new Date('2026-05-20T16:47:51.568Z'),
        category: {
            connect: { id: 1 }
        },
        brand: {
            connect: { id: 1 }
        },
        images: {
            create: [
                {
                    url: 'https://content.rozetka.com.ua/goods/images/big/12015398.jpg',
                    sortOrder: 0,
                    isMain: true,
                    createdAt: new Date('2026-05-20T16:47:51.581Z')
                },
                {
                    url: 'https://content1.rozetka.com.ua/goods/images/big/12015407.jpg',
                    sortOrder: 1,
                    isMain: false,
                    createdAt: new Date('2026-05-20T16:47:51.581Z')
                },
                {
                    url: 'https://content2.rozetka.com.ua/goods/images/big/12015423.jpg',
                    sortOrder: 2,
                    isMain: false,
                    createdAt: new Date('2026-05-20T16:47:51.581Z')
                }
            ]
        },
        specifications: {
            create: []
        }
    }
];

async function main() {
    console.log('Clearing database...');
    await prisma.inventoryMovement.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.productSpecification.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();

    console.log('Starting database seeding...');

    for (const brand of brandsData) {
        await prisma.brand.create({ data: brand });
    }
    console.log('Brands successfully added.');

    for (const category of categoriesData) {
        await prisma.category.create({ data: category });
    }
    console.log('Categories successfully added.');

    for (const user of usersData) {
        await prisma.user.create({ data: user });
    }
    console.log('Users successfully added.');

    for (const product of productsData) {
        await prisma.product.create({ data: product });
    }
    console.log('Products along with images and specifications successfully added.');
    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });