import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  LayoutDashboard, 
  BookOpen, 
  Lightbulb, 
  Timer, 
  Flame, 
  UserCog, 
  RotateCcw
} from 'lucide-react';
import { StudentProfile } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'timetable' | 'subjects' | 'recommendations' | 'focus';
  setActiveTab: (tab: 'dashboard' | 'timetable' | 'subjects' | 'recommendations' | 'focus') => void;
  profile: StudentProfile | null;
  streakDays: number;
  onOpenSetup: () => void;
  onResetPlan: () => void;
  onGoLanding: () => void;
  recommendationsCount: number;
  isTimerRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  streakDays,
  onOpenSetup,
  onResetPlan,
  onGoLanding,
  recommendationsCount,
  isTimerRunning,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              id="brand-logo-btn"
              onClick={onGoLanding}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight font-display">
                  SmartStudy<span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                  AI Study Planner
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          {profile && (
            <nav id="desktop-navigation" className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                id="nav-tab-timetable"
                onClick={() => setActiveTab('timetable')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'timetable'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Timetable
              </button>

              <button
                id="nav-tab-subjects"
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'subjects'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Subjects & Deadlines
              </button>

              <button
                id="nav-tab-recommendations"
                onClick={() => setActiveTab('recommendations')}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                AI Tips
                {recommendationsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {recommendationsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-focus"
                onClick={() => setActiveTab('focus')}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'focus'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Timer className="w-4 h-4 text-rose-500" />
                Focus Mode
                {isTimerRunning && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <>
                {/* Streak Badge */}
                <div 
                  id="user-streak-badge"
                  title="Daily Study Streak"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold"
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                  <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</span>
                </div>

                {/* Edit Profile / Reconfigure */}
                <button
                  id="btn-edit-student-profile"
                  onClick={onOpenSetup}
                  title="Update Academic Details"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  <UserCog className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Plan</span>
                </button>

                {/* Reset / New Plan */}
                <button
                  id="btn-reset-plan-action"
                  onClick={onResetPlan}
                  title="Reset or Create New Plan"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                id="btn-nav-get-started"
                onClick={onOpenSetup}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      {profile && (
        <div id="mobile-navigation" className="md:hidden flex items-center justify-around border-t border-slate-200/80 bg-white py-2 px-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'timetable' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timetable</span>
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'subjects' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subjects</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg relative ${
              activeTab === 'recommendations' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Tips</span>
            {recommendationsCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'focus' ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Timer className="w-4 h-4 text-rose-500" />
            <span>Focus</span>
          </button>
        </div>
      )}
    </header>
  );
};
