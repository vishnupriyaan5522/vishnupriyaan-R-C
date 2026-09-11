import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  Plus, 
  Filter, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Search, 
  BookOpen,
  Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayOfWeek, StudentProfile, TimetableTask } from '../types';
import { DAYS_OF_WEEK } from '../utils/plannerAlgorithm';
import { soundManager } from '../utils/audio';

interface TimetableScheduleViewProps {
  profile: StudentProfile;
  tasks: TimetableTask[];
  onToggleTaskCompletion: (taskId: string) => void;
  onOpenQuickAdd: (day?: DayOfWeek) => void;
  onStartFocusOnTask: (task: TimetableTask) => void;
}

export const TimetableScheduleView: React.FC<TimetableScheduleViewProps> = ({
  profile,
  tasks,
  onToggleTaskCompletion,
  onOpenQuickAdd,
  onStartFocusOnTask,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [viewMode, setViewMode] = useState<'single-day' | 'all-days'>('single-day');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTask = (task: TimetableTask) => {
    if (subjectFilter !== 'all' && task.subjectId !== subjectFilter) return false;
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = task.topic.toLowerCase().includes(q);
      const matchSubject = task.subjectName.toLowerCase().includes(q);
      const matchType = task.taskType.toLowerCase().includes(q);
      if (!matchTopic && !matchSubject && !matchType) return false;
    }
    return true;
  };

  const handleTaskToggle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      soundManager.playSuccessChime();
      
      // Check if this completes all tasks for this day!
      const dayTasks = tasks.filter((t) => t.day === task.day);
      const willBeCompletedCount = dayTasks.filter((t) => t.completed || t.id === taskId).length;
      if (willBeCompletedCount === dayTasks.length) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      soundManager.playClickSound();
    }
    onToggleTaskCompletion(taskId);
  };

  // Export as text/csv format or trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const lines = [
      `SMARTSTUDY AI – WEEKLY STUDY PLAN`,
      `Student: ${profile.name} | ${profile.course} (${profile.semester})`,
      `Target Study: ${profile.availableDailyHours} Hours/Day | Preferred: ${profile.preferredStudyTime}`,
      `------------------------------------------------------------\n`,
    ];

    DAYS_OF_WEEK.forEach((day) => {
      lines.push(`== ${day.toUpperCase()} ==`);
      const dayTasks = tasks.filter((t) => t.day === day);
      if (dayTasks.length === 0) {
        lines.push(`  (No scheduled sessions / Rest day)`);
      } else {
        dayTasks.forEach((t) => {
          lines.push(
            `  [${t.completed ? 'X' : ' '}] ${t.timeSlot} | ${t.subjectName} | ${t.topic} (${t.taskType}, ${t.durationMinutes}m)`
          );
        });
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartStudy-Timetable-${profile.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Personalized AI Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Weekly Study Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monday through Sunday schedule balanced with priority-weighted slots and scheduled breaks.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => onOpenQuickAdd(selectedDay)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>

          <button
            onClick={handleExportText}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download text file summary"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print study plan"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Day Tabs, Filters, and View Mode */}
      <div className="space-y-4">
        
        {/* Day Selector Tabs (Monday -> Sunday) */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl">
            {DAYS_OF_WEEK.map((day) => {
              const dayTasks = tasks.filter((t) => t.day === day);
              const completedCount = dayTasks.filter((t) => t.completed).length;
              const isSelected = selectedDay === day && viewMode === 'single-day';
              const isHoliday = profile.weeklyHolidays.includes(day);

              return (
                <button
                  key={day}
                  onClick={() => {
                    soundManager.playClickSound();
                    setSelectedDay(day);
                    setViewMode('single-day');
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>{day}</span>
                  {dayTasks.length > 0 ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        completedCount === dayTasks.length
                          ? 'bg-emerald-100 text-emerald-700 font-extrabold'
                          : 'bg-slate-200 text-slate-600 font-mono'
                      }`}
                    >
                      {completedCount}/{dayTasks.length}
                    </span>
                  ) : isHoliday ? (
                    <Coffee className="w-3 h-3 text-amber-500" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Toggle All Week Overview */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              setViewMode(viewMode === 'all-days' ? 'single-day' : 'all-days');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'all-days'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {viewMode === 'all-days' ? 'Show Single Day' : 'All 7 Days Grid'}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Subjects ({profile.subjects.length})</option>
                {profile.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status:</span>
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                {(['all', 'pending', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-1 rounded-md capitalize font-semibold transition-colors cursor-pointer ${
                      statusFilter === s ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search topic or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* Timetable Rendering */}
      {viewMode === 'single-day' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>{selectedDay}'s Schedule</span>
              {profile.weeklyHolidays.includes(selectedDay) && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Coffee className="w-3 h-3" />
                  Scheduled Holiday
                </span>
              )}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {tasks.filter((t) => t.day === selectedDay && filterTask(t)).length} sessions planned
            </span>
          </div>

          {tasks.filter((t) => t.day === selectedDay && filterTask(t)).length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No Sessions for {selectedDay}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No tasks match your current filters. Add a study session or take time to relax and recharge.
              </p>
              <button
                onClick={() => onOpenQuickAdd(selectedDay)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                + Add Custom Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks
                .filter((t) => t.day === selectedDay && filterTask(t))
                .map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      task.completed
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
                    }`}
                  >
                    {/* Checkbox and info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleTaskToggle(task.id)}
                        className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-indigo-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {task.timeSlot}
                          </span>
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white shadow-2xs"
                            style={{ backgroundColor: task.subjectColor }}
                          >
                            {task.subjectName}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {task.taskType}
                          </span>
                          {task.priority === 'High' && (
                            <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              High Priority
                            </span>
                          )}
                        </div>

                        <h3 className={`text-base font-bold text-slate-900 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.topic}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {task.durationMinutes} minutes duration
                          </span>
                          {task.notes && (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                              {task.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Focus Action */}
                    {!task.completed && (
                      <button
                        onClick={() => onStartFocusOnTask(task)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-indigo-600" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Full Week Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayTasks = tasks.filter((t) => t.day === day && filterTask(t));
            const isHoliday = profile.weeklyHolidays.includes(day);

            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="font-bold text-slate-900 text-sm font-display">{day}</span>
                    {isHoliday ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Rest
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">
                        {dayTasks.filter((t) => t.completed).length}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dayTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No sessions</p>
                    ) : (
                      dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            t.completed
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] text-slate-500">{t.timeSlot}</span>
                            <button
                              type="button"
                              onClick={() => handleTaskToggle(t.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                                t.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                          </div>
                          <span
                            className="font-bold block truncate text-slate-800"
                            style={{ color: t.subjectColor }}
                          >
                            {t.subjectName}
                          </span>
                          <span className={`text-[11px] text-slate-600 line-clamp-2 mt-0.5 ${t.completed ? 'line-through' : ''}`}>
                            {t.topic}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onOpenQuickAdd(day)}
                  className="mt-3 w-full py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
