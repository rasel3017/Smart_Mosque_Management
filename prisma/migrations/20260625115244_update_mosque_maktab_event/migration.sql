-- DropForeignKey
ALTER TABLE "Maktab" DROP CONSTRAINT "Maktab_mosqueId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Maktab" ADD COLUMN     "address" TEXT,
ADD COLUMN     "coursesOffered" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "mosqueId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mosque" ADD COLUMN     "asrTime" TEXT,
ADD COLUMN     "fajrTime" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "imamName" TEXT,
ADD COLUMN     "ishaTime" TEXT,
ADD COLUMN     "maghribTime" TEXT,
ADD COLUMN     "muazzinName" TEXT,
ADD COLUMN     "zuhrTime" TEXT;

-- AddForeignKey
ALTER TABLE "Maktab" ADD CONSTRAINT "Maktab_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
