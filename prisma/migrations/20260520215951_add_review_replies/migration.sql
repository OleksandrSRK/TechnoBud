-- AlterTable
ALTER TABLE `review` ADD COLUMN `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
