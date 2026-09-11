import React from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  CircleDashed, 
  Calendar, 
  Flame, 
  Plus, 
  ArrowUpRight, 
  AlertTriangle, 
  Play, 
  Timer, 
  BookOpen, 
  Check, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayOfWeek, StudentProfile, TimetableTask } from '../types';
import { soundManager } from '../utils/audio';

interface DashboardViewProps {
  profile: StudentProfile;
  tasks: TimetableTask[];
  onToggleTaskCompletion: (taskId: string) => void;
  streakDays: number;
  onIncrementStreak: () => void;
  onOpenQuickAdd: () => void;
  onStartFocusOnTask: (task: TimetableTask) => void;
  onNavigateToTab: (tab: 'dashboard' | 'timetable' | 'subjects' | 'recommendations' | 'focus') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  tasks,
  onToggleTaskCompletion,
  streakDays,
  onIncrementStreak,
  onOpenQuickAdd,
  onStartFocusOnTask,
  onNavigateToTab,
}) => {
  // Determine current day of week
  const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[new Date().getDay()];

  // Today's tasks
  const todayTasks = tasks.filter((t) => t.day === todayDayName);
  // Fallback to Monday if today has no tasks (e.g. holiday or empty)
  const displayTasks = todayTasks.length > 0 ? todayTasks : tasks.filter((t) => t.day === 'Monday');
  const activeDayName = todayTasks.length > 0 ? todayDayName : 'Monday';

  // Metrics calculations
  const todayCompletedCount = displayTasks.filter((t) => t.completed).length;
  const todayPendingCount = displayTasks.filter((t) => !t.completed).length;
  const todayCompletedMinutes = displayTasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.durationMinutes, 0);
  const todayPlannedMinutes = displayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  const totalTasksCount = tasks.length;
  const totalCompletedCount = tasks.filter((t) => t.completed).length;
  const overallPercentage = totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

  // Upcoming Exams
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcomingExams = profile.subjects
    .filter((s) => s.hasExam && s.examDate)
    .map((s) => {
      const examDate = new Date(s.examDate!);
      const diffDays = Math.ceil((examDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      return { subject: s, days: diffDays };
    })
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days);

  // Upcoming Assignments
  const upcomingAssignments = profile.subjects
    .filter((s) => s.hasAssignment && s.assignmentDeadline)
    .map((s) => {
      const dDate = new Date(s.assignmentDeadline!);
      const diffDays = Math.ceil((dDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      return { subject: s, days: diffDays };
    })
    .filter((a) => a.days >= 0)
    .sort((a, b) => a.days - b.days);

  // Trigger streak confetti
  const handleStreakCheckin = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
    soundManager.playSuccessChime();
    onIncrementStreak();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>{profile.course} • {profile.semester}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
            Welcome, {profile.name}!
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base mt-2 max-w-xl">
            {todayPendingCount === 0 && displayTasks.length > 0
              ? 'Outstanding job! You have cleared all scheduled tasks for today.'
              : `You have ${todayPendingCount} study session${todayPendingCount === 1 ? '' : 's'} scheduled for today (${activeDayName}). Let's get into flow!`}
          </p>
        </div>

        {/* Quick Actions in Banner */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            id="btn-quick-add-task-banner"
            onClick={onOpenQuickAdd}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Quick Add Task</span>
          </button>

          <button
            onClick={() => onNavigateToTab('focus')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm border border-indigo-400/40 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Timer className="w-4 h-4 text-rose-300" />
            <span>Open Focus Timer</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Today's Study Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Study</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {(todayCompletedMinutes / 60).toFixed(1)} <span className="text-sm font-semibold text-slate-500">/ {(todayPlannedMinutes / 60).toFixed(1)}h</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${todayPlannedMinutes > 0 ? Math.min(100, Math.round((todayCompletedMinutes / todayPlannedMinutes) * 100)) : 0}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {todayCompletedMinutes >= todayPlannedMinutes && todayPlannedMinutes > 0 ? 'Target achieved!' : `${Math.round(todayPlannedMinutes - todayCompletedMinutes)} mins left`}
          </span>
        </div>

        {/* 2. Completed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {todayCompletedCount} <span className="text-sm font-semibold text-slate-500">Today</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalCompletedCount} total tasks finished
            </p>
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Progress logged</span>
          </div>
        </div>

        {/* 3. Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CircleDashed className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {todayPendingCount} <span className="text-sm font-semibold text-slate-500">Left</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalTasksCount - totalCompletedCount} across full week
            </p>
          </div>
          <div className="text-[11px] font-semibold text-amber-600 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{todayPendingCount === 0 ? 'All caught up' : 'Ready for focus'}</span>
          </div>
        </div>

        {/* 4. Upcoming Exams */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Exams</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {upcomingExams.length} <span className="text-sm font-semibold text-slate-500">Exams</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {upcomingExams[0]
                ? `${upcomingExams[0].subject.name.split(' ')[0]} in ${upcomingExams[0].days}d`
                : 'No exams this term'}
            </p>
          </div>
          <div className="text-[11px] font-semibold text-rose-600 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{upcomingExams[0] ? 'High revision weight' : 'All clear'}</span>
          </div>
        </div>

        {/* 5. Overall Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Progress</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {overallPercentage}%
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-violet-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {totalCompletedCount} of {totalTasksCount} tasks
          </span>
        </div>

      </div>

      {/* Main Content Grid: Today's Timetable (Left) & Deadlines / Streak / Subject Progress (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Today's Timetable */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Today's Study Timetable</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {activeDayName}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check off tasks as you complete them to automatically update your progress statistics.
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('timetable')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Week View</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {displayTasks.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-600">No study tasks scheduled for today!</p>
              <p className="text-xs text-slate-400 mt-1">Take a well-deserved break or use Quick Add to plan an extra session.</p>
              <button
                onClick={onOpenQuickAdd}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Add Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    task.completed
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
                  }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTaskCompletion(task.id)}
                      className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {task.timeSlot}
                        </span>
                        <span 
                          className="text-xs font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: task.subjectColor }}
                        >
                          {task.subjectName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {task.taskType}
                        </span>
                        {task.priority === 'High' && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            High Priority
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm sm:text-base font-bold text-slate-900 mt-1 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.topic}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {task.durationMinutes} mins
                        </span>
                        {task.notes && (
                          <span className="text-slate-400 text-[11px] italic">• {task.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Focus Mode trigger */}
                  {!task.completed && (
                    <button
                      onClick={() => onStartFocusOnTask(task)}
                      title="Start Focus Session on this Task"
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                      <span className="hidden sm:inline">Focus</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick AI Tip Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">AI Scheduling Insight</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Subjects with low current preparation are automatically positioned in your peak alertness hours.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('recommendations')}
              className="text-xs font-bold text-amber-900 underline flex-shrink-0 cursor-pointer"
            >
              View All Tips
            </button>
          </div>
        </div>

        {/* Right Column (1 Col): Deadlines, Streak, Subject Progress */}
        <div className="space-y-6">
          
          {/* Study Streak Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-display">Study Streak</h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {streakDays} Days Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Consistency beats intensity. Check in every day you complete at least 1 study session.
            </p>
            <button
              id="btn-streak-checkin"
              onClick={handleStreakCheckin}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Log Today's Daily Check-in</span>
            </button>
          </div>

          {/* Upcoming Deadlines & Exams Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Upcoming Deadlines & Exams
              </h3>
              <button
                onClick={() => onNavigateToTab('subjects')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.length === 0 && upcomingAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming deadlines logged.</p>
              ) : (
                <>
                  {/* Exams */}
                  {upcomingExams.slice(0, 3).map((item) => (
                    <div
                      key={item.subject.id}
                      className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-rose-950 block">{item.subject.name}</span>
                        <span className="text-[11px] text-rose-700">Final Exam • {item.subject.examDate}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[10px]">
                        {item.days === 0 ? 'Today' : `${item.days}d left`}
                      </span>
                    </div>
                  ))}

                  {/* Assignments */}
                  {upcomingAssignments.slice(0, 3).map((item) => (
                    <div
                      key={item.subject.id}
                      className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-amber-950 block">{item.subject.assignmentTitle || 'Assignment'}</span>
                        <span className="text-[11px] text-amber-700">{item.subject.name} • {item.subject.assignmentDeadline}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[10px]">
                        {item.days === 0 ? 'Due Today' : `${item.days}d left`}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Subject Progress Bars */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Subject Progress
              </h3>
              <span className="text-xs text-slate-400 font-medium">{profile.subjects.length} Subjects</span>
            </div>

            <div className="space-y-3">
              {profile.subjects.map((sub) => {
                const subTasks = tasks.filter((t) => t.subjectId === sub.id);
                const subDone = subTasks.filter((t) => t.completed).length;
                const pct = subTasks.length > 0 ? Math.round((subDone / subTasks.length) * 100) : 0;

                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate">{sub.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{pct}% ({subDone}/{subTasks.length})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: sub.color || '#3b82f6' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
