import { AIRecommendation, StudentProfile, TimetableTask } from '../types';

export function generateAIRecommendations(
  profile: StudentProfile,
  tasks: TimetableTask[],
  todayStudiedMinutes: number
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Check for upcoming exams
  profile.subjects.forEach((subject) => {
    if (subject.hasExam && subject.examDate) {
      const examDate = new Date(subject.examDate);
      const diffTime = examDate.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days >= 0 && days <= 7) {
        recommendations.push({
          id: `rec-exam-${subject.id}`,
          type: 'exam_urgency',
          title: `Exam Approaching: ${subject.name}`,
          description: `Your ${subject.name} exam is ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}. Increase ${subject.name} revision and practice mock papers this week.`,
          severity: 'urgent',
          subjectName: subject.name,
          actionLabel: 'View Exam Tasks',
          targetTab: 'timetable',
        });
      }
    }
  });

  // 2. Check for upcoming assignment deadlines
  const assignmentsNear: { subject: string; title: string; days: number; dayOfWeekStr: string }[] = [];
  profile.subjects.forEach((subject) => {
    if (subject.hasAssignment && subject.assignmentDeadline) {
      const dDate = new Date(subject.assignmentDeadline);
      const diffTime = dDate.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeekStr = dayNames[dDate.getDay()];

      if (days >= 0 && days <= 5) {
        assignmentsNear.push({
          subject: subject.name,
          title: subject.assignmentTitle || 'Assignment',
          days,
          dayOfWeekStr,
        });
      }
    }
  });

  if (assignmentsNear.length >= 2) {
    recommendations.push({
      id: 'rec-multiple-deadlines',
      type: 'deadline_alert',
      title: 'Multiple Deadlines Clustering',
      description: `You have ${assignmentsNear.length} upcoming deadlines this week (including ${assignmentsNear.map((a) => a.subject).join(', ')}). Consider completing them earlier to avoid crunch time.`,
      severity: 'warning',
      actionLabel: 'Check Deadlines',
      targetTab: 'subjects',
    });
  } else if (assignmentsNear.length === 1) {
    const item = assignmentsNear[0];
    recommendations.push({
      id: 'rec-single-deadline',
      type: 'deadline_alert',
      title: `Assignment Due Soon: ${item.subject}`,
      description: `Your ${item.title} for ${item.subject} is due in ${item.days === 0 ? 'today' : `${item.days} days`} on ${item.dayOfWeekStr}. Schedule an early focus block.`,
      severity: 'warning',
      subjectName: item.subject,
      actionLabel: 'Start Assignment',
      targetTab: 'focus',
    });
  }

  // 3. Low Preparation & High Difficulty Check
  profile.subjects.forEach((subject) => {
    if (subject.difficulty === 'Hard' && subject.preparationLevel === 'Low') {
      recommendations.push({
        id: `rec-hard-lowprep-${subject.id}`,
        type: 'high_difficulty',
        title: `Priority Boost: ${subject.name}`,
        description: `${subject.name} has low preparation and high difficulty, so it has been given higher priority with dedicated deep-study slots.`,
        severity: 'urgent',
        subjectName: subject.name,
        actionLabel: 'Focus on Topic',
        targetTab: 'timetable',
      });
    } else if (subject.preparationLevel === 'Low' && subject.difficulty === 'Medium') {
      recommendations.push({
        id: `rec-med-lowprep-${subject.id}`,
        type: 'high_difficulty',
        title: `Catch-up Recommended: ${subject.name}`,
        description: `Current preparation level for ${subject.name} is Low. Tackle fundamental concept reviews before starting practice sets.`,
        severity: 'warning',
        subjectName: subject.name,
      });
    }
  });

  // 4. Study Fatigue & Break Monitoring
  if (todayStudiedMinutes >= 120) {
    const hours = (todayStudiedMinutes / 60).toFixed(1);
    recommendations.push({
      id: 'rec-fatigue-break',
      type: 'fatigue_break',
      title: 'Rest & Cognitive Reset',
      description: `You have studied for ${hours} hours today! Great work. Take a 15-minute screen-free walk or hydrate before your next session to maintain memory retention.`,
      severity: 'tip',
      actionLabel: 'Open Break Timer',
      targetTab: 'focus',
    });
  } else if (todayStudiedMinutes > 0) {
    recommendations.push({
      id: 'rec-steady-momentum',
      type: 'study_balance',
      title: 'Solid Momentum',
      description: `You have logged ${todayStudiedMinutes} minutes of focused study today. Keep your daily rhythm steady.`,
      severity: 'success',
    });
  }

  // 5. Completion Rate & Balanced Workload
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  if (totalCount > 0 && completedCount / totalCount >= 0.75) {
    recommendations.push({
      id: 'rec-high-completion',
      type: 'streak_motivation',
      title: 'Superb Consistency!',
      description: `You have achieved over ${Math.round((completedCount / totalCount) * 100)}% task completion this week. Your exam readiness is trending upwards!`,
      severity: 'success',
    });
  }

  // 6. Default Fallback advice if list is short
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'rec-active-recall',
      type: 'study_balance',
      title: 'Active Recall Technique',
      description: 'Use the Focus Mode 25-minute Pomodoro timer with self-testing flashcards instead of passive re-reading to boost long-term retention by 50%.',
      severity: 'tip',
      actionLabel: 'Try Focus Mode',
      targetTab: 'focus',
    });
  }

  return recommendations;
}
