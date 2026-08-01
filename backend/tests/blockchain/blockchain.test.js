import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import calculateHash from '../../src/blockchain/hash.js';
import Block from '../../src/blockchain/block.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Blockchain Phase 1 Tests', () => {

  it('Requirement 5: Should correctly generate a SHA-256 hash using calculateHash', () => {
    const data = { voteId: 'v123', candidateId: 'c456' };
    const hash1 = calculateHash(data);
    const hash2 = calculateHash(data);

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64); // SHA-256 produces 64 hex chars
    assert.equal(hash1, hash2, 'Identical inputs should yield identical hashes');
  });

  it('Requirement 6: Should create a Block instance with required fields', () => {
    const timestamp = new Date().toISOString();
    const block = new Block(1, timestamp, { vote: 'Candidate A' }, 'prevHash123');

    assert.equal(block.index, 1);
    assert.equal(block.timestamp, timestamp);
    assert.deepEqual(block.data, { vote: 'Candidate A' });
    assert.equal(block.previousHash, 'prevHash123');
    assert.equal(typeof block.hash, 'string');
    assert.equal(block.hash.length, 64);
  });

  it('Requirement 7: Should initialize Genesis block and add multiple linked blocks', () => {
    const voteChain = new Blockchain();

    assert.equal(voteChain.chain.length, 1, 'Should start with Genesis block');
    assert.equal(voteChain.chain[0].data, 'Genesis Block');

    const block1 = new Block(1, new Date().toISOString(), { vote: 'Alice' });
    voteChain.addBlock(block1);

    const block2 = new Block(2, new Date().toISOString(), { vote: 'Bob' });
    voteChain.addBlock(block2);

    assert.equal(voteChain.chain.length, 3);
    assert.equal(block1.previousHash, voteChain.chain[0].hash, 'Block 1 previousHash should match Genesis hash');
    assert.equal(block2.previousHash, block1.hash, 'Block 2 previousHash should match Block 1 hash');
  });

  it('Requirement 8: Should verify that a valid blockchain returns true from isChainValid()', () => {
    const voteChain = new Blockchain();
    voteChain.addBlock(new Block(1, new Date().toISOString(), { voteId: 'v1', candidate: 'Alice' }));
    voteChain.addBlock(new Block(2, new Date().toISOString(), { voteId: 'v2', candidate: 'Bob' }));

    assert.equal(voteChain.isChainValid(), true, 'Valid blockchain should pass validation');
  });

  it('Requirement 9: Should detect tampering (modifying block data causes isChainValid() to return false)', () => {
    const voteChain = new Blockchain();
    voteChain.addBlock(new Block(1, new Date().toISOString(), { voteId: 'v1', candidate: 'Alice' }));
    voteChain.addBlock(new Block(2, new Date().toISOString(), { voteId: 'v2', candidate: 'Bob' }));

    assert.equal(voteChain.isChainValid(), true, 'Chain should initially be valid');

    // Tamper with data in block 1
    voteChain.chain[1].data = { voteId: 'v1', candidate: 'Hacked Candidate' };

    assert.equal(voteChain.isChainValid(), false, 'Tampered block data must cause isChainValid() to return false');
  });

});
