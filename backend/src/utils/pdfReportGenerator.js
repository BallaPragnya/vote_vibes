import PDFDocument from 'pdfkit';

/**
 * Generate a professional Election Report PDF Buffer using PDFKit
 * 
 * Includes:
 * - Header banner & branding
 * - Election details
 * - Winner announcement box
 * - Turnout & voter participation metrics
 * - Candidate rankings table
 * - System audit statement & generation timestamp
 * 
 * @param {Object} summaryData - Election summary payload from resultService.getElectionSummary
 * @returns {Promise<Buffer>} - Resolves with PDF binary buffer
 */
export const generateElectionReportPDF = (summaryData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const {
        election = {},
        winner = null,
        rankings = [],
        turnout = {},
        timestamp = new Date().toISOString(),
      } = summaryData || {};

      const primaryColor = '#1E1E38'; // Dark Navy Indigo
      const accentColor = '#4F46E5';  // Vibrant Indigo
      const lightBg = '#F3F4F6';       // Light Slate Gray
      const successColor = '#059669';  // Emerald Green
      const textColor = '#1F2937';     // Dark Charcoal

      // Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

      doc.fillColor('#FFFFFF')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('VoteVibes', 50, 30);

      doc.fontSize(12)
         .font('Helvetica')
         .text('Official Election Audit & Results Report', 50, 60);

      doc.fontSize(10)
         .text(`Generated: ${new Date(timestamp).toUTCString()}`, doc.page.width - 250, 60, { width: 200, align: 'right' });

      let yPos = 120;

      // Section 1: Election Details
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('1. Election Information', 50, yPos);

      yPos += 25;

      doc.rect(50, yPos, doc.page.width - 100, 65).fill(lightBg);

      doc.fillColor(textColor)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(`Title: `, 60, yPos + 10)
         .font('Helvetica')
         .text(election.title || 'N/A', 100, yPos + 10);

      doc.font('Helvetica-Bold')
         .text(`Status: `, 60, yPos + 28)
         .font('Helvetica')
         .fillColor(successColor)
         .text(election.status || 'COMPLETED', 110, yPos + 28);

      doc.fillColor(textColor)
         .font('Helvetica-Bold')
         .text(`Election ID: `, 60, yPos + 46)
         .font('Helvetica')
         .text(election.id || 'N/A', 140, yPos + 46);

      yPos += 80;

      // Section 2: Winner Announcement Box
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('2. Election Outcome & Winner', 50, yPos);

      yPos += 25;

      doc.rect(50, yPos, doc.page.width - 100, 75).fill('#ECFDF5').stroke('#10B981');

      if (winner && winner.winningStatus === 'SINGLE_WINNER') {
        doc.fillColor(successColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`WINNER: ${winner.fullName}`, 65, yPos + 15);

        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text(`Vote Tally: ${winner.voteCount} votes (${winner.percentage}%)`, 65, yPos + 40);
      } else if (winner && winner.isTie) {
        doc.fillColor('#D97706')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`OUTCOME: TIE DECLARED (${winner.voteCount} votes each)`, 65, yPos + 15);

        const tiedNames = (winner.winners || []).map((w) => w.fullName).join(', ');
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text(`Tied Candidates: ${tiedNames}`, 65, yPos + 40);
      } else {
        doc.fillColor('#6B7280')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('No votes recorded or election uncompleted', 65, yPos + 25);
      }

      yPos += 90;

      // Section 3: Voter Turnout Metrics
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('3. Voter Participation & Turnout', 50, yPos);

      yPos += 25;

      const cardWidth = (doc.page.width - 120) / 3;

      // Card A: Eligible Voters
      doc.rect(50, yPos, cardWidth, 50).fill(lightBg);
      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('ELIGIBLE VOTERS', 60, yPos + 10);
      doc.fontSize(14).font('Helvetica-Bold').text(`${turnout.eligibleVoters || 0}`, 60, yPos + 26);

      // Card B: Votes Cast
      doc.rect(50 + cardWidth + 10, yPos, cardWidth, 50).fill(lightBg);
      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('VOTES CAST', 60 + cardWidth + 10, yPos + 10);
      doc.fontSize(14).font('Helvetica-Bold').text(`${turnout.votesCast || 0}`, 60 + cardWidth + 10, yPos + 26);

      // Card C: Turnout %
      doc.rect(50 + (cardWidth + 10) * 2, yPos, cardWidth, 50).fill(lightBg);
      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('TURNOUT %', 60 + (cardWidth + 10) * 2, yPos + 10);
      doc.fontSize(14).fillColor(accentColor).font('Helvetica-Bold').text(`${turnout.turnoutPercentage || 0}%`, 60 + (cardWidth + 10) * 2, yPos + 26);

      yPos += 65;

      // Section 4: Candidate Rankings Table
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('4. Official Candidate Rankings', 50, yPos);

      yPos += 25;

      // Table Header
      doc.rect(50, yPos, doc.page.width - 100, 25).fill(primaryColor);
      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Rank', 60, yPos + 7)
         .text('Candidate Name', 120, yPos + 7)
         .text('Votes Cast', 320, yPos + 7)
         .text('Percentage', 420, yPos + 7);

      yPos += 25;

      // Table Rows
      if (rankings.length === 0) {
        doc.rect(50, yPos, doc.page.width - 100, 25).fill(lightBg);
        doc.fillColor(textColor).fontSize(10).font('Helvetica').text('No candidate records available', 60, yPos + 7);
        yPos += 25;
      } else {
        rankings.forEach((cand, idx) => {
          const rowBg = idx % 2 === 0 ? '#FFFFFF' : lightBg;
          doc.rect(50, yPos, doc.page.width - 100, 25).fill(rowBg);

          doc.fillColor(textColor)
             .fontSize(10)
             .font(cand.isWinner ? 'Helvetica-Bold' : 'Helvetica')
             .text(`#${cand.rank}`, 60, yPos + 7)
             .text(cand.fullName || 'Candidate', 120, yPos + 7)
             .text(`${cand.voteCount}`, 320, yPos + 7)
             .text(`${cand.percentage}%`, 420, yPos + 7);

          yPos += 25;
        });
      }

      yPos += 20;

      // Section 5: System Verification Footer
      doc.rect(50, doc.page.height - 70, doc.page.width - 100, 40).fill(lightBg);
      doc.fillColor('#4B5563')
         .fontSize(9)
         .font('Helvetica')
         .text(
           'This report is generated automatically by VoteVibes System. Votes are secured and verified via SHA-256 blockchain ledger audit integrity.',
           60,
           doc.page.height - 60,
           { width: doc.page.width - 120, align: 'center' }
         );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default generateElectionReportPDF;
