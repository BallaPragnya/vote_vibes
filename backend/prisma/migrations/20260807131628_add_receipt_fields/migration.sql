-- AlterTable
ALTER TABLE "vote_receipts" ADD COLUMN     "candidate_id" UUID,
ADD COLUMN     "receipt_hash" VARCHAR(64),
ADD COLUMN     "vote_timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "vote_receipts_receipt_hash_idx" ON "vote_receipts"("receipt_hash");

-- AddForeignKey
ALTER TABLE "vote_receipts" ADD CONSTRAINT "vote_receipts_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
