import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VoterDashboardPage from './pages/VoterDashboardPage';
import CandidatePortalPage from './pages/CandidatePortalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ElectionDashboard from './pages/ElectionDashboard';
import ElectionDetails from './pages/ElectionDetails';
import CreateElection from './pages/CreateElection';
import EditElection from './pages/EditElection';

import CandidateGridPage from './pages/CandidateGridPage';
import CandidateDetailsPage from './pages/CandidateDetailsPage';
import NominationFormPage from './pages/NominationFormPage';
import CandidateStatusPage from './pages/CandidateStatusPage';
import AdminCandidateApprovalPage from './pages/AdminCandidateApprovalPage';

import VotingPage from './pages/VotingPage';
import VotingBallotPage from './pages/VotingBallotPage';
import VoteReceiptPage from './pages/VoteReceiptPage';
import VoteStatusPage from './pages/VoteStatusPage';
import BlockchainAuditExplorerPage from './pages/BlockchainAuditExplorerPage';
import ElectionResultsPage from './pages/ElectionResultsPage';

import ResultDashboard from './pages/ResultDashboard';
import WinnerPage from './pages/WinnerPage';

import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

import { ShieldCheck, Vote, Cpu, CheckCircle2, Lock, FileCheck, ArrowRight, Award, BarChart3, Trophy } from 'lucide-react';
import useAuth from './hooks/useAuth';

function HeroLanding() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-8 sm:py-16 text-center max-w-4xl mx-auto">
      {/* Badge Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
        <ShieldCheck className="w-4 h-4 text-indigo-400" />
        Transparent • Secure • Verifiable
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
        Modern & Blockchain-Audit Ready <br />
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
          College Election Platform
        </span>
      </h1>

      <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
        VoteVibes enables college students to securely cast digital votes backed by custom SHA-256 blockchain verification and Role-Based Access Control.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-14">
        {isAuthenticated ? (
          <>
            <Link
              to="/results"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02]"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Phase 6 Result Dashboard</span>
            </Link>
            <Link
              to="/elections"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:bg-slate-850"
            >
              <span>Explore Campus Elections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
            >
              <span>Get Started & Register</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:bg-slate-850"
            >
              Sign In to Account
            </Link>
          </>
        )}
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-12">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit mb-3 text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">JWT & RBAC Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dual-token authentication with Voter, Candidate, and Administrator access control tiers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
          <div className="p-2.5 bg-violet-500/10 rounded-xl w-fit mb-3 text-violet-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">Custom Blockchain Ledger</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every cast vote records an immutable cryptographic SHA-256 block hash for total auditability.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
          <div className="p-2.5 bg-amber-500/10 rounded-xl w-fit mb-3 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">Phase 6 Results & PDF Export</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive Recharts dashboard, turnout metrics, declared winner announcement, and PDF summary widget.
          </p>
        </div>
      </div>

      {/* Verification Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Phase 6 Branch Active: <strong>archana_phase6</strong></span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HeroLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/audit" element={<BlockchainAuditExplorerPage />} />
            <Route path="/receipt/:receiptId" element={<VoteReceiptPage />} />

            {/* Phase 6 Result Dashboard & Winner Routes */}
            <Route path="/results" element={<ResultDashboard />} />
            <Route path="/results/:electionId" element={<ResultDashboard />} />
            <Route path="/winner/:electionId" element={<WinnerPage />} />

            {/* Voting Scope Protected Routes */}
            <Route
              path="/vote"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'STUDENT', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VotingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote/status"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'STUDENT', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VoteStatusPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote/receipt"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'STUDENT', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VoteReceiptPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote/:electionId"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'STUDENT', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VotingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Election Routes */}
            <Route
              path="/elections"
              element={
                <ProtectedRoute>
                  <ElectionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections/:id"
              element={
                <ProtectedRoute>
                  <ElectionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections/:id/vote"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'STUDENT', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VotingBallotPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections/:id/results"
              element={
                <ProtectedRoute>
                  <ElectionResultsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/elections/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <CreateElection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/elections/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <EditElection />
                </ProtectedRoute>
              }
            />

            {/* Candidate Management Routes */}
            <Route
              path="/candidates"
              element={
                <ProtectedRoute>
                  <CandidateGridPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates/nominate"
              element={
                <ProtectedRoute>
                  <NominationFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates/status"
              element={
                <ProtectedRoute>
                  <CandidateStatusPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates/:id"
              element={
                <ProtectedRoute>
                  <CandidateDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/candidates"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <AdminCandidateApprovalPage />
                </ProtectedRoute>
              }
            />

            {/* User Portals */}
            <Route
              path="/voter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VoterDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['VOTER', 'CANDIDATE', 'ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <VoterDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/portal"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN', 'SUPER_ADMIN']}>
                  <CandidatePortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Wildcard 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
