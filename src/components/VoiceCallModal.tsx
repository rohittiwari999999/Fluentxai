import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { voiceService } from '../services/voiceService';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  HelpCircle,
  Globe,
  Sparkles,
  Award,
  RotateCcw,
  Languages,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  profile: UserProfile;
  scenarioTitle?: string;
  onClose: () => void;
  onAddXP: (xp: number) => void;
}

interface CallExchange {
  role: 'ava' | 'user';
  text: string;
  hindiTranslation?: string;
}

export const VoiceCallModal: React.FC<Props> = ({
  profile,
  scenarioTitle = 'Daily Life Chit-Chat',
  onClose,
  onAddXP,
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [isAvaSpeaking, setIsAvaSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [history, setHistory] = useState<CallExchange[]>([]);
  const [showHindiTip, setShowHindiTip] = useState(false);
  const [currentHindiExplanation, setCurrentHindiExplanation] = useState('');
  const [suggestedPhrases, setSuggestedPhrases] = useState<string[]>([
    "I'm doing great, thank you! How are you?",
    "Today was quite busy at work.",
    "Could you say that again a bit slower?",
  ]);

  const timerRef = useRef<any>(null);
  const avaGreeting = profile.name && profile.name !== 'Learner'
    ? `Hello ${profile.name}! So wonderful to connect on call. How is your day going?`
    : `Hello! So nice to connect on call. How is your day going?`;

  const avaGreetingHindi = `नमस्ते! आपसे कॉल पर बात करके बहुत अच्छा लगा। आपका दिन कैसा बीत रहा है?`;

  // Start call simulation & audio
  useEffect(() => {
    voiceService.playSfx('tap');

    // Ringing for 1.8 seconds then connect
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      voiceService.playSfx('success');

      // Ava speaks opening greeting
      const opening: CallExchange = {
        role: 'ava',
        text: avaGreeting,
        hindiTranslation: avaGreetingHindi,
      };
      setHistory([opening]);
      setCurrentHindiExplanation(avaGreetingHindi);

      setIsAvaSpeaking(true);
      voiceService.speak(
        opening.text,
        () => {
          setIsAvaSpeaking(false);
          startListeningForUser();
        },
        isSlowMode ? 0.75 : 0.95
      );
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startListeningForUser = () => {
    if (isMuted || callStatus !== 'connected') return;
    setIsUserSpeaking(true);
    setLiveTranscript('');

    voiceService.startListening(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim().length > 0) {
          setIsUserSpeaking(false);
          handleUserFinishedSpeaking(transcript);
        }
      },
      () => {
        setIsUserSpeaking(false);
      },
      () => {
        setIsUserSpeaking(false);
      }
    );
  };

  const handleUserFinishedSpeaking = async (userText: string) => {
    voiceService.stopListening();
    setIsUserSpeaking(false);

    const userExchange: CallExchange = {
      role: 'user',
      text: userText,
    };
    setHistory((prev) => [...prev, userExchange]);

    // Query backend for Ava's voice reply
    setIsAvaSpeaking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...history.map((h) => ({
              role: h.role === 'ava' ? 'assistant' : 'user',
              content: h.text,
            })),
            { role: 'user', content: userText },
          ],
          scenario: scenarioTitle,
          learnerLevel: profile.englishLevel || 'Beginner',
          nativeLanguage: profile.nativeLanguage || 'Hindi',
        }),
      });

      const data = await response.json();
      const avaReply = data.reply || "That sounds great! Tell me more about what you did today.";
      const avaHindi = data.translation || "यह बहुत अच्छा लगा! मुझे और बताइए कि आज आपने क्या किया।";

      const newExchange: CallExchange = {
        role: 'ava',
        text: avaReply,
        hindiTranslation: avaHindi,
      };

      setHistory((prev) => [...prev, newExchange]);
      setCurrentHindiExplanation(avaHindi);

      if (data.suggestedPhrases && data.suggestedPhrases.length > 0) {
        setSuggestedPhrases(data.suggestedPhrases);
      } else {
        setSuggestedPhrases([
          "That sounds really interesting!",
          "Yes, exactly what I was thinking.",
          "Could you give me an example?",
        ]);
      }

      if (isSpeakerOn) {
        voiceService.speak(
          avaReply,
          () => {
            setIsAvaSpeaking(false);
            // Automatically prompt the user to respond
            setTimeout(() => {
              if (callStatus === 'connected' && !isMuted) {
                startListeningForUser();
              }
            }, 600);
          },
          isSlowMode ? 0.75 : 0.95
        );
      } else {
        setIsAvaSpeaking(false);
      }
    } catch (err) {
      const fallbackReply = "That's lovely! Keep practicing speaking in English, you are doing fantastic.";
      setHistory((prev) => [
        ...prev,
        {
          role: 'ava',
          text: fallbackReply,
          hindiTranslation: "बहुत बढ़िया! अंग्रेजी में बोलने का अभ्यास करते रहिए, आप बहुत अच्छा कर रहे हैं।",
        },
      ]);
      setIsAvaSpeaking(false);
      setTimeout(() => {
        if (callStatus === 'connected' && !isMuted) {
          startListeningForUser();
        }
      }, 800);
    }
  };

  const handleSelectSuggestedPhrase = (phrase: string) => {
    voiceService.playSfx('tap');
    handleUserFinishedSpeaking(phrase);
  };

  const handleToggleMute = () => {
    voiceService.playSfx('tap');
    if (isMuted) {
      setIsMuted(false);
      startListeningForUser();
    } else {
      setIsMuted(true);
      voiceService.stopListening();
      setIsUserSpeaking(false);
    }
  };

  const handleToggleSlowMode = () => {
    voiceService.playSfx('tap');
    setIsSlowMode(!isSlowMode);
    const lastAva = [...history].reverse().find((h) => h.role === 'ava');
    if (lastAva) {
      voiceService.speak(lastAva.text, undefined, !isSlowMode ? 0.7 : 0.95);
    }
  };

  const handleRepeatAva = () => {
    voiceService.playSfx('tap');
    const lastAva = [...history].reverse().find((h) => h.role === 'ava');
    if (lastAva) {
      setIsAvaSpeaking(true);
      voiceService.speak(
        lastAva.text,
        () => setIsAvaSpeaking(false),
        isSlowMode ? 0.75 : 0.95
      );
    }
  };

  const handleEndCall = () => {
    voiceService.playSfx('error');
    voiceService.stopListening();
    voiceService.stopSpeaking();
    setCallStatus('ended');

    const minutesLearned = Math.max(1, Math.round(callDurationSeconds / 60));
    const xpEarned = Math.max(25, minutesLearned * 15);
    onAddXP(xpEarned);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const lastExchange = history[history.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090E] text-white overflow-hidden">
      <div className="relative w-full max-w-md h-full flex flex-col justify-between px-6 pt-8 pb-8 bg-gradient-to-b from-[#11131F] via-[#0B0D14] to-[#07090E]">
        
        {/* Call Summary Modal when Call Ends */}
        {callStatus === 'ended' ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-4xl mb-4 shadow-xl shadow-emerald-500/20">
              🎉
            </div>

            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              Call Completed
            </span>

            <h2 className="text-2xl font-black text-white mb-2">
              Shabash, {profile.name || 'Dost'}!
            </h2>
            <p className="text-sm text-slate-300 mb-6 max-w-xs">
              Aapne Ava ke sath{' '}
              <strong className="text-white font-bold">{formatTimer(callDurationSeconds)}</strong>{' '}
              baat ki. Real English bolne ka ye darr ab khatam ho raha hai!
            </p>

            <div className="w-full bg-[#161824] border border-slate-800 rounded-3xl p-5 mb-8 space-y-3.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Call Duration</span>
                <span className="text-sm font-bold text-white">{formatTimer(callDurationSeconds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Exchanges completed</span>
                <span className="text-sm font-bold text-white">{history.length} messages</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Confidence Score</span>
                <span className="text-sm font-bold text-emerald-400">92% (High)</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-slate-300">XP Earned</span>
                <span className="text-sm font-black text-amber-400">
                  +{Math.max(25, Math.round(callDurationSeconds / 60) * 15)} XP ⭐
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-[#FF4B26] hover:bg-[#E03E1C] text-white font-bold text-base shadow-xl shadow-[#FF4B26]/30 transition-all active:scale-[0.98]"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Top Bar: Caller Identity & Timer */}
            <div className="flex flex-col items-center pt-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold backdrop-blur-md mb-3">
                {scenarioTitle}
              </span>

              <h1 className="text-2xl font-black text-white tracking-tight">
                Ava • AI English Tutor
              </h1>

              <div className="flex items-center gap-2 mt-1">
                {callStatus === 'connecting' ? (
                  <span className="text-sm text-amber-400 font-medium animate-pulse">
                    Connecting call...
                  </span>
                ) : (
                  <span className="text-sm text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    {formatTimer(callDurationSeconds)}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Ava Avatar with Voice Waveform Animation */}
            <div className="flex-1 flex flex-col items-center justify-center my-4 relative">
              {/* Outer pulsing ring */}
              <div
                className={`relative flex items-center justify-center transition-all duration-500 ${
                  isAvaSpeaking
                    ? 'scale-105'
                    : 'scale-100'
                }`}
              >
                {/* Audio pulse halos */}
                {isAvaSpeaking && (
                  <>
                    <div className="absolute w-48 h-48 rounded-full bg-indigo-500/20 animate-ping" />
                    <div className="absolute w-40 h-40 rounded-full bg-[#FF4B26]/20 animate-pulse" />
                  </>
                )}

                {/* Avatar circle */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-600 p-1 shadow-2xl z-10">
                  <div className="w-full h-full rounded-full bg-[#131520] flex items-center justify-center text-6xl select-none overflow-hidden">
                    👩‍🏫
                  </div>
                </div>
              </div>

              {/* Status pill under avatar */}
              <div className="mt-5 text-center px-4">
                {isAvaSpeaking ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>Ava bol rahi hain... Listen carefully</span>
                  </div>
                ) : isUserSpeaking ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Aapki aawaz sun rahe hain... Speak now</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                    <span>Aapki baari hai! Tap microphone to reply</span>
                  </div>
                )}
              </div>

              {/* Active Conversation Subtitles */}
              <div className="w-full mt-4 bg-[#141622]/90 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-md min-h-[90px] flex flex-col justify-center text-center">
                {liveTranscript ? (
                  <p className="text-sm font-medium text-emerald-300 italic">
                    "{liveTranscript}"
                  </p>
                ) : lastExchange ? (
                  <div>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      "{lastExchange.text}"
                    </p>
                    {showHindiTip && lastExchange.hindiTranslation && (
                      <p className="text-xs text-amber-300 mt-1.5 font-medium border-t border-slate-700/60 pt-1.5">
                        💡 {lastExchange.hindiTranslation}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Ava ke sath freely English bolen. Galti hone par Ava aasan shabdon mein help karegi.
                  </p>
                )}
              </div>

              {/* In-Call Helper Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setShowHindiTip(!showHindiTip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    showHindiTip
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{showHindiTip ? 'Hide Hindi' : 'Hindi mein samjhao'}</span>
                </button>

                <button
                  onClick={handleToggleSlowMode}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isSlowMode
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>🐢</span>
                  <span>{isSlowMode ? 'Slow: On' : 'Dheere bolo'}</span>
                </button>

                <button
                  onClick={handleRepeatAva}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repeat</span>
                </button>
              </div>

              {/* Suggested Quick Response Chips if Learner is Hesitant */}
              <div className="w-full mt-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                  💡 Agar samajh na aaye, to ye bol sakte hain:
                </div>
                <div className="flex flex-col gap-1.5">
                  {suggestedPhrases.slice(0, 2).map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestedPhrase(phrase)}
                      className="px-3.5 py-2 rounded-xl bg-[#181B26] border border-slate-700 hover:border-[#FF4B26] text-xs text-left text-slate-200 hover:text-white transition-all line-clamp-1"
                    >
                      🗣️ "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Call Control Buttons (Speaker, Mic, End Call) */}
            <div className="pt-2">
              <div className="flex items-center justify-around max-w-xs mx-auto">
                {/* Speaker Toggle */}
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isSpeakerOn
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                  title="Speakerphone"
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>

                {/* Main Mic Push-to-Talk / Listening button */}
                <button
                  onClick={() => {
                    if (isUserSpeaking) {
                      voiceService.stopListening();
                      setIsUserSpeaking(false);
                    } else {
                      startListeningForUser();
                    }
                  }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
                    isUserSpeaking
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/40 animate-pulse'
                      : 'bg-white text-slate-950 hover:bg-slate-100'
                  }`}
                  title="Speak"
                >
                  <Mic className="w-7 h-7" />
                </button>

                {/* Mute Mic */}
                <button
                  onClick={handleToggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isMuted
                      ? 'bg-rose-500/20 border border-rose-500 text-rose-400'
                      : 'bg-slate-800 text-white'
                  }`}
                  title="Mute"
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-600/30 transition-all active:scale-95"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
