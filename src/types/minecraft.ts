export type BlockType = 
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'wood'
  | 'leaves'
  | 'diamond_ore'
  | 'gold_ore'
  | 'redstone_ore'
  | 'obsidian'
  | 'tnt'
  | 'lucky_block'
  | 'bedrock'
  | 'glowstone'
  | 'cursed_flesh'
  | 'backrooms_wall';

export interface BlockDefinition {
  id: BlockType;
  nameUz: string;
  nameEn: string;
  color: string;
  texturePattern?: string;
  hardness: number;
  emissive?: string;
  special?: 'lucky' | 'explosive' | 'light' | 'corrupt';
}

export interface GameServer {
  id: string;
  name: string;
  type: 'solo' | 'multiplayer' | 'horror' | 'minigame';
  descriptionUz: string;
  descriptionEn: string;
  bannerColor: string;
  bannerIcon: string;
  playersOnline: number;
  maxPlayers: number;
  pingMs: number;
  ip: string;
  version: string;
  isHorror?: boolean;
  gameMode: 'survival' | 'creative' | 'hardcore' | 'adventure';
  features: string[];
}

export interface HorrorMod {
  id: string;
  name: string;
  alias: string;
  descriptionUz: string;
  descriptionEn: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  icon: string;
  glowColor: string;
  enabled: boolean;
  activeFeatureUz: string;
  jumpscareChance: number; // 0 to 1
  audioTheme: 'whispers' | 'heartbeat' | 'screech' | 'siren' | 'static';
}

export interface FeatureMod {
  id: string;
  name: string;
  categoryUz: string;
  categoryEn: string;
  descriptionUz: string;
  descriptionEn: string;
  icon: string;
  accentColor: string;
  enabled: boolean;
  powerAbilityUz: string;
  hotkey: string;
}

export interface HotbarItem {
  id: BlockType | 'sword' | 'magic_staff' | 'gravity_gun' | 'blaster' | 'jetpack';
  nameUz: string;
  nameEn: string;
  count?: number;
  type: 'block' | 'tool' | 'weapon' | 'utility';
  color: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
  isHorrorWarning?: boolean;
  rank?: 'VIP' | 'ADMIN' | 'MVP+' | 'MOD' | 'PLAYER';
}

export interface PlayerSkin {
  id: string;
  name: string;
  category: 'classic' | 'warrior' | 'horror' | 'cyber';
  headColor: string;
  bodyColor: string;
  legsColor: string;
  eyesColor: string;
  armsColor: string;
  isSpecial?: boolean;
}

export interface LevelTier {
  level: number;
  titleUz: string;
  titleEn: string;
  requiredXp: number;
  rewardUz: string;
  rewardIcon: string;
  unlockedSkinId?: string;
  unlockedModId?: string;
  color: string;
}

export interface PlayerQuest {
  id: string;
  titleUz: string;
  descriptionUz: string;
  progress: number;
  target: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface PlayerProgress {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalBlocksBroken: number;
  luckyBlocksOpened: number;
  structuresBuilt: number;
  horrorEncounters: number;
}

