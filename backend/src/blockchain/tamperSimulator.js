import Blockchain from './blockchain.js';
import { recordVoteOnBlockchain } from './votingIntegration.js';
import { batchVerifyBlocks } from './cryptoOptimizer.js';

/**
 * Tamper Detection Demonstration Engine (Phase 7)
 * 
 * Simulates active tamper attacks on the blockchain ledger (data payload mutation, 
 * hash forgery, link corruption) and demonstrates real-time detection.
 */

/**
 * Simulates a tamper attack on a target block in a blockchain ledger.
 * 
 * @param {Blockchain} [blockchain] - Target blockchain (creates sample chain if omitted)
 * @param {number} [targetBlockIndex=1] - Block index to tamper
 * @param {string} [tamperType='DATA_MUTATION'] - 'DATA_MUTATION' | 'HASH_FORGERY' | 'LINK_CORRUPTION'
 * @returns {Object} Tamper simulation report detailing detection proof
 */
export function simulateTamperAttempt(blockchain = null, targetBlockIndex = 1, tamperType = 'DATA_MUTATION') {
  const chain = blockchain || new Blockchain();

  // If chain only has genesis, populate 3 sample vote blocks for demonstration
  if (chain.chain.length <= 1) {
    for (let i = 1; i <= 3; i++) {
      recordVoteOnBlockchain({
        userId: `usr_demo_voter_${i}`,
        electionId: 'elec_demo_2026',
        candidateId: `cand_demo_${i}`,
        blockchain: chain,
      });
    }
  }

  const index = Math.min(Math.max(1, targetBlockIndex), chain.chain.length - 1);
  const targetBlock = chain.chain[index];

  const originalHash = targetBlock.hash;
  const originalPreviousHash = targetBlock.previousHash;
  const originalData = JSON.stringify(targetBlock.data);

  let tamperDescription = '';

  // Execute Tamper Attack
  switch (tamperType.toUpperCase()) {
    case 'DATA_MUTATION':
      targetBlock.data = {
        ...targetBlock.data,
        secureCandidateId: 'FORGED_CANDIDATE_HASH_HACKED',
      };
      tamperDescription = `Unauthorized candidate data payload mutation on Block #${index}`;
      break;

    case 'HASH_FORGERY':
      targetBlock.hash = '0000000000000000000000000000000000000000000000000000000000000000';
      tamperDescription = `Hash forgery attempt on Block #${index}`;
      break;

    case 'LINK_CORRUPTION':
      targetBlock.previousHash = 'bad_previous_hash_link_1234567890abcdef1234567890abcdef12345678';
      tamperDescription = `Previous hash link corruption on Block #${index}`;
      break;

    default:
      targetBlock.data = { ...targetBlock.data, tampered: true };
      tamperDescription = `Payload alteration on Block #${index}`;
      break;
  }

  // Run Integrity Scan
  const auditResult = batchVerifyBlocks(chain.chain);
  const isChainValid = chain.isChainValid() && auditResult.isChainValid;

  return {
    detected: !isChainValid,
    tamperType: tamperType.toUpperCase(),
    targetBlockIndex: index,
    tamperDescription,
    originalState: {
      hash: originalHash,
      previousHash: originalPreviousHash,
      data: originalData,
    },
    tamperedState: {
      hash: targetBlock.hash,
      previousHash: targetBlock.previousHash,
      data: JSON.stringify(targetBlock.data),
    },
    auditReport: {
      isChainValid,
      integrityScore: isChainValid ? 100 : Math.round(((chain.chain.length - auditResult.corruptedIndices.length) / chain.chain.length) * 100),
      corruptedIndices: auditResult.corruptedIndices,
      status: isChainValid ? 'INTACT' : 'TAMPERING_DETECTED',
      message: !isChainValid
        ? `ALERT: Tamper attack detected on Block #${index}! (${tamperDescription})`
        : 'Chain intact',
    },
  };
}

export default {
  simulateTamperAttempt,
};
