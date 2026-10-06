import React from 'react';
import { HorrorMod } from '../types/minecraft';
import {
  X,
  Skull,
  Eye,
  CloudFog,
  Radio,
  Biohazard,
  Maximize2,
  Volume2,
  Flame,
  AlertTriangle,
  Moon,
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface HorrorModsModalProps {
  mods: HorrorMod[];
  onToggleMod: (id: string) => void;
  onDisableAll?: () => void;
  onClose: () => void;
  onTestJumpscare: (name: string) => void;
  isBloodMoon: boolean;
  onToggleBloodMoon: () => void;
}

export const HorrorModsModal: React.FC<HorrorModsModalProps> = ({
  mods,
  onToggleMod,
  onDisableAll,
  onClose,
  onTestJumpscare,
  isBloodMoon,
  onToggleBloodMoon,
}) => {
  const getModIcon = (icon: string) => {
    switch (icon) {
      case 'Eye':
        return <Eye className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'CloudFog':
        return <CloudFog className="w-5 h-5 text-purple-400" />;
      case 'Skull':
        return <Skull className="w-5 h-5 text-rose-500" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-orange-500" />;
      case 'Biohazard':
        return <Biohazard className="w-5 h-5 text-purple-500" />;
      case 'Maximize2':
        return <Maximize2 className="w-5 h-5 text-yellow-500" />;
      default:
        return <Skull className="w-5 h-5 text-red-500" />;
    }
  };

  const handleTestAudio = (theme: HorrorMod['audioTheme']) => {
    if (theme === 'whispers' || theme === 'static') {
      sound.playHorrorDrone();
    } else if (theme === 'heartbeat') {
      sound.playHorrorHeartbeat();
    } else if (theme === 'screech' || theme === 'siren') {
      sound.playThunder();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="mc-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-stone-100 border-red-950">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/60 bg-gradient-to-r from-red-950 via-stone-900 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-950 border border-red-700 flex items-center justify-center text-red-500">
              <Skull className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-pixel text-base text-red-400 flex items-center gap-2">
                <span>Dahshatli Horror Modlar</span>
                <span className="text-[10px] text-red-500 uppercase tracking-widest">[HARDCORE]</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Minecraft olamiga Herobrine, tuman maxluqi va qoʻrqinchli mavjudotlarni qoʻshish
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

        {/* Global Horror Controls (Blood Moon trigger & Disable all) */}
        <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-pixel text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Qonli Oy (Blood Moon):</span>
            <span className="text-stone-300">{isBloodMoon ? 'FAOL (QIZIL TUMAN)' : "O'CHIK"}</span>
          </div>

          <div className="flex items-center gap-2">
            {onDisableAll && (
              <button
                onClick={() => {
                  onDisableAll();
                  sound.playStep();
                }}
                className="mc-button mc-button-green px-3 py-1 font-pixel text-xs text-white flex items-center gap-1"
                title="Barcha horror modlarni butunlay o'chirish"
              >
                <span>🛡 Hammasini Oʻchirish (Yoʻq Qilish)</span>
              </button>
            )}

            <button
              onClick={() => {
                onToggleBloodMoon();
                sound.playThunder();
              }}
              className={`mc-button px-3 py-1 font-pixel text-xs flex items-center gap-1.5 ${
                isBloodMoon ? 'mc-button-red text-white' : 'text-stone-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{isBloodMoon ? "Qonli Oyni To'xtatish" : "Qonli Oyni Chaqlash"}</span>
            </button>
          </div>
        </div>

        {/* Mods List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {mods.map((mod) => (
            <div
              key={mod.id}
              className={`p-3.5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                mod.enabled
                  ? 'border-red-600/80 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                  : 'border-stone-800 bg-stone-900/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 bg-stone-950 border border-stone-800 flex items-center justify-center">
                  {getModIcon(mod.icon)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-pixel text-sm text-stone-100 font-bold">
                      {mod.name}
                    </h3>
                    <span className="text-xs text-red-400 font-pixel">({mod.alias})</span>
                  </div>

                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {mod.descriptionUz}
                  </p>

                  <div className="mt-2 text-[11px] text-stone-300 flex items-center gap-2">
                    <span className="text-red-400 font-pixel">Xavf Darajasi:</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skull
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < mod.dangerLevel ? 'text-red-500 fill-red-500' : 'text-stone-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span aria-hidden="true" className="text-stone-600">·</span>
                    <span className="text-amber-400/90 font-pixel">{mod.activeFeatureUz}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Sound Test & Toggle */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleTestAudio(mod.audioTheme)}
                  className="mc-button px-2.5 py-1.5 font-pixel text-xs text-stone-300 flex items-center gap-1"
                  title="Horror Ovozni Eshitish"
                >
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Ovoz</span>
                </button>

                <button
                  onClick={() => {
                    sound.playHorrorHeartbeat();
                    onTestJumpscare(mod.name);
                  }}
                  className="mc-button mc-button-red px-2.5 py-1.5 font-pixel text-xs text-white flex items-center gap-1"
                  title="Jumpscare sinab koʻrish"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Jumpscare</span>
                </button>

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
