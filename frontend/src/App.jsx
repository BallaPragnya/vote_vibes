import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

import { ShieldCheck, Vote, Cpu, CheckCircle2, Lock, FileCheck, ArrowRight } from 'lucide-react';
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
        VoteVibes empowers college students to securely cast digital votes backed by custom SHA-256 blockchain verification and Role-Based Access Control.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-14">
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
          >
            <span>Go to Voter Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
            Dual-token authentication (15-min Access Token & 7-day Refresh Token) with Voter, Candidate, and Admin roles.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
          <div className="p-2.5 bg-violet-500/10 rounded-xl w-fit mb-3 text-violet-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">Custom Blockchain Ledger</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every vote generates an immutable cryptographic SHA-256 block hash for total auditability without compromising privacy.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl w-fit mb-3 text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">Election Management</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seamless election creation, candidate registration, status tracking, and live results analytics.
          </p>
        </div>
      </div>

      {/* Verification Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Phase 2 Branch Active: <strong>archananewphase2</strong></span>
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
            <Route path="/" element={<HeroLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
