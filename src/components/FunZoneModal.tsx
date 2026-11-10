import React, { useState } from 'react';
import { UserProfile } from '../types';
import { voiceService } from '../services/voiceService';
import {
  Sparkles,
  ArrowLeft,
  Mic,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Flame,
  Award,
  Zap,
  HelpCircle,
  Gamepad2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onAddXP: (xp: number) => void;
}

type FunTab = 'twisters' | 'bollywood' | 'jumble' | 'rapidfire';

interface TongueTwister {
  id: string;
  level: 'Easy' | 'Medium' | 'Hard';
  hindiHint: string;
  phrase: string;
  funFact: string;
}

const TONGUE_TWISTERS: TongueTwister[] = [
  {
    id: 'tt1',
    level: 'Easy',
    hindiHint: 'लाल लॉरी, पीली लॉरी - 3 बार तेजी से बोलो!',
    phrase: 'Red lorry, yellow lorry, red lorry, yellow lorry.',
    funFact: 'Helps master the difference between "R" and "L" sounds which Indian speakers often swap!',
  },
  {
    id: 'tt2',
    level: 'Easy',
    hindiHint: 'किचन में चिकन खाती बिल्ली!',
    phrase: 'I saw a kitten eating chicken in the kitchen.',
    funFact: 'Trains rapid tongue movement between "K", "T" and "CH" consonant clusters.',
  },
  {
    id: 'tt3',
    level: 'Medium',
    hindiHint: 'समुद्र किनारे शंख बेचने वाली!',
    phrase: 'She sells seashells by the seashore.',
    funFact: 'Cleans up confusion between "S" (स) and "SH" (श) sounds completely!',
  },
  {
    id: 'tt4',
    level: 'Medium',
    hindiHint: 'आइसक्रीम की दीवानी चीखें!',
    phrase: 'I scream, you scream, we all scream for ice cream!',
    funFact: 'Builds fluent English sentence rhythm and joyful pronunciation.',
  },
  {
    id: 'tt5',
    level: 'Hard',
    hindiHint: 'बेट्टी बॉटर का कड़वा मक्खन!',
    phrase: "Betty Botter bought some butter, but she said the butter's bitter.",
    funFact: 'The ultimate speech workout for quick American/British "T" and "B" plosives.',
  },
  {
    id: 'tt6',
    level: 'Hard',
    hindiHint: 'पीटर पाइपर और अचार वाली मिर्च!',
    phrase: 'Peter Piper picked a peck of pickled peppers.',
    funFact: 'Develops powerful breath control and lip agility for confident public speaking.',
  },
];

interface IdiomMatch {
  id: string;
  hindiProverb: string;
  literalMeaning: string;
  englishIdiom: string;
  sampleUsage: string;
  wrongOptions: string[];
}

const BOLLYWOOD_IDIOMS: IdiomMatch[] = [
  {
    id: 'id1',
    hindiProverb: 'जान में जान आई! 😌',
    literalMeaning: 'A feeling of immense relief when tension ends.',
    englishIdiom: 'A sigh of relief',
    sampleUsage: 'When the exam ended, I let out a sigh of relief.',
    wrongOptions: ['A jump in the sky', 'Life came back to life', 'Heart in mouth'],
  },
  {
    id: 'id2',
    hindiProverb: 'आसमान से गिरा, खजूर में अटका! 🌴',
    literalMeaning: 'Escaping one problem only to fall into an even bigger one.',
    englishIdiom: 'Out of the frying pan into the fire',
    sampleUsage: 'Leaving that job for this one was out of the frying pan into the fire.',
    wrongOptions: ['Fell from cloud to dates', 'Stuck between trees', 'Lost in the wind'],
  },
  {
    id: 'id3',
    hindiProverb: 'दूध का जला छाछ भी फूंक कर पीता है! 🥛',
    literalMeaning: 'Once hurt, a person becomes overly cautious.',
    englishIdiom: 'Once bitten, twice shy',
    sampleUsage: 'After losing money in that scam, he was once bitten, twice shy.',
    wrongOptions: ['Burnt milk drinker', 'Blow on the butter', 'Cold water fright'],
  },
  {
    id: 'id4',
    hindiProverb: 'नाच न जाने आँगन टेढ़ा! 💃',
    literalMeaning: 'Blaming external tools or situations for one’s own lack of skill.',
    englishIdiom: 'A bad workman blames his tools',
    sampleUsage: 'He said his laptop caused the delay, but a bad workman blames his tools.',
    wrongOptions: ['Dancing on crooked floor', 'Courtyard is bent', 'Step without music'],
  },
  {
    id: 'id5',
    hindiProverb: 'चार दिन की चाँदनी फिर अंधेरी रात! 🌙',
    literalMeaning: 'Temporary glory or short-lived happiness.',
    englishIdiom: "A nine days' wonder",
    sampleUsage: "His sudden viral fame turned out to be just a nine days' wonder.",
    wrongOptions: ['Four nights of moonlight', 'Dark night ahead', 'Silver moon smile'],
  },
  {
    id: 'id6',
    hindiProverb: 'अपने मुँह मियाँ मिट्ठू बनना! 🦜',
    literalMeaning: 'Praising oneself in front of others.',
    englishIdiom: 'Blowing your own trumpet',
    sampleUsage: 'Nobody likes someone who keeps blowing their own trumpet.',
    wrongOptions: ['Parrot talks to self', 'Sugar on the lips', 'Sweet mouth gentleman'],
  },
  {
    id: 'id7',
    hindiProverb: 'ऊँट के मुँह में जीरा! 🐪',
    literalMeaning: 'A tiny, inadequate quantity compared to what is needed.',
    englishIdiom: 'A drop in the ocean',
    sampleUsage: 'A 50 rupee discount on a luxury phone is just a drop in the ocean.',
    wrongOptions: ['Cumin for the camel', 'Big mouth little seed', 'Desert grain'],
  },
];

interface SentencePuzzle {
  id: string;
  hindiMeaning: string;
  words: string[];
  correctSentence: string;
  tip: string;
}

const JUMBLE_PUZZLES: SentencePuzzle[] = [
  {
    id: 'jp1',
    hindiMeaning: 'क्या आप कृपया इसमें मेरी मदद कर सकते हैं?',
    words: ['help', 'Could', 'me', 'with', 'you', 'please', 'this?'],
    correctSentence: 'Could you please help me with this?',
    tip: 'Polite requests in English start with "Could you please..." instead of "Can you...".',
  },
  {
    id: 'jp2',
    hindiMeaning: 'मुझे आपसे मिलकर बहुत खुशी हुई।',
    words: ['forward', 'looking', 'to', 'I', 'meeting', 'am', 'you.'],
    correctSentence: 'I am looking forward to meeting you.',
    tip: '"Look forward to" takes "-ing" (meeting), not base verb (meet)!',
  },
  {
    id: 'jp3',
    hindiMeaning: 'अभ्यास करने से इंसान फ्लूएंट बनता है।',
    words: ['fluent.', 'makes', 'Practice', 'person', 'a'],
    correctSentence: 'Practice makes a person fluent.',
    tip: 'Singular subject "Practice" takes the verb with -s ("makes").',
  },
  {
    id: 'jp4',
    hindiMeaning: 'आज शाम का मौसम बहुत सुहाना है।',
    words: ['weather', 'pleasant', 'The', 'this', 'evening.', 'is', 'very'],
    correctSentence: 'The weather is very pleasant this evening.',
    tip: '"Pleasant" is a much more natural English word than "good" for weather!',
  },
];

export const FunZoneModal: React.FC<Props> = ({ profile, onClose, onAddXP }) => {
  const [activeTab, setActiveTab] = useState<FunTab>('twisters');

  // Tongue Twisters State
  const [twisterIndex, setTwisterIndex] = useState(0);
  const [isRecordingTwister, setIsRecordingTwister] = useState(false);
  const [twisterTranscript, setTwisterTranscript] = useState('');
  const [twisterScore, setTwisterScore] = useState<number | null>(null);

  // Bollywood State
  const [idiomIndex, setIdiomIndex] = useState(0);
  const [selectedIdiomAnswer, setSelectedIdiomAnswer] = useState<string | null>(null);
  const [showIdiomCard, setShowIdiomCard] = useState(false);

  // Sentence Jumble State
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [tappedWords, setTappedWords] = useState<string[]>([]);
  const [puzzleResult, setPuzzleResult] = useState<'correct' | 'wrong' | null>(null);

  // Rapid Fire State
  const [rapidFireCount, setRapidFireCount] = useState(0);
  const [rapidFireTranscript, setRapidFireTranscript] = useState('');
  const [isRecordingRapid, setIsRecordingRapid] = useState(false);

  // 1. Tongue Twister Recording
  const currentTwister = TONGUE_TWISTERS[twisterIndex];

  const handleStartTwisterRecording = () => {
    if (isRecordingTwister) {
      voiceService.stopListening();
      setIsRecordingTwister(false);
      return;
    }

    setTwisterTranscript('');
    setTwisterScore(null);
    setIsRecordingTwister(true);

    voiceService.startListening(
      (transcript, isFinal) => {
        setTwisterTranscript(transcript);
        if (isFinal) {
          setIsRecordingTwister(false);
          evaluateTwister(transcript, currentTwister.phrase);
        }
      },
      () => setIsRecordingTwister(false),
      () => setIsRecordingTwister(false)
    );
  };

  const evaluateTwister = (spoken: string, target: string) => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/);
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/);

    let matchCount = 0;
    cleanTarget.forEach((word) => {
      if (cleanSpoken.includes(word)) matchCount++;
    });

    const calculated = Math.min(100, Math.round((matchCount / cleanTarget.length) * 100));
    setTwisterScore(calculated);

    if (calculated >= 70) {
      voiceService.playSfx('levelUp');
      onAddXP(30);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      voiceService.playSfx('tap');
    }
  };

  // 2. Bollywood Idiom Quiz
  const currentIdiom = BOLLYWOOD_IDIOMS[idiomIndex];
  const allIdiomOptions = React.useMemo(() => {
    return [currentIdiom.englishIdiom, ...currentIdiom.wrongOptions].sort(
      () => 0.5 - Math.random()
    );
  }, [idiomIndex]);

  const handleSelectIdiomOption = (opt: string) => {
    voiceService.playSfx('tap');
    setSelectedIdiomAnswer(opt);
    const isCorrect = opt === currentIdiom.englishIdiom;

    if (isCorrect) {
      voiceService.playSfx('success');
      onAddXP(20);
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      voiceService.playSfx('error');
    }
  };

  // 3. Sentence Jumble Logic
  const currentPuzzle = JUMBLE_PUZZLES[puzzleIndex];
  const availableWords = currentPuzzle.words.filter(
    (w) => !tappedWords.includes(w)
  );

  const handleTapWord = (word: string) => {
    voiceService.playSfx('tap');
    const newTapped = [...tappedWords, word];
    setTappedWords(newTapped);

    // If assembled all words
    if (newTapped.length === currentPuzzle.words.length) {
      const formed = newTapped.join(' ');
      if (formed.toLowerCase() === currentPuzzle.correctSentence.toLowerCase()) {
        setPuzzleResult('correct');
        voiceService.playSfx('levelUp');
        voiceService.speak(currentPuzzle.correctSentence);
        onAddXP(35);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      } else {
        setPuzzleResult('wrong');
        voiceService.playSfx('error');
      }
    }
  };

  const handleResetPuzzle = () => {
    voiceService.playSfx('tap');
    setTappedWords([]);
    setPuzzleResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090A10] text-white overflow-hidden">
      <div className="relative w-full max-w-lg h-full flex flex-col justify-between px-4 pt-4 pb-6 bg-[#0B0C14]">
        
        {/* Header Bar */}
        <div>
          <div className="flex items-center justify-between pt-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Maje Maje Mein English</span>
                  <span className="text-xl">🎉</span>
                </h1>
                <p className="text-xs text-amber-400 font-semibold">
                  Fun Games • Bolne Ka Darr Chhodo!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>+XP Bonus</span>
            </div>
          </div>

          {/* Sub-Tabs (Tongue Twisters, Bollywood Idioms, Sentence Jumble) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141624] rounded-2xl border border-slate-800 mt-3">
            <button
              onClick={() => {
                voiceService.playSfx('tap');
                setActiveTab('twisters');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'twisters'
                  ? 'bg-[#FF4B26] text-white shadow-md shadow-[#FF4B26]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👅 जीभ घुमाओ
            </button>

            <button
              onClick={() => {
                voiceService.playSfx('tap');
                setActiveTab('bollywood');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'bollywood'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎬 देसी कहावतें
            </button>

            <button
              onClick={() => {
                voiceService.playSfx('tap');
                setActiveTab('jumble');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'jumble'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🧩 शब्द जोड़ो
            </button>
          </div>
        </div>

        {/* TAB 1: TONGUE TWISTER SPRINT */}
        {activeTab === 'twisters' && (
          <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto animate-in fade-in duration-200">
            <div>
              {/* Card Header with Level & Counter */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  Level: {currentTwister.level}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {twisterIndex + 1} of {TONGUE_TWISTERS.length}
                </span>
              </div>

              {/* Hindi Meaning Hint */}
              <div className="text-xs text-amber-300 font-semibold mb-2">
                💡 {currentTwister.hindiHint}
              </div>

              {/* Main Tongue Twister Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#181B2A] to-[#121422] border-2 border-indigo-500/30 shadow-2xl text-center relative overflow-hidden">
                <p className="text-xl sm:text-2xl font-black text-white leading-relaxed tracking-tight">
                  "{currentTwister.phrase}"
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      voiceService.playSfx('tap');
                      voiceService.speak(currentTwister.phrase, undefined, 0.9);
                    }}
                    className="px-4 py-2 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-bold hover:bg-indigo-600/50 transition-all flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen to Ava</span>
                  </button>

                  <button
                    onClick={() => {
                      voiceService.playSfx('tap');
                      voiceService.speak(currentTwister.phrase, undefined, 0.7);
                    }}
                    className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs font-bold hover:text-white transition-all"
                  >
                    🐢 Slow
                  </button>
                </div>
              </div>

              {/* Phonetic Science Tip */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#141622] border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-indigo-400 block mb-0.5">
                  🧠 Pronunciation Science:
                </span>
                {currentTwister.funFact}
              </div>

              {/* Score Display if attempted */}
              {twisterScore !== null && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-center animate-in zoom-in-95 duration-200">
                  <div className="text-3xl font-black text-emerald-400 mb-1">
                    {twisterScore}%
                  </div>
                  <div className="text-xs font-bold text-white">
                    {twisterScore >= 80
                      ? '🔥 Zabardast Speed & Clarity!'
                      : twisterScore >= 50
                      ? '👍 Bahut badiya! Ek baar aur tez bolo'
                      : '🙂 Thoda aur practice karein! Ava ki audio sunein'}
                  </div>
                  {twisterTranscript && (
                    <div className="text-[11px] text-slate-400 italic mt-1">
                      You said: "{twisterTranscript}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handleStartTwisterRecording}
                className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                  isRecordingTwister
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#FF4B26] hover:bg-[#E03E1C] text-white shadow-[#FF4B26]/30'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>
                  {isRecordingTwister
                    ? 'Listening... 3 bar jaldi bolo!'
                    : 'Tap to Speak (Speed Challenge)'}
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  disabled={twisterIndex === 0}
                  onClick={() => {
                    voiceService.playSfx('tap');
                    setTwisterIndex(twisterIndex - 1);
                    setTwisterScore(null);
                    setTwisterTranscript('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={twisterIndex === TONGUE_TWISTERS.length - 1}
                  onClick={() => {
                    voiceService.playSfx('tap');
                    setTwisterIndex(twisterIndex + 1);
                    setTwisterScore(null);
                    setTwisterTranscript('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-30"
                >
                  Next Twister →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOLLYWOOD TO HOLLYWOOD IDIOMS */}
        {activeTab === 'bollywood' && (
          <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                  Desi Kahawat Quiz
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {idiomIndex + 1} of {BOLLYWOOD_IDIOMS.length}
                </span>
              </div>

              {/* Hindi Proverb Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/60 to-slate-900 border-2 border-purple-500/30 text-center mb-4">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Guess the Real English Idiom for:
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                  "{currentIdiom.hindiProverb}"
                </h2>
                <p className="text-xs text-slate-400 italic">
                  Meaning: {currentIdiom.literalMeaning}
                </p>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {allIdiomOptions.map((opt, i) => {
                  const isSelected = selectedIdiomAnswer === opt;
                  const isCorrect = opt === currentIdiom.englishIdiom;

                  let btnStyle = 'bg-[#151724] border-slate-800 text-slate-200 hover:border-slate-700';
                  if (selectedIdiomAnswer) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={Boolean(selectedIdiomAnswer)}
                      onClick={() => handleSelectIdiomOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedIdiomAnswer && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {selectedIdiomAnswer && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Reveal Explanation when answered */}
              {selectedIdiomAnswer && (
                <div className="mt-4 p-4 rounded-2xl bg-[#161826] border border-purple-500/40 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-purple-300">
                      English Expression:
                    </span>
                    <button
                      onClick={() => {
                        voiceService.playSfx('tap');
                        voiceService.speak(currentIdiom.sampleUsage);
                      }}
                      className="text-xs text-indigo-400 hover:text-white flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio</span>
                    </button>
                  </div>
                  <div className="text-sm font-black text-white">
                    "{currentIdiom.englishIdiom}"
                  </div>
                  <div className="text-xs text-slate-300 mt-1 italic">
                    Example: "{currentIdiom.sampleUsage}"
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Next Question */}
            <div className="pt-4">
              <button
                disabled={!selectedIdiomAnswer}
                onClick={() => {
                  voiceService.playSfx('tap');
                  setSelectedIdiomAnswer(null);
                  setIdiomIndex((idiomIndex + 1) % BOLLYWOOD_IDIOMS.length);
                }}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm disabled:opacity-40 shadow-lg shadow-purple-600/20 transition-all"
              >
                Next Proverb →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SENTENCE JUMBLE PUZZLE */}
        {activeTab === 'jumble' && (
          <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  Puzzle {puzzleIndex + 1} of {JUMBLE_PUZZLES.length}
                </span>
                <button
                  onClick={handleResetPuzzle}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Words</span>
                </button>
              </div>

              {/* Hindi Target Prompt */}
              <div className="p-4 rounded-2xl bg-[#141624] border border-slate-800 text-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assemble English sentence for:
                </span>
                <h3 className="text-lg font-bold text-emerald-300">
                  "{currentPuzzle.hindiMeaning}"
                </h3>
              </div>

              {/* Assembly Drop Target Area */}
              <div className="min-h-[110px] p-4 rounded-3xl bg-[#0D0F18] border-2 border-dashed border-slate-700 flex flex-wrap items-center justify-center gap-2 mb-4">
                {tappedWords.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">
                    Tap the word tiles below in the correct order...
                  </span>
                ) : (
                  tappedWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md animate-in zoom-in-75 duration-150"
                    >
                      {word}
                    </span>
                  ))
                )}
              </div>

              {/* Feedback Alert if Finished */}
              {puzzleResult === 'correct' && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center mb-4 animate-in fade-in duration-200">
                  <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bilkul Sahi! Perfect Grammar</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    💡 {currentPuzzle.tip}
                  </p>
                </div>
              )}

              {puzzleResult === 'wrong' && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-center mb-4 animate-in fade-in duration-200">
                  <div className="text-sm font-black text-rose-400 flex items-center justify-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Galat sequence hai dost! Reset karke try karein.</span>
                  </div>
                </div>
              )}

              {/* Available Word Tiles to Tap */}
              <div className="flex flex-wrap justify-center gap-2.5">
                {currentPuzzle.words.map((word, i) => {
                  const isUsed = tappedWords.includes(word);
                  return (
                    <button
                      key={i}
                      disabled={isUsed}
                      onClick={() => handleTapWord(word)}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-md ${
                        isUsed
                          ? 'opacity-20 bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-[#1C1F30] border border-slate-700 hover:border-indigo-400 text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Next Puzzle */}
            <div className="pt-4">
              <button
                disabled={puzzleResult !== 'correct'}
                onClick={() => {
                  voiceService.playSfx('tap');
                  handleResetPuzzle();
                  setPuzzleIndex((puzzleIndex + 1) % JUMBLE_PUZZLES.length);
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-30 shadow-lg shadow-emerald-600/20 transition-all"
              >
                Next Puzzle →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
