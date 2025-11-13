/*
  Warnings:

  - The values [REALISTIC,ARTISTIC,CARTOON,CYBERPUNK,WATERCOLOR] on the enum `ImageStyle` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImageStyle_new" AS ENUM ('realistic', 'artistic', 'cartoon', 'cyberpunk', 'watercolor');
ALTER TABLE "Generation" ALTER COLUMN "style" TYPE "ImageStyle_new" USING ("style"::text::"ImageStyle_new");
ALTER TYPE "ImageStyle" RENAME TO "ImageStyle_old";
ALTER TYPE "ImageStyle_new" RENAME TO "ImageStyle";
DROP TYPE "public"."ImageStyle_old";
COMMIT;
