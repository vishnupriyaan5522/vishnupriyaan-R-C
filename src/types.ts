export type SubjectDifficulty = 'Easy' | 'Medium' | 'Hard';
export type PreparationLevel = 'Low' | 'Medium' | 'High';
export type PreferredStudyTime = 'Morning' | 'Afternoon' | 'Evening';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TaskType = 'Deep Study' | 'Assignment Work' | 'Exam Revision' | 'Practice Problems' | 'Quick Review';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  difficulty: SubjectDifficulty;
  preparationLevel: PreparationLevel;
  hasExam: boolean;
  examDate?: string; // YYYY-MM-DD
  hasAssignment: boolean;
  assignmentTitle?: string;
  assignmentDeadline?: string; // YYYY-MM-DD
  topics: string[];
}

export interface StudentProfile {
  name: string;
  course: string;
  semester: string;
  subjects: Subject[];
  availableDailyHours: number;
  preferredStudyTime: PreferredStudyTime;
  weeklyHolidays: DayOfWeek[];
  targetExamScore?: string;
}

export interface TimetableTask {
  id: string;
  day: DayOfWeek;
  timeSlot: string; // e.g. "09:00 - 10:00"
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topic: string;
  taskType: TaskType;
  durationMinutes: number;
  completed: boolean;
  priority: PriorityLevel;
  notes?: string;
  dateStr?: string;
  completedAt?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'exam_urgency' | 'deadline_alert' | 'high_difficulty' | 'fatigue_break' | 'streak_motivation' | 'study_balance';
  title: string;
  description: string;
  severity: 'urgent' | 'warning' | 'tip' | 'success';
  subjectName?: string;
  actionLabel?: string;
  targetTab?: string;
}

export interface StudyStats {
  streakDays: number;
  lastActiveDate: string;
  todayMinutesStudied: number;
}
