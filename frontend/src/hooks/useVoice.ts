
// import { useState, useEffect, useRef } from 'react';
// import { VoiceState, TTSState } from '../types';

// export const useVoice = () => {
//   const [voiceState, setVoiceState] = useState<VoiceState>({
//     isListening: false,
//     isSupported: false,
//     transcript: ''
//   });

//   const [ttsState, setTTSState] = useState<TTSState>({
//     isSpeaking: false,
//     isEnabled: true,
//     isSupported: false
//   });

//   const recognitionRef = useRef<any>(null);
//   const synthRef = useRef<SpeechSynthesis | null>(null);

//   useEffect(() => {
//     // Initialize Speech Recognition
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();

//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = 'en-US';

//       recognitionRef.current.onresult = (event: any) => {
//         let transcript = '';
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           transcript += event.results[i][0].transcript;
//         }
//         setVoiceState(prev => ({ ...prev, transcript }));
//       };

//       recognitionRef.current.onerror = (event: any) => {
//         console.error('Speech recognition error:', event.error);
//         setVoiceState(prev => ({ ...prev, isListening: false }));
//       };

//       recognitionRef.current.onend = () => {
//         setVoiceState(prev => ({ ...prev, isListening: false }));
//       };

//       setVoiceState(prev => ({ ...prev, isSupported: true }));
//     }

//     // Initialize Speech Synthesis
//     if ('speechSynthesis' in window) {
//       synthRef.current = window.speechSynthesis;
//       setTTSState(prev => ({ ...prev, isSupported: true }));
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//       if (synthRef.current) {
//         synthRef.current.cancel();
//       }
//     };
//   }, []);

//   const startListening = () => {
//     if (recognitionRef.current && voiceState.isSupported) {
//       setVoiceState(prev => ({ ...prev, transcript: '', isListening: true }));
//       recognitionRef.current.start();
//     }
//   };


//   const stopListening = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setVoiceState(prev => ({ ...prev, isListening: false }));
//     }
//   };

//   const speak = (text: string) => {
//     if (synthRef.current && ttsState.isSupported && ttsState.isEnabled) {
//       synthRef.current.cancel();

//       const utterance = new SpeechSynthesisUtterance(text);
//        // Get available voices
//     const voices = synthRef.current.getVoices();


// const naturalVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));

// if (naturalVoice) {
//   utterance.voice = naturalVoice;
// }


//     // Use the default voice (browser will assign one)
//     console.log('Available voices:', voices);
//       utterance.onstart = () => setTTSState(prev => ({ ...prev, isSpeaking: true }));
//       utterance.onend = () => setTTSState(prev => ({ ...prev, isSpeaking: false }));
//       utterance.onerror = () => setTTSState(prev => ({ ...prev, isSpeaking: false }));

//       synthRef.current.speak(utterance);
//     }
//   };

//   const stopSpeaking = () => {
//   if (synthRef.current) {
//     synthRef.current.cancel();
//     setTTSState(prev => ({ ...prev, isSpeaking: false }));
//   }
// };

//   const toggleTTS = () => {
//     setTTSState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
//     if (ttsState.isSpeaking && synthRef.current) {
//       synthRef.current.cancel();
//     }
//   };

//   return {
//     voiceState,
//     ttsState,
//     startListening,
//     stopListening,
//     speak,
//     stopSpeaking,
//     toggleTTS
//   };
// };

// import { useState, useEffect, useRef } from "react";
// import { VoiceState, TTSState } from "../types";

// const INDIAN_LANGUAGES = [
//   "hi-IN", "bn-IN", "ta-IN", "te-IN", "ml-IN",
//   "gu-IN", "mr-IN", "kn-IN", "pa-IN", "or-IN"
// ];

// export const useVoice = () => {
//   const [voiceState, setVoiceState] = useState<VoiceState>({
//     isListening: false,
//     isSupported: false,
//     transcript: "",
//   });

//   const [ttsState, setTTSState] = useState<TTSState>({
//     isSpeaking: false,
//     isEnabled: true,
//     isSupported: false,
//   });

//   const recognitionRef = useRef<any>(null);
//   const synthRef = useRef<SpeechSynthesis | null>(null);

//   useEffect(() => {
//     // Initialize Speech Recognition
//     if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
//       const SpeechRecognition =
//         (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();

//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;

//       // Try to detect language automatically; fallback to Hindi
//       recognitionRef.current.lang =
//         INDIAN_LANGUAGES.includes(navigator.language) ? navigator.language : "hi-IN";

//       recognitionRef.current.onresult = (event: any) => {
//         let transcript = "";
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           transcript += event.results[i][0].transcript;
//         }
//         setVoiceState((prev) => ({ ...prev, transcript }));
//       };

//       recognitionRef.current.onerror = (event: any) => {
//         console.error("Speech recognition error:", event.error);
//         setVoiceState((prev) => ({ ...prev, isListening: false }));
//       };

//       recognitionRef.current.onend = () => {
//         setVoiceState((prev) => ({ ...prev, isListening: false }));
//       };

//       setVoiceState((prev) => ({ ...prev, isSupported: true }));
//     }

//     // Initialize Speech Synthesis
//     if ("speechSynthesis" in window) {
//       synthRef.current = window.speechSynthesis;
//       setTTSState((prev) => ({ ...prev, isSupported: true }));
//     }

//     return () => {
//       if (recognitionRef.current) recognitionRef.current.stop();
//       if (synthRef.current) synthRef.current.cancel();
//     };
//   }, []);

//   const startListening = (lang?: string) => {
//     if (recognitionRef.current && voiceState.isSupported) {
//       setVoiceState((prev) => ({ ...prev, transcript: "", isListening: true }));
//       // Set language dynamically (optional)
//       recognitionRef.current.lang = lang || recognitionRef.current.lang || "hi-IN";
//       recognitionRef.current.start();
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setVoiceState((prev) => ({ ...prev, isListening: false }));
//     }
//   };

//   const speak = (text: string) => {
//     if (synthRef.current && ttsState.isSupported && ttsState.isEnabled) {
//       synthRef.current.cancel();
//       const utterance = new SpeechSynthesisUtterance(text);

//       // Use an Indian language voice if available
//       const voices = synthRef.current.getVoices();
//       const indianVoice = voices.find((v) =>
//         ["hi", "bn", "ta", "te", "ml", "gu", "mr", "kn", "pa", "or"].some((l) =>
//           v.lang.startsWith(l)
//         )
//       );
//       if (indianVoice) utterance.voice = indianVoice;

//       utterance.onstart = () => setTTSState((prev) => ({ ...prev, isSpeaking: true }));
//       utterance.onend = () => setTTSState((prev) => ({ ...prev, isSpeaking: false }));
//       utterance.onerror = () => setTTSState((prev) => ({ ...prev, isSpeaking: false }));

//       synthRef.current.speak(utterance);
//     }
//   };

//   const stopSpeaking = () => {
//     if (synthRef.current) {
//       synthRef.current.cancel();
//       setTTSState((prev) => ({ ...prev, isSpeaking: false }));
//     }
//   };

//   const toggleTTS = () => {
//     setTTSState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
//     if (ttsState.isSpeaking && synthRef.current) synthRef.current.cancel();
//   };

//   return {
//     voiceState,
//     ttsState,
//     startListening,
//     stopListening,
//     speak,
//     stopSpeaking,
//     toggleTTS,
//   };
// };

import { useState, useEffect, useRef } from "react";
import { VoiceState, TTSState } from "../types";
import { apiService } from "../services/api";

/**
 * Supported Indian languages for Speech Recognition
 */
const INDIAN_LANGUAGES = [
  "hi-IN", "bn-IN", "ta-IN", "te-IN", "ml-IN",
  "gu-IN", "mr-IN", "kn-IN", "pa-IN", "or-IN"
];

export const useVoice = () => {
  /**
   * Speech-to-text (Mic)
   */
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSupported: false,
    transcript: "",
  });

  /**
   * Text-to-speech (Azure backend)
   */
  const [ttsState, setTTSState] = useState<TTSState>({
    isSpeaking: false,
    isEnabled: true,
    isSupported: true, // backend-based TTS
    isLoading: false,
  });

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * ---------------------------
   * INIT – Speech Recognition
   * ---------------------------
   */
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.lang =
        INDIAN_LANGUAGES.includes(navigator.language)
          ? navigator.language
          : "en-IN";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceState((prev) => ({ ...prev, transcript }));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setVoiceState((prev) => ({ ...prev, isListening: false }));
      };

      recognition.onend = () => {
        setVoiceState((prev) => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      setVoiceState((prev) => ({ ...prev, isSupported: true }));
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  /**
   * ---------------------------
   * Mic controls
   * ---------------------------
   */
  const startListening = (lang?: string) => {
    if (!recognitionRef.current || !voiceState.isSupported) return;

    setVoiceState({ isListening: true, isSupported: true, transcript: "" });
    recognitionRef.current.lang = lang || recognitionRef.current.lang || "hi-IN";
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setVoiceState((prev) => ({ ...prev, isListening: false }));
  };

  /**
   * ---------------------------
   * Azure TTS – Speak
   * ---------------------------
   */
  // const speak = async (text: string) => {
  //   if (!ttsState.isEnabled) return;

  //   try {
  //     setTTSState((prev) => ({ ...prev, isSpeaking: true }));

  //     // Stop previous audio
  //     if (audioRef.current) {
  //       audioRef.current.pause();
  //       audioRef.current.src = "";
  //       audioRef.current = null;
  //     }

  //     const blob = await apiService.getSpeechAudio(text);
  //     console.log(blob.type, blob.size);
  //     const audioUrl = URL.createObjectURL(blob);

  //     const audio = new Audio(audioUrl);
  //     audioRef.current = audio;

  //     audio.onended = () => {
  //       setTTSState((prev) => ({ ...prev, isSpeaking: false }));
  //       URL.revokeObjectURL(audioUrl);
  //     };

  //     audio.onerror = (e) => {
  //       console.error("Audio playback failed", e);
  //       setTTSState((prev) => ({ ...prev, isSpeaking: false }));
  //       URL.revokeObjectURL(audioUrl);
  //     };

  //     await audio.play();
  //   } catch (err) {
  //     console.error("TTS playback failed:", err);
  //     setTTSState((prev) => ({ ...prev, isSpeaking: false }));
  //   }
  // };

  const speak = async (text: string) => {
    if (!ttsState.isEnabled || !text.trim()) return;

    try {
      setTTSState((prev) => ({
        ...prev,
        isSpeaking: false,
        isLoading: true,
      }));

      // stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      const blob = await apiService.getSpeechAudio(text);

      if (blob.size === 0) throw new Error("Empty audio blob");

      // Explicitly fallback to audio/wav if type is missing or generic
      const type = blob.type || 'audio/wav';
      const audioBlob = blob.type ? blob : new Blob([blob], { type });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setTTSState((prev) => ({
          ...prev,
          isSpeaking: false,
          isLoading: false,
        }));
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setTTSState((prev) => ({
          ...prev,
          isSpeaking: false,
          isLoading: false,
        }));
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

      setTTSState((prev) => ({
        ...prev,
        isSpeaking: true,
        isLoading: false,
      }));
    } catch (err) {
      console.error("TTS playback failed:", err);
      setTTSState((prev) => ({
        ...prev,
        isSpeaking: false,
        isLoading: false,
      }));
    }
  };

  /**
   * ---------------------------
   * Stop TTS
   * ---------------------------
   */
  // const stopSpeaking = () => {
  //   if (audioRef.current) {
  //     audioRef.current.pause();
  //     audioRef.current.src = "";
  //     audioRef.current = null;
  //   }
  //   setTTSState((prev) => ({ ...prev, isSpeaking: false }));
  // };
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    setTTSState((prev) => ({
      ...prev,
      isSpeaking: false,
      isLoading: false,
    }));
  };

  /**
   * ---------------------------
   * Toggle TTS
   * ---------------------------
   */
  const toggleTTS = () => {
    setTTSState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
    if (ttsState.isSpeaking) stopSpeaking();
  };

  return {
    voiceState,
    ttsState,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleTTS,
  };
};
