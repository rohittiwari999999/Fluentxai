import React, { useState } from 'react';
import { PronunciationResult, UserProfile } from '../types';
import { X, Mic, Volume2, Sparkles, Award, RefreshCw, ChevronRight } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AiService } from '../services/aiService';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onAddXP: (amount: number) => void;
}

const PRACTICE_SENTENCES = [
  {
    text: 'She sells sea shells by the sea shore.',
    focus: '/s/ vs /ʃ/ (sh)',
    tip: 'Keep tongue behind teeth for "s", pull tongue back for "sh".',
  },
  {
    text: 'Think through the three thrilling theories thoroughly.',
    focus: 'Voiceless /θ/ (th)',
    tip: 'Place the tip of your tongue gently between your upper and lower front teeth.',
  },
  {
    text: 'Very well, we will visit the village on Wednesday.',
    focus: '/v/ vs /w/',
    tip: 'Top teeth touch lower lip for /v/. Rounded lips with no teeth contact for /w/.',
  },
  {
    text: 'The weather is absolutely magnificent today.',
    focus: 'Syllable Stress: mag-NIF-i-cent',
    tip: 'Elongate the stressed syllable "NIF" and soften the surrounding vowels.',
  },
  {
    text: 'He decided to accept the extraordinary challenge.',
    focus: 'Linking sounds & -ed endings',
    tip: 'Link "decided to" smoothly, pronounce "accept" with crisp /k-s/.',
  },
];

export const PronunciationModal: React.FC<Props> = ({ profile, onClose, onAddXP }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);

  const currentItem = PRACTICE_SENTENCES[currentIndex];

  const handlePlayAudio = (rate: number = 1.0) => {
    voiceService.playSfx('tap');
    voiceService.speak(currentItem.text, { rate });
  };

  const handleStartRecording = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setRecognizedText('');
    setResult(null);
    setIsListening(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setRecognizedText(transcript);
        if (isFinal) {
          setIsListening(false);
          runAnalysis(transcript);
        }
      },
      (error) => {
        setIsListening(false);
        console.warn('Speech error:', error);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  const runAnalysis = async (userSpeech: string) => {
    setIsAnalyzing(true);
    try {
      const evalResult = await AiService.assessPronunciation({
        targetText: currentItem.text,
        userSpokenText: userSpeech,
        userLevel: profile.englishLevel,
      });

      setResult(evalResult);
      if (evalResult.score >= 80) {
        voiceService.playSfx('success');
        onAddXP(20);
      } else {
        voiceService.playSfx('tap');
        onAddXP(5);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    voiceService.playSfx('tap');
    setRecognizedText('');
    setResult(null);
    setCurrentIndex((prev) => (prev + 1) % PRACTICE_SENTENCES.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Pronunciation Coach</h2>
              <p className="text-xs text-slate-400">Word-level analysis & acoustic placement guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Practice sentence navigation */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>EXERCISE {currentIndex + 1} OF {PRACTICE_SENTENCES.length}</span>
          <span className="text-cyan-400 font-bold uppercase tracking-wider">{currentItem.focus}</span>
        </div>

        {/* Target Sentence Card */}
        <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/80 text-center">
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            "{currentItem.text}"
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => handlePlayAudio(1.0)}
              className="px-4 py-2 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/50 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen</span>
            </button>
            <button
              onClick={() => handlePlayAudio(0.75)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all text-xs font-semibold"
            >
              0.75x Slow
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-left">
            <span className="text-cyan-400 font-bold">Mouth Tip: </span>
            {currentItem.tip}
          </div>
        </div>

        {/* Microphone action */}
        <div className="mt-6 text-center">
          <button
            onClick={handleStartRecording}
            disabled={isAnalyzing}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30 scale-110'
                : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:scale-105 shadow-cyan-500/40'
            }`}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <div className="text-xs text-slate-400 mt-3 font-medium">
            {isListening
              ? 'Listening... Repeat after Ava clearly'
              : isAnalyzing
              ? 'Analyzing speech acoustics...'
              : 'Tap to record your pronunciation'}
          </div>

          {recognizedText && (
            <div className="mt-2 text-xs text-slate-300 font-medium italic">
              "{recognizedText}"
            </div>
          )}
        </div>

        {/* Analysis Result Card */}
        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    result.score >= 80
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {result.score}%
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {result.score >= 80 ? 'Excellent Clarity!' : 'Good Effort! Keep Polishing'}
                  </div>
                  <div className="text-[11px] text-slate-400">Word-level feedback below</div>
                </div>
              </div>
              {result.score >= 80 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> +20 XP
                </span>
              )}
            </div>

            {/* Word-by-word visual highlight */}
            <div className="mb-3">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">Word Accuracy:</div>
              <div className="flex flex-wrap gap-1.5">
                {result.wordDiff.map((wd, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      wd.status === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : wd.status === 'needs_practice'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {wd.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Placement tip & encouragement */}
            <div className="text-xs text-slate-300 space-y-1">
              <div>
                <span className="text-cyan-400 font-bold">Tongue & Mouth Guide: </span>
                {result.mouthPlacementTip}
              </div>
              <div className="text-slate-400 italic mt-1">"{result.encouragement}"</div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setRecognizedText('');
              setResult(null);
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
          >
            <span>Next Sentence</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
