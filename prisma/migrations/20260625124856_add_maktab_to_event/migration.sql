-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_mosqueId_fkey";

-- DropForeignKey
ALTER TABLE "Funding" DROP CONSTRAINT "Funding_maktabId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "maktabId" TEXT,
ALTER COLUMN "mosqueId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Funding" ADD COLUMN     "mosqueId" TEXT,
ALTER COLUMN "maktabId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Funding" ADD CONSTRAINT "Funding_maktabId_fkey" FOREIGN KEY ("maktabId") REFERENCES "Maktab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funding" ADD CONSTRAINT "Funding_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_maktabId_fkey" FOREIGN KEY ("maktabId") REFERENCES "Maktab"("id") ON DELETE SET NULL ON UPDATE CASCADE;
