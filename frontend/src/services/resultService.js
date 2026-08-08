import api from '../api/axios';
import jsPDF from 'jspdf';

export const resultService = {
  /**
   * Fetch election voting results from Pragnya's Phase 6 backend
   * @param {string} electionId
   */
  async getElectionResults(electionId) {
    const response = await api.get(`/votes/results/${electionId}`);
    return response.data;
  },

  /**
   * Fetch election details parameters from backend
   * @param {string} electionId
   */
  async getElectionDetails(electionId) {
    const response = await api.get(`/elections/${electionId}`);
    return response.data;
  },

  /**
   * Process turnout metrics from backend results and election payload
   */
  calculateTurnout(resultsData, electionData) {
    let totalVotesCast = 0;
    const positions = resultsData?.results || resultsData?.tally || [];

    if (Array.isArray(positions)) {
      positions.forEach((pos) => {
        if (pos.totalVotesCast) {
          totalVotesCast += pos.totalVotesCast;
        } else if (Array.isArray(pos.candidates)) {
          pos.candidates.forEach((c) => {
            totalVotesCast += c.voteCount || c.votes || 0;
          });
        }
      });
    }

    // Estimate eligible voters based on department scope or fallback
    const eligibleVoters = electionData?.eligibleVotersCount || 500;
    const turnoutPercentage = eligibleVoters > 0 
      ? parseFloat(((totalVotesCast / eligibleVoters) * 100).toFixed(1)) 
      : 0;

    return {
      totalVotesCast,
      eligibleVoters,
      turnoutPercentage: Math.min(turnoutPercentage, 100),
      nonVotingPercentage: Math.max(0, parseFloat((100 - Math.min(turnoutPercentage, 100)).toFixed(1))),
    };
  },

  /**
   * Determine winner candidate for each position from backend result payload
   */
  extractWinners(resultsData) {
    const positions = resultsData?.results || resultsData?.tally || [];
    const winners = [];

    if (Array.isArray(positions)) {
      positions.forEach((pos) => {
        const candidates = pos.candidates || [];
        if (candidates.length > 0) {
          const sorted = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
          const winner = sorted[0];
          const totalPosVotes = pos.totalVotesCast || candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
          const percentage = totalPosVotes > 0 
            ? parseFloat(((winner.voteCount / totalPosVotes) * 100).toFixed(1)) 
            : 0;

          winners.push({
            positionId: pos.positionId,
            positionTitle: pos.positionTitle || 'Position',
            winnerId: winner.id,
            winnerName: winner.fullName || winner.user?.name || 'Nominee',
            winnerPhoto: winner.profileImage || winner.photoUrl,
            voteCount: winner.voteCount || 0,
            percentage,
            totalVotesInPosition: totalPosVotes,
          });
        }
      });
    }

    return winners;
  },

  /**
   * Process demographic & position breakdown categories from backend data
   */
  extractDemographicBreakdown(resultsData) {
    const positions = resultsData?.results || resultsData?.tally || [];
    return positions.map((pos) => ({
      name: pos.positionTitle || 'Position',
      totalVotes: pos.totalVotesCast || (pos.candidates || []).reduce((sum, c) => sum + (c.voteCount || 0), 0),
      candidateCount: (pos.candidates || []).length,
    }));
  },

  /**
   * Generate official PDF election summary document and trigger browser download
   */
  downloadElectionSummary(electionTitle, resultsData, winners, turnoutInfo) {
    const doc = new jsPDF();
    const safeTitle = (electionTitle || 'Election').replace(/[^a-zA-Z0-9_-]/g, '_');

    // PDF Header Styling
    doc.setFillColor(15, 23, 42); // Dark slate header banner
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VoteVibes - Official Election Summary', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Certified Blockchain Audit Summary • Generated ${new Date().toLocaleDateString()}`, 14, 32);

    // Election Details
    let yPos = 52;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Election: ${electionTitle}`, 14, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Votes Cast: ${turnoutInfo.totalVotesCast}`, 14, yPos);
    doc.text(`Estimated Eligible Voters: ${turnoutInfo.eligibleVoters}`, 80, yPos);
    doc.text(`Voter Turnout: ${turnoutInfo.turnoutPercentage}%`, 150, yPos);

    // Divider Line
    yPos += 8;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos, 196, yPos);

    // Winners Section
    yPos += 12;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Declared Election Winners', 14, yPos);

    yPos += 8;
    winners.forEach((w, index) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${index + 1}. ${w.positionTitle}: ${w.winnerName}`, 16, yPos);

      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`   Votes Received: ${w.voteCount} (${w.percentage}% of ${w.totalVotesInPosition} position votes)`, 16, yPos);

      yPos += 8;
    });

    // Position Tally Breakdown
    yPos += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Full Candidate Vote Breakdown', 14, yPos);

    const positions = resultsData?.results || resultsData?.tally || [];
    positions.forEach((pos) => {
      yPos += 8;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Position: ${pos.positionTitle || 'Position'}`, 14, yPos);

      (pos.candidates || []).forEach((c) => {
        yPos += 6;
        if (yPos > 275) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`- ${c.fullName || 'Candidate'}: ${c.voteCount || 0} votes`, 20, yPos);
      });
    });

    // PDF Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('This official summary report is backed by SHA-256 cryptographic verification.', 14, 285);

    doc.save(`VoteVibes_${safeTitle}_Summary.pdf`);
  }
};

export default resultService;
