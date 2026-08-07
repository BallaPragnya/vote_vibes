import AppError from '../utils/AppError.js';
import resultService from './result.service.js';

export class ExportService {
  /**
   * Helper method to generate clean CSV content from summary data
   * 
   * @param {Object} summary 
   * @returns {string}
   */
  _generateCSVContent(summary) {
    const lines = [];

    // Header
    lines.push('VOTEVIBES OFFICIAL ELECTION REPORT');
    lines.push(`Generated,${new Date(summary.timestamp).toUTCString()}`);
    lines.push('');

    // Election Details
    lines.push('ELECTION DETAILS');
    lines.push(`Election ID,${summary.election.id}`);
    lines.push(`Title,"${summary.election.title.replace(/"/g, '""')}"`);
    lines.push(`Status,${summary.election.status}`);
    lines.push('');

    // Turnout
    lines.push('VOTER PARTICIPATION');
    lines.push(`Eligible Voters,${summary.turnout.eligibleVoters}`);
    lines.push(`Votes Cast,${summary.turnout.votesCast}`);
    lines.push(`Turnout %,${summary.turnout.turnoutPercentage}%`);
    lines.push('');

    // Winner
    lines.push('ELECTION OUTCOME');
    if (summary.winner && summary.winner.winningStatus === 'SINGLE_WINNER') {
      lines.push(`Winner,"${summary.winner.fullName.replace(/"/g, '""')}"`);
      lines.push(`Vote Count,${summary.winner.voteCount}`);
      lines.push(`Percentage,${summary.winner.percentage}%`);
    } else if (summary.winner && summary.winner.isTie) {
      lines.push(`Outcome,TIE`);
      lines.push(`Vote Count,${summary.winner.voteCount}`);
    } else {
      lines.push('Outcome,No Winner / No Votes');
    }
    lines.push('');

    // Rankings Table
    lines.push('CANDIDATE RANKINGS');
    lines.push('Rank,Candidate Name,Candidate ID,Votes Cast,Percentage,Is Winner');

    (summary.rankings || []).forEach((c) => {
      const name = (c.fullName || 'Candidate').replace(/"/g, '""');
      lines.push(`${c.rank},"${name}",${c.candidateId},${c.voteCount},${c.percentage}%,${c.isWinner ? 'YES' : 'NO'}`);
    });

    return lines.join('\n');
  }

  /**
   * Export election results in specified format (pdf, csv, json, excel)
   * Future-ready modular architecture: reuses resultService to avoid duplicated code.
   * 
   * @param {string} electionId 
   * @param {string} [format='pdf'] - 'pdf' | 'csv' | 'json' | 'excel' | 'xlsx'
   * @param {Date|number|string} [now=new Date()] 
   * @returns {Promise<{ buffer: Buffer, contentType: string, filename: string }>}
   */
  async exportElectionResults(electionId, format = 'pdf', now = new Date()) {
    const normalizedFormat = (format || 'pdf').toLowerCase().trim();

    const allowedFormats = ['pdf', 'csv', 'json', 'excel', 'xlsx'];
    if (!allowedFormats.includes(normalizedFormat)) {
      throw new AppError(
        `Unsupported export format '${format}'. Allowed formats are: pdf, csv, json, excel.`,
        400,
        'ValidationError'
      );
    }

    // Reuse existing resultService summary data (Avoids duplicated report calculation code)
    const summary = await resultService.getElectionSummary(electionId, now);
    const safeTitle = (summary.election.title || 'Election').replace(/[^a-zA-Z0-9_-]/g, '_');
    const shortId = summary.election.id.slice(0, 8);

    switch (normalizedFormat) {
      case 'pdf': {
        const pdfData = await resultService.generateElectionReportPDF(electionId, now);
        return {
          buffer: pdfData.buffer,
          contentType: 'application/pdf',
          filename: pdfData.filename,
        };
      }

      case 'json': {
        const jsonString = JSON.stringify(summary, null, 2);
        return {
          buffer: Buffer.from(jsonString, 'utf-8'),
          contentType: 'application/json',
          filename: `Election_Report_${safeTitle}_${shortId}.json`,
        };
      }

      case 'csv': {
        const csvContent = this._generateCSVContent(summary);
        return {
          buffer: Buffer.from(csvContent, 'utf-8'),
          contentType: 'text/csv',
          filename: `Election_Report_${safeTitle}_${shortId}.csv`,
        };
      }

      case 'excel':
      case 'xlsx': {
        const csvContent = this._generateCSVContent(summary);
        return {
          buffer: Buffer.from(csvContent, 'utf-8'),
          contentType: 'application/vnd.ms-excel',
          filename: `Election_Report_${safeTitle}_${shortId}.csv`,
        };
      }

      default:
        throw new AppError(`Export format '${format}' is not supported.`, 400, 'ValidationError');
    }
  }
}

export const exportService = new ExportService();
export default exportService;
