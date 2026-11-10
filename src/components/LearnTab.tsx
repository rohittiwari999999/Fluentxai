import React, { useState } from 'react';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { CourseUnit, EnglishLevel, Lesson, UserProfile } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  Mic,
  Award,
  ArrowRight,
  ArrowLeft,
  X,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface Props {
  profile: UserProfile;
  onAddXP: (amount: number) => void;
  onLessonComplete: (lessonId: string, xp: number) => void;
}

export const LearnTab: React.FC<Props> = ({ profile, onAddXP, onLessonComplete }) => {
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel>(profile.englishLevel);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Lesson player state
  const [playerStep, setPlayerStep] = useState<number>(1); // 1: Explain, 2: Examples, 3: Speaking Test, 4: Quiz
  const [isListening, setIsListening] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const nativeLang = profile.nativeLanguage;
  const filteredUnits = CURRICULUM_DATA.filter((u) => u.level === selectedLevel) || CURRICULUM_DATA;

  const handleOpenLesson = (lesson: Lesson) => {
    voiceService.playSfx('tap');
    setActiveLesson(lesson);
    setPlayerStep(1);
    setUserSpokenText('');
    setSpeakingScore(null);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);

    // Speak introductory rule
    const explanation = lesson.nativeExplanation[nativeLang] || lesson.nativeExplanation.Hindi;
    // Speak lesson title
    voiceService.speak(lesson.title);
  };

  const handlePlayAudio = (text: string, rate: number = 1.0) => {
    voiceService.playSfx('tap');
    voiceService.speak(text, { rate });
  };

  const handleStartSpeakingExercise = () => {
    if (!activeLesson) return;
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setUserSpokenText('');
    setSpeakingScore(null);
    setIsListening(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setUserSpokenText(transcript);
        if (isFinal) {
          setIsListening(false);
          const target = activeLesson.speakingExercise.targetSentence.toLowerCase().replace(/[^a-z0-9\s]/g, '');
          const spoken = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, '');

          const targetWords = target.split(' ');
          const spokenWords = spoken.split(' ');
          let matches = 0;
          targetWords.forEach((w) => {
            if (spokenWords.includes(w)) matches++;
          });

          const score = Math.round((matches / targetWords.length) * 100);
          setSpeakingScore(score);

          if (score >= 70) {
            voiceService.playSfx('success');
            onAddXP(15);
          } else {
            voiceService.playSfx('error');
          }
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (!started) setIsListening(false);
  };

  const handleFinishLesson = () => {
    if (!activeLesson) return;
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    voiceService.playSfx('levelUp');
    onLessonComplete(activeLesson.id, activeLesson.xpReward);
    setActiveLesson(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-24">
      
      {/* Header & Level Selector */}
      <div className="pt-2 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Structured English Curriculum
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step master lessons explained in {nativeLang}
            </p>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['Beginner', 'Elementary', 'Intermediate', 'Advanced'] as EnglishLevel[]).map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setSelectedLevel(lvl);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Units Roadmap */}
      <div className="space-y-4">
        {filteredUnits.map((unit) => (
          <div key={unit.id} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            {/* Unit Title */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                {unit.icon}
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">{unit.title}</h3>
                <p className="text-xs text-slate-400">{unit.description}</p>
              </div>
            </div>

            {/* Lessons List in this Unit */}
            <div className="space-y-2 mt-3">
              {unit.lessons.map((lesson, idx) => {
                const isCompleted = profile.completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-indigo-500/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{lesson.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{lesson.durationMinutes} mins</span>
                          <span>•</span>
                          <span className="text-purple-400 font-bold">+{lesson.xpReward} XP</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenLesson(lesson)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isCompleted ? 'Review' : 'Start'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Lesson Player Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Step {playerStep} of 4 • {activeLesson.level}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-white">{activeLesson.title}</h3>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Theory & Grammar in Native Language */}
            {playerStep === 1 && (
              <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
                    Explanation in {nativeLang}
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed font-medium">
                    {activeLesson.nativeExplanation[nativeLang] || activeLesson.nativeExplanation.Hindi}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                    Core Grammar Rule
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    {activeLesson.grammarRule}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: English Examples with Audio */}
            {playerStep === 2 && (
              <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Listen to Real-life Examples
                </div>

                {activeLesson.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm sm:text-base font-bold text-white mb-1">
                        "{ex.english}"
                      </div>
                      {ex.phonetic && (
                        <div className="text-xs text-purple-300 font-mono mb-1">
                          Pronunciation: {ex.phonetic}
                        </div>
                      )}
                      <div className="text-xs text-slate-400">
                        {ex.nativeTranslation[nativeLang] || ex.nativeTranslation.Hindi}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePlayAudio(ex.english, 1.0)}
                        className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePlayAudio(ex.english, 0.75)}
                        className="px-2 py-1.5 rounded-xl bg-slate-700 text-xs text-slate-300"
                      >
                        0.75x
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: Speaking Exercise (Repeat after AI) */}
            {playerStep === 3 && (
              <div className="mt-4 space-y-4 text-center animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Speaking Challenge: Repeat After Ava
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white">
                    "{activeLesson.speakingExercise.targetSentence}"
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {activeLesson.speakingExercise.nativeTranslation[nativeLang] || activeLesson.speakingExercise.nativeTranslation.Hindi}
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => handlePlayAudio(activeLesson.speakingExercise.targetSentence)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4" /> Listen Ava
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={handleStartSpeakingExercise}
                    className={`w-18 h-18 mx-auto rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40'
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-xl shadow-indigo-600/30'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div className="text-xs text-slate-400 mt-2">
                    {isListening ? 'Listening... Speak the sentence now' : 'Tap mic to speak'}
                  </div>

                  {userSpokenText && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-800 text-xs text-left">
                      <span className="text-slate-400 block mb-0.5">You said:</span>
                      <span className="font-semibold text-white">"{userSpokenText}"</span>
                      {speakingScore !== null && (
                        <div className="mt-2 text-xs font-bold">
                          Accuracy: <span className={speakingScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{speakingScore}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Quiz & Assessment */}
            {playerStep === 4 && (
              <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                {activeLesson.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-800 border border-slate-700">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                      Quick Check
                    </div>
                    <div className="text-sm font-bold text-white mb-3">
                      {q.question}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = quizSelectedOption === optIdx;
                        const isCorrect = q.correctIndex === optIdx;

                        let style = 'bg-slate-700/60 border-slate-600 text-slate-200';
                        if (quizSubmitted) {
                          if (isCorrect) style = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
                          else if (isChosen) style = 'bg-rose-600/30 border-rose-500 text-rose-300';
                        } else if (isChosen) {
                          style = 'bg-indigo-600/30 border-indigo-400 text-white font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => {
                              voiceService.playSfx('tap');
                              setQuizSelectedOption(optIdx);
                            }}
                            className={`w-full p-3 rounded-xl text-xs text-left border transition-all ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        onClick={() => {
                          if (quizSelectedOption === null) return;
                          setQuizSubmitted(true);
                          if (quizSelectedOption === q.correctIndex) {
                            voiceService.playSfx('success');
                            onAddXP(20);
                          } else {
                            voiceService.playSfx('error');
                          }
                        }}
                        disabled={quizSelectedOption === null}
                        className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900 text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
              {playerStep > 1 ? (
                <button
                  onClick={() => setPlayerStep(playerStep - 1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>
              ) : (
                <div />
              )}

              {playerStep < 4 ? (
                <button
                  onClick={() => setPlayerStep(playerStep + 1)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinishLesson}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Lesson (+{activeLesson.xpReward} XP)</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
