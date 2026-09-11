import { DayOfWeek, StudentProfile, Subject, TaskType, TimetableTask, PriorityLevel } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface SubjectPriorityInfo {
  subject: Subject;
  score: number;
  priorityLevel: PriorityLevel;
  daysToExam: number | null;
  daysToDeadline: number | null;
  needsAssignmentFocus: boolean;
  needsExamFocus: boolean;
}

/**
 * Calculates priority scores for each subject based on exam proximity,
 * assignment deadlines, difficulty, and current student preparation level.
 */
export function calculateSubjectPriorities(subjects: Subject[]): SubjectPriorityInfo[] {
  const now = new Date();
  // Strip time for clean date calculation
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return subjects.map((subject) => {
    let score = 20; // baseline

    // 1. Difficulty weight
    if (subject.difficulty === 'Hard') score += 35;
    else if (subject.difficulty === 'Medium') score += 20;
    else score += 10;

    // 2. Preparation level weight (Low prep requires highest attention)
    if (subject.preparationLevel === 'Low') score += 40;
    else if (subject.preparationLevel === 'Medium') score += 22;
    else score += 8;

    // 3. Exam proximity
    let daysToExam: number | null = null;
    let needsExamFocus = false;
    if (subject.hasExam && subject.examDate) {
      const examDate = new Date(subject.examDate);
      const diffTime = examDate.getTime() - today.getTime();
      daysToExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysToExam <= 3 && daysToExam >= 0) {
        score += 60; // critical
        needsExamFocus = true;
      } else if (daysToExam <= 7 && daysToExam >= 0) {
        score += 45;
        needsExamFocus = true;
      } else if (daysToExam <= 14 && daysToExam >= 0) {
        score += 30;
        needsExamFocus = true;
      } else if (daysToExam <= 30 && daysToExam >= 0) {
        score += 15;
      } else if (daysToExam < 0) {
        // Exam already passed, lower priority
        score += 2;
      }
    }

    // 4. Assignment deadline proximity
    let daysToDeadline: number | null = null;
    let needsAssignmentFocus = false;
    if (subject.hasAssignment && subject.assignmentDeadline) {
      const deadlineDate = new Date(subject.assignmentDeadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      daysToDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysToDeadline <= 2 && daysToDeadline >= 0) {
        score += 50;
        needsAssignmentFocus = true;
      } else if (daysToDeadline <= 5 && daysToDeadline >= 0) {
        score += 35;
        needsAssignmentFocus = true;
      } else if (daysToDeadline <= 10 && daysToDeadline >= 0) {
        score += 20;
      } else if (daysToDeadline < 0) {
        score += 2;
      }
    }

    // Determine categorical priority
    let priorityLevel: PriorityLevel = 'Medium';
    if (score >= 80) priorityLevel = 'High';
    else if (score < 45) priorityLevel = 'Low';

    return {
      subject,
      score,
      priorityLevel,
      daysToExam,
      daysToDeadline,
      needsAssignmentFocus,
      needsExamFocus,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Returns formatted time slots based on preferred time of day and available hours.
 * Includes a 15-minute scheduled break between 50-minute study sessions!
 */
export function generateTimeSlots(preferredTime: 'Morning' | 'Afternoon' | 'Evening', hours: number): { slotText: string; duration: number }[] {
  let startHour = 9;
  let startMinute = 0;

  if (preferredTime === 'Morning') {
    startHour = 8;
    startMinute = 30;
  } else if (preferredTime === 'Afternoon') {
    startHour = 13;
    startMinute = 30;
  } else {
    // Evening
    startHour = 18;
    startMinute = 0;
  }

  const slotsCount = Math.max(1, Math.min(8, Math.round(hours)));
  const slots: { slotText: string; duration: number }[] = [];

  let curH = startHour;
  let curM = startMinute;

  for (let i = 0; i < slotsCount; i++) {
    const sessionDuration = 55; // 55 minutes study session
    const endTotalMin = curH * 60 + curM + sessionDuration;
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const startStr = `${pad(curH)}:${pad(curM)}`;
    const endStr = `${pad(endH)}:${pad(endM)}`;

    slots.push({
      slotText: `${startStr} - ${endStr}`,
      duration: sessionDuration,
    });

    // Add 15-minute break period before next slot
    const nextTotalMin = endTotalMin + 15;
    curH = Math.floor(nextTotalMin / 60);
    curM = nextTotalMin % 60;
  }

  return slots;
}

const DEFAULT_TOPIC_TEMPLATES = [
  'Core Fundamentals & Conceptual Review',
  'Advanced Problem Solving & Exercises',
  'Key Theories, Formulas & Proofs',
  'Practical Applications & Lab Questions',
  'Past Exam Papers & High-Yield Questions',
  'Chapter Summary & Flashcard Memorization',
  'Challenging Topics Breakdown',
  'Comprehensive Mock Revision',
];

/**
 * Main AI planning timetable generator.
 * Builds an evenly balanced, intelligently prioritized weekly schedule.
 */
export function generatePersonalizedTimetable(profile: StudentProfile): TimetableTask[] {
  if (!profile.subjects || profile.subjects.length === 0) {
    return [];
  }

  const priorityInfos = calculateSubjectPriorities(profile.subjects);
  const slotsConfig = generateTimeSlots(profile.preferredStudyTime, profile.availableDailyHours);
  const tasks: TimetableTask[] = [];

  // Track allocation counts to ensure balanced distribution
  const allocationCounts: Record<string, number> = {};
  profile.subjects.forEach((s) => {
    allocationCounts[s.id] = 0;
  });

  // Track topic index for each subject
  const topicIndices: Record<string, number> = {};
  profile.subjects.forEach((s) => {
    topicIndices[s.id] = 0;
  });

  // Build a weighted pool of subjects
  // High priority subjects appear more frequently in the candidate selector pool
  const candidatePool: SubjectPriorityInfo[] = [];
  priorityInfos.forEach((info) => {
    const weightFactor = info.priorityLevel === 'High' ? 4 : info.priorityLevel === 'Medium' ? 2 : 1;
    for (let w = 0; w < weightFactor; w++) {
      candidatePool.push(info);
    }
  });

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    const isHoliday = profile.weeklyHolidays.includes(day);
    // On holidays: schedule either 1 light review session or rest
    const dailySlots = isHoliday
      ? slotsConfig.slice(0, Math.min(2, Math.max(1, Math.floor(slotsConfig.length / 2))))
      : slotsConfig;

    const subjectsAssignedToday: string[] = [];

    dailySlots.forEach((slot, slotIndex) => {
      // Pick best subject for this slot:
      // Prefer subjects that have not reached excessive allocations and haven't been over-assigned today
      let selectedInfo = candidatePool.find(
        (cand) => !subjectsAssignedToday.includes(cand.subject.id)
      );

      if (!selectedInfo) {
        // Fallback: pick the subject with least allocations overall
        selectedInfo = [...priorityInfos].sort(
          (a, b) => (allocationCounts[a.subject.id] || 0) - (allocationCounts[b.subject.id] || 0)
        )[0];
      }

      if (!selectedInfo) {
        selectedInfo = priorityInfos[0];
      }

      const subject = selectedInfo.subject;
      allocationCounts[subject.id] = (allocationCounts[subject.id] || 0) + 1;
      subjectsAssignedToday.push(subject.id);

      // Determine task type based on AI priority indicators
      let taskType: TaskType = 'Deep Study';
      if (isHoliday) {
        taskType = 'Quick Review';
      } else if (selectedInfo.needsExamFocus && (dayIndex >= 3 || slotIndex % 2 === 1)) {
        taskType = 'Exam Revision';
      } else if (selectedInfo.needsAssignmentFocus && slotIndex === 0) {
        taskType = 'Assignment Work';
      } else if (subject.difficulty === 'Hard') {
        taskType = slotIndex % 2 === 0 ? 'Deep Study' : 'Practice Problems';
      } else if (subject.preparationLevel === 'Low') {
        taskType = 'Deep Study';
      } else if (subject.preparationLevel === 'High') {
        taskType = slotIndex % 2 === 0 ? 'Practice Problems' : 'Quick Review';
      }

      // Pick a topic
      let topic = '';
      if (subject.topics && subject.topics.length > 0) {
        const curIdx = topicIndices[subject.id] % subject.topics.length;
        topic = subject.topics[curIdx];
        topicIndices[subject.id]++;
      } else {
        const templateIdx = (topicIndices[subject.id] + dayIndex) % DEFAULT_TOPIC_TEMPLATES.length;
        topic = `${DEFAULT_TOPIC_TEMPLATES[templateIdx]} – Module ${((dayIndex + slotIndex) % 4) + 1}`;
        topicIndices[subject.id]++;
      }

      if (taskType === 'Assignment Work' && subject.assignmentTitle) {
        topic = `Complete: ${subject.assignmentTitle}`;
      } else if (taskType === 'Exam Revision' && subject.hasExam) {
        topic = `Exam Prep: High-Yield Revision & Mock Questions`;
      }

      tasks.push({
        id: `task-${day}-${slotIndex}-${subject.id}-${Date.now() + Math.random()}`,
        day,
        timeSlot: slot.slotText,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color || '#3b82f6',
        topic,
        taskType,
        durationMinutes: slot.duration,
        completed: false,
        priority: selectedInfo.priorityLevel,
        notes: isHoliday ? 'Light session on scheduled holiday' : undefined,
      });
    });
  });

  return tasks;
}
