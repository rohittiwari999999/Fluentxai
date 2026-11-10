import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../data/roleplayData';
import {
  ChatMessage,
  ConversationScenario,
  SpeakingAssessmentReport,
  UserProfile,
} from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Languages,
  Sparkles,
  Award,
  ChevronDown,
  Info,
  Pause,
  Play,
  Lightbulb,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface Props {
  profile: UserProfile;
  onOpenAssessment: (report: SpeakingAssessmentReport) => void;
  onAddXP: (amount: number) => void;
}

export const SpeakTab: React.FC<Props> = ({ profile, onOpenAssessment, onAddXP }) => {
  const [currentScenario, setCurrentScenario] = useState<ConversationScenario>('Free Talk');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 1.0 normal, 0.75 slow
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [isPaused, setIsPaused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scenarioMeta = SCENARIOS.find((s) => s.id === currentScenario) || SCENARIOS[0];

  // Initialize or reset conversation when scenario changes
  useEffect(() => {
    const greeting = profile.name && currentScenario === 'Free Talk'
      ? `Hi ${profile.name}! I'm Ava, your English speaking partner. How was your day today, and what would you like to talk about?`
      : scenarioMeta.starterMessage;

    const starterMsg: ChatMessage = {
      id: 'msg_start_' + Date.now(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedResponse: scenarioMeta.suggestedPhrases[0],
      translation: profile.name
        ? `नमस्ते ${profile.name}! मैं आपकी बोलने की साथी हूँ। आज आपका दिन कैसा रहा?`
        : 'नमस्ते! मैं आपकी बोलने की साथी हूँ। आज आपका दिन कैसा रहा?',
    };

    setMessages([starterMsg]);
    setLiveTranscript('');
    setSessionStartTime(Date.now());

    // Auto greet with Ava's voice on scenario selection
    voiceService.speak(starterMsg.content, {
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, [currentScenario]);

  // Scroll chat into view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, isThinking]);

  // Toggle voice recognition
  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    if (isSpeaking) {
      // Interrupt Ava
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }

    setLiveTranscript('');
    setIsListening(true);

    const started = voiceService.startListening(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          handleUserSpokenMessage(transcript);
        }
      },
      (error) => {
        setIsListening(false);
        console.warn('Speech recognition error:', error);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  const handleUserSpokenMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLiveTranscript('');
    setIsThinking(true);

    onAddXP(10);
    storageService.updateSpeakingMinutes(1);

    try {
      const response = await AiService.sendChatMessage({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        scenario: currentScenario,
        userLevel: profile.englishLevel,
        nativeLanguage: profile.nativeLanguage,
        characterName: scenarioMeta.characterName,
      });

      const assistantMsg: ChatMessage = {
        id: 'msg_ava_' + Date.now(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: response.feedback,
        suggestedResponse: response.suggestedResponse,
        translation: response.translationHint,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak Ava's response out loud
      if (!isPaused) {
        voiceService.speak(response.reply, {
          rate: speechRate,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRepeatSentence = (text: string) => {
    voiceService.playSfx('tap');
    voiceService.speak(text, {
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleToggleSlowRate = () => {
    voiceService.playSfx('tap');
    const newRate = speechRate === 1.0 ? 0.75 : 1.0;
    setSpeechRate(newRate);
  };

  const handleTogglePause = () => {
    voiceService.playSfx('tap');
    if (isSpeaking) {
      voiceService.pauseSpeaking();
      setIsPaused(true);
      setIsSpeaking(false);
    } else if (isPaused) {
      voiceService.resumeSpeaking();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const handleEndSessionAndAssess = async () => {
    voiceService.playSfx('tap');
    voiceService.stopSpeaking();
    voiceService.stopListening();

    const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    const assessment = await AiService.generateSpeakingAssessment({
      sessionTranscript: messages,
      durationMinutes,
      scenario: currentScenario,
      userLevel: profile.englishLevel,
    });

    storageService.saveAssessment(assessment);
    storageService.updateSpeakingMinutes(durationMinutes);
    onAddXP(50);
    onOpenAssessment(assessment);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-3 sm:px-4 pb-20">
      
      {/* Top Scenario Switcher Bar */}
      <div className="relative mb-3">
        <button
          onClick={() => {
            voiceService.playSfx('tap');
            setShowScenarioPicker(!showScenarioPicker);
          }}
          className="w-full p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{scenarioMeta.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{scenarioMeta.title}</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold border border-indigo-500/30">
                  {scenarioMeta.difficulty}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Partner: {scenarioMeta.characterName} ({scenarioMeta.characterRole})
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showScenarioPicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu for 10 Scenarios */}
        {showScenarioPicker && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
              Select Conversation Mode (10 Real-life Scenarios)
            </div>
            <div className="space-y-1">
              {SCENARIOS.map((sc) => {
                const isSelected = sc.id === currentScenario;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      voiceService.playSfx('tap');
                      setCurrentScenario(sc.id);
                      setShowScenarioPicker(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{sc.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{sc.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sc.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ava Live Voice Presence & Waveform Header */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between mb-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                isSpeaking
                  ? 'bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-purple-500/50 scale-105 ring-4 ring-purple-400/30'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {scenarioMeta.avatar}
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-ping" />
            )}
          </div>
          <div>
            <div className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>{scenarioMeta.characterName}</span>
              <span className="text-[10px] text-indigo-400 font-mono">
                {isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : isListening ? 'Listening to you...' : 'Ready'}
              </span>
            </div>

            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1 h-4 mt-1">
              <span className={`w-1 rounded-full bg-indigo-400 ${isSpeaking ? 'wave-animate-1' : 'h-1.5 bg-slate-700'}`} />
              <span className={`w-1 rounded-full bg-purple-400 ${isSpeaking ? 'wave-animate-2' : 'h-2 bg-slate-700'}`} />
              <span className={`w-1 rounded-full bg-pink-400 ${isSpeaking ? 'wave-animate-3' : 'h-1 bg-slate-700'}`} />
              <span className={`w-1 rounded-full bg-indigo-400 ${isSpeaking ? 'wave-animate-4' : 'h-2 bg-slate-700'}`} />
              <span className={`w-1 rounded-full bg-purple-400 ${isSpeaking ? 'wave-animate-5' : 'h-1.5 bg-slate-700'}`} />
            </div>
          </div>
        </div>

        {/* Voice Control Quick Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Slow/Normal Rate Button */}
          <button
            onClick={handleToggleSlowRate}
            title={speechRate === 0.75 ? 'Switch to Normal 1.0x Speed' : 'Switch to Slow 0.75x Speed'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              speechRate === 0.75
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {speechRate === 0.75 ? '0.75x Slow' : '1.0x'}
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={handleTogglePause}
            title={isPaused ? 'Resume Audio' : 'Pause Audio'}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isTranslated = revealedTranslations[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-3xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-md'
                }`}
              >
                {/* Spoken content */}
                <div className="font-medium text-sm sm:text-base">{msg.content}</div>

                {/* Translated Native Meaning Toggle */}
                {msg.translation && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                    {isTranslated ? (
                      <div className="text-xs text-amber-300 font-medium animate-in fade-in">
                        <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-400 mb-0.5">
                          {profile.nativeLanguage} Translation:
                        </span>
                        {msg.translation}
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setRevealedTranslations((prev) => ({ ...prev, [msg.id]: true }))
                        }
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <Languages className="w-3 h-3" />
                        <span>Translate to {profile.nativeLanguage}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Grammar / Natural Expression Feedback */}
                {msg.feedback && (
                  <div className="mt-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                    <span className="font-bold text-purple-300 block text-[10px] uppercase">
                      💡 Natural English Tip:
                    </span>
                    {msg.feedback}
                  </div>
                )}

                {/* Audio repeat & timestamp */}
                <div className="flex items-center justify-between gap-3 mt-2 pt-1 text-[10px] text-slate-400 border-t border-white/5">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleRepeatSentence(msg.content)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Repeat</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Suggested Follow-up Response Chips */}
              {msg.suggestedResponse && !isUser && (
                <div className="mt-1.5 max-w-[85%] flex items-center gap-1.5 text-xs text-slate-400">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Say:</span>
                  <button
                    onClick={() => {
                      voiceService.playSfx('tap');
                      handleUserSpokenMessage(msg.suggestedResponse!);
                    }}
                    className="text-[11px] text-indigo-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 px-2.5 py-1 rounded-xl transition-all truncate text-left"
                  >
                    "{msg.suggestedResponse}"
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Recognized User Speech in Progress */}
        {liveTranscript && (
          <div className="flex justify-end animate-in fade-in">
            <div className="p-3.5 rounded-3xl rounded-br-none bg-indigo-900/60 border border-indigo-500/40 text-xs text-indigo-200 max-w-[85%] italic">
              <span className="block text-[10px] font-bold uppercase text-indigo-400 not-italic mb-1">
                Listening...
              </span>
              "{liveTranscript}"
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
            <span className="font-semibold text-xs ml-1">Ava is crafting natural reply...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Speaking Bar */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {/* End & Get Assessment Button */}
        <button
          onClick={handleEndSessionAndAssess}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">End &</span>
          <span>Assess</span>
        </button>

        {/* Central Master Microphone */}
        <button
          onClick={handleToggleListening}
          className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-xl ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40 shadow-rose-500/40'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:scale-[1.02] shadow-indigo-600/30'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Tap to Stop & Send</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 animate-pulse" />
              <span>Tap to Speak English</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
