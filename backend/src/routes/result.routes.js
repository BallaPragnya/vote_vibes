import { Router } from 'express';
import {
  getResultById,
  getResultStats,
  getResultRankings,
  getResultSummary,
  getDemographics,
  getReport,
  exportReport,
} from '../controllers/resultCalculation.controller.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Public / Authenticated Endpoints for Result APIs
 */

// GET /results/:id -> Returns { winner, voteCounts, rankings }
router.get('/:id', optionalAuthenticate, getResultById);

// GET /results/:id/stats -> Returns { turnout, totalVoters, totalVotes, rejectedVotes }
router.get('/:id/stats', optionalAuthenticate, getResultStats);

// GET /results/:id/rankings -> Returns sorted candidates list
router.get('/:id/rankings', optionalAuthenticate, getResultRankings);

// GET /results/:id/summary -> Returns complete election summary
router.get('/:id/summary', optionalAuthenticate, getResultSummary);

// GET /results/:id/demographics -> Returns demographic breakdown for Chart.js / Recharts
router.get('/:id/demographics', optionalAuthenticate, getDemographics);

// GET /results/:id/report -> Generates and downloads PDF report
router.get('/:id/report', optionalAuthenticate, getReport);

// GET /results/:id/export/:format -> Export report in format (pdf, csv, json, excel)
router.get('/:id/export/:format?', optionalAuthenticate, exportReport);

export default router;
