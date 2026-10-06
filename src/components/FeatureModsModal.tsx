import React from 'react';
import { FeatureMod } from '../types/minecraft';
import {
  X,
  HelpCircle,
  Rocket,
  Magnet,
  Wand2,
  Crosshair,
  Scan,
  Hammer,
  Sparkles,
  Zap,
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface FeatureModsModalProps {
  mods: FeatureMod[];
  onToggleMod: (id: string) => void;
  onClose: () => void;
}

export const FeatureModsModal: React.FC<FeatureModsModalProps> = ({
  mods,
  onToggleMod,
  onClose,
}) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-amber-400" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-cyan-400" />;
      case 'Magnet':
        return <Magnet className="w-5 h-5 text-purple-400" />;
      case 'Wand2':
        return <Wand2 className="w-5 h-5 text-pink-400" />;
      case 'Crosshair':
        return <Crosshair className="w-5 h-5 text-emerald-400" />;
      case 'Scan':
        return <Scan className="w-5 h-5 text-sky-400" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-orange-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="mc-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-stone-100 border-amber-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-gradient-to-r from-amber-950/80 via-stone-900 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-pixel text-base text-amber-400 flex items-center gap-2">
                <span>Xususiyatli & Sehrli Modlar</span>
                <span className="text-[10px] text-amber-500 uppercase tracking-widest">[SPECIAL POWERS]</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Lucky Block, Jetpack, Gravitatsiya quroli, Sehrli hassa va 1-Click bino quruvchi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mc-button p-1.5 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mods List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {mods.map((mod) => (
            <div
              key={mod.id}
              className={`p-3.5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                mod.enabled
                  ? 'border-amber-500/80 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                  : 'border-stone-800 bg-stone-900/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 bg-stone-950 border border-stone-800 flex items-center justify-center">
                  {getIcon(mod.icon)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-pixel text-sm text-stone-100 font-bold">
                      {mod.name}
                    </h3>
                    <span className="text-xs text-amber-400 font-pixel">[{mod.categoryUz}]</span>
                  </div>

                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {mod.descriptionUz}
                  </p>

                  <div className="mt-2 text-[11px] text-stone-300 flex items-center gap-2">
                    <span className="text-cyan-400 font-pixel">Qobiliyat:</span>
                    <span className="text-stone-300">{mod.powerAbilityUz}</span>
                    <span aria-hidden="true" className="text-stone-600">·</span>
                    <span className="text-amber-300 font-pixel bg-stone-950 px-1.5 py-0.5 border border-stone-800">
                      Tugma: {mod.hotkey}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toggle */}
              <div className="shrink-0 self-end md:self-center">
                <button
                  onClick={() => {
                    sound.playStep();
                    onToggleMod(mod.id);
                  }}
                  className={`mc-button px-4 py-1.5 font-pixel text-xs ${
                    mod.enabled
                      ? 'mc-button-green text-white font-bold'
                      : 'text-stone-400'
                  }`}
                >
                  {mod.enabled ? '✓ FAOL (ON)' : "O'CHIK (OFF)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
