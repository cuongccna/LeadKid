-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "reviews_link" TEXT,
ADD COLUMN     "reviews_per_rating" JSONB;

-- AlterTable
ALTER TABLE "place_cache" ADD COLUMN     "reviews_link" TEXT,
ADD COLUMN     "reviews_per_rating" JSONB;
