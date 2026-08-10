import catchAsync from '../utils/catchAsync.js';
import resultService from '../services/result.service.js';
import analyticsService from '../services/analytics.service.js';
import exportService from '../services/export.service.js';

/**
 * @route GET /api/results/:id
 * @desc Get election result (winner, vote counts, rankings)
 * @access Public (COMPLETED elections) / Private
 */
export const getResultById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await resultService.getElectionResult(id);

  return res.status(200).json({
    success: true,
    message: 'Election result retrieved successfully',
    data: result,
  });
});

/**
 * @route GET /api/results/:id/stats
 * @desc Get election statistics (turnout %, total voters, total votes, rejected votes)
 * @access Public (COMPLETED elections) / Private
 */
export const getResultStats = catchAsync(async (req, res) => {
  const { id } = req.params;
  const stats = await resultService.getElectionStats(id);

  return res.status(200).json({
    success: true,
    message: 'Election statistics retrieved successfully',
    data: stats,
  });
});

/**
 * @route GET /api/results/:id/rankings
 * @desc Get sorted candidates ranking for an election
 * @access Public (COMPLETED elections) / Private
 */
export const getResultRankings = catchAsync(async (req, res) => {
  const { id } = req.params;
  const rankings = await resultService.getElectionRankings(id);

  return res.status(200).json({
    success: true,
    message: 'Election candidate rankings retrieved successfully',
    data: rankings,
  });
});

/**
 * @route GET /api/results/:id/summary
 * @desc Get complete election summary (stats, winner, rankings, vote counts)
 * @access Public (COMPLETED elections) / Private
 */
export const getResultSummary = catchAsync(async (req, res) => {
  const { id } = req.params;
  const summary = await resultService.getElectionSummary(id);

  return res.status(200).json({
    success: true,
    message: 'Complete election summary retrieved successfully',
    data: summary,
  });
});

/**
 * @route GET /api/results/:id/demographics
 * @desc Get demographic analytics breakdown (department, year, branch, role) for Chart.js/Recharts
 * @access Public (COMPLETED elections) / Private
 */
export const getDemographics = catchAsync(async (req, res) => {
  const { id } = req.params;
  const demographics = await analyticsService.getDemographicAnalytics(id);

  return res.status(200).json({
    success: true,
    message: 'Demographic analytics retrieved successfully',
    data: demographics,
  });
});

/**
 * @route GET /api/results/:id/report
 * @desc Generate and download professional election report PDF
 * @access Public (COMPLETED elections) / Private
 */
export const getReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const pdfResult = await resultService.generateElectionReportPDF(id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
  res.setHeader('Content-Length', pdfResult.buffer.length);

  return res.status(200).send(pdfResult.buffer);
});

/**
 * @route GET /api/results/:id/export/:format
 * @desc Export election results in requested format (pdf, csv, json, excel)
 * @access Public (COMPLETED elections) / Private
 */
export const exportReport = catchAsync(async (req, res) => {
  const { id, format } = req.params;
  const targetFormat = format || req.query.format || 'pdf';

  const exportResult = await exportService.exportElectionResults(id, targetFormat);

  res.setHeader('Content-Type', exportResult.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
  res.setHeader('Content-Length', exportResult.buffer.length);

  return res.status(200).send(exportResult.buffer);
});

export default {
  getResultById,
  getResultStats,
  getResultRankings,
  getResultSummary,
  getDemographics,
  getReport,
  exportReport,
};
