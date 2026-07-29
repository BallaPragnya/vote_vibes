import React from 'react';
import { ShieldCheck, Vote, Cpu, CheckCircle2, Lock, FileCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              VoteVibes
            </h1>
            <p className="text-xs text-indigo-400 font-medium">College Election Platform</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Frontend Active (Archana Phase 1)
        </div>
      </header>

      {/* Main Showcase Hero */}
      <main className="max-w-4xl w-full mx-auto my-auto py-12 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Transparent • Secure • Verifiable
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 mb-6 leading-tight">
          Modern & Blockchain-Audit Ready <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            Election Infrastructure
          </span>
        </h2>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          The frontend foundation for VoteVibes has been successfully initialized using React, Vite, and Tailwind CSS.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-12">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
            <div className="p-2 bg-indigo-500/10 rounded-lg w-fit mb-3">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Vite + React</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lightning fast build system and modular component structure tailored for scalable UI development.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
            <div className="p-2 bg-violet-500/10 rounded-lg w-fit mb-3">
              <Lock className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Tailwind CSS v4</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configured with utility-first styling for rich, modern design aesthetics and dynamic layouts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-md shadow-lg">
            <div className="p-2 bg-emerald-500/10 rounded-lg w-fit mb-3">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Independent Module</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fully decoupled frontend structure ready for future page routing and API service integration.
            </p>
          </div>
        </div>

        {/* Verification Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Tailwind CSS classes and React functional components validated</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center sm:flex sm:justify-between sm:items-center pt-6 border-t border-slate-900 text-xs text-slate-500 z-10">
        <p>© 2026 VoteVibes Team. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 font-mono">Branch: archana_phase1</p>
      </footer>
    </div>
  );
}
