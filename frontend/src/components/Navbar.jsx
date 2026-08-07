import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Vote, 
  LogOut, 
  User, 
  Menu, 
  X, 
  LayoutDashboard, 
  Award, 
  Settings, 
  Home,
  ChevronDown,
  Layers,
  Users
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'ELECTION_COMMISSION':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'CANDIDATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'VOTER':
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  VoteVibes
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Phase 4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Transparent • Secure • Verifiable
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>

            {/* Elections Hub */}
            {isAuthenticated && (
              <Link
                to="/elections"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive('/elections')
                    ? 'bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Elections
              </Link>
            )}

            {/* Candidates Hub */}
            {isAuthenticated && (
              <Link
                to="/candidates"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive('/candidates')
                    ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Candidates
              </Link>
            )}

            {/* Role: VOTER Portal */}
            {isAuthenticated && (
              <Link
                to="/voter/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  location.pathname === '/voter/dashboard' || location.pathname === '/dashboard'
                    ? 'bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Voter Portal
              </Link>
            )}

            {/* Role: CANDIDATE Workspace */}
            {isAuthenticated && (role === 'CANDIDATE' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
              <Link
                to="/candidate/portal"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  location.pathname === '/candidate/portal'
                    ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Candidate Workspace
              </Link>
            )}

            {/* Role: ADMINISTRATOR Console */}
            {isAuthenticated && (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ELECTION_COMMISSION') && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* Desktop User Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-inner"
                >
                  <div className="p-1 bg-indigo-500/20 rounded-lg">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-semibold text-slate-200 block truncate max-w-[120px]">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(role)}`}>
                    {role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-slate-100">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider mt-1.5 ${getRoleBadgeStyle(role)}`}>
                        Role: {role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/elections"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Elections Hub
                      </Link>
                      <Link
                        to="/candidates"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        Candidate Directory
                      </Link>
                      <Link
                        to="/voter/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                        My Dashboard
                      </Link>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
          >
            Home
          </Link>

          {isAuthenticated && (
            <Link
              to="/elections"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-indigo-300 hover:bg-slate-900"
            >
              Elections Hub
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to="/candidates"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-amber-300 hover:bg-slate-900"
            >
              Candidate Directory
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to="/voter/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
            >
              Voter Portal
            </Link>
          )}

          {isAuthenticated && (role === 'CANDIDATE' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <Link
              to="/candidate/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-amber-300 hover:bg-slate-900"
            >
              Candidate Workspace
            </Link>
          )}

          {isAuthenticated && (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ELECTION_COMMISSION') && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-purple-300 hover:bg-slate-900"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-3 border-t border-slate-900">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 text-xs text-slate-400">
                  User: <span className="font-semibold text-slate-200">{user?.name}</span> ({role})
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
