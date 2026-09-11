import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Check, 
  Sun, 
  Sunset, 
  Moon,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  DayOfWeek, 
  PreferredStudyTime, 
  StudentProfile, 
  Subject, 
  SubjectDifficulty, 
  PreparationLevel 
} from '../types';
import { DAYS_OF_WEEK } from '../utils/plannerAlgorithm';
import { DEMO_STUDENT_PROFILE } from '../data/mockStudentData';
import { soundManager } from '../utils/audio';

interface StudentSetupPageProps {
  initialProfile: StudentProfile | null;
  onSaveAndGenerate: (profile: StudentProfile) => void;
  onCancel?: () => void;
}

const PALETTE = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export const StudentSetupPage: React.FC<StudentSetupPageProps> = ({
  initialProfile,
  onSaveAndGenerate,
  onCancel,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [course, setCourse] = useState(initialProfile?.course || '');
  const [semester, setSemester] = useState(initialProfile?.semester || 'Semester 5');
  const [availableDailyHours, setAvailableDailyHours] = useState(initialProfile?.availableDailyHours || 4);
  const [preferredStudyTime, setPreferredStudyTime] = useState<PreferredStudyTime>(
    initialProfile?.preferredStudyTime || 'Morning'
  );
  const [weeklyHolidays, setWeeklyHolidays] = useState<DayOfWeek[]>(
    initialProfile?.weeklyHolidays || ['Sunday']
  );

  const [subjects, setSubjects] = useState<Subject[]>(
    initialProfile?.subjects && initialProfile.subjects.length > 0
      ? initialProfile.subjects
      : [
          {
            id: 'sub-1',
            name: 'Mathematics',
            code: 'MATH101',
            color: '#3b82f6',
            difficulty: 'Hard',
            preparationLevel: 'Low',
            hasExam: true,
            examDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
            hasAssignment: true,
            assignmentTitle: 'Calculus Problem Set 4',
            assignmentDeadline: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            topics: ['Limits and Continuity', 'Multivariable Derivatives', 'Integration Techniques'],
          },
          {
            id: 'sub-2',
            name: 'Computer Networks',
            code: 'CS204',
            color: '#8b5cf6',
            difficulty: 'Medium',
            preparationLevel: 'Medium',
            hasExam: true,
            examDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
            hasAssignment: false,
            topics: ['TCP/IP Model', 'Routing Algorithms', 'Subnetting & IP addressing'],
          },
          {
            id: 'sub-3',
            name: 'Physics',
            code: 'PHY102',
            color: '#06b6d4',
            difficulty: 'Hard',
            preparationLevel: 'Low',
            hasExam: false,
            hasAssignment: true,
            assignmentTitle: 'Optics Lab Report',
            assignmentDeadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
            topics: ['Electromagnetism', 'Wave Optics', 'Quantum Mechanics Basics'],
          },
        ]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subject actions
  const handleAddSubject = () => {
    soundManager.playClickSound();
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: '',
      code: '',
      color: PALETTE[subjects.length % PALETTE.length],
      difficulty: 'Medium',
      preparationLevel: 'Medium',
      hasExam: false,
      examDate: '',
      hasAssignment: false,
      assignmentTitle: '',
      assignmentDeadline: '',
      topics: [],
    };
    setSubjects([...subjects, newSub]);
  };

  const handleRemoveSubject = (id: string) => {
    soundManager.playClickSound();
    if (subjects.length <= 1) {
      setErrorMsg('Please keep at least one subject to generate a study timetable.');
      return;
    }
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === id) {
          return { ...s, ...updates };
        }
        return s;
      })
    );
  };

  const handleHolidayToggle = (day: DayOfWeek) => {
    soundManager.playClickSound();
    if (weeklyHolidays.includes(day)) {
      setWeeklyHolidays(weeklyHolidays.filter((d) => d !== day));
    } else {
      setWeeklyHolidays([...weeklyHolidays, day]);
    }
  };

  const handleLoadDemoValues = () => {
    soundManager.playSuccessChime();
    setName(DEMO_STUDENT_PROFILE.name);
    setCourse(DEMO_STUDENT_PROFILE.course);
    setSemester(DEMO_STUDENT_PROFILE.semester);
    setAvailableDailyHours(DEMO_STUDENT_PROFILE.availableDailyHours);
    setPreferredStudyTime(DEMO_STUDENT_PROFILE.preferredStudyTime);
    setWeeklyHolidays(DEMO_STUDENT_PROFILE.weeklyHolidays);
    setSubjects(DEMO_STUDENT_PROFILE.subjects);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your student name.');
      return;
    }
    if (!course.trim()) {
      setErrorMsg('Please specify your Course or Department.');
      return;
    }
    const emptySubject = subjects.find((s) => !s.name.trim());
    if (emptySubject) {
      setErrorMsg('Please fill in a name for all your subjects.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    soundManager.playClickSound();

    // Brief realistic AI generation feedback transition
    setTimeout(() => {
      const updatedProfile: StudentProfile = {
        name: name.trim(),
        course: course.trim(),
        semester: semester.trim() || 'Semester 1',
        subjects,
        availableDailyHours,
        preferredStudyTime,
        weeklyHolidays,
        targetExamScore: 'Target GPA 3.8 / 90%+',
      };
      setIsGenerating(false);
      soundManager.playSuccessChime();
      onSaveAndGenerate(updatedProfile);
    }, 750);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Study Setup Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Configure Your Academic Profile
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Enter your subjects, exam schedules, and available hours. Our AI planning logic will craft your personalized, balanced timetable.
            </p>
          </div>

          <button
            type="button"
            id="btn-prefill-demo"
            onClick={handleLoadDemoValues}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Load sample engineering curriculum"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Sample Data</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          
          {/* Section 1: Basic Student Info */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Student Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Name *
                </label>
                <input
                  id="input-student-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course / Department *
                </label>
                <input
                  id="input-student-course"
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester / Term
                </label>
                <input
                  id="input-student-semester"
                  type="text"
                  placeholder="e.g. Semester 5 / Fall 2026"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Study Availability & Preferences */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Study Availability & Habits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily Hours */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Available Study Hours / Day
                  </label>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold text-sm">
                    {availableDailyHours} Hours
                  </span>
                </div>
                <input
                  id="slider-daily-hours"
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={availableDailyHours}
                  onChange={(e) => setAvailableDailyHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>1 Hour (Light)</span>
                  <span>4 Hours (Standard)</span>
                  <span>8 Hours (Exam Sprint)</span>
                </div>
              </div>

              {/* Preferred Study Time */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Preferred Study Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Morning', icon: Sun, label: 'Morning', desc: '08:30 AM' },
                    { id: 'Afternoon', icon: Sunset, label: 'Afternoon', desc: '01:30 PM' },
                    { id: 'Evening', icon: Moon, label: 'Evening', desc: '06:00 PM' },
                  ].map((time) => {
                    const Icon = time.icon;
                    const isSelected = preferredStudyTime === time.id;
                    return (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => {
                          soundManager.playClickSound();
                          setPreferredStudyTime(time.id as PreferredStudyTime);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center sm:items-start cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                        <span className="text-xs font-bold">{time.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {time.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly Holidays */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Weekly Holidays / Light Days
                </label>
                <span className="text-xs text-slate-500">
                  {weeklyHolidays.length === 0 ? 'No rest days selected' : `${weeklyHolidays.length} rest days`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                The algorithm will assign rest or minimal review sessions on selected holidays.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = weeklyHolidays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleHolidayToggle(day)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isChecked
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-amber-700" />}
                      <span>{day.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Subjects & Deadlines */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                Subjects, Exams & Deadlines
              </h2>

              <button
                type="button"
                id="btn-add-subject"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-4">
              {subjects.map((sub, index) => (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sub.color }}
                      ></div>
                      <span className="text-xs font-extrabold text-slate-400">#{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Subject Name (e.g. Operating Systems)"
                        value={sub.name}
                        onChange={(e) => handleUpdateSubject(sub.id, { name: e.target.value })}
                        className="font-bold text-slate-900 text-sm sm:text-base border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none flex-1 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Code (e.g. CS201)"
                        value={sub.code}
                        onChange={(e) => handleUpdateSubject(sub.id, { code: e.target.value })}
                        className="w-20 px-2 py-1 text-xs font-mono uppercase bg-slate-100 rounded-md border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-500 text-center"
                      />
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Difficulty & Preparation Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    
                    {/* Difficulty */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Subject Difficulty
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Easy', 'Medium', 'Hard'] as SubjectDifficulty[]).map((level) => {
                          const isSel = sub.difficulty === level;
                          const colorClasses =
                            level === 'Hard'
                              ? isSel
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                              : level === 'Medium'
                              ? isSel
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : isSel
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200';

                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                soundManager.playClickSound();
                                handleUpdateSubject(sub.id, { difficulty: level });
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${colorClasses}`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Preparation Level */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Current Preparation Level
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Low', 'Medium', 'High'] as PreparationLevel[]).map((prep) => {
                          const isSel = sub.preparationLevel === prep;
                          const prepClasses =
                            prep === 'Low'
                              ? isSel
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                              : prep === 'Medium'
                              ? isSel
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : isSel
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200';

                          return (
                            <button
                              key={prep}
                              type="button"
                              onClick={() => {
                                soundManager.playClickSound();
                                handleUpdateSubject(sub.id, { preparationLevel: prep });
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${prepClasses}`}
                            >
                              {prep}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Exam Date & Assignment Deadline inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                    
                    {/* Exam Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={sub.hasExam}
                            onChange={(e) =>
                              handleUpdateSubject(sub.id, {
                                hasExam: e.target.checked,
                                examDate: e.target.checked && !sub.examDate
                                  ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
                                  : sub.examDate,
                              })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Upcoming Exam Date</span>
                        </label>
                      </div>
                      {sub.hasExam && (
                        <input
                          type="date"
                          value={sub.examDate || ''}
                          onChange={(e) => handleUpdateSubject(sub.id, { examDate: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Assignment Deadline */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={sub.hasAssignment}
                            onChange={(e) =>
                              handleUpdateSubject(sub.id, {
                                hasAssignment: e.target.checked,
                                assignmentDeadline: e.target.checked && !sub.assignmentDeadline
                                  ? new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
                                  : sub.assignmentDeadline,
                              })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Assignment Deadline</span>
                        </label>
                      </div>
                      {sub.hasAssignment && (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Assignment Name (e.g. Lab Project 2)"
                            value={sub.assignmentTitle || ''}
                            onChange={(e) => handleUpdateSubject(sub.id, { assignmentTitle: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <input
                            type="date"
                            value={sub.assignmentDeadline || ''}
                            onChange={(e) => handleUpdateSubject(sub.id, { assignmentDeadline: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              id="btn-generate-study-plan"
              disabled={isGenerating}
              className="w-full sm:w-auto sm:ml-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 active:scale-95 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{isGenerating ? 'Analyzing & Scheduling...' : 'Generate My Study Plan'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
