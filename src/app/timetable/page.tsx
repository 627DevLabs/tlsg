'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TimetableEntry {
  id: string;
  subject: string;
  day: number;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
}

const STORAGE_KEY = 'tlsg-timetable-entries';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, '0')}:00`;
});

const PRESET_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Sky', value: '#0ea5e9' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formDay, setFormDay] = useState(1);
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formColor, setFormColor] = useState('#6366f1');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setEntries(JSON.parse(raw) as TimetableEntry[]);
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  function saveEntries(updated: TimetableEntry[]) {
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function resetForm() {
    setFormSubject('');
    setFormDay(1);
    setFormStart('09:00');
    setFormEnd('10:00');
    setFormLocation('');
    setFormColor('#6366f1');
  }

  function openAddForm() {
    resetForm();
    setEditMode(false);
    setSelectedEntry(null);
    setShowForm(true);
  }

  function openEditForm(entry: TimetableEntry) {
    setFormSubject(entry.subject);
    setFormDay(entry.day);
    setFormStart(entry.startTime);
    setFormEnd(entry.endTime);
    setFormLocation(entry.location);
    setFormColor(entry.color);
    setEditMode(true);
    setSelectedEntry(entry);
    setShowForm(true);
  }

  function submitForm() {
    if (!formSubject.trim()) return;
    if (editMode && selectedEntry) {
      const updated = entries.map((e) =>
        e.id === selectedEntry.id
          ? {
              ...e,
              subject: formSubject.trim(),
              day: formDay,
              startTime: formStart,
              endTime: formEnd,
              location: formLocation.trim(),
              color: formColor,
            }
          : e
      );
      saveEntries(updated);
    } else {
      const newEntry: TimetableEntry = {
        id: generateId(),
        subject: formSubject.trim(),
        day: formDay,
        startTime: formStart,
        endTime: formEnd,
        location: formLocation.trim(),
        color: formColor,
      };
      saveEntries([...entries, newEntry]);
    }
    setShowForm(false);
    setSelectedEntry(null);
    resetForm();
  }

  function deleteEntry(id: string) {
    saveEntries(entries.filter((e) => e.id !== id));
    setSelectedEntry(null);
  }

  function getEntriesForCell(day: number, hour: string) {
    return entries.filter((e) => e.day === day && e.startTime === hour);
  }

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-violet-400 transition-colors text-sm flex items-center gap-1"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-white">📅 Timetable</h1>
          <button
            onClick={openAddForm}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Add Entry
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-white font-semibold text-lg mb-5">
                {editMode ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i + 1}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">Start</label>
                    <select
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">End</label>
                    <select
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {/* Color picker */}
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Colour</label>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setFormColor(c.value)}
                        title={c.label}
                        style={{ backgroundColor: c.value }}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          formColor === c.value ? 'border-white scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={submitForm}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    {editMode ? 'Save' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedEntry(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entry detail panel */}
        {selectedEntry && !showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ backgroundColor: selectedEntry.color }}
              />
              <h2 className="text-white font-semibold text-lg mb-1">
                {selectedEntry.subject}
              </h2>
              <p className="text-slate-400 text-sm">
                {DAYS[selectedEntry.day - 1]} · {selectedEntry.startTime} – {selectedEntry.endTime}
              </p>
              {selectedEntry.location && (
                <p className="text-slate-400 text-sm mt-1">📍 {selectedEntry.location}</p>
              )}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => openEditForm(selectedEntry)}
                  className="flex-1 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/40 text-violet-300 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEntry(selectedEntry.id)}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timetable grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="w-16 bg-slate-800 p-2 text-xs text-slate-500 font-normal border-b border-r border-slate-700">
                  Time
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d}
                    className="bg-slate-800 p-3 text-xs text-slate-300 font-semibold border-b border-r border-slate-700 last:border-r-0 min-w-28"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-slate-700/50 last:border-b-0">
                  <td className="bg-slate-800/60 p-2 text-xs text-slate-500 border-r border-slate-700 text-right whitespace-nowrap">
                    {hour}
                  </td>
                  {DAYS.map((_, di) => {
                    const dayEntries = getEntriesForCell(di + 1, hour);
                    return (
                      <td
                        key={di}
                        className="border-r border-slate-700/50 last:border-r-0 p-1 align-top h-12"
                      >
                        {dayEntries.map((entry) => (
                          <button
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            style={{
                              backgroundColor: hexToRgba(entry.color, 0.25),
                              borderLeftColor: entry.color,
                            }}
                            className="w-full text-left text-xs rounded px-1.5 py-1 border-l-2 hover:brightness-125 transition-all leading-tight"
                          >
                            <span className="text-white font-medium truncate block">
                              {entry.subject}
                            </span>
                            {entry.endTime && (
                              <span className="text-slate-300 opacity-75">
                                –{entry.endTime}
                              </span>
                            )}
                          </button>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <p className="text-center text-slate-500 mt-8 text-sm">
            No entries yet. Click <strong className="text-slate-300">+ Add Entry</strong> to start
            building your timetable.
          </p>
        )}
      </div>
    </main>
  );
}
