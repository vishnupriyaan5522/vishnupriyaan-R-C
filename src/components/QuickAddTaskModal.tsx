import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, BookOpen, Tag } from 'lucide-react';
import { DayOfWeek, PriorityLevel, StudentProfile, TaskType, TimetableTask } from '../types';
import { soundManager } from '../utils/audio';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onAddTask: (task: TimetableTask) => void;
  defaultDay?: DayOfWeek;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddTask,
  defaultDay = 'Monday',
}) => {
  const [subjectId, setSubjectId] = useState(profile.subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [timeSlot, setTimeSlot] = useState('16:00 - 17:00');
  const [taskType, setTaskType] = useState<TaskType>('Deep Study');
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<PriorityLevel>('High');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const subject = profile.subjects.find((s) => s.id === subjectId) || profile.subjects[0];

    const newTask: TimetableTask = {
      id: `task-manual-${Date.now()}`,
      day,
      timeSlot,
      subjectId: subject ? subject.id : 'custom',
      subjectName: subject ? subject.name : 'General Study',
      subjectColor: subject ? subject.color : '#6366f1',
      topic: topic.trim(),
      taskType,
      durationMinutes: duration,
      completed: false,
      priority,
    };

    soundManager.playSuccessChime();
    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">Quick Add Study Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Topic / Goal *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dynamic Programming LeetCode Practice"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {profile.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || 'Course'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Day of Week
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time Slot
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 15:00 - 16:00"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Deep Study">Deep Study</option>
                <option value="Assignment Work">Assignment Work</option>
                <option value="Exam Revision">Exam Revision</option>
                <option value="Practice Problems">Practice Problems</option>
                <option value="Quick Review">Quick Review</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Schedule</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
