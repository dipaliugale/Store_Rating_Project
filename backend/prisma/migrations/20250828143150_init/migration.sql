/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - Added the required column `updatedAt` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `role` ENUM('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER';
