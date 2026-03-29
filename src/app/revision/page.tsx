'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FlashCard {
  id: string;
  question: string;
  answer: string;
  status: 'new' | 'known' | 'review';
}

interface FlashcardSet {
  id: string;
  name: string;
  subject: string;
  cards: FlashCard[];
}

const STORAGE_KEY = 'tlsg-revision-sets';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function RevisionPage() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New set form
  const [newSetName, setNewSetName] = useState('');
  const [newSetSubject, setNewSetSubject] = useState('');
  const [showNewSetForm, setShowNewSetForm] = useState(false);

  // New card form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSets(JSON.parse(raw) as FlashcardSet[]);
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  function saveSets(updated: FlashcardSet[]) {
    setSets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function createSet() {
    if (!newSetName.trim()) return;
    const newSet: FlashcardSet = {
      id: generateId(),
      name: newSetName.trim(),
      subject: newSetSubject.trim(),
      cards: [],
    };
    saveSets([...sets, newSet]);
    setNewSetName('');
    setNewSetSubject('');
    setShowNewSetForm(false);
  }

  function deleteSet(id: string) {
    saveSets(sets.filter((s) => s.id !== id));
    if (currentSet?.id === id) setCurrentSet(null);
  }

  function openSet(set: FlashcardSet) {
    setCurrentSet(set);
    setCardIndex(0);
    setIsFlipped(false);
  }

  function addCard() {
    if (!currentSet || !newQuestion.trim() || !newAnswer.trim()) return;
    const card: FlashCard = {
      id: generateId(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      status: 'new',
    };
    const updated = sets.map((s) =>
      s.id === currentSet.id ? { ...s, cards: [...s.cards, card] } : s
    );
    saveSets(updated);
    setCurrentSet({ ...currentSet, cards: [...currentSet.cards, card] });
    setNewQuestion('');
    setNewAnswer('');
    setShowCardForm(false);
  }

  function markCard(status: 'known' | 'review') {
    if (!currentSet) return;
    const updatedCards = currentSet.cards.map((c, i) =>
      i === cardIndex ? { ...c, status } : c
    );
    const updatedSet = { ...currentSet, cards: updatedCards };
    const updated = sets.map((s) => (s.id === currentSet.id ? updatedSet : s));
    saveSets(updated);
    setCurrentSet(updatedSet);
    // Advance to next card
    if (cardIndex < currentSet.cards.length - 1) {
      setCardIndex(cardIndex + 1);
      setIsFlipped(false);
    }
  }

  function prevCard() {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setIsFlipped(false);
    }
  }

  function nextCard() {
    if (currentSet && cardIndex < currentSet.cards.length - 1) {
      setCardIndex(cardIndex + 1);
      setIsFlipped(false);
    }
  }

  const card = currentSet?.cards[cardIndex] ?? null;
  const knownCount = currentSet?.cards.filter((c) => c.status === 'known').length ?? 0;
  const reviewCount = currentSet?.cards.filter((c) => c.status === 'review').length ?? 0;

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/"
          className="text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-white">🃏 Revision</h1>
        <div className="w-16" />
      </div>

      {/* Set list view */}
      {!currentSet && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Your Flashcard Sets</h2>
            <button
              onClick={() => setShowNewSetForm(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              + New Set
            </button>
          </div>

          {showNewSetForm && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
              <h3 className="text-slate-200 font-medium mb-4">Create New Set</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Set name"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Subject (optional)"
                  value={newSetSubject}
                  onChange={(e) => setNewSetSubject(e.target.value)}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={createSet}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewSetForm(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {sets.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">🃏</p>
              <p className="text-lg">No flashcard sets yet.</p>
              <p className="text-sm">Create your first set to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sets.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      {s.subject && (
                        <p className="text-xs text-indigo-400 mt-0.5">{s.subject}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSet(s.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {s.cards.length} card{s.cards.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => openSet(s)}
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    Open →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Set study view */}
      {currentSet && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentSet(null)}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← All Sets
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">{currentSet.name}</h2>
              {currentSet.subject && (
                <p className="text-xs text-indigo-400">{currentSet.subject}</p>
              )}
            </div>
            <button
              onClick={() => setShowCardForm(!showCardForm)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              + Card
            </button>
          </div>

          {/* Add card form */}
          {showCardForm && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
              <h3 className="text-slate-200 font-medium mb-4">Add New Card</h3>
              <div className="flex flex-col gap-3">
                <textarea
                  placeholder="Question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={2}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <textarea
                  placeholder="Answer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={2}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCard}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowCardForm(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentSet.cards.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-lg">No cards in this set yet.</p>
              <p className="text-sm">Add your first card to start studying!</p>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-slate-400 w-20 text-right">
                  {cardIndex + 1} / {currentSet.cards.length}
                </span>
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((cardIndex + 1) / currentSet.cards.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400">✓ {knownCount}</span>
                  <span className="text-amber-400">↩ {reviewCount}</span>
                </div>
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer select-none min-h-52 bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 mb-6"
              >
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
                  {isFlipped ? 'Answer' : 'Question'}
                </p>
                <p className="text-xl text-white leading-relaxed">
                  {isFlipped ? card?.answer : card?.question}
                </p>
                {card && card.status !== 'new' && (
                  <span
                    className={`mt-4 text-xs px-2 py-0.5 rounded-full ${
                      card.status === 'known'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {card.status === 'known' ? '✓ Known' : '↩ Review'}
                  </span>
                )}
                <p className="text-xs text-slate-600 mt-4">Click to flip</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={prevCard}
                  disabled={cardIndex === 0}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white px-5 py-2 rounded-lg text-sm transition-colors"
                >
                  ← Prev
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => markCard('review')}
                    className="bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    ↩ Review
                  </button>
                  <button
                    onClick={() => markCard('known')}
                    className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    ✓ Known
                  </button>
                </div>
                <button
                  onClick={nextCard}
                  disabled={cardIndex === currentSet.cards.length - 1}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white px-5 py-2 rounded-lg text-sm transition-colors"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
