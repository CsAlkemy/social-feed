-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY');

-- AlterTable
ALTER TABLE "comment_likes" ADD COLUMN     "type" "ReactionType" NOT NULL DEFAULT 'LIKE';

-- AlterTable
ALTER TABLE "post_likes" ADD COLUMN     "type" "ReactionType" NOT NULL DEFAULT 'LIKE';
