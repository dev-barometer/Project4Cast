-- AlterTable: Add financial tracking fields to Job
ALTER TABLE "Job" ADD COLUMN "estimate" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN "billedAmount" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN "paidAmount" DOUBLE PRECISION;
