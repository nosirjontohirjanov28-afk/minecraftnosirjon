import React from 'react';
import { Skull, RefreshCw, Trophy, Heart } from 'lucide-react';
import { sound } from '../services/soundEngine';

interface DeathScreenProps {
  reason: string;
  level: number;
  xp: number;
  onRespawn: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({
  reason,
  level,
  xp,
  onRespawn,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="mc-panel w-full max-w-md p-6 text-center border-4 border-red-700 shadow-[0_0_50px_rgba(220,38,38,0.7)] bg-gradient-to-b from-stone-950 via-stone-900 to-red-950">
        <div className="w-16 h-16 mx-auto mb-3 bg-red-900/60 border-2 border-red-500 flex items-center justify-center text-red-400 animate-bounce">
          <Skull className="w-10 h-10" />
        </div>

        <h1 className="font-pixel text-2xl sm:text-3xl text-red-500 font-extrabold tracking-wider drop-shadow-[0_2px_4px_#000]">
          SIZ HALOK BOʻLDINGIZ!
        </h1>

        <p className="font-pixel text-xs text-stone-300 mt-2 mb-4 bg-red-950/40 p-2 border border-red-900/50">
          Sabab: <span className="text-amber-400">{reason || "TNT Portlashi"}</span>
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-4 text-xs font-pixel mb-6 bg-stone-950 p-2.5 border border-stone-800">
          <div className="flex items-center gap-1.5 text-lime-400">
            <Trophy className="w-4 h-4" />
            <span>Daraja: {level}</span>
          </div>
          <div className="text-stone-500">|</div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <Heart className="w-4 h-4 text-red-500" />
            <span>XP: {xp}</span>
          </div>
        </div>

        {/* Respawn Button */}
        <button
          onClick={() => {
            sound.playLevelUp();
            onRespawn();
          }}
          className="mc-button mc-button-green w-full py-3 font-pixel text-sm text-white flex items-center justify-center gap-2 font-bold tracking-wide hover:scale-105 active:scale-95 transition-transform"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>QAYTA TIRILISH (RESPAWN)</span>
        </button>
      </div>
    </div>
  );
};
