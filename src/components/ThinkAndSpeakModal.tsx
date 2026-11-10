import React, { useState } from 'react';
import { TRANSLATION_ITEMS } from '../data/translationsData';
import { NativeLanguage, TranslateSpeakItem, UserProfile } from '../types';
import { X, Mic, Volume2, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onAddXP: (amount: number) => void;
}

export const ThinkAndSpeakModal: React.FC<Props> = ({ profile, onClose, onAddXP }) => {
  const [selectedItem, setSelectedItem] = useState<TranslateSpeakItem>(TRANSLATION_ITEMS[0]);
  const [customInput, setCustomInput] = useState('');
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenResult, setSpokenResult] = useState('');
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);

  const nativeLang = profile.nativeLanguage;

  const handlePlayAudio = (text: string, rate: number = 1.0) => {
    voiceService.playSfx('tap');
    voiceService.speak(text, { rate });
  };

  const handleStartSpeaking = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setSpokenResult('');
    setFeedbackScore(null);
    setIsListening(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setSpokenResult(transcript);
        if (isFinal) {
          setIsListening(false);
          // Compare transcript with target
          evaluateSpeech(transcript, selectedItem.englishTranslation);
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

  const evaluateSpeech = (spoken: string, target: string) => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    const targetWords = cleanTarget.split(' ');
    const spokenWords = cleanSpoken.split(' ');
    let matches = 0;

    targetWords.forEach((word) => {
      if (spokenWords.includes(word)) matches++;
    });

    const score = Math.round((matches / targetWords.length) * 100);
    setFeedbackScore(score);

    if (score >= 70) {
      voiceService.playSfx('success');
      onAddXP(15);
    } else {
      voiceService.playSfx('error');
    }
  };

  const handleCustomTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isLoadingCustom) return;

    setIsLoadingCustom(true);
    setSpokenResult('');
    setFeedbackScore(null);

    try {
      const data = await AiService.translateAndExplain(customInput.trim(), nativeLang);
      const newItem: TranslateSpeakItem = {
        id: 'custom_' + Date.now(),
        category: 'Your Custom Thought',
        nativeText: {
          [nativeLang]: customInput.trim(),
        } as Record<NativeLanguage, string>,
        englishTranslation: data.englishTranslation,
        structureBreakdown: data.structureBreakdown,
        grammarRule: data.grammarRule,
        nativeExplanation: {
          [nativeLang]: data.nativeExplanation,
        } as Record<NativeLanguage, string>,
        phoneticGuide: data.phoneticGuide,
        alternativeExpressions: data.alternativeExpressions,
        speakingTips: data.speakingTips,
      };

      setSelectedItem(newItem);
      setCustomInput('');
      voiceService.playSfx('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Think in {nativeLang}, Speak in English
              </h2>
              <p className="text-xs text-slate-400">
                Bridge the gap between your thoughts and spoken English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Carousel / Pre-made Items */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TRANSLATION_ITEMS.map((item) => {
            const isSelected = selectedItem.id === item.id;
            const nativeSentence = item.nativeText[nativeLang] || item.nativeText.Hindi;
            return (
              <button
                key={item.id}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setSelectedItem(item);
                  setSpokenResult('');
                  setFeedbackScore(null);
                }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {nativeSentence.substring(0, 24)}...
              </button>
            );
          })}
        </div>

        {/* Current Native Thought Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-between">
            <span>Your Thought ({nativeLang})</span>
            <span className="text-slate-400 lowercase font-normal">{selectedItem.category}</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-slate-100">
            {selectedItem.nativeText[nativeLang] || selectedItem.nativeText.Hindi}
          </div>

          {/* Arrow Divider */}
          <div className="flex items-center gap-2 my-3 text-slate-500">
            <div className="h-px flex-1 bg-slate-700/60" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              Natural English <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <div className="h-px flex-1 bg-slate-700/60" />
          </div>

          {/* English Translation */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xl sm:text-2xl font-black text-indigo-300 tracking-tight">
                "{selectedItem.englishTranslation}"
              </div>
              {selectedItem.phoneticGuide && (
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Phonetic: <span className="text-purple-300">{selectedItem.phoneticGuide}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handlePlayAudio(selectedItem.englishTranslation, 1.0)}
                title="Normal Speed"
                className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 hover:text-white transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePlayAudio(selectedItem.englishTranslation, 0.75)}
                title="Slow Speed (0.75x)"
                className="px-2 py-1.5 rounded-xl bg-slate-700/60 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                0.75x
              </button>
            </div>
          </div>
        </div>

        {/* Structural Breakdown & Grammar Rule in Native Language */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              Sentence Structure
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {selectedItem.structureBreakdown}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Grammar Rule ({nativeLang})
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedItem.nativeExplanation[nativeLang] || selectedItem.nativeExplanation.Hindi || selectedItem.grammarRule}
            </p>
          </div>
        </div>

        {/* Alternative Natural Expressions */}
        {selectedItem.alternativeExpressions && selectedItem.alternativeExpressions.length > 0 && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/30 border border-slate-700/40">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Alternative Natural Phrasings
            </div>
            <div className="space-y-1.5">
              {selectedItem.alternativeExpressions.map((alt, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span> "{alt}"
                  </span>
                  <button
                    onClick={() => handlePlayAudio(alt)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Speech Practice Section */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
            Now Practice Speaking Out Loud
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Press the microphone, say the English sentence, and receive instant accuracy feedback!
          </p>

          <button
            onClick={handleStartSpeaking}
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40 scale-110'
                : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-500/40'
            }`}
          >
            <Mic className="w-7 h-7" />
          </button>

          <div className="text-xs text-slate-400 mt-2 font-medium">
            {isListening ? (
              <span className="text-rose-400 font-bold animate-pulse">Listening... speak clearly into mic</span>
            ) : (
              'Tap microphone to speak'
            )}
          </div>

          {/* User Spoken Transcript & Feedback */}
          {spokenResult && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-left">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-0.5">You Said:</div>
              <div className="text-sm font-semibold text-white">"{spokenResult}"</div>

              {feedbackScore !== null && (
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {feedbackScore >= 70 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs font-bold text-slate-200">
                      Accuracy Score: <span className={feedbackScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{feedbackScore}%</span>
                    </span>
                  </div>
                  {feedbackScore >= 70 && (
                    <span className="text-xs font-bold text-indigo-400">+15 XP Earned!</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Thought Input Box */}
        <form onSubmit={handleCustomTranslate} className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={`Type any thought in ${nativeLang} (e.g. "मुझे एक कप कॉफ़ी चाहिए")...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!customInput.trim() || isLoadingCustom}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            {isLoadingCustom ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Explain</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
