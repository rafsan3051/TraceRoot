-- AlterTable
ALTER TABLE `products` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `locationAccuracy` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `supply_chain_events` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `locationAccuracy` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;
