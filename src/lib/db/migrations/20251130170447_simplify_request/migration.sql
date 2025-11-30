/*
  Warnings:

  - You are about to drop the column `postId` on the `MessageDeletionRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MessageDeletionRequest" DROP CONSTRAINT "MessageDeletionRequest_postId_fkey";

-- DropIndex
DROP INDEX "public"."MessageDeletionRequest_postId_idx";

-- AlterTable
ALTER TABLE "MessageDeletionRequest" DROP COLUMN "postId",
ADD COLUMN     "jobPostId" TEXT;

-- AddForeignKey
ALTER TABLE "MessageDeletionRequest" ADD CONSTRAINT "MessageDeletionRequest_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
