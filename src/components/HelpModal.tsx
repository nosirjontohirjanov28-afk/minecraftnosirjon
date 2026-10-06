import React from 'react';
import { X, Keyboard, Mouse, Zap, Shield, Sparkles, Terminal } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="mc-panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-stone-100 border-stone-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-base text-amber-400">
              Minecraft Master Boshqaruvi va Qoʻllanma
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Controls Grid */}
          <div>
            <h3 className="font-pixel text-sm text-stone-200 mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Klaviatura va Sichqoncha Boshqaruvi</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Harakat:</span>
                <span className="font-pixel text-amber-300">W, A, S, D</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Sakrash / Parvoz:</span>
                <span className="font-pixel text-amber-300">Space (Boʻshliq)</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Blokni sindirish:</span>
                <span className="font-pixel text-amber-300">Sichqoncha Chap Tugma</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Blok qoʻyish:</span>
                <span className="font-pixel text-amber-300">Sichqoncha Oʻng Tugma</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Hotbar tanlash:</span>
                <span className="font-pixel text-amber-300">1 dan 9 gacha</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">1-Click Bino / Bunker:</span>
                <span className="font-pixel text-emerald-400">K Tugmasi</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Fonarik (Yorugʻlik):</span>
                <span className="font-pixel text-amber-300">F Tugmasi</span>
              </div>
              <div className="p-2.5 bg-stone-950/80 border border-stone-800 flex justify-between">
                <span className="text-stone-400">Chatni ochish:</span>
                <span className="font-pixel text-cyan-300">T Tugmasi</span>
              </div>
            </div>
          </div>

          {/* Commands */}
          <div>
            <h3 className="font-pixel text-sm text-stone-200 mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Chat Buyruqlari (Commands)</span>
            </h3>
            <div className="space-y-1.5 bg-stone-950/80 p-3 border border-stone-800 font-pixel text-[11px]">
              <div><span className="text-amber-400">/help</span> - Barcha mavjud buyruqlar</div>
              <div><span className="text-amber-400">/lucky</span> - 5 ta Lucky Block yaratish</div>
              <div><span className="text-amber-400">/bloodmoon</span> - Qonli Oy dahshatini yoqish/oʻchirish</div>
              <div><span className="text-amber-400">/castle</span> - 1 tugma bilan qasr qurish</div>
              <div><span className="text-amber-400">/herobrine</span> - Herobrineni chaqirish</div>
              <div><span className="text-amber-400">/clear</span> - Chatni tozalash</div>
            </div>
          </div>

          {/* Performance & Optimization */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-800 text-stone-300">
            <span className="font-pixel text-emerald-400 font-bold block mb-1">
              ⚡ Qotmaslik va Yuqori Tezlik (60+ FPS):
            </span>
            <p className="leading-relaxed">
              Dastur eng zamonaviy WebGL va InstancedMesh texnologiyasiga asoslangan boʻlib, grafikani optimallashtiradi va protsessorga ortiqcha yuk tushirmaydi. Oʻyin silliq, qotmasdan va barqaror 60-120 FPS bilan ishlaydi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
