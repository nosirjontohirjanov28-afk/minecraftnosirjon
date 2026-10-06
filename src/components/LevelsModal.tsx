import React, { useState } from 'react';
import { LevelTier, PlayerQuest, PlayerProgress } from '../types/minecraft';
import { LEVEL_TIERS } from '../data/minecraftData';
import {
  X,
  Trophy,
  Crown,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  Pickaxe,
  Hammer,
  Skull,
  Rocket,
  Shield,
  Zap,
  Gem,
  Ghost,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/soundEngine';

interface LevelsModalProps {
  progress: PlayerProgress;
  quests: PlayerQuest[];
  onClaimQuest: (questId: string) => void;
  onClose: () => void;
}

export const LevelsModal: React.FC<LevelsModalProps> = ({
  progress,
  quests,
  onClaimQuest,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'quests'>('roadmap');

  const getTierIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'Skull':
        return <Skull className="w-5 h-5 text-red-400" />;
      case 'Gem':
        return <Gem className="w-5 h-5 text-cyan-400" />;
      case 'Ghost':
        return <Ghost className="w-5 h-5 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-amber-300" />;
      default:
        return <Shield className="w-5 h-5 text-stone-300" />;
    }
  };

  const getQuestIcon = (iconName: string) => {
    switch (iconName) {
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5 text-amber-400" />;
      case 'Pickaxe':
        return <Pickaxe className="w-5 h-5 text-stone-300" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-orange-400" />;
      case 'Skull':
        return <Skull className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  // Find current tier title
  const currentTier =
    [...LEVEL_TIERS].reverse().find((t) => progress.level >= t.level) || LEVEL_TIERS[0];

  const nextTier = LEVEL_TIERS.find((t) => t.level > progress.level);

  // Progress percentage to next level
  const percentToNext = Math.min(
    100,
    Math.round((progress.currentXp / progress.xpToNextLevel) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="mc-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-stone-100 border-lime-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-900/80 border-2 border-emerald-500 flex items-center justify-center text-lime-400 font-pixel text-xl font-bold">
              {progress.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base text-lime-400">
                  Darajalar & Kvestlar (Level Progression)
                </h2>
                <span className="font-pixel text-xs text-amber-300">
                  [{currentTier.titleUz}]
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Bloklar sindiring, kvestlarni bajaring va yangi darajalar hamda mukofotlarni oching!
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

        {/* Level Stats Bar */}
        <div className="p-3.5 bg-stone-900 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <div className="flex justify-between font-pixel text-xs mb-1">
              <span className="text-stone-300">
                Daraja {progress.level}: <span className="text-amber-400">{currentTier.titleUz}</span>
              </span>
              <span className="text-lime-400">
                {progress.currentXp} / {progress.xpToNextLevel} XP ({percentToNext}%)
              </span>
            </div>
            <div className="h-3 w-full bg-stone-950 border border-stone-700 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-lime-400 transition-all duration-300"
                style={{ width: `${percentToNext}%` }}
              />
            </div>
          </div>

          {nextTier && (
            <div className="sm:border-l sm:border-stone-700 sm:pl-3 font-pixel text-[11px] text-stone-400">
              Keyingi Unvon: <span className="text-amber-300 block">{nextTier.titleUz} (Lvl {nextTier.level})</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950 px-4 text-xs font-pixel">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-2 px-4 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'border-lime-500 text-lime-400 bg-stone-900/50'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Darajalar Xaritasi (Roadmap)</span>
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`py-2 px-4 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'quests'
                ? 'border-lime-500 text-lime-400 bg-stone-900/50'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vazifalar & Kvestlar ({quests.filter((q) => q.completed && !q.claimed).length} Yangi)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'roadmap' ? (
            /* Roadmap list */
            <div className="space-y-3">
              {LEVEL_TIERS.map((tier) => {
                const isReached = progress.level >= tier.level;
                const isCurrent = currentTier.level === tier.level;

                return (
                  <div
                    key={tier.level}
                    className={`p-3.5 border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-lime-500 bg-lime-950/20 shadow-[0_0_12px_rgba(132,204,22,0.15)]'
                        : isReached
                        ? 'border-stone-700 bg-stone-900/70'
                        : 'border-stone-800 bg-stone-950/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 shrink-0 border flex items-center justify-center font-pixel text-sm font-bold ${
                          isReached
                            ? 'bg-emerald-950 border-emerald-500 text-lime-400'
                            : 'bg-stone-900 border-stone-800 text-stone-600'
                        }`}
                      >
                        {getTierIcon(tier.rewardIcon)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs text-amber-400">
                            Daraja {tier.level}:
                          </span>
                          <h4 className="font-pixel text-sm text-stone-100 font-bold">
                            {tier.titleUz}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-300 mt-0.5">
                          🎁 Mukofot: <span className="text-lime-300 font-pixel">{tier.rewardUz}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 font-pixel text-xs">
                      {isCurrent ? (
                        <span className="px-2.5 py-1 bg-lime-950 border border-lime-500 text-lime-300">
                          HOZIRGI DARAJA
                        </span>
                      ) : isReached ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>OCHILDI</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-stone-500">
                          <Lock className="w-4 h-4" />
                          <span>{tier.requiredXp} XP kerak</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Quests tab */
            <div className="space-y-3">
              {quests.map((quest) => {
                const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      quest.claimed
                        ? 'border-stone-800 bg-stone-950/50 opacity-60'
                        : quest.completed
                        ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'border-stone-800 bg-stone-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 shrink-0 bg-stone-950 border border-stone-800 flex items-center justify-center">
                        {getQuestIcon(quest.icon)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-pixel text-sm text-stone-100 font-bold">
                            {quest.titleUz}
                          </h4>
                          <span className="text-xs font-pixel text-lime-400">
                            +{quest.xpReward} XP
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {quest.descriptionUz}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <div className="h-2 w-36 bg-stone-950 border border-stone-700 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="font-pixel text-[11px] text-stone-300">
                            {quest.progress} / {quest.target}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center font-pixel text-xs">
                      {quest.claimed ? (
                        <span className="text-stone-500 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Olingan</span>
                        </span>
                      ) : quest.completed ? (
                        <button
                          onClick={() => {
                            confetti({ particleCount: 30, spread: 50 });
                            sound.playLevelUp();
                            onClaimQuest(quest.id);
                          }}
                          className="mc-button mc-button-green px-3.5 py-1.5 text-white flex items-center gap-1 animate-pulse"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Mukofotni Olish</span>
                        </button>
                      ) : (
                        <span className="text-stone-400">
                          Bajarilmoqda ({percent}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
