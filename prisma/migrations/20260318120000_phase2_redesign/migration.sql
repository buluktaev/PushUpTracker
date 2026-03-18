-- AlterTable: добавить discipline в Room
ALTER TABLE "Room" ADD COLUMN "discipline" TEXT NOT NULL DEFAULT 'pushups';

-- AlterTable: переименовать count → value в Session
ALTER TABLE "Session" RENAME COLUMN "count" TO "value";
