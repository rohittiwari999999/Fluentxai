import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Send, Mic, Volume2, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AiService } from '../services/aiService';

interface Props {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAddXP: (amount: number) => void;
}

interface QnAResult {
  question: string;
  answer: string;
  nativeExplanation: string;
  examples: string[];
  practiceQuestion: string;
}

const COMMON_QUESTIONS = [
  'What is the difference between "Since" and "For"?',
  'When do we use "have had" together in a sentence?',
  'How to politely disagree in an office meeting?',
  'Why do we say "listen to" but not "hear to"?',
];

export const TutorDrawer: React.FC<Props> = ({ profile, isOpen, onClose, onAddXP }) => {
  const [questionText, setQuestionText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<QnAResult[]>([]);

  if (!isOpen) return null;

  const nativeLang = profile.nativeLanguage;

  const handleStartListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setQuestionText('');
    setIsListening(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setQuestionText(transcript);
        if (isFinal) {
          setIsListening(false);
          handleAsk(transcript);
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (!started) setIsListening(false);
  };

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || questionText).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setQuestionText('');

    try {
      const response = await AiService.askTutorQuestion(q, nativeLang, profile.englishLevel);
      const newEntry: QnAResult = {
        question: q,
        answer: response.answer,
        nativeExplanation: response.nativeExplanation,
        examples: response.examples,
        practiceQuestion: response.practiceQuestion,
      };

      setChatHistory((prev) => [newEntry, ...prev]);
      voiceService.playSfx('success');
      onAddXP(10);

      // Speak Ava's answer
      voiceService.speak(response.answer);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700/80 h-full flex flex-col text-white shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              👩‍🏫
            </div>
            <div>
              <div className="font-bold text-sm">Ask Ava English Tutor</div>
              <div className="text-[11px] text-slate-400">
                Answers explained in English & {nativeLang}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick FAQ Prompts */}
          {chatHistory.length === 0 && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300">
                <span className="font-bold text-indigo-300 block mb-1">Hi! I am Ava.</span>
                Ask me any grammar rule, why a sentence sounded awkward, idioms, or how to translate tricky thoughts!
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Popular questions to ask:
              </div>
              <div className="space-y-2">
                {COMMON_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      handleAsk(q);
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat QA Entries */}
          {chatHistory.map((item, index) => (
            <div key={index} className="space-y-2 animate-in fade-in duration-200">
              {/* User question bubble */}
              <div className="flex justify-end">
                <div className="p-3 rounded-2xl rounded-tr-none bg-indigo-600 text-white text-xs font-medium max-w-[85%] shadow-md">
                  {item.question}
                </div>
              </div>

              {/* Ava tutor response card */}
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <span className="flex items-center gap-1">
                    👩‍🏫 Ava Tutor
                  </span>
                  <button
                    onClick={() => {
                      voiceService.playSfx('tap');
                      voiceService.speak(item.answer);
                    }}
                    className="p-1 hover:text-white"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-slate-200 leading-relaxed font-medium">
                  {item.answer}
                </div>

                {/* Native Explanation */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300">
                  <span className="font-bold text-amber-400 block text-[11px] mb-0.5">
                    {nativeLang} Explanation:
                  </span>
                  {item.nativeExplanation}
                </div>

                {/* Examples */}
                {item.examples && item.examples.length > 0 && (
                  <div className="text-slate-300 space-y-1">
                    <span className="font-bold text-slate-400 block text-[11px]">Examples:</span>
                    {item.examples.map((ex, i) => (
                      <div key={i} className="text-indigo-300 italic">
                        • {ex}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center justify-center p-4 text-xs text-indigo-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ava is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleStartListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ask Ava any English doubt..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={!questionText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
