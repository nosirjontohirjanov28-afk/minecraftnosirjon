import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pickaxe, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface MobileControlsProps {
  onDirectionPress: (dir: 'forward' | 'backward' | 'left' | 'right', isPressed: boolean) => void;
  onJumpPress: (isPressed: boolean) => void;
  onDescendPress: (isPressed: boolean) => void;
  onBreakClick: () => void;
  onPlaceClick: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionPress,
  onJumpPress,
  onDescendPress,
  onBreakClick,
  onPlaceClick,
}) => {
  return (
    <div className="md:hidden pointer-events-none fixed inset-0 z-30 flex justify-between items-end p-4 pb-20 select-none">
      {/* D-Pad on Left */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 w-36 h-36">
        <div />
        <button
          onTouchStart={() => onDirectionPress('forward', true)}
          onTouchEnd={() => onDirectionPress('forward', false)}
          className="mc-button flex items-center justify-center text-white active:bg-stone-700"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onTouchStart={() => onDirectionPress('left', true)}
          onTouchEnd={() => onDirectionPress('left', false)}
          className="mc-button flex items-center justify-center text-white active:bg-stone-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mc-slot flex items-center justify-center bg-stone-900 border-none" />
        <button
          onTouchStart={() => onDirectionPress('right', true)}
          onTouchEnd={() => onDirectionPress('right', false)}
          className="mc-button flex items-center justify-center text-white active:bg-stone-700"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          onTouchStart={() => onDirectionPress('backward', true)}
          onTouchEnd={() => onDirectionPress('backward', false)}
          className="mc-button flex items-center justify-center text-white active:bg-stone-700"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Action buttons on Right */}
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <button
          onClick={onBreakClick}
          className="mc-button mc-button-red w-12 h-12 flex items-center justify-center text-white"
          title="Sindirish"
        >
          <Pickaxe className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlaceClick}
            className="mc-button mc-button-green w-12 h-12 flex items-center justify-center text-white"
            title="Qoʻyish"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => onJumpPress(true)}
            onTouchEnd={() => onJumpPress(false)}
            className="mc-button mc-button-gold w-12 h-12 flex items-center justify-center text-white"
            title="Sakrash / Uchish"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
