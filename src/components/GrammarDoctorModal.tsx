import React, { useState } from 'react';
import { GrammarAnalysis, UserProfile } from '../types';
import { X, Mic, Send, Volume2, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AiService } from '../services/aiService';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onAddXP: (amount: number) => void;
}

const COMMON_MISTAKES = [
  'I am agree with you.',
  'She don’t like tea.',
  'He is going to school yesterday.',
  'I discussed about the problem with my manager.',
  'Myself Rajesh from Delhi.',
];

export const GrammarDoctorModal: React.FC<Props> = ({ profile, onClose, onAddXP }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);

  const nativeLang = profile.nativeLanguage;

  const handleStartListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setInputText('');
    setIsListening(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          runGrammarCheck(transcript);
        }
      },
      (error) => {
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  const runGrammarCheck = async (sentenceToCheck?: string) => {
    const text = (sentenceToCheck || inputText).trim();
    if (!text || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await AiService.analyzeGrammar(text, nativeLang);
      setAnalysis(res);
      voiceService.playSfx('success');
      onAddXP(15);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayAudio = (text: string) => {
    voiceService.playSfx('tap');
    voiceService.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">AI Grammar Doctor</h2>
              <p className="text-xs text-slate-400">
                Fix mistakes, understand tenses, and learn why in {nativeLang}
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

        {/* Input Box with Mic and Type */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak any English sentence to inspect (e.g. 'I am agree with your proposal')..."
            rows={3}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 mt-2">
            <button
              onClick={handleStartListening}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'Listening...' : 'Speak Sentence'}</span>
            </button>

            <button
              onClick={() => runGrammarCheck()}
              disabled={!inputText.trim() || isAnalyzing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze Sentence</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Pitfalls Chips */}
        <div className="mt-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Or try common tricky sentences:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_MISTAKES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setInputText(s);
                  runGrammarCheck(s);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Results Display */}
        {analysis && (
          <div className="mt-5 space-y-3 animate-in fade-in duration-300">
            {/* Status & Corrected Comparison */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                {analysis.hasError ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {analysis.errorType || 'Grammar Refinement'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Grammatically Accurate!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-rose-400">Original: </span>
                  <span className="line-through">{analysis.original}</span>
                </div>
                <div className="flex items-center justify-between text-base sm:text-lg font-bold text-white bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 block mb-0.5">Correct Natural Form:</span>
                    <span className="text-emerald-300">"{analysis.corrected}"</span>
                  </div>
                  <button
                    onClick={() => handlePlayAudio(analysis.corrected)}
                    className="p-2 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 hover:text-white transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Explanation in Native Language */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Explanation in {nativeLang}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {analysis.nativeExplanation}
              </p>
              <p className="text-xs text-slate-400 mt-2 border-t border-slate-700/50 pt-2">
                {analysis.explanation}
              </p>
            </div>

            {/* Additional Natural Examples */}
            {analysis.alternativeExpressions && analysis.alternativeExpressions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Two Additional Examples
                </div>
                <div className="space-y-1.5">
                  {analysis.alternativeExpressions.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                      <span>• "{ex}"</span>
                      <button
                        onClick={() => handlePlayAudio(ex)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
