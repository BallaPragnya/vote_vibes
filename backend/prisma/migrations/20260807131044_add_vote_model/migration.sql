-- CreateTable
CREATE TABLE "votes" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "voter_id" UUID NOT NULL,
    "transaction_receipt" VARCHAR(255) NOT NULL,
    "blockchain_transaction_id" VARCHAR(255),
    "vote_timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "votes_election_id_idx" ON "votes"("election_id");

-- CreateIndex
CREATE INDEX "votes_candidate_id_idx" ON "votes"("candidate_id");

-- CreateIndex
CREATE INDEX "votes_voter_id_idx" ON "votes"("voter_id");

-- CreateIndex
CREATE INDEX "votes_transaction_receipt_idx" ON "votes"("transaction_receipt");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
