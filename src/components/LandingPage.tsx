import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CalendarCheck, 
  Clock, 
  Flame, 
  CheckCircle2, 
  ShieldAlert, 
  Compass, 
  Layers, 
  TrendingUp, 
  BookMarked,
  Timer
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
  hasExistingData: boolean;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onViewDemo,
  hasExistingData,
  onGoToDashboard,
}) => {
  const handleStart = () => {
    soundManager.playClickSound();
    onGetStarted();
  };

  const handleDemo = () => {
    soundManager.playSuccessChime();
    onViewDemo();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-slate-50">
      
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl -z-10 flex justify-between">
        <div className="w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/60 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
          <span>Tailored For College & University Students</span>
        </div>

        {/* Mandatory Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight font-display max-w-4xl mx-auto">
          Study Smarter. Plan Better. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600">
            Achieve More.
          </span>
        </h1>

        {/* Mandatory Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Your AI-powered personal study planner that creates a realistic schedule based on your subjects, deadlines, priorities, and available study time.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="btn-landing-get-started"
            onClick={handleStart}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="btn-landing-view-demo"
            onClick={handleDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600 group-hover:scale-110 transition-transform" />
            <span>View Demo</span>
          </button>

          {hasExistingData && (
            <button
              id="btn-landing-resume-dashboard"
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resume Current Plan</span>
            </button>
          )}
        </div>

        {/* Live UI Mockup Preview Banner */}
        <div className="mt-14 max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-semibold text-slate-400 ml-2">SmartStudy AI Live Optimizer</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Algorithm Balanced: 4.0 Daily Hours</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Slot 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-medium">08:30 - 09:25</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">Exam in 4d</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Discrete Mathematics</h4>
              <p className="text-xs text-slate-500 mt-1">Proof by Induction & Graph Circuits</p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">Deep Study</span>
                <span className="text-slate-400 font-medium">55 mins</span>
              </div>
            </div>

            {/* Break */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-center items-center text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-indigo-900">Scheduled 15-Min Break</span>
              <span className="text-[11px] text-indigo-600 mt-0.5">Hydrate & Cognitive Reset</span>
            </div>

            {/* Slot 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-mono font-medium">09:40 - 10:35</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 font-bold text-[10px]">Due in 2d</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Data Structures</h4>
              <p className="text-xs text-slate-500 mt-1">B-Trees & Hash Maps Implementation</p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">Assignment Work</span>
                <span className="text-slate-400 font-medium">55 mins</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Engineered For Academic Excellence
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Everything you need to stop cramming and start studying with calm, structured confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: AI Study Planning */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Study Planning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dynamically calculates study allocations factoring in exam proximity, subject complexity, and personal preparation level so every hour counts.
            </p>
          </div>

          {/* Card 2: Exam & Deadline Tracking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Exam & Deadline Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never let an assignment or midterm sneak up on you. Automatic countdown alerts help you finish work well ahead of eleventh-hour deadlines.
            </p>
          </div>

          {/* Card 3: Smart Prioritization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Prioritization</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Subjects with high difficulty and low preparation receive immediate deep-study blocks, ensuring weak spots are reinforced systematically.
            </p>
          </div>

          {/* Card 4: Daily Progress Tracking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Daily Progress Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track completed tasks, active study streaks, and subject completion rates with instant visual metric cards and milestone celebrations.
            </p>
          </div>

          {/* Card 5: Personalized Timetable */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Timetable</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A balanced Monday-to-Sunday schedule respecting your chosen study hours, preferred times of day, and designated weekly holiday rest days.
            </p>
          </div>

          {/* Bonus Card: Focus Mode with Pomodoro */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-rose-300 flex items-center justify-center mb-4 border border-white/10">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Built-in Focus Mode</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              25-minute Pomodoro study cycles with ambient sounds (rain, ocean, white noise) to keep you locked into deep flow without distractions.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 SmartStudy AI – AI Study Planner for Students. All data is saved securely in your browser.</p>
      </footer>

    </div>
  );
};
