import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Layers
} from 'lucide-react';
import { StudentProfile, Subject } from '../types';
import { soundManager } from '../utils/audio';

interface SubjectsDeadlinesViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onRegenerateTimetable: () => void;
  onOpenSetup: () => void;
}

export const SubjectsDeadlinesView: React.FC<SubjectsDeadlinesViewProps> = ({
  profile,
  onUpdateProfile,
  onRegenerateTimetable,
  onOpenSetup,
}) => {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getDaysDiff = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleDeleteSubject = (id: string) => {
    if (profile.subjects.length <= 1) {
      alert('You must have at least one subject.');
      return;
    }
    soundManager.playClickSound();
    const updated = {
      ...profile,
      subjects: profile.subjects.filter((s) => s.id !== id),
    };
    onUpdateProfile(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Curriculum & Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Subjects, Exams & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track exam schedules, assignment deliverables, preparation levels, and re-optimize your timetable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenSetup();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Edit Profile Info
          </button>

          <button
            onClick={() => {
              soundManager.playSuccessChime();
              onRegenerateTimetable();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Re-optimize Plan</span>
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.subjects.map((sub) => {
          const examDays = getDaysDiff(sub.examDate);
          const deadlineDays = getDaysDiff(sub.assignmentDeadline);

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 hover:border-indigo-300 transition-all"
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sub.color }}
                  ></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                      <span>{sub.name}</span>
                      {sub.code && (
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {sub.code}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubject(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Difficulty
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      sub.difficulty === 'Hard'
                        ? 'text-rose-700 bg-rose-50'
                        : sub.difficulty === 'Medium'
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-emerald-700 bg-emerald-50'
                    }`}
                  >
                    {sub.difficulty}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Preparation Level
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      sub.preparationLevel === 'Low'
                        ? 'text-rose-700 bg-rose-50'
                        : sub.preparationLevel === 'Medium'
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-emerald-700 bg-emerald-50'
                    }`}
                  >
                    {sub.preparationLevel}
                  </span>
                </div>
              </div>

              {/* Milestones: Exam and Assignment */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {/* Exam status */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <div>
                      <span className="font-bold text-slate-800">Final Exam</span>
                      <span className="text-slate-500 text-[11px] block">
                        {sub.hasExam && sub.examDate ? sub.examDate : 'No exam scheduled'}
                      </span>
                    </div>
                  </div>
                  {sub.hasExam && examDays !== null && (
                    <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                      {examDays === 0 ? 'Today!' : examDays > 0 ? `In ${examDays} days` : 'Completed'}
                    </span>
                  )}
                </div>

                {/* Assignment status */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {sub.hasAssignment && sub.assignmentTitle ? sub.assignmentTitle : 'Assignment'}
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        {sub.hasAssignment && sub.assignmentDeadline ? sub.assignmentDeadline : 'No active deadline'}
                      </span>
                    </div>
                  </div>
                  {sub.hasAssignment && deadlineDays !== null && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[11px]">
                      {deadlineDays === 0 ? 'Due Today!' : deadlineDays > 0 ? `In ${deadlineDays} days` : 'Past deadline'}
                    </span>
                  )}
                </div>
              </div>

              {/* Topics preview if available */}
              {sub.topics && sub.topics.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Core Study Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sub.topics.map((top, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
