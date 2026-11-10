// Speech recognition and synthesis abstraction

type RecognitionCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListening = false;
  private audioContext: AudioContext | null = null;
  private onResultCallback: RecognitionCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;
  private onEndCallback: (() => void) | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      this.initRecognition();
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural English female voices (Ava personality)
    const preferred = voices.find(
      (v) =>
        (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en')) &&
        (v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google') ||
          v.name.includes('Female') ||
          v.name.includes('Ava') ||
          v.name.includes('Karen'))
    );
    this.preferredVoice = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && this.onResultCallback) {
          this.onResultCallback(finalTranscript.trim(), true);
        } else if (interimTranscript && this.onResultCallback) {
          this.onResultCallback(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
    }
  }

  public isSpeechSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      'speechSynthesis' in window
    );
  }

  public speak(
    text: string,
    optionsOrOnEnd?:
      | {
          rate?: number; // 0.75 for slow, 1.0 for normal
          pitch?: number;
          onStart?: () => void;
          onEnd?: () => void;
          onError?: (e: any) => void;
        }
      | (() => void),
    rate?: number
  ): void {
    let opts: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (e: any) => void;
    } = {};

    if (typeof optionsOrOnEnd === 'function') {
      opts.onEnd = optionsOrOnEnd;
      if (rate !== undefined) opts.rate = rate;
    } else if (optionsOrOnEnd) {
      opts = optionsOrOnEnd;
    }

    if (!this.synth) {
      if (opts.onEnd) opts.onEnd();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    utterance.rate = opts.rate || 1.0;
    utterance.pitch = opts.pitch || 1.05; // Slightly warm friendly pitch
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      if (opts.onStart) opts.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (opts.onEnd) opts.onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (opts.onError) opts.onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public pauseSpeaking(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resumeSpeaking(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public startListening(
    onResult: RecognitionCallback,
    onError?: ErrorCallback,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    this.stopSpeaking(); // Stop AI voice before listening
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    try {
      this.playSfx('micStart');
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      // Often thrown if recognition is already started
      console.warn('Recognition start error:', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.playSfx('micStop');
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  // Auditory feedback synthesized via Web Audio API
  public playSfx(type: 'success' | 'error' | 'micStart' | 'micStop' | 'levelUp' | 'tap') {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'error') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(195, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'micStart') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'micStop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'levelUp') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'tap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Audio context might fail without user interaction yet
    }
  }
}

export const voiceService = new VoiceService();
