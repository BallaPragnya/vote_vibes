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
};
