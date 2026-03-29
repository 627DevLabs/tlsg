'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GuideSection {
  id: string;
  heading: string;
  content: string;
}

interface StudyGuide {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  sections: GuideSection[];
}

type View = 'list' | 'create' | 'view';

const STORAGE_KEY = 'tlsg-study-guides';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function StudyGuidePage() {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [view, setView] = useState<View>('list');
  const [activeGuide, setActiveGuide] = useState<StudyGuide | null>(null);

  // Create form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [sections, setSections] = useState<GuideSection[]>([
    { id: generateId(), heading: '', content: '' },
  ]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setGuides(JSON.parse(raw) as StudyGuide[]);
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  function saveGuides(updated: StudyGuide[]) {
    setGuides(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function openCreateView() {
    setFormTitle('');
    setFormSubject('');
    setSections([{ id: generateId(), heading: '', content: '' }]);
    setView('create');
  }

  function addSection() {
    setSections((prev) => [...prev, { id: generateId(), heading: '', content: '' }]);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSection(id: string, field: 'heading' | 'content', value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function saveGuide() {
    if (!formTitle.trim()) return;
    const guide: StudyGuide = {
      id: generateId(),
      title: formTitle.trim(),
      subject: formSubject.trim(),
      createdAt: new Date().toISOString(),
      sections: sections.filter((s) => s.heading.trim() || s.content.trim()),
    };
    saveGuides([guide, ...guides]);
    setView('list');
  }

  function openGuide(guide: StudyGuide) {
    setActiveGuide(guide);
    setView('view');
  }

  function deleteGuide(id: string) {
    saveGuides(guides.filter((g) => g.id !== id));
    if (activeGuide?.id === id) {
      setActiveGuide(null);
      setView('list');
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/"
          className="text-slate-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-white">📖 Study Guide</h1>
        <div className="w-16" />
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Your Study Guides</h2>
            <button
              onClick={openCreateView}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              + New Guide
            </button>
          </div>

          {guides.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">📖</p>
              <p className="text-lg">No study guides yet.</p>
              <p className="text-sm">Create your first guide to get organised!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {guides.map((g) => (
                <div
                  key={g.id}
                  className="bg-slate-800 border border-slate-700 hover:border-emerald-500/40 rounded-xl p-5 flex items-center justify-between transition-colors"
                >
                  <button
                    onClick={() => openGuide(g)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-semibold text-white">{g.title}</h3>
                    <div className="flex gap-3 mt-1">
                      {g.subject && (
                        <span className="text-xs text-emerald-400">{g.subject}</span>
                      )}
                      <span className="text-xs text-slate-500">{formatDate(g.createdAt)}</span>
                      <span className="text-xs text-slate-500">
                        {g.sections.length} section{g.sections.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteGuide(g.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors ml-4 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setView('list')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold text-slate-200">New Study Guide</h2>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Guide title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Subject (optional)"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-slate-300 font-medium mb-4 text-sm">Sections</h3>
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Section {idx + 1}</span>
                    {sections.length > 1 && (
                      <button
                        onClick={() => removeSection(section.id)}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Heading"
                    value={section.heading}
                    onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                  />
                  <textarea
                    placeholder="Content..."
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              ))}
              <button
                onClick={addSection}
                className="w-full bg-slate-800 border border-dashed border-slate-600 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 text-sm py-3 rounded-xl transition-colors"
              >
                + Add Section
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveGuide}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Save Guide
              </button>
              <button
                onClick={() => setView('list')}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW/READ VIEW */}
      {view === 'view' && activeGuide && (
        <div>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView('list')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{activeGuide.title}</h2>
              <div className="flex gap-3 mt-1">
                {activeGuide.subject && (
                  <span className="text-sm text-emerald-400">{activeGuide.subject}</span>
                )}
                <span className="text-sm text-slate-500">{formatDate(activeGuide.createdAt)}</span>
              </div>
            </div>
            <button
              onClick={() => deleteGuide(activeGuide.id)}
              className="text-slate-500 hover:text-red-400 transition-colors text-sm"
            >
              Delete
            </button>
          </div>

          {activeGuide.sections.length === 0 ? (
            <p className="text-slate-500 text-sm">This guide has no sections.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {activeGuide.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6"
                >
                  {section.heading && (
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {section.heading}
                    </h3>
                  )}
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
