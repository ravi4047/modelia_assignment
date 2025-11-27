/*
  Warnings:

  - Changed the type of `style` on the `Generation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ImageStyle" AS ENUM ('REALISTIC', 'ARTISTIC', 'CARTOON', 'CYBERPUNK', 'WATERCOLOR');

-- AlterTable
ALTER TABLE "Generation" DROP COLUMN "style",
ADD COLUMN     "style" "ImageStyle" NOT NULL;
