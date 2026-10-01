import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../store/PlatformContext';
import { hapticFeedback } from '../../utils/haptics';

export const VoiceSearchModal: React.FC = () => {
  const { isVoiceSearchOpen, setIsVoiceSearchOpen } = usePlatform();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!isVoiceSearchOpen) {
      setTranscript('');
      setIsListening(false);
      return;
    }

    hapticFeedback.medium();
    setIsListening(true);

    // Check for native SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            hapticFeedback.success();
            setTimeout(() => {
              setIsVoiceSearchOpen(false);
              navigate(`/search?q=${encodeURIComponent(text.trim())}`);
            }, 600);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();

        return () => {
          try {
            recognition.stop();
          } catch {
            // Ignore
          }
        };
      } catch (err) {
        console.warn('Voice recognition initialization error:', err);
      }
    }
  }, [isVoiceSearchOpen, navigate, setIsVoiceSearchOpen]);

  if (!isVoiceSearchOpen) return null;

  const handleQuickSelect = (query: string) => {
    hapticFeedback.light();
    setIsVoiceSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0" onClick={() => setIsVoiceSearchOpen(false)} />

      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 z-10 shadow-2xl text-center space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            UniStore Voice Search
          </span>
          <button
            onClick={() => setIsVoiceSearchOpen(false)}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Pulsating Microphone Ripple */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute -inset-3 rounded-full bg-blue-500/10 animate-pulse" />
            </>
          )}
          <div className="relative w-20 h-20 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[36px] text-blue-400">
              mic
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-zinc-950">
            {transcript ? `"${transcript}"` : isListening ? 'Listening...' : 'Tap to speak'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Say a product name, brand, or category (e.g. &quot;Headphones&quot;, &quot;Ergonomic Chair&quot;)
          </p>
        </div>

        {/* Quick Voice Suggestions */}
        <div className="pt-2 border-t border-zinc-100">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Or tap to search instantly:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Noise Cancelling Headphones', 'Ergonomic Chair', 'Mechanical Keyboard', 'Ceramic Table Lamp'].map((item) => (
              <button
                key={item}
                onClick={() => handleQuickSelect(item)}
                className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
