/*
  Warnings:

  - You are about to drop the column `brand` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `inStock` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `power` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `warranty` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brandId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `brand`,
    DROP COLUMN `category`,
    DROP COLUMN `imageUrl`,
    DROP COLUMN `inStock`,
    DROP COLUMN `power`,
    DROP COLUMN `warranty`,
    ADD COLUMN `brandId` INTEGER NOT NULL,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `energyClass` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `material` VARCHAR(191) NULL,
    ADD COLUMN `oldPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `powerW` INTEGER NULL,
    ADD COLUMN `reservedStock` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `reviewCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `shortDescription` VARCHAR(191) NULL,
    ADD COLUMN `sku` VARCHAR(191) NOT NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `warrantyMonths` INTEGER NULL,
    ADD COLUMN `weightKg` DECIMAL(8, 2) NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL,
    MODIFY `currency` VARCHAR(191) NOT NULL DEFAULT 'UAH',
    MODIFY `description` TEXT NOT NULL,
    MODIFY `stock` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_parentId_idx`(`parentId`),
    INDEX `Category_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Brand_slug_key`(`slug`),
    INDEX `Brand_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSpecification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isHighlighted` BOOLEAN NOT NULL DEFAULT false,
    `productId` INTEGER NOT NULL,

    INDEX `ProductSpecification_productId_idx`(`productId`),
    INDEX `ProductSpecification_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_phone_idx`(`phone`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Ukraine',
    `city` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `house` VARCHAR(191) NOT NULL,
    `apartment` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Address_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('ACTIVE', 'CONVERTED', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',
    `sessionId` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_sessionId_key`(`sessionId`),
    UNIQUE INDEX `Cart_userId_key`(`userId`),
    INDEX `Cart_status_idx`(`status`),
    INDEX `Cart_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CartItem_cartId_idx`(`cartId`),
    INDEX `CartItem_productId_idx`(`productId`),
    UNIQUE INDEX `CartItem_cartId_productId_key`(`cartId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wishlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wishlist_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WishlistItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wishlistId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WishlistItem_wishlistId_idx`(`wishlistId`),
    INDEX `WishlistItem_productId_idx`(`productId`),
    UNIQUE INDEX `WishlistItem_wishlistId_productId_key`(`wishlistId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `shippingAddress` TEXT NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `shippingAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    `userId` INTEGER NULL,
    `addressId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `totalPrice` DECIMAL(10, 2) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NULL,
    `productNameSnapshot` VARCHAR(191) NOT NULL,
    `brandNameSnapshot` VARCHAR(191) NULL,
    `skuSnapshot` VARCHAR(191) NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `comment` TEXT NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Review_productId_idx`(`productId`),
    INDEX `Review_userId_idx`(`userId`),
    INDEX `Review_rating_idx`(`rating`),
    UNIQUE INDEX `Review_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryMovement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUSTMENT') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `note` TEXT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventoryMovement_productId_idx`(`productId`),
    INDEX `InventoryMovement_type_idx`(`type`),
    INDEX `InventoryMovement_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Product_sku_key` ON `Product`(`sku`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_slug_key` ON `Product`(`slug`);

-- CreateIndex
CREATE INDEX `Product_categoryId_idx` ON `Product`(`categoryId`);

-- CreateIndex
CREATE INDEX `Product_brandId_idx` ON `Product`(`brandId`);

-- CreateIndex
CREATE INDEX `Product_price_idx` ON `Product`(`price`);

-- CreateIndex
CREATE INDEX `Product_isActive_idx` ON `Product`(`isActive`);

-- CreateIndex
CREATE INDEX `Product_isFeatured_idx` ON `Product`(`isFeatured`);

-- CreateIndex
CREATE INDEX `Product_createdAt_idx` ON `Product`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSpecification` ADD CONSTRAINT `ProductSpecification_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_wishlistId_fkey` FOREIGN KEY (`wishlistId`) REFERENCES `Wishlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
