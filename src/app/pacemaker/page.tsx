'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface PomodoroState {
  phase: 'work' | 'short-break' | 'long-break';
  timeLeft: number;
  isRunning: boolean;
  sessionCount: number;
  dailyTarget: number;
  currentTask: string;
}

interface StoredData {
  date: string;
  sessionCount: number;
  dailyTarget: number;
}

const STORAGE_KEY = 'tlsg-pacemaker';

const DURATIONS: Record<PomodoroState['phase'], number> = {
  work: 1500,
  'short-break': 300,
  'long-break': 900,
};

const PHASE_LABELS: Record<PomodoroState['phase'], string> = {
  work: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const PHASE_COLORS: Record<PomodoroState['phase'], string> = {
  work: '#6366f1',
  'short-break': '#10b981',
  'long-break': '#0ea5e9',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function PacemakerPage() {
  const [state, setState] = useState<PomodoroState>({
    phase: 'work',
    timeLeft: DURATIONS.work,
    isRunning: false,
    sessionCount: 0,
    dailyTarget: 8,
    currentTask: '',
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load stored data on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const stored: StoredData = JSON.parse(raw);
        const count = stored.date === todayStr() ? stored.sessionCount : 0;
        setState((prev) => ({
          ...prev,
          sessionCount: count,
          dailyTarget: stored.dailyTarget ?? 8,
        }));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            // Phase complete
            const newSessionCount =
              prev.phase === 'work' ? prev.sessionCount + 1 : prev.sessionCount;

            // Persist session count
            const stored: StoredData = {
              date: todayStr(),
              sessionCount: newSessionCount,
              dailyTarget: prev.dailyTarget,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

            // Determine next phase
            let nextPhase: PomodoroState['phase'];
            if (prev.phase === 'work') {
              nextPhase = newSessionCount % 4 === 0 ? 'long-break' : 'short-break';
            } else {
              nextPhase = 'work';
            }

            return {
              ...prev,
              phase: nextPhase,
              timeLeft: DURATIONS[nextPhase],
              isRunning: false,
              sessionCount: newSessionCount,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning]);

  function toggleRunning() {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  }

  function reset() {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: DURATIONS[prev.phase],
    }));
  }

  function setPhase(phase: PomodoroState['phase']) {
    setState((prev) => ({
      ...prev,
      phase,
      timeLeft: DURATIONS[phase],
      isRunning: false,
    }));
  }

  function updateDailyTarget(value: number) {
    const target = Math.max(1, Math.min(24, value));
    setState((prev) => ({ ...prev, dailyTarget: target }));
    const raw = localStorage.getItem(STORAGE_KEY);
    let stored: StoredData = { date: todayStr(), sessionCount: state.sessionCount, dailyTarget: target };
    if (raw) {
      try {
        const existing: StoredData = JSON.parse(raw);
        stored = { ...existing, dailyTarget: target };
      } catch {
        // ignore
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  // SVG ring
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const total = DURATIONS[state.phase];
  const progress = (total - state.timeLeft) / total;
  const strokeOffset = circumference * (1 - progress);
  const color = PHASE_COLORS[state.phase];

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/"
          className="text-slate-400 hover:text-sky-400 transition-colors text-sm flex items-center gap-1"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-white">⏱️ Pacemaker</h1>
        <div className="w-16" />
      </div>

      {/* Phase selector */}
      <div className="flex gap-2 justify-center mb-8">
        {(['work', 'short-break', 'long-break'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              state.phase === p
                ? 'border-transparent text-white'
                : 'border-slate-600 text-slate-400 hover:border-slate-400'
            }`}
            style={state.phase === p ? { backgroundColor: color } : {}}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="flex justify-center mb-6">
        <svg width="220" height="220" className="-rotate-90">
          {/* Track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Time overlay */}
        <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '70px' }}>
          <span className="text-5xl font-mono font-bold text-white">
            {formatTime(state.timeLeft)}
          </span>
          <span className="text-sm text-slate-400 mt-1">{PHASE_LABELS[state.phase]}</span>
        </div>
      </div>

      {/* Task input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="What are you working on?"
          value={state.currentTask}
          onChange={(e) => setState((prev) => ({ ...prev, currentTask: e.target.value }))}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-8">
        <button
          onClick={toggleRunning}
          className="px-10 py-3 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: color }}
        >
          {state.isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-lg transition-colors"
        >
          ↺
        </button>
      </div>

      {/* Session counter */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-300 text-sm font-medium">Today&apos;s Sessions</span>
          <span className="text-white font-bold">
            {state.sessionCount} / {state.dailyTarget}
          </span>
        </div>
        {/* Pips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Array.from({ length: state.dailyTarget }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border transition-colors ${
                i < state.sessionCount
                  ? 'border-transparent'
                  : 'bg-slate-700 border-slate-600'
              }`}
              style={i < state.sessionCount ? { backgroundColor: color } : {}}
            />
          ))}
        </div>
        {/* Daily target input */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Daily target</span>
          <button
            onClick={() => updateDailyTarget(state.dailyTarget - 1)}
            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            −
          </button>
          <span className="text-white font-semibold w-6 text-center">{state.dailyTarget}</span>
          <button
            onClick={() => updateDailyTarget(state.dailyTarget + 1)}
            className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </main>
  );
}
