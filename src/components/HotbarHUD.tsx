import React from 'react';
import { HotbarItem } from '../types/minecraft';
import {
  Heart,
  Zap,
  Shield,
  Flashlight,
  Hammer,
  Moon,
  Volume2,
  VolumeX,
  Play,
  HelpCircle,
  Sword,
  Wand2,
  Box,
  Flame,
  Gem,
  Columns,
  Square,
  Magnet,
  Trophy,
  ArrowDown,
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface HotbarHUDProps {
  items: HotbarItem[];
  selectedIndex: number;
  onSelectSlot: (index: number) => void;
  health: number;
  maxHealth: number;
  hunger: number;
  xpLevel: number;
  currentXp?: number;
  xpToNextLevel?: number;
  onOpenLevels?: () => void;
  isFlashlightOn: boolean;
  onToggleFlashlight: () => void;
  isBloodMoon: boolean;
  onToggleBloodMoon: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickBuild: () => void;
  onOpenServers: () => void;
  onOpenHorrorMods: () => void;
  onOpenFeatureMods: () => void;
  onDescend?: (active: boolean) => void;
  isDescendActive?: boolean;
}

export const HotbarHUD: React.FC<HotbarHUDProps> = ({
  items,
  selectedIndex,
  onSelectSlot,
  health,
  maxHealth,
  hunger,
  xpLevel,
  currentXp = 0,
  xpToNextLevel = 100,
  onOpenLevels,
  isFlashlightOn,
  onToggleFlashlight,
  isBloodMoon,
  onToggleBloodMoon,
  isMuted,
  onToggleMute,
  onQuickBuild,
  onOpenServers,
  onOpenHorrorMods,
  onOpenFeatureMods,
  onDescend,
  isDescendActive = false,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sword':
        return <Sword className="w-5 h-5 text-cyan-300" />;
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-amber-300 animate-pulse" />;
      case 'Square':
        return <Square className="w-5 h-5 text-emerald-400" />;
      case 'Box':
        return <Box className="w-5 h-5 text-stone-300" />;
      case 'Columns':
        return <Columns className="w-5 h-5 text-amber-700" />;
      case 'Gem':
        return <Gem className="w-5 h-5 text-cyan-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-red-500" />;
      case 'Wand2':
        return <Wand2 className="w-5 h-5 text-pink-400" />;
      case 'Magnet':
        return <Magnet className="w-5 h-5 text-purple-400" />;
      default:
        return <Box className="w-5 h-5 text-white" />;
    }
  };

  const selectedItem = items[selectedIndex];

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
      {/* Selected Item Label Popup */}
      {selectedItem && (
        <div className="font-pixel text-xs text-stone-100 bg-stone-900/90 border border-stone-700 px-3 py-1 shadow-md">
          {selectedItem.nameUz}
        </div>
      )}

      {/* Health & Hunger Bars */}
      <div className="w-[380px] max-w-[94vw] flex items-center justify-between px-1 drop-shadow">
        {/* Hearts */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-3.5 h-3.5 ${
                i < health / 2
                  ? isBloodMoon
                    ? 'fill-red-600 text-red-700'
                    : 'fill-red-500 text-red-600'
                  : 'text-stone-700 fill-stone-900'
              }`}
            />
          ))}
        </div>

        {/* Armor & Hunger */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border border-stone-900 ${
                i < hunger / 2 ? 'bg-amber-600' : 'bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* XP Bar */}
      <button
        onClick={() => {
          sound.playStep();
          onOpenLevels?.();
        }}
        className="relative w-[380px] max-w-[94vw] h-2.5 bg-stone-900 border border-stone-800 cursor-pointer group hover:border-lime-500 transition-colors"
        title="Darajalar va Kvestlar (Bosing)"
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-lime-400"
          style={{ width: `${Math.min(100, Math.round((currentXp / Math.max(1, xpToNextLevel)) * 100))}%` }}
        />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 font-pixel text-[11px] text-lime-400 font-bold drop-shadow-[0_1px_2px_#000] group-hover:scale-110 transition-transform">
          {xpLevel}
        </span>
      </button>

      {/* 9 Hotbar Slots */}
      <div className="flex items-center gap-1 p-1 bg-stone-950/80 border-2 border-stone-800 rounded-sm">
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              onClick={() => {
                onSelectSlot(index);
                sound.playStep();
              }}
              className={`relative w-10 h-10 flex items-center justify-center transition-all ${
                isSelected
                  ? 'mc-slot-selected bg-stone-700'
                  : 'mc-slot hover:bg-stone-700/80'
              }`}
            >
              {getIcon(item.icon)}

              {/* Count badge */}
              {item.count && (
                <span className="absolute bottom-0.5 right-1 font-pixel text-[10px] text-white drop-shadow-[0_1px_1px_#000]">
                  {item.count}
                </span>
              )}

              {/* Slot Number */}
              <span className="absolute top-0.5 left-1 font-pixel text-[9px] text-stone-400">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fast Control Bar below Hotbar */}
      <div className="flex items-center gap-2 pt-1 font-pixel text-[11px]">
        {onOpenLevels && (
          <button
            onClick={onOpenLevels}
            className="mc-button mc-button-green px-2.5 py-1 text-lime-300 flex items-center gap-1.5"
            title="Darajalar va Kvestlar"
          >
            <Trophy className="w-3.5 h-3.5 text-lime-400" />
            <span>Lvl {xpLevel}</span>
          </button>
        )}

        <button
          onClick={onOpenServers}
          className="mc-button px-2.5 py-1 text-cyan-300 flex items-center gap-1.5"
          title="Serverlar roʻyxati"
        >
          <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span>Serverlar</span>
        </button>

        <button
          onClick={onOpenHorrorMods}
          className={`mc-button px-2.5 py-1 flex items-center gap-1.5 ${
            isBloodMoon ? 'mc-button-red text-red-200' : 'text-rose-400'
          }`}
          title="Qoʻrqinchli modlar"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Horror Modlar</span>
        </button>

        <button
          onClick={onOpenFeatureMods}
          className="mc-button px-2.5 py-1 text-amber-300 flex items-center gap-1.5"
          title="Xususiyatli modlar"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Xususiyatlar</span>
        </button>

        <button
          onClick={onQuickBuild}
          className="mc-button px-2 py-1 text-emerald-300"
          title="1-Click Mega-Bino (K)"
        >
          <Hammer className="w-3.5 h-3.5" />
        </button>

        {onDescend && (
          <button
            onMouseDown={() => onDescend(true)}
            onMouseUp={() => onDescend(false)}
            onTouchStart={() => onDescend(true)}
            onTouchEnd={() => onDescend(false)}
            className={`mc-button px-2.5 py-1 font-pixel text-xs flex items-center gap-1 ${
              isDescendActive ? 'bg-amber-600 text-white shadow-inner' : 'text-amber-300'
            }`}
            title="Pastga Tushish / Qonish / Sneak (Shift / C)"
          >
            <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pasga (Down)</span>
          </button>
        )}

        <button
          onClick={onToggleFlashlight}
          className={`mc-button px-2 py-1 ${
            isFlashlightOn ? 'text-amber-300 bg-amber-950/60' : 'text-stone-400'
          }`}
          title="Fonar / Fonarik (F)"
        >
          <Flashlight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleBloodMoon}
          className={`mc-button px-2 py-1 ${
            isBloodMoon ? 'mc-button-red text-red-300' : 'text-stone-400'
          }`}
          title="Qonli Oy (Blood Moon)"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleMute}
          className="mc-button px-2 py-1 text-stone-300"
          title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
