import React from 'react';
import { GameServer } from '../types/minecraft';
import {
  Gamepad2,
  Globe,
  Zap,
  Skull,
  User,
  HelpCircle,
  Activity,
  Layers,
  Trophy,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface MasterHeaderProps {
  currentServer: GameServer;
  playerLevel: number;
  onOpenLevels: () => void;
  onOpenServers: () => void;
  onOpenHorrorMods: () => void;
  onOpenFeatureMods: () => void;
  onOpenSkins: () => void;
  onOpenHelp: () => void;
  activeHorrorCount: number;
  activeFeatureCount: number;
  onDisableAllHorror?: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  currentServer,
  playerLevel,
  onOpenLevels,
  onOpenServers,
  onOpenHorrorMods,
  onOpenFeatureMods,
  onOpenSkins,
  onOpenHelp,
  activeHorrorCount,
  activeFeatureCount,
  onDisableAllHorror,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-3 py-2 bg-stone-950/90 border-b border-stone-800 backdrop-blur-sm flex items-center justify-between pointer-events-auto">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-pixel text-sm sm:text-base font-bold tracking-wider">
          <span className="text-emerald-400">MINECRAFT</span>
          <span className="text-amber-400">MASTER</span>
          <span className="hidden sm:inline-block text-[10px] text-stone-400 ml-1 font-normal font-sans">
            v1.21 PRO
          </span>
        </div>

        {/* Current Server Indicator */}
        <button
          onClick={() => {
            sound.playStep();
            onOpenServers();
          }}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 border border-stone-700 hover:border-amber-400 transition-colors text-xs font-pixel"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-stone-300 truncate max-w-[150px]">{currentServer.name}</span>
          <span className="text-emerald-400 text-[10px]">{currentServer.pingMs}ms</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex items-center gap-1.5">
        <button
          onClick={() => {
            sound.playStep();
            onOpenLevels();
          }}
          className="mc-button mc-button-green px-2.5 py-1 font-pixel text-xs text-lime-300 flex items-center gap-1.5 font-bold"
          title="Darajalar va Kvestlar"
        >
          <Trophy className="w-3.5 h-3.5 text-lime-400" />
          <span>Lvl {playerLevel}</span>
        </button>

        <button
          onClick={() => {
            sound.playStep();
            onOpenServers();
          }}
          className="mc-button px-2.5 py-1 font-pixel text-xs text-cyan-300 flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Serverlar</span>
        </button>

        {activeHorrorCount === 0 ? (
          <button
            onClick={() => {
              sound.playStep();
              onOpenHorrorMods();
            }}
            className="mc-button px-2.5 py-1 font-pixel text-xs text-emerald-300 flex items-center gap-1.5"
            title="Horror modlar o'chirilgan (Tinch rejim)"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tinch Rejim (Horror Yoʻq)</span>
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playStep();
                onOpenHorrorMods();
              }}
              className="mc-button px-2.5 py-1 font-pixel text-xs text-rose-300 flex items-center gap-1.5"
            >
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Horror</span>
              <span className="text-[10px] text-rose-400 font-bold">
                ({activeHorrorCount})
              </span>
            </button>
            {onDisableAllHorror && (
              <button
                onClick={() => {
                  sound.playStep();
                  onDisableAllHorror();
                }}
                className="mc-button mc-button-red px-2 py-1 font-pixel text-[10px] text-white"
                title="Horror modlarni butunlay yo'q qilish"
              >
                Yoʻqolsin ✕
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => {
            sound.playStep();
            onOpenFeatureMods();
          }}
          className="mc-button px-2.5 py-1 font-pixel text-xs text-amber-300 flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Xususiyatlar</span>
          {activeFeatureCount > 0 && (
            <span className="text-[10px] text-amber-400 font-bold">
              ({activeFeatureCount})
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sound.playStep();
            onOpenSkins();
          }}
          className="mc-button px-2.5 py-1 font-pixel text-xs text-stone-200 flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-stone-300" />
          <span className="hidden sm:inline">Skin</span>
        </button>

        <button
          onClick={() => {
            sound.playStep();
            onOpenHelp();
          }}
          className="mc-button px-2 py-1 text-stone-400 hover:text-white"
          title="Boshqaruv va Yordam"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </nav>
    </header>
  );
};
