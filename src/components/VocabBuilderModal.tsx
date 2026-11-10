import React, { useState } from 'react';
import { INITIAL_VOCABULARY } from '../data/vocabularyData';
import { UserProfile, VocabularyWord } from '../types';
import { X, Volume2, Sparkles, RotateCw, Check, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { storageService } from '../services/storageService';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onAddXP: (amount: number) => void;
}

export const VocabBuilderModal: React.FC<Props> = ({ profile, onClose, onAddXP }) => {
  const [vocabList, setVocabList] = useState<VocabularyWord[]>(() => {
    const custom = storageService.getCustomVocab();
    return custom.length > 0 ? custom : INITIAL_VOCABULARY;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'all'>('flashcards');

  const nativeLang = profile.nativeLanguage;
  const currentWord = vocabList[currentIndex] || vocabList[0];

  const handlePlayAudio = (text: string) => {
    voiceService.playSfx('tap');
    voiceService.speak(text);
  };

  const handleFlip = () => {
    voiceService.playSfx('tap');
    setIsFlipped(!isFlipped);
  };

  const handleReviewWord = (mastered: boolean) => {
    voiceService.playSfx(mastered ? 'success' : 'tap');
    setIsFlipped(false);

    const updated = [...vocabList];
    const item = { ...updated[currentIndex] };

    if (mastered) {
      item.box = Math.min(5, (item.box || 1) + 1);
      onAddXP(10);
    } else {
      item.box = 1;
    }
    item.timesPracticed = (item.timesPracticed || 0) + 1;
    updated[currentIndex] = item;

    setVocabList(updated);
    storageService.saveCustomVocab(updated);

    // Advance to next card
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Vocabulary Builder</h2>
              <p className="text-xs text-slate-400">Spaced repetition & native translations ({nativeLang})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Flashcards vs All Words */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flashcards Mode
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Word Bank ({vocabList.length})
            </button>
          </div>

          <div className="text-xs font-semibold text-purple-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Card {currentIndex + 1} / {vocabList.length}</span>
          </div>
        </div>

        {activeTab === 'flashcards' ? (
          <div>
            {/* Flashcard Component */}
            <div
              onClick={handleFlip}
              className="mt-4 cursor-pointer min-h-[300px] rounded-3xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-purple-500/50 relative overflow-hidden"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
                  Level: {currentWord.level}
                </span>
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  Box {currentWord.box || 1} <span className="text-[10px] text-purple-400">(Leitner)</span>
                </span>
              </div>

              {/* Card Center Content */}
              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="text-center my-auto py-6">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                    {currentWord.word}
                  </div>
                  <div className="text-xs text-purple-400 font-mono italic mb-2">
                    {currentWord.partOfSpeech} • {currentWord.phonetic}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(currentWord.word);
                    }}
                    className="p-3 mx-auto rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white transition-all border border-purple-500/30"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-[11px] text-slate-500 mt-6 flex items-center justify-center gap-1 font-medium">
                    <RotateCw className="w-3.5 h-3.5" /> Tap card to reveal meaning & {nativeLang} translation
                  </div>
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="my-auto py-2 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  {/* Meaning in Native Language */}
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-0.5">
                      Meaning in {nativeLang}:
                    </div>
                    <div className="text-base font-bold text-white">
                      {currentWord.meaningInNative[nativeLang] || currentWord.meaningInNative.Hindi}
                    </div>
                  </div>

                  {/* English Definition */}
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-100">Definition: </span>
                    {currentWord.definition}
                  </div>

                  {/* Example Sentence with Audio */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium italic">"{currentWord.exampleSentence}"</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {currentWord.nativeExample[nativeLang] || currentWord.nativeExample.Hindi}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(currentWord.exampleSentence);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Synonyms & Antonyms */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">Synonyms: </span>
                    {currentWord.synonyms.join(', ')}
                  </div>
                </div>
              )}

              {/* Bottom hint */}
              <div className="text-center text-[10px] text-slate-500">
                Tap card anytime to flip
              </div>
            </div>

            {/* Leitner Spaced Repetition Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleReviewWord(false)}
                className="py-3 px-4 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-750 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" />
                <span>Needs Review (Box 1)</span>
              </button>

              <button
                onClick={() => handleReviewWord(true)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Mastered (+10 XP)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Word Bank Table Mode */
          <div className="mt-4 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {vocabList.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.word}</span>
                    <span className="text-[11px] text-purple-400 italic font-mono">{item.partOfSpeech}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-700 text-[10px] text-slate-300">
                      Box {item.box || 1}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {item.meaningInNative[nativeLang] || item.meaningInNative.Hindi}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePlayAudio(item.word)}
                    className="p-2 rounded-xl bg-slate-700/60 text-slate-300 hover:text-white"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentIndex(index);
                      setActiveTab('flashcards');
                      setIsFlipped(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 text-xs font-semibold hover:bg-purple-600 hover:text-white transition-all"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
