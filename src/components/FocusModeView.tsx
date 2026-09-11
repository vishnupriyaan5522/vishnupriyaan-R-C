import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Volume2, 
  VolumeX, 
  Check, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Coffee, 
  BookOpen, 
  CheckCircle2,
  CloudRain,
  Waves,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, TimetableTask } from '../types';
import { soundManager } from '../utils/audio';

interface FocusModeViewProps {
  profile: StudentProfile;
  tasks: TimetableTask[];
  selectedTask: TimetableTask | null;
  onSelectTask: (task: TimetableTask | null) => void;
  onToggleTaskCompletion: (taskId: string) => void;
}

type TimerMode = 'study' | 'break' | 'long-break';

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  profile,
  tasks,
  selectedTask,
  onSelectTask,
  onToggleTaskCompletion,
}) => {
  const [timerMode, setTimerMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'waves' | 'whitenoise'>('none');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback to first pending task if none selected
  useEffect(() => {
    if (!selectedTask && tasks.length > 0) {
      const firstPending = tasks.find((t) => !t.completed) || tasks[0];
      onSelectTask(firstPending);
    }
  }, [tasks, selectedTask, onSelectTask]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished!
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    soundManager.playTimerFinishAlarm();

    if (timerMode === 'study') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setCompletedSessionsCount((c) => c + 1);
      // Auto switch to break
      setTimerMode('break');
      setTimeLeft(5 * 60);
    } else {
      // Break finished, back to study
      setTimerMode('study');
      setTimeLeft(25 * 60);
    }
  };

  const handleModeSwitch = (mode: TimerMode) => {
    soundManager.playClickSound();
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'study') setTimeLeft(25 * 60);
    else if (mode === 'break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleStartPause = () => {
    soundManager.playClickSound();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundManager.playClickSound();
    setIsRunning(false);
    if (timerMode === 'study') setTimeLeft(25 * 60);
    else if (timerMode === 'break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleAmbientToggle = (type: 'none' | 'rain' | 'waves' | 'whitenoise') => {
    soundManager.playClickSound();
    if (type === 'none' || ambientSound === type) {
      soundManager.stopAmbient();
      setAmbientSound('none');
    } else {
      soundManager.startAmbient(type);
      setAmbientSound(type);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const totalSeconds = timerMode === 'study' ? 25 * 60 : timerMode === 'break' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div
      ref={containerRef}
      className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-all ${
        isFullscreen ? 'bg-slate-950 text-white min-h-screen flex flex-col justify-center' : ''
      }`}
    >
      {/* Top Bar with Mode and Fullscreen */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Deep Focus Mode
            </h1>
            <p className="text-xs text-slate-500">25m Study • 5m Break Pomodoro Cycle</p>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Distraction-Free Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Main Timer Display Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 text-center space-y-8 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
            timerMode === 'study' ? 'bg-rose-400' : 'bg-emerald-400'
          }`}
        ></div>

        {/* Timer Mode Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => handleModeSwitch('study')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timerMode === 'study'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            25-min Study Timer
          </button>
          <button
            onClick={() => handleModeSwitch('break')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timerMode === 'break'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5-min Break Timer
          </button>
          <button
            onClick={() => handleModeSwitch('long-break')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timerMode === 'long-break'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            15-min Long Break
          </button>
        </div>

        {/* Selected Task / Subject Display */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Active Study Focus:
            </span>
            <select
              value={selectedTask?.id || ''}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                if (found) onSelectTask(found);
              }}
              className="text-xs bg-white border border-slate-300 rounded-md px-2 py-0.5 max-w-[200px] truncate"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subjectName} – {t.topic}
                </option>
              ))}
            </select>
          </div>

          {selectedTask ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedTask.subjectColor }}
                  ></span>
                  <span className="text-xs font-bold text-slate-900">{selectedTask.subjectName}</span>
                </div>
                <p className="text-sm font-extrabold text-slate-800 line-clamp-1 mt-0.5">
                  {selectedTask.topic}
                </p>
              </div>

              {/* Complete Task Button directly here */}
              <button
                onClick={() => {
                  soundManager.playSuccessChime();
                  confetti({ particleCount: 50 });
                  onToggleTaskCompletion(selectedTask.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  selectedTask.completed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedTask.completed ? 'Completed!' : 'Mark Done'}</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">General Independent Study</p>
          )}
        </div>

        {/* Large Timer Display */}
        <div className="relative py-4">
          <div className="text-6xl sm:text-8xl font-black font-mono tracking-tighter text-slate-900 select-none">
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2 block">
            {timerMode === 'study' ? 'Deep Work Session' : 'Rest & Cognitive Recharge'}
          </span>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto w-full bg-slate-100 h-2.5 rounded-full mt-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                timerMode === 'study' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Controls: Start / Pause / Reset */}
        <div className="flex items-center justify-center gap-4">
          <button
            id="btn-timer-start-pause"
            onClick={handleStartPause}
            className={`px-8 py-4 rounded-2xl font-extrabold text-base shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            id="btn-timer-reset"
            onClick={handleReset}
            className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sounds Synthesizer Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Ambient Focus Audio:</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'none', label: 'Off', icon: VolumeX },
              { id: 'rain', label: 'Warm Rain', icon: CloudRain },
              { id: 'waves', label: 'Ocean Waves', icon: Waves },
              { id: 'whitenoise', label: 'White Noise', icon: Radio },
            ].map((sound) => {
              const Icon = sound.icon;
              const isSel = ambientSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleAmbientToggle(sound.id as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isSel
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sound.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Pomodoro Tips and Completed Sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Pomodoro Sessions Finished
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-display mt-1 block">
              {completedSessionsCount} Cycles
            </span>
            <span className="text-xs text-slate-400">
              {completedSessionsCount * 25} minutes of hyper-focus logged
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Flow State Advice
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Put your phone in another room or on Do Not Disturb. During the 5-minute break, avoid scrolling social media—stand up, stretch, and give your optic nerves rest.
          </p>
        </div>
      </div>

    </div>
  );
};
