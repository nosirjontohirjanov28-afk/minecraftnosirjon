import React, { useEffect, useState } from 'react';

interface JumpscareOverlayProps {
  entityName: string;
  onFinish: () => void;
}

export const JumpscareOverlay: React.FC<JumpscareOverlayProps> = ({
  entityName,
  onFinish,
}) => {
  const [glitchPhase, setGlitchPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchPhase((p) => p + 1);
    }, 120);

    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-black/95 select-none animate-in fade-in duration-75">
      {/* Glitch scanlines */}
      <div
        className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.85)_50%)] bg-[length:100%_4px]"
      />

      {/* Red ambient strobe */}
      <div
        className={`absolute inset-0 transition-opacity duration-75 ${
          glitchPhase % 2 === 0 ? 'bg-red-950/70' : 'bg-black'
        }`}
      />

      {/* Terrifying Entity Face Simulation */}
      <div className="relative flex flex-col items-center justify-center scale-125 transition-transform duration-100">
        {/* Glowing Eyes */}
        <div className="flex items-center gap-16 mb-4">
          <div className="w-14 h-9 bg-white shadow-[0_0_50px_#ffffff] rounded-sm animate-pulse" />
          <div className="w-14 h-9 bg-white shadow-[0_0_50px_#ffffff] rounded-sm animate-pulse" />
        </div>

        {/* Teeth / Scream Void */}
        <div className="w-36 h-20 bg-black border-4 border-red-900 rounded-lg flex items-center justify-center">
          <div className="font-pixel text-4xl text-red-600 font-bold tracking-tighter">
            Ψ ☠ Ψ
          </div>
        </div>

        {/* Warning text */}
        <div className="mt-8 font-pixel text-2xl text-red-500 font-black tracking-widest drop-shadow-[0_0_20px_#dc2626]">
          {entityName} SIZNI TOPDI!
        </div>
      </div>
    </div>
  );
};
