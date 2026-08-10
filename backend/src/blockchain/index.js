import calculateHash from './hash.js';
import Block from './block.js';
import Blockchain from './blockchain.js';
import voterIdentity, {
  generateVoterHash,
  createAnonymizedVotePayload,
  verifyVoterHash,
  validateAnonymizedBlockData,
} from './voterIdentity.js';
import electionIntegrity, {
  computeElectionIntegrityHash,
  onElectionCreatedHook,
  onElectionStateChangedHook,
  verifyElectionIntegrity,
} from './electionIntegrity.js';
import candidateValidation, {
  hashCandidateId,
  computeCandidateIntegrityHash,
  validateCandidateSecurity,
  verifyCandidateIntegrity,
  createCandidateRegistrationBlockData,
} from './candidateValidation.js';
import votingIntegration, {
  generateReceiptId,
  recordVoteOnBlockchain,
  generateCryptographicVoteReceipt,
} from './votingIntegration.js';
import voteVerification, {
  verifyVoteReceipt,
  verifyVoterParticipation,
} from './voteVerification.js';

export {
  calculateHash,
  Block,
  Blockchain,
  voterIdentity,
  generateVoterHash,
  createAnonymizedVotePayload,
  verifyVoterHash,
  validateAnonymizedBlockData,
  electionIntegrity,
  computeElectionIntegrityHash,
  onElectionCreatedHook,
  onElectionStateChangedHook,
  verifyElectionIntegrity,
  candidateValidation,
  hashCandidateId,
  computeCandidateIntegrityHash,
  validateCandidateSecurity,
  verifyCandidateIntegrity,
  createCandidateRegistrationBlockData,
  votingIntegration,
  generateReceiptId,
  recordVoteOnBlockchain,
  generateCryptographicVoteReceipt,
  voteVerification,
  verifyVoteReceipt,
  verifyVoterParticipation,
};
