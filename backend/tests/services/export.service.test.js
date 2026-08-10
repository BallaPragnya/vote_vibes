import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ExportService } from '../../src/services/export.service.js';
import resultService from '../../src/services/result.service.js';

describe('ExportService Unit Tests', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  test('Should throw 400 ValidationError for unsupported export format', async () => {
    const service = new ExportService();
    await assert.rejects(
      async () => service.exportElectionResults(validUuid, 'xml'),
      (err) => err.statusCode === 400 && err.errorType === 'ValidationError'
    );
  });

  test('Should export PDF format correctly reusing resultService', async () => {
    const service = new ExportService();

    resultService.getElectionSummary = async function (id) {
      return {
        election: { id, title: 'Sample PDF Election', status: 'COMPLETED' },
        winner: { fullName: 'Alice' },
        rankings: [],
        voteCounts: {},
        turnout: { turnoutPercentage: 100 },
        timestamp: new Date().toISOString(),
      };
    };

    resultService.generateElectionReportPDF = async function (id) {
      return {
        buffer: Buffer.from('%PDF-1.4 Mock PDF Content'),
        filename: 'Election_Report_Test.pdf',
        electionId: id,
      };
    };

    const res = await service.exportElectionResults(validUuid, 'pdf');

    assert.strictEqual(res.contentType, 'application/pdf');
    assert.ok(Buffer.isBuffer(res.buffer));
    assert.strictEqual(res.filename, 'Election_Report_Test.pdf');
  });

  test('Should export JSON format correctly without duplicate calculations', async () => {
    const service = new ExportService();

    resultService.getElectionSummary = async function (id) {
      return {
        election: { id, title: 'Sample Election', status: 'COMPLETED' },
        winner: { fullName: 'Alice' },
        rankings: [],
        voteCounts: {},
        turnout: { turnoutPercentage: 100 },
        timestamp: new Date().toISOString(),
      };
    };

    const res = await service.exportElectionResults(validUuid, 'json');

    assert.strictEqual(res.contentType, 'application/json');
    assert.ok(res.filename.endsWith('.json'));

    const parsed = JSON.parse(res.buffer.toString('utf-8'));
    assert.strictEqual(parsed.election.id, validUuid);
  });

  test('Should export CSV and Excel formats correctly', async () => {
    const service = new ExportService();

    resultService.getElectionSummary = async function (id) {
      return {
        election: { id, title: 'Sample CSV Election', status: 'COMPLETED' },
        winner: { winningStatus: 'SINGLE_WINNER', fullName: 'Alice Smith', voteCount: 80, percentage: 80 },
        rankings: [
          { rank: 1, fullName: 'Alice Smith', candidateId: 'c1', voteCount: 80, percentage: 80, isWinner: true },
        ],
        turnout: { eligibleVoters: 100, votesCast: 80, turnoutPercentage: 80 },
        timestamp: new Date().toISOString(),
      };
    };

    const csvRes = await service.exportElectionResults(validUuid, 'csv');
    assert.strictEqual(csvRes.contentType, 'text/csv');
    assert.ok(csvRes.filename.endsWith('.csv'));
    assert.ok(csvRes.buffer.toString('utf-8').includes('Alice Smith'));

    const excelRes = await service.exportElectionResults(validUuid, 'excel');
    assert.strictEqual(excelRes.contentType, 'application/vnd.ms-excel');
    assert.ok(excelRes.buffer.toString('utf-8').includes('VOTEVIBES OFFICIAL ELECTION REPORT'));
  });
});
