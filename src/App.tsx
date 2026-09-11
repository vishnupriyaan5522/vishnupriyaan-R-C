import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentSetupPage } from './components/StudentSetupPage';
import { DashboardView } from './components/DashboardView';
import { TimetableScheduleView } from './components/TimetableScheduleView';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { FocusModeView } from './components/FocusModeView';
import { SubjectsDeadlinesView } from './components/SubjectsDeadlinesView';
import { QuickAddTaskModal } from './components/QuickAddTaskModal';
import { 
  AIRecommendation, 
  DayOfWeek, 
  StudentProfile, 
  TimetableTask 
} from './types';
import { DEMO_STUDENT_PROFILE } from './data/mockStudentData';
import { generatePersonalizedTimetable } from './utils/plannerAlgorithm';
import { generateAIRecommendations } from './utils/recommendations';
import { soundManager } from './utils/audio';

const STORAGE_KEY_PROFILE = 'smartstudy_profile_v1';
const STORAGE_KEY_TASKS = 'smartstudy_tasks_v1';
const STORAGE_KEY_STREAK = 'smartstudy_streak_v1';
const STORAGE_KEY_STUDIED_MIN = 'smartstudy_studied_min_v1';

export default function App() {
  // App views: 'landing', 'setup', 'app'
  const [currentView, setCurrentView] = useState<'landing' | 'setup' | 'app'>('landing');
  
  // App tabs when currentView === 'app'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timetable' | 'subjects' | 'recommendations' | 'focus'>('dashboard');

  // Student Profile
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Timetable tasks
  const [tasks, setTasks] = useState<TimetableTask[]>([]);

  // Streak & Study Stats
  const [streakDays, setStreakDays] = useState<number>(3);
  const [todayStudiedMinutes, setTodayStudiedMinutes] = useState<number>(65);

  // Active focus task
  const [selectedFocusTask, setSelectedFocusTask] = useState<TimetableTask | null>(null);

  // Quick Add Task Modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDay, setQuickAddDay] = useState<DayOfWeek>('Monday');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProfileStr = localStorage.getItem(STORAGE_KEY_PROFILE);
      const savedTasksStr = localStorage.getItem(STORAGE_KEY_TASKS);
      const savedStreakStr = localStorage.getItem(STORAGE_KEY_STREAK);
      const savedMinutesStr = localStorage.getItem(STORAGE_KEY_STUDIED_MIN);

      if (savedProfileStr) {
        const parsedProfile: StudentProfile = JSON.parse(savedProfileStr);
        setProfile(parsedProfile);

        if (savedTasksStr) {
          const parsedTasks: TimetableTask[] = JSON.parse(savedTasksStr);
          setTasks(parsedTasks);
        } else {
          // If profile exists without tasks, generate
          const generated = generatePersonalizedTimetable(parsedProfile);
          setTasks(generated);
          localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(generated));
        }

        if (savedStreakStr) setStreakDays(Number(savedStreakStr));
        if (savedMinutesStr) setTodayStudiedMinutes(Number(savedMinutesStr));

        // Default to app dashboard if data exists
        setCurrentView('app');
      }
    } catch (e) {
      console.error('Failed to load storage data:', e);
    }
  }, []);

  // Save changes to localStorage
  const saveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
  };

  const saveTasks = (newTasks: TimetableTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
  };

  // Generate & Save new Plan from Setup
  const handleSaveAndGenerate = (newProfile: StudentProfile) => {
    saveProfile(newProfile);
    const newTasks = generatePersonalizedTimetable(newProfile);
    saveTasks(newTasks);
    setCurrentView('app');
    setActiveTab('dashboard');
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    saveProfile(DEMO_STUDENT_PROFILE);
    const demoTasks = generatePersonalizedTimetable(DEMO_STUDENT_PROFILE);
    
    // Mark a couple of tasks completed in demo so dashboard charts look lively!
    if (demoTasks.length >= 2) {
      demoTasks[0].completed = true;
      demoTasks[1].completed = true;
    }
    
    saveTasks(demoTasks);
    setStreakDays(4);
    setTodayStudiedMinutes(110);
    localStorage.setItem(STORAGE_KEY_STREAK, '4');
    localStorage.setItem(STORAGE_KEY_STUDIED_MIN, '110');
    setCurrentView('app');
    setActiveTab('dashboard');
  };

  // Toggle Task Completion
  const handleToggleTaskCompletion = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    saveTasks(updated);

    // Update today's studied minutes
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const delta = task.completed ? -task.durationMinutes : task.durationMinutes;
      const newMinutes = Math.max(0, todayStudiedMinutes + delta);
      setTodayStudiedMinutes(newMinutes);
      localStorage.setItem(STORAGE_KEY_STUDIED_MIN, newMinutes.toString());
    }
  };

  // Increment Streak
  const handleIncrementStreak = () => {
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    localStorage.setItem(STORAGE_KEY_STREAK, newStreak.toString());
  };

  // Quick Add Task
  const handleAddTask = (newTask: TimetableTask) => {
    const updated = [...tasks, newTask];
    saveTasks(updated);
  };

  // Start Focus on Task
  const handleStartFocusOnTask = (task: TimetableTask) => {
    soundManager.playClickSound();
    setSelectedFocusTask(task);
    setActiveTab('focus');
  };

  // Reset / Clear Plan
  const handleResetPlan = () => {
    const confirmed = window.confirm('Would you like to reset your study plan and start over?');
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_TASKS);
      setProfile(null);
      setTasks([]);
      setCurrentView('landing');
    }
  };

  // Re-optimize existing subjects timetable
  const handleRegenerateTimetable = () => {
    if (!profile) return;
    const freshTasks = generatePersonalizedTimetable(profile);
    saveTasks(freshTasks);
    setActiveTab('timetable');
  };

  // Dynamic recommendations
  const dynamicRecommendations: AIRecommendation[] = profile
    ? generateAIRecommendations(profile, tasks, todayStudiedMinutes)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        streakDays={streakDays}
        onOpenSetup={() => setCurrentView('setup')}
        onResetPlan={handleResetPlan}
        onGoLanding={() => setCurrentView('landing')}
        recommendationsCount={dynamicRecommendations.length}
        isTimerRunning={false}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView('setup')}
            onViewDemo={handleLoadDemo}
            hasExistingData={!!profile}
            onGoToDashboard={() => setCurrentView('app')}
          />
        )}

        {currentView === 'setup' && (
          <StudentSetupPage
            initialProfile={profile}
            onSaveAndGenerate={handleSaveAndGenerate}
            onCancel={profile ? () => setCurrentView('app') : () => setCurrentView('landing')}
          />
        )}

        {currentView === 'app' && profile && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                tasks={tasks}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                streakDays={streakDays}
                onIncrementStreak={handleIncrementStreak}
                onOpenQuickAdd={() => {
                  setQuickAddDay('Monday');
                  setIsQuickAddOpen(true);
                }}
                onStartFocusOnTask={handleStartFocusOnTask}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'timetable' && (
              <TimetableScheduleView
                profile={profile}
                tasks={tasks}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                onOpenQuickAdd={(day) => {
                  if (day) setQuickAddDay(day);
                  setIsQuickAddOpen(true);
                }}
                onStartFocusOnTask={handleStartFocusOnTask}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsDeadlinesView
                profile={profile}
                onUpdateProfile={(updated) => {
                  saveProfile(updated);
                  const newTasks = generatePersonalizedTimetable(updated);
                  saveTasks(newTasks);
                }}
                onRegenerateTimetable={handleRegenerateTimetable}
                onOpenSetup={() => setCurrentView('setup')}
              />
            )}

            {activeTab === 'recommendations' && (
              <AIRecommendationsView
                profile={profile}
                tasks={tasks}
                recommendations={dynamicRecommendations}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onStartFocus={() => setActiveTab('focus')}
              />
            )}

            {activeTab === 'focus' && (
              <FocusModeView
                profile={profile}
                tasks={tasks}
                selectedTask={selectedFocusTask}
                onSelectTask={setSelectedFocusTask}
                onToggleTaskCompletion={handleToggleTaskCompletion}
              />
            )}
          </>
        )}
      </main>

      {/* Quick Add Task Modal */}
      {profile && (
        <QuickAddTaskModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          profile={profile}
          onAddTask={handleAddTask}
          defaultDay={quickAddDay}
        />
      )}

    </div>
  );
}
