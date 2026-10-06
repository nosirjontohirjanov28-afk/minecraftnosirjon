/**
 * Minecraft Master - Full 3D Voxel Sandbox, Multiplayer Servers & Horror Mods Engine
 * High Performance, 60+ FPS zero-lag optimization with Levels & Quests Progression
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GameServer,
  HorrorMod,
  FeatureMod,
  HotbarItem,
  ChatMessage,
  PlayerSkin,
  BlockType,
  PlayerProgress,
  PlayerQuest,
} from './types/minecraft';
import {
  INITIAL_SERVERS,
  HORROR_MODS,
  FEATURE_MODS,
  DEFAULT_HOTBAR,
  LEVEL_TIERS,
  INITIAL_QUESTS,
} from './data/minecraftData';
import { VoxelCanvas } from './components/VoxelCanvas';
import { HotbarHUD } from './components/HotbarHUD';
import { MasterHeader } from './components/MasterHeader';
import { ServersModal } from './components/ServersModal';
import { HorrorModsModal } from './components/HorrorModsModal';
import { FeatureModsModal } from './components/FeatureModsModal';
import { SkinSelectorModal } from './components/SkinSelectorModal';
import { HelpModal } from './components/HelpModal';
import { LevelsModal } from './components/LevelsModal';
import { LevelUpToast } from './components/LevelUpToast';
import { DeathScreen } from './components/DeathScreen';
import { ChatOverlay } from './components/ChatOverlay';
import { JumpscareOverlay } from './components/JumpscareOverlay';
import { MobileControls } from './components/MobileControls';
import { sound } from './services/soundEngine';

export default function App() {
  // State
  const [servers, setServers] = useState<GameServer[]>(INITIAL_SERVERS);
  const [currentServer, setCurrentServer] = useState<GameServer>(INITIAL_SERVERS[1]); // Default to Tashkent SMP
  const [horrorMods, setHorrorMods] = useState<HorrorMod[]>(HORROR_MODS);
  const [featureMods, setFeatureMods] = useState<FeatureMod[]>(FEATURE_MODS);
  const [hotbarItems, setHotbarItems] = useState<HotbarItem[]>(DEFAULT_HOTBAR);
  const [selectedHotbarIndex, setSelectedHotbarIndex] = useState<number>(1); // Lucky block selected
  const [playerSkinId, setPlayerSkinId] = useState<string>('steve');

  // Player Level & Quest Progression
  const [progress, setProgress] = useState<PlayerProgress>({
    level: 1,
    currentXp: 40,
    xpToNextLevel: 100,
    totalBlocksBroken: 0,
    luckyBlocksOpened: 0,
    structuresBuilt: 0,
    horrorEncounters: 0,
  });
  const [quests, setQuests] = useState<PlayerQuest[]>(INITIAL_QUESTS);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    title: string;
    reward: string;
  } | null>(null);

  // Gameplay state
  const [health, setHealth] = useState<number>(20);
  const [hunger, setHunger] = useState<number>(20);
  const [deathReason, setDeathReason] = useState<string | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);
  const [isBloodMoon, setIsBloodMoon] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDescendPressed, setIsDescendPressed] = useState<boolean>(false);
  const [jumpscareEntity, setJumpscareEntity] = useState<string | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'servers' | 'horror' | 'features' | 'skins' | 'help' | 'levels' | null
  >(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Server',
      text: "Minecraft Master Olamiga Xush Kelibsiz! Darajalar, Kvestlar va Horror modlar faol.",
      time: '12:00',
      isSystem: true,
      rank: 'ADMIN',
    },
    {
      id: '2',
      sender: 'JasurCraft',
      text: "Salom barchaga! 10-darajaga yetib Olmos Ritsar skinini ochdim!",
      time: '12:01',
      rank: 'PLAYER',
    },
    {
      id: '3',
      sender: 'Bekzod_UZ',
      text: "Lucky Blocklarni ehtiyotkorlik bilan ochinglar, katta XP beradi!",
      time: '12:02',
      rank: 'VIP',
    },
  ]);

  // Add XP and handle Level Up
  const addXp = useCallback((amount: number) => {
    setProgress((prev) => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let threshold = prev.xpToNextLevel;

      if (newXp >= threshold) {
        newXp = newXp - threshold;
        newLevel += 1;
        threshold = Math.round(threshold * 1.35 + 60);

        const tier =
          [...LEVEL_TIERS].reverse().find((t) => newLevel >= t.level) || LEVEL_TIERS[0];

        sound.playLevelUp();
        setLevelUpData({
          level: newLevel,
          title: tier.titleUz,
          reward: tier.rewardUz,
        });

        // Automatically unlock skins if eligible
        if (tier.unlockedSkinId) {
          setPlayerSkinId(tier.unlockedSkinId);
        }

        // Announce in chat
        setChatMessages((msgs) => [
          ...msgs,
          {
            id: `${Date.now()}-lvl`,
            sender: 'Daraja Tizimi',
            text: `🎉 TABRIKLAYMIZ! Siz ${newLevel}-DARAJAGA erishdingiz! [${tier.titleUz}] unvoni va yangi mukofotlar ochildi!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            rank: 'ADMIN',
          },
        ]);
      }

      return {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        xpToNextLevel: threshold,
      };
    });
  }, []);

  // Update Quest Progress helper
  const updateQuestProgress = useCallback((questId: string, delta: number = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          const newProg = Math.min(q.target, q.progress + delta);
          const isDone = newProg >= q.target;
          if (isDone) {
            sound.playLevelUp();
          }
          return { ...q, progress: newProg, completed: isDone };
        }
        return q;
      })
    );
  }, []);

  // Handle Block Breaking
  const handleBlockBroken = useCallback(
    (type: BlockType) => {
      setProgress((prev) => ({ ...prev, totalBlocksBroken: prev.totalBlocksBroken + 1 }));
      updateQuestProgress('quest-mining', 1);

      if (type === 'diamond_ore') {
        addXp(30);
      } else if (type === 'gold_ore' || type === 'redstone_ore') {
        addXp(18);
      } else if (type === 'stone') {
        addXp(6);
      } else {
        addXp(4);
      }
    },
    [addXp, updateQuestProgress]
  );

  // Handle Lucky Block Break
  const handleLuckyBreak = useCallback(
    (surprise: string) => {
      setProgress((prev) => ({ ...prev, luckyBlocksOpened: prev.luckyBlocksOpened + 1 }));
      updateQuestProgress('quest-lucky', 1);
      addXp(50);
    },
    [addXp, updateQuestProgress]
  );

  // Handle Structure Built (K key)
  const handleStructureBuilt = useCallback(() => {
    setProgress((prev) => ({ ...prev, structuresBuilt: prev.structuresBuilt + 1 }));
    updateQuestProgress('quest-builder', 1);
    addXp(120);
  }, [addXp, updateQuestProgress]);

  // Handle Horror Jumpscare / Stalker
  const handleTriggerJumpscare = useCallback(
    (entityName: string) => {
      setJumpscareEntity(entityName);
      setProgress((prev) => ({ ...prev, horrorEncounters: prev.horrorEncounters + 1 }));
      updateQuestProgress('quest-horror', 1);
      addXp(150);
    },
    [addXp, updateQuestProgress]
  );

  // Handle Take Damage from TNT, Traps, or Monsters
  const handleTakeDamage = useCallback((damage: number, reason: string) => {
    setHealth((prev) => {
      const next = Math.max(0, prev - damage);
      if (next <= 0) {
        setDeathReason(reason);
        setChatMessages((msgs) => [
          ...msgs,
          {
            id: `${Date.now()}-death`,
            sender: 'Tizim',
            text: `☠ Siz ${reason} oqibatida halok boʻldingiz!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            rank: 'ADMIN',
          },
        ]);
      }
      return next;
    });
  }, []);

  // Handle Healing
  const handleHeal = useCallback((amount: number) => {
    setHealth((prev) => Math.min(20, prev + amount));
  }, []);

  // Handle Respawn after death
  const handleRespawn = useCallback(() => {
    setHealth(20);
    setHunger(20);
    setDeathReason(null);
    setChatMessages((msgs) => [
      ...msgs,
      {
        id: `${Date.now()}-respawn`,
        sender: 'Tizim',
        text: "✨ Siz qayta tirildingiz! Joningiz toʻliq 20/20 ga tiklandi.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        rank: 'ADMIN',
      },
    ]);
  }, []);

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );
    addXp(quest.xpReward);
  };

  // Handle Chat message sending and command execution
  const handleSendMessage = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (text.startsWith('/')) {
      handleCommand(text, time);
      return;
    }

    const newMsg: ChatMessage = {
      id: `${Date.now()}`,
      sender: "Siz (O'yinchi)",
      text,
      time,
      rank: 'MVP+',
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const handleCommand = (cmd: string, time: string) => {
    const lower = cmd.toLowerCase().trim();

    if (lower === '/help') {
      addSystemMessage(
        "Mavjud buyruqlar: /lucky, /castle, /tinch, /peace, /day, /night, /level, /clear",
        time
      );
    } else if (lower === '/peace' || lower === '/nohorror' || lower === '/tinch') {
      handleDisableAllHorror();
    } else if (lower === '/lucky') {
      sound.playLuckyBlock();
      addSystemMessage("✨ 5x Lucky Block atrofingizga joylashtirildi!", time);
    } else if (lower === '/level') {
      setActiveModal('levels');
      addSystemMessage(`Sizning darajangiz: ${progress.level} (XP: ${progress.currentXp}/${progress.xpToNextLevel})`, time);
    } else if (lower === '/bloodmoon') {
      setIsBloodMoon((b) => !b);
      sound.playThunder();
      addSystemMessage(
        `Qonli Oy ${!isBloodMoon ? 'YOQILDI! Qizil tuman tushdi!' : "O'CHIRILDI."}`,
        time,
        true
      );
    } else if (lower === '/herobrine') {
      sound.playHorrorDrone();
      addSystemMessage("⚠ HEROBRINE OLAMGA TASHRIF BUYURDI... ORQANGIZGA QARANG!", time, true);
      handleTriggerJumpscare("HEROBRINE");
    } else if (lower === '/clear') {
      setChatMessages([]);
    } else if (lower === '/day') {
      setIsBloodMoon(false);
      addSystemMessage("Vaqt kunduzgiga o'zgartirildi.", time);
    } else if (lower === '/night') {
      setIsBloodMoon(true);
      addSystemMessage("Vaqt tunga o'zgartirildi.", time);
    } else {
      addSystemMessage(`Noma'lum buyruq: ${cmd}. Yordam uchun /help deb yozing.`, time);
    }
  };

  const addSystemMessage = (text: string, time: string, isHorror?: boolean) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        sender: 'Tizim',
        text,
        time,
        isSystem: true,
        isHorrorWarning: isHorror,
      },
    ]);
  };

  const handleAddExternalChatMessage = useCallback((sender: string, text: string, isHorror?: boolean) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        text,
        time,
        isHorrorWarning: isHorror,
      },
    ]);
  }, []);

  // Mod Toggles
  const handleToggleHorrorMod = (id: string) => {
    setHorrorMods((prev) =>
      prev.map((mod) => (mod.id === id ? { ...mod, enabled: !mod.enabled } : mod))
    );
  };

  const handleDisableAllHorror = useCallback(() => {
    setHorrorMods((prev) => prev.map((m) => ({ ...m, enabled: false })));
    setIsBloodMoon(false);
    setJumpscareEntity(null);
    sound.playStep();
    setChatMessages((msgs) => [
      ...msgs,
      {
        id: `${Date.now()}-peace`,
        sender: 'Tizim',
        text: "🛡 Horror modlar va qoʻrqinchli effektlar butunlay yoʻq qilindi (Tinch rejim faollashtirildi)!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        rank: 'ADMIN',
      },
    ]);
  }, []);

  const handleToggleFeatureMod = (id: string) => {
    setFeatureMods((prev) =>
      prev.map((mod) => (mod.id === id ? { ...mod, enabled: !mod.enabled } : mod))
    );
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      // 1-9 Hotbar selection
      const keyNum = parseInt(e.key);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
        setSelectedHotbarIndex(keyNum - 1);
        sound.playStep();
      }

      // Flashlight (F)
      if (e.code === 'KeyF') {
        setIsFlashlightOn((f) => !f);
        sound.playStep();
      }

      // Chat (T)
      if (e.code === 'KeyT') {
        e.preventDefault();
        setIsChatOpen((c) => !c);
      }

      // Mute (M)
      if (e.code === 'KeyM') {
        setIsMuted((m) => {
          const next = !m;
          sound.setMuted(next);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeHorrorCount = horrorMods.filter((m) => m.enabled).length;
  const activeFeatureCount = featureMods.filter((m) => m.enabled).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 text-stone-100 font-sans select-none">
      {/* Top Header */}
      <MasterHeader
        currentServer={currentServer}
        playerLevel={progress.level}
        onOpenLevels={() => setActiveModal('levels')}
        onOpenServers={() => setActiveModal('servers')}
        onOpenHorrorMods={() => setActiveModal('horror')}
        onOpenFeatureMods={() => setActiveModal('features')}
        onOpenSkins={() => setActiveModal('skins')}
        onOpenHelp={() => setActiveModal('help')}
        activeHorrorCount={activeHorrorCount}
        activeFeatureCount={activeFeatureCount}
        onDisableAllHorror={handleDisableAllHorror}
      />

      {/* 3D Voxel Sandbox Gameplay Engine */}
      <div className="w-full h-full pt-10">
        <VoxelCanvas
          currentServer={currentServer}
          activeHorrorMods={horrorMods}
          activeFeatureMods={featureMods}
          selectedHotbarItem={hotbarItems[selectedHotbarIndex]}
          onLuckyBreak={handleLuckyBreak}
          onBlockBroken={handleBlockBroken}
          onStructureBuilt={handleStructureBuilt}
          onTakeDamage={handleTakeDamage}
          onHeal={handleHeal}
          onChatMessage={handleAddExternalChatMessage}
          isBloodMoon={isBloodMoon}
          isFlashlightOn={isFlashlightOn}
          isDescendPressed={isDescendPressed}
          onTriggerJumpscare={handleTriggerJumpscare}
          playerSkinId={playerSkinId}
        />
      </div>

      {/* Bottom Minecraft Hotbar HUD with interactive XP bar, Daraja & Pasga button */}
      <HotbarHUD
        items={hotbarItems}
        selectedIndex={selectedHotbarIndex}
        onSelectSlot={(idx) => setSelectedHotbarIndex(idx)}
        health={health}
        maxHealth={20}
        hunger={hunger}
        xpLevel={progress.level}
        currentXp={progress.currentXp}
        xpToNextLevel={progress.xpToNextLevel}
        onOpenLevels={() => setActiveModal('levels')}
        isFlashlightOn={isFlashlightOn}
        onToggleFlashlight={() => setIsFlashlightOn(!isFlashlightOn)}
        isBloodMoon={isBloodMoon}
        onToggleBloodMoon={() => {
          setIsBloodMoon(!isBloodMoon);
          sound.playThunder();
        }}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          sound.setMuted(next);
        }}
        onQuickBuild={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK' }));
        }}
        onDescend={setIsDescendPressed}
        isDescendActive={isDescendPressed}
        onOpenServers={() => setActiveModal('servers')}
        onOpenHorrorMods={() => setActiveModal('horror')}
        onOpenFeatureMods={() => setActiveModal('features')}
      />

      {/* Mobile Touch Virtual Controls with Descend Button */}
      <MobileControls
        onDirectionPress={(dir, isPressed) => {
          const codeMap: Record<string, string> = {
            forward: 'KeyW',
            backward: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
          };
          window.dispatchEvent(
            new KeyboardEvent(isPressed ? 'keydown' : 'keyup', { code: codeMap[dir] })
          );
        }}
        onJumpPress={(isPressed) => {
          window.dispatchEvent(
            new KeyboardEvent(isPressed ? 'keydown' : 'keyup', { code: 'Space' })
          );
        }}
        onDescendPress={(isPressed) => {
          setIsDescendPressed(isPressed);
        }}
        onBreakClick={() => {
          window.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
        }}
        onPlaceClick={() => {
          window.dispatchEvent(new MouseEvent('mousedown', { button: 2 }));
        }}
      />

      {/* Multiplayer & Command Chat Overlay */}
      <ChatOverlay
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Modals */}
      {activeModal === 'levels' && (
        <LevelsModal
          progress={progress}
          quests={quests}
          onClaimQuest={handleClaimQuest}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'servers' && (
        <ServersModal
          servers={servers}
          currentServer={currentServer}
          onSelectServer={(srv) => {
            setCurrentServer(srv);
            if (srv.isHorror) {
              setIsBloodMoon(true);
            }
          }}
          onClose={() => setActiveModal(null)}
          onAddCustomServer={(newSrv) => setServers((prev) => [...prev, newSrv])}
        />
      )}

      {activeModal === 'horror' && (
        <HorrorModsModal
          mods={horrorMods}
          onToggleMod={handleToggleHorrorMod}
          onDisableAll={handleDisableAllHorror}
          onClose={() => setActiveModal(null)}
          onTestJumpscare={(name) => handleTriggerJumpscare(name)}
          isBloodMoon={isBloodMoon}
          onToggleBloodMoon={() => setIsBloodMoon(!isBloodMoon)}
        />
      )}

      {activeModal === 'features' && (
        <FeatureModsModal
          mods={featureMods}
          onToggleMod={handleToggleFeatureMod}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'skins' && (
        <SkinSelectorModal
          currentSkinId={playerSkinId}
          onSelectSkin={(id) => setPlayerSkinId(id)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'help' && (
        <HelpModal onClose={() => setActiveModal(null)} />
      )}

      {/* Horror Jumpscare Overlay */}
      {jumpscareEntity && (
        <JumpscareOverlay
          entityName={jumpscareEntity}
          onFinish={() => setJumpscareEntity(null)}
        />
      )}

      {/* Level Up Toast Popup */}
      {levelUpData && (
        <LevelUpToast
          level={levelUpData.level}
          title={levelUpData.title}
          reward={levelUpData.reward}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* Death & Respawn Screen */}
      {deathReason && (
        <DeathScreen
          reason={deathReason}
          level={progress.level}
          xp={progress.currentXp}
          onRespawn={handleRespawn}
        />
      )}
    </div>
  );
}
