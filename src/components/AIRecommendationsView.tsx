import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Flame, 
  ShieldAlert, 
  Compass, 
  Send, 
  Bot, 
  HelpCircle,
  BrainCircuit,
  Calendar
} from 'lucide-react';
import { AIRecommendation, StudentProfile, TimetableTask } from '../types';
import { calculateSubjectPriorities } from '../utils/plannerAlgorithm';
import { soundManager } from '../utils/audio';

interface AIRecommendationsViewProps {
  profile: StudentProfile;
  tasks: TimetableTask[];
  recommendations: AIRecommendation[];
  onNavigateToTab: (tab: 'dashboard' | 'timetable' | 'subjects' | 'recommendations' | 'focus') => void;
  onStartFocus: () => void;
}

export const AIRecommendationsView: React.FC<AIRecommendationsViewProps> = ({
  profile,
  tasks,
  recommendations,
  onNavigateToTab,
  onStartFocus,
}) => {
  const priorities = calculateSubjectPriorities(profile.subjects);

  // Interactive AI Study Advisor Chat / Query
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ q: string; a: string; time: string }[]>([
    {
      q: 'Why was Discrete Mathematics scheduled for early morning deep study?',
      a: `Based on your profile, Discrete Mathematics has "Hard" difficulty and an exam in 4 days. Cognitive research indicates that peak analytical working memory occurs in the first 2 hours of your preferred study window (${profile.preferredStudyTime}), maximizing retention of complex proofs and theorems.`,
      time: 'Just now',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleAsk = (queryText?: string) => {
    const q = (queryText || customQuestion).trim();
    if (!q) return;

    soundManager.playClickSound();
    setIsThinking(true);
    setCustomQuestion('');

    setTimeout(() => {
      let answer = '';
      const lower = q.toLowerCase();

      if (lower.includes('burnout') || lower.includes('tired') || lower.includes('fatigue')) {
        answer = `With your current ${profile.availableDailyHours} hours/day study load, the Pomodoro 25/5 rhythm is essential. Always step away from your screen during the 5-minute break. Schedule full rest on your selected holiday (${profile.weeklyHolidays.join(', ') || 'Sunday'}).`;
      } else if (lower.includes('exam') || lower.includes('cram')) {
        const nearestExam = profile.subjects.find((s) => s.hasExam);
        answer = nearestExam
          ? `For ${nearestExam.name}, shift from passive reading to Active Recall. Solve past papers in 50-minute timed sprint blocks using the Focus Mode timer. Dedicate the last 15 minutes of every session to flashcard review.`
          : `Distribute your revision using spaced repetition intervals: Day 1 (Deep Concept), Day 3 (Practice Questions), Day 7 (Comprehensive Mock Review).`;
      } else if (lower.includes('assignment') || lower.includes('deadline')) {
        answer = `Tackle assignment requirements in 2 separate phases: Phase 1 (Outline and core logic) 48 hours in advance; Phase 2 (Polishing and test cases) 24 hours before submission. Never start on deadline day.`;
      } else {
        answer = `To maximize your GPA in ${profile.course} (${profile.semester}), prioritize subjects where current preparation is "Low" first. Completing 2 high-priority tasks each morning generates psychological momentum for the rest of your day.`;
      }

      setAiAnswers((prev) => [
        {
          q,
          a: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setIsThinking(false);
      soundManager.playSuccessChime();
    }, 600);
  };

  const handleRecommendationAction = (rec: AIRecommendation) => {
    soundManager.playClickSound();
    if (rec.targetTab) {
      onNavigateToTab(rec.targetTab as any);
    } else if (rec.type === 'fatigue_break') {
      onStartFocus();
    } else {
      onNavigateToTab('timetable');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Planning Diagnostics & Cognitive Strategy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Dynamic AI Recommendations
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Real-time intelligence generated directly from your entered subjects, upcoming exam proximity, assignment deadlines, and difficulty vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
            <span className="block text-2xl font-extrabold text-sky-400 font-display">
              {recommendations.length}
            </span>
            <span className="text-[11px] text-slate-300 font-medium">Active Insights</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommendations Cards (Left) & Priority Matrix / Advisor Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Dynamic Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Personalized Academic Directives</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Updated automatically</span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const isUrgent = rec.severity === 'urgent';
              const isWarning = rec.severity === 'warning';
              const isSuccess = rec.severity === 'success';

              const borderClass = isUrgent
                ? 'border-rose-200 bg-rose-50/50 hover:border-rose-300'
                : isWarning
                ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                : isSuccess
                ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                : 'border-blue-200 bg-blue-50/40 hover:border-blue-300';

              const badgeClass = isUrgent
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : isWarning
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : isSuccess
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-blue-100 text-blue-800 border-blue-200';

              const Icon = isUrgent
                ? ShieldAlert
                : isWarning
                ? AlertTriangle
                : isSuccess
                ? CheckCircle2
                : Lightbulb;

              return (
                <div
                  key={rec.id}
                  className={`p-5 rounded-2xl border transition-all shadow-xs ${borderClass}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badgeClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {rec.severity}
                          </span>
                          {rec.subjectName && (
                            <span className="text-xs font-bold text-slate-600">
                              {rec.subjectName}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 font-display">
                          {rec.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                    </div>

                    {rec.actionLabel && (
                      <button
                        onClick={() => handleRecommendationAction(rec)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs border border-slate-200 flex items-center gap-1 flex-shrink-0 transition-colors cursor-pointer"
                      >
                        <span>{rec.actionLabel}</span>
                        <ArrowRight className="w-3 h-3 text-indigo-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive AI Study Advisor Q&A Box */}
          <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base font-display">Ask AI Study Advisor</h3>
                <p className="text-xs text-slate-500">Ask strategic questions about your workload, exams, or active recall tactics.</p>
              </div>
            </div>

            {/* Quick suggested chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'How to prevent study burnout?',
                'Best revision strategy for exams in <7 days?',
                'How to balance assignments with exams?',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAsk(chip)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask advice regarding your subjects or timetable..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isThinking}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="space-y-3 pt-3">
              {isThinking && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-800 text-xs flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing cognitive study advice...</span>
                </div>
              )}

              {aiAnswers.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="text-indigo-900 font-bold">Q: {item.q}</span>
                    <span className="text-[10px]">{item.time}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200/60">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Subject Priority & Allocation Matrix */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                Subject Priority Matrix
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Weighted</span>
            </div>

            <p className="text-xs text-slate-500">
              The AI calculates an algorithm score for each subject combining exam urgency, difficulty, low preparation penalties, and assignment due dates:
            </p>

            <div className="space-y-3">
              {priorities.map((item) => {
                const sub = item.subject;
                const isHigh = item.priorityLevel === 'High';
                const isMed = item.priorityLevel === 'Medium';

                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        ></div>
                        <span className="font-bold text-slate-900">{sub.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : isMed
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {item.priorityLevel} (Score: {item.score})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <div>
                        <span className="text-slate-400">Difficulty: </span>
                        <span className="font-semibold text-slate-700">{sub.difficulty}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Prep: </span>
                        <span className="font-semibold text-slate-700">{sub.preparationLevel}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Exam: </span>
                        <span className="font-semibold text-slate-700">
                          {item.daysToExam !== null ? `in ${item.daysToExam}d` : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Assignment: </span>
                        <span className="font-semibold text-slate-700">
                          {item.daysToDeadline !== null ? `in ${item.daysToDeadline}d` : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study Rules Guide */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 p-5 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              Cognitive Science Optimization Rules
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-indigo-900/80">
              <li>High-difficulty topics are scheduled in 50-minute max intervals to avoid cognitive fatigue.</li>
              <li>Break periods (15 minutes) prevent proactive interference between competing subjects.</li>
              <li>Assignment work is scheduled before revision to clear working memory space.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
