import React, { useEffect } from 'react';
import { Trophy, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpToastProps {
  level: number;
  title: string;
  reward: string;
  onClose: () => void;
}

export const LevelUpToast: React.FC<LevelUpToastProps> = ({
  level,
  title,
  reward,
  onClose,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
    });

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="mc-panel p-4 bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 border-2 border-lime-500 shadow-[0_0_30px_rgba(132,204,22,0.4)] flex items-center gap-4 max-w-md">
        <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shrink-0 animate-bounce">
          <Crown className="w-7 h-7 fill-amber-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 font-pixel text-xs text-lime-400 font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>YANGI DARAJA (LEVEL UP)!</span>
          </div>

          <h3 className="font-pixel text-base text-white font-extrabold mt-0.5">
            Daraja {level}: <span className="text-amber-300">{title}</span>
          </h3>

          <p className="text-xs text-stone-300 mt-1 font-pixel">
            🎁 Mukofot: <span className="text-lime-300">{reward}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="mc-button px-2.5 py-1 text-xs font-pixel text-stone-300 hover:text-white"
        >
          OK
        </button>
      </div>
    </div>
  );
};
