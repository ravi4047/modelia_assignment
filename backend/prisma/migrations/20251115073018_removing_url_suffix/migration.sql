/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Generation` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Generation` table. All the data in the column will be lost.
  - Added the required column `image` to the `Generation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Generation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Generation" DROP COLUMN "imageUrl",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL;
