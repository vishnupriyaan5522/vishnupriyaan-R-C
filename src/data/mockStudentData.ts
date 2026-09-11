import { StudentProfile } from '../types';

export const DEMO_STUDENT_PROFILE: StudentProfile = {
  name: 'Alex Rivera',
  course: 'Computer Science & Engineering',
  semester: 'Semester 5',
  availableDailyHours: 4,
  preferredStudyTime: 'Morning',
  weeklyHolidays: ['Sunday'],
  targetExamScore: '90%+',
  subjects: [
    {
      id: 'sub-dsa',
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      color: '#3b82f6', // Blue
      difficulty: 'Hard',
      preparationLevel: 'Low',
      hasExam: true,
      examDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // 5 days away
      hasAssignment: true,
      assignmentTitle: 'B-Trees & Hash Maps Implementation',
      assignmentDeadline: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // 2 days away
      topics: [
        'Dynamic Programming & Memoization',
        'Graph Traversals (BFS, DFS & Dijkstra)',
        'Balanced Binary Search Trees & AVL',
        'Hashing Collision Resolution Techniques',
        'Greedy Algorithms & Spanning Trees',
      ],
    },
    {
      id: 'sub-math',
      name: 'Discrete Mathematics',
      code: 'MA202',
      color: '#8b5cf6', // Purple
      difficulty: 'Hard',
      preparationLevel: 'Medium',
      hasExam: true,
      examDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], // 4 days away
      hasAssignment: false,
      topics: [
        'Propositional & Predicate Logic',
        'Combinatorics & Pigeonhole Principle',
        'Recurrence Relations & Generating Functions',
        'Graph Theory & Euler/Hamilton Circuits',
      ],
    },
    {
      id: 'sub-os',
      name: 'Operating Systems',
      code: 'CS304',
      color: '#06b6d4', // Cyan
      difficulty: 'Medium',
      preparationLevel: 'Medium',
      hasExam: true,
      examDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0], // 12 days away
      hasAssignment: true,
      assignmentTitle: 'Process Synchronization & Semaphores Lab',
      assignmentDeadline: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
      topics: [
        'Process Scheduling & Deadlocks Handling',
        'Virtual Memory & Page Replacement (LRU, FIFO)',
        'File Systems & Disk Allocation Methods',
        'Multi-threading & Race Conditions',
      ],
    },
    {
      id: 'sub-dbms',
      name: 'Database Systems',
      code: 'CS305',
      color: '#10b981', // Emerald Green
      difficulty: 'Medium',
      preparationLevel: 'High',
      hasExam: true,
      examDate: new Date(Date.now() + 19 * 86400000).toISOString().split('T')[0], // 19 days away
      hasAssignment: false,
      topics: [
        'Relational Algebra & Normalization (BCNF, 3NF)',
        'Transaction ACID Properties & 2-Phase Locking',
        'SQL Complex Joins & Subqueries Optimization',
        'B+ Tree Indexing & Query Execution Plans',
      ],
    },
  ],
};
