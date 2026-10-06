import React from 'react';
import { PlayerSkin } from '../types/minecraft';
import { SKINS } from '../data/minecraftData';
import { X, Check, Sparkles, Shield, Skull } from 'lucide-react';
import { sound } from '../services/soundEngine';

interface SkinSelectorModalProps {
  currentSkinId: string;
  onSelectSkin: (skinId: string) => void;
  onClose: () => void;
}

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({
  currentSkinId,
  onSelectSkin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="mc-panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-stone-100 border-cyan-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900">
          <div>
            <h2 className="font-pixel text-base text-cyan-400">
              Personaj & Skin Tanlash
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              O'yindagi tashqi ko'rinishingizni tanlang (Steve, Herobrine, Olmos Ritsar...)
            </p>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SKINS.map((skin) => {
            const isSelected = currentSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`p-3.5 border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Skin Avatar Preview Box */}
                  <div className="w-12 h-16 border-2 border-stone-700 bg-stone-950 flex flex-col items-center justify-center p-1">
                    {/* Head */}
                    <div
                      className="w-6 h-6 border border-stone-900 relative"
                      style={{ backgroundColor: skin.headColor }}
                    >
                      {/* Eyes */}
                      <div
                        className="absolute bottom-1 left-0.5 w-1.5 h-1"
                        style={{ backgroundColor: skin.eyesColor }}
                      />
                      <div
                        className="absolute bottom-1 right-0.5 w-1.5 h-1"
                        style={{ backgroundColor: skin.eyesColor }}
                      />
                    </div>
                    {/* Body */}
                    <div
                      className="w-7 h-5 border border-stone-900 mt-0.5"
                      style={{ backgroundColor: skin.bodyColor }}
                    />
                    {/* Legs */}
                    <div
                      className="w-6 h-4 border border-stone-900 mt-0.5"
                      style={{ backgroundColor: skin.legsColor }}
                    />
                  </div>

                  <div>
                    <h3 className="font-pixel text-sm text-stone-100 font-bold">
                      {skin.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                      {skin.category === 'horror' ? (
                        <Skull className="w-3.5 h-3.5 text-red-400" />
                      ) : skin.category === 'warrior' ? (
                        <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className="capitalize">{skin.category}</span>
                      {skin.isSpecial && (
                        <span className="text-[10px] text-red-400 font-pixel font-bold">
                          [MAXSUS]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playStep();
                    onSelectSkin(skin.id);
                  }}
                  className={`mc-button px-3 py-1.5 font-pixel text-xs flex items-center gap-1 ${
                    isSelected ? 'mc-button-green text-white' : 'text-stone-300'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tanlandi</span>
                    </>
                  ) : (
                    <span>Tanlash</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
