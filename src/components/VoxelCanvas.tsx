import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { BlockType, GameServer, HorrorMod, FeatureMod, HotbarItem } from '../types/minecraft';
import { BLOCKS } from '../data/minecraftData';
import {
  getBlockTexture,
  getGrassTopTexture,
  getGrassSideTexture,
  getWoodBarkTexture,
  getWoodRingsTexture,
} from '../utils/textureGenerator';
import { createRealisticSky, RealisticSkyInstance } from '../utils/realisticSky';
import { createRealisticHuman, updateRealisticHumanAnimation, RealisticHumanInstance } from '../utils/realisticHuman';
import { sound } from '../services/soundEngine';

interface VoxelCanvasProps {
  currentServer: GameServer;
  activeHorrorMods: HorrorMod[];
  activeFeatureMods: FeatureMod[];
  selectedHotbarItem: HotbarItem;
  onLuckyBreak: (surprise: string) => void;
  onBlockBroken?: (type: BlockType) => void;
  onStructureBuilt?: () => void;
  onTakeDamage?: (damage: number, reason: string) => void;
  onHeal?: (amount: number) => void;
  onChatMessage: (sender: string, text: string, isHorror?: boolean) => void;
  isBloodMoon: boolean;
  isFlashlightOn: boolean;
  isDescendPressed?: boolean;
  onTriggerJumpscare: (entityName: string) => void;
  playerSkinId: string;
}

export const VoxelCanvas: React.FC<VoxelCanvasProps> = ({
  currentServer,
  activeHorrorMods,
  activeFeatureMods,
  selectedHotbarItem,
  onLuckyBreak,
  onBlockBroken,
  onStructureBuilt,
  onTakeDamage,
  onHeal,
  onChatMessage,
  isBloodMoon,
  isFlashlightOn,
  isDescendPressed = false,
  onTriggerJumpscare,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState<number>(60);
  const [playerCoords, setPlayerCoords] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 5, z: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [targetedBlockInfo, setTargetedBlockInfo] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState<boolean>(false);

  // References to keep game loop buttery smooth
  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    instancedMeshes: new Map<BlockType, THREE.InstancedMesh>(),
    voxelMap: new Map<string, BlockType>(),
    playerPos: new THREE.Vector3(0, 7, 0),
    playerVelocity: new THREE.Vector3(0, 0, 0),
    cameraPitch: 0,
    cameraYaw: 0,
    keys: {} as Record<string, boolean>,
    isGrounded: false,
    herobrineMesh: null as THREE.Group | null,
    manFromFogMesh: null as THREE.Group | null,
    realisticHumans: [] as RealisticHumanInstance[],
    magicProjectiles: [] as { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[],
    // Physical Lucky Block Dynamic Entities
    luckyTNTs: [] as {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      timer: number;
      flashMat: THREE.MeshBasicMaterial;
      origMat: THREE.Material | THREE.Material[];
    }[],
    luckyGems: [] as {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      type: 'diamond' | 'emerald';
      rotSpeed: number;
    }[],
    luckyBeacons: [] as {
      group: THREE.Group;
      itemMesh: THREE.Mesh;
      life: number;
    }[],
    heldBlockMesh: null as THREE.Mesh | null,
    heldBlockType: null as BlockType | null,
    lastTime: performance.now(),
    frameCount: 0,
    lastFpsUpdate: performance.now(),
    flashlightLight: null as THREE.SpotLight | null,
    realisticSky: null as RealisticSkyInstance | null,
    fog: null as THREE.FogExp2 | null,
    horrorEncounterTimer: 0,
  });

  const isJetpackEnabled = activeFeatureMods.some((m) => m.id === 'jetpack' && m.enabled);
  const isHerobrineActive = activeHorrorMods.some((m) => m.id === 'herobrine' && m.enabled);
  const isFogManActive = activeHorrorMods.some((m) => m.id === 'man_from_the_fog' && m.enabled);
  const isMagicEnabled = activeFeatureMods.some((m) => m.id === 'magic_spells' && m.enabled);
  const isGravityGunActive = activeFeatureMods.some((m) => m.id === 'gravity_gun' && m.enabled);

  // Spawn Physical Lucky Block Reward
  const spawnPhysicalLuckyReward = useCallback((pos: THREE.Vector3) => {
    const s = stateRef.current;
    if (!s.scene) return;

    sound.playLuckyBlock();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    const roll = Math.random();

    // 1. TNT Cluster Trap (har tomonga otilib portlaydi!)
    if (roll < 0.35) {
      sound.playFuseHiss();
      onChatMessage("Lucky Block", "🔥 TNT TUZOG'I! 6x TNT har tomonga otildi! QOCHING!", true);
      onLuckyBreak("🔥 6x TNT HAR TOMONGA OTILIB PORTLAMOQDA!");

      const tntCount = 6;
      const tntTexture = getBlockTexture('tnt');
      const tntGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);

      for (let i = 0; i < tntCount; i++) {
        const tntOrigMat = new THREE.MeshLambertMaterial({ map: tntTexture });
        const tntFlashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const tntMesh = new THREE.Mesh(tntGeo, tntOrigMat);

        tntMesh.position.copy(pos).add(new THREE.Vector3(0, 0.5, 0));
        s.scene.add(tntMesh);

        // Fling in all directions with arcs
        const angle = (i / tntCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const horizSpeed = 4.5 + Math.random() * 4;
        const vertSpeed = 5 + Math.random() * 4;

        const vel = new THREE.Vector3(
          Math.cos(angle) * horizSpeed,
          vertSpeed,
          Math.sin(angle) * horizSpeed
        );

        s.luckyTNTs.push({
          mesh: tntMesh,
          vel,
          timer: 1.6 + Math.random() * 0.4,
          flashMat: tntFlashMat,
          origMat: tntOrigMat,
        });
      }
      return;
    }

    // 2. Diamond & Emerald Geyser
    if (roll < 0.7) {
      sound.playLuckyBlock();
      onChatMessage("Lucky Block", "💎 OLMOSTAR FAVVORASI! 10x Qimmatbaho olmoslar otilib chiqdi! Yig'ib oling!", false);
      onLuckyBreak("💎 10x OLMOSTAR FAVVORASI YERGA SOCHILDI!");

      const gemCount = 10;
      for (let i = 0; i < gemCount; i++) {
        const isDiamond = i % 2 === 0;
        const geo = new THREE.OctahedronGeometry(0.25, 0);
        const mat = new THREE.MeshBasicMaterial({
          color: isDiamond ? 0x38bdf8 : 0x10b981,
          wireframe: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos).add(new THREE.Vector3(0, 0.8, 0));
        s.scene.add(mesh);

        const angle = (i / gemCount) * Math.PI * 2 + (Math.random() - 0.5);
        const horiz = 2 + Math.random() * 3;
        const vert = 5 + Math.random() * 4;

        const vel = new THREE.Vector3(
          Math.cos(angle) * horiz,
          vert,
          Math.sin(angle) * horiz
        );

        s.luckyGems.push({
          mesh,
          vel,
          type: isDiamond ? 'diamond' : 'emerald',
          rotSpeed: 3 + Math.random() * 3,
        });
      }
      return;
    }

    // 3. Legendary Weapon Beam Drop
    sound.playThunder();
    onChatMessage("Lucky Block", "👑 AFSONAVIY QUROL VA MAYOQ TUSHDI! Oltin nur ichidagi qurolni oling!", false);
    onLuckyBreak("👑 AFSONAVIY OLMOZ QILICH VA MAYOQ!");

    const beaconGroup = new THREE.Group();
    beaconGroup.position.copy(pos);

    // Vertical beam of golden light
    const beamGeo = new THREE.CylinderGeometry(0.4, 0.4, 25, 12);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 12.5;
    beaconGroup.add(beam);

    // Floating rotating 3D Diamond Sword
    const swordBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.1, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    swordBlade.position.y = 1.2;
    beaconGroup.add(swordBlade);

    s.scene.add(beaconGroup);
    s.luckyBeacons.push({
      group: beaconGroup,
      itemMesh: swordBlade,
      life: 300, // 5 seconds
    });
  }, [onChatMessage, onLuckyBreak]);

  // Break block logic
  const handleBreakTargetedBlock = useCallback(() => {
    const s = stateRef.current;
    if (!s.camera || !s.scene) return;

    // Raycast from camera center
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), s.camera);
    raycaster.far = 7.5;

    // Check against instanced meshes
    const meshes = Array.from(s.instancedMeshes.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const mesh = hit.object as THREE.InstancedMesh;
      const instanceId = hit.instanceId;

      if (instanceId !== undefined) {
        const matrix = new THREE.Matrix4();
        mesh.getMatrixAt(instanceId, matrix);
        const position = new THREE.Vector3();
        position.setFromMatrixPosition(matrix);

        const key = `${Math.round(position.x)},${Math.round(position.y)},${Math.round(position.z)}`;
        const blockType = s.voxelMap.get(key);

        if (blockType && blockType !== 'bedrock') {
          s.voxelMap.delete(key);

          // Hide instance by scaling matrix to 0
          matrix.makeScale(0, 0, 0);
          mesh.setMatrixAt(instanceId, matrix);
          mesh.instanceMatrix.needsUpdate = true;

          if (blockType === 'lucky_block') {
            spawnPhysicalLuckyReward(position);
          } else {
            sound.playBlockBreak();
          }

          onBlockBroken?.(blockType);
          createBlockBreakParticles(position, blockType);
        }
      }
    }
  }, [onBlockBroken, spawnPhysicalLuckyReward]);

  // Place block logic
  const handlePlaceBlock = useCallback(() => {
    const s = stateRef.current;
    if (!s.camera || !s.scene) return;

    if (selectedHotbarItem.id === 'magic_staff' && isMagicEnabled) {
      sound.playMagicCast();
      castFireball();
      return;
    }

    if (selectedHotbarItem.id === 'gravity_gun' && isGravityGunActive) {
      if (s.heldBlockMesh && s.heldBlockType) {
        sound.playBlaster();
        const dir = new THREE.Vector3();
        s.camera.getWorldDirection(dir);
        const throwPos = s.playerPos.clone().add(dir.clone().multiplyScalar(4));
        placeBlockAt(Math.round(throwPos.x), Math.round(throwPos.y), Math.round(throwPos.z), s.heldBlockType);

        s.scene.remove(s.heldBlockMesh);
        s.heldBlockMesh = null;
        s.heldBlockType = null;
        return;
      }
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), s.camera);
    raycaster.far = 7.5;

    const meshes = Array.from(s.instancedMeshes.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const normal = hit.face?.normal;
      if (!normal) return;

      const matrix = new THREE.Matrix4();
      (hit.object as THREE.InstancedMesh).getMatrixAt(hit.instanceId!, matrix);
      const hitPos = new THREE.Vector3();
      hitPos.setFromMatrixPosition(matrix);

      const placePos = hitPos.clone().add(normal);
      const px = Math.round(placePos.x);
      const py = Math.round(placePos.y);
      const pz = Math.round(placePos.z);
      const key = `${px},${py},${pz}`;

      const dist = placePos.distanceTo(s.playerPos);
      if (dist < 1.0) return;

      if (!s.voxelMap.has(key)) {
        const blockToPlace: BlockType =
          selectedHotbarItem.type === 'block' ? (selectedHotbarItem.id as BlockType) : 'stone';

        placeBlockAt(px, py, pz, blockToPlace);
        sound.playBlockPlace();
      }
    }
  }, [selectedHotbarItem, isMagicEnabled, isGravityGunActive]);

  // Cast Fireball
  const castFireball = () => {
    const s = stateRef.current;
    if (!s.scene || !s.camera) return;

    const dir = new THREE.Vector3();
    s.camera.getWorldDirection(dir);

    const geo = new THREE.SphereGeometry(0.35, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(s.playerPos).add(dir.clone().multiplyScalar(1.2));

    s.scene.add(mesh);
    s.magicProjectiles.push({
      mesh,
      vel: dir.multiplyScalar(0.7),
      life: 60,
    });
  };

  // Place block helper
  const placeBlockAt = (x: number, y: number, z: number, type: BlockType) => {
    const s = stateRef.current;
    const key = `${x},${y},${z}`;
    s.voxelMap.set(key, type);

    const mesh = s.instancedMeshes.get(type);
    if (mesh) {
      const count = mesh.count;
      if (count < 2500) {
        const dummy = new THREE.Object3D();
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(count, dummy.matrix);
        mesh.count += 1;
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  };

  // Particles on block breaking
  const createBlockBreakParticles = (pos: THREE.Vector3, type: BlockType) => {
    const s = stateRef.current;
    if (!s.scene) return;

    const blockColor = BLOCKS[type]?.color || '#ffffff';
    const particleCount = 12;
    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(blockColor) });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.set(
        pos.x + (Math.random() - 0.5) * 0.8,
        pos.y + (Math.random() - 0.5) * 0.8,
        pos.z + (Math.random() - 0.5) * 0.8
      );
      s.scene.add(p);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.12,
        Math.random() * 0.15 + 0.05,
        (Math.random() - 0.5) * 0.12
      );

      let frames = 0;
      const animateParticle = () => {
        frames++;
        p.position.add(vel);
        vel.y -= 0.008;
        if (frames < 25) {
          requestAnimationFrame(animateParticle);
        } else {
          s.scene?.remove(p);
          geo.dispose();
          mat.dispose();
        }
      };
      animateParticle();
    }
  };

  // Instant Structure (Bunker / Fortress) builder
  const buildInstantCastle = useCallback(() => {
    const s = stateRef.current;
    const px = Math.round(s.playerPos.x);
    const py = Math.max(1, Math.round(s.playerPos.y) - 1);
    const pz = Math.round(s.playerPos.z);

    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        placeBlockAt(px + x, py, pz + z, 'stone');
        placeBlockAt(px + x, py + 4, pz + z, 'wood');

        if (x === -3 || x === 3 || z === -3 || z === 3) {
          for (let y = 1; y <= 3; y++) {
            if (!(x === 0 && z === 3 && y <= 2)) {
              placeBlockAt(px + x, py + y, pz + z, 'stone');
            }
          }
        }
      }
    }
    placeBlockAt(px, py + 3, pz, 'glowstone');
    placeBlockAt(px + 2, py + 1, pz + 2, 'lucky_block');

    sound.playThunder();
    onStructureBuilt?.();
    onChatMessage("Mega-Builder", "Instant Fortress & Boshpana qurildi!", false);
  }, [onChatMessage, onStructureBuilt]);

  // Main Three.js Setup & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    // 1. Realistic Atmosphere & Sky System
    const realisticSky = createRealisticSky(scene);
    stateRef.current.realisticSky = realisticSky;

    // Fog
    const fog = new THREE.FogExp2(0xa5c4ff, 0.012);
    scene.fog = fog;

    // Camera
    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 200);
    camera.position.set(0, 6, 0);

    // High Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Player Flashlight
    const flashlight = new THREE.SpotLight(0xfff4e0, isFlashlightOn ? 2.5 : 0, 25, Math.PI / 4, 0.3, 1);
    camera.add(flashlight);
    flashlight.target = camera;
    scene.add(camera);

    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.renderer = renderer;
    stateRef.current.fog = fog;
    stateRef.current.flashlightLight = flashlight;

    // 2. Generate HD Procedural Terrain with Multi-Face Materials
    generateProceduralTerrain(scene);

    // 3. Create Realistic Animated Human Players
    createSimulatedMultiplayer(scene);

    // Keyboard & Mouse Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (e.code === 'KeyK') {
        buildInstantCastle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement) {
        const s = stateRef.current;
        const sensitivity = 0.0022;
        s.cameraYaw -= e.movementX * sensitivity;
        s.cameraPitch -= e.movementY * sensitivity;
        s.cameraPitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, s.cameraPitch));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
        return;
      }
      if (e.button === 0) {
        handleBreakTargetedBlock();
      } else if (e.button === 2) {
        e.preventDefault();
        handlePlaceBlock();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === renderer.domElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation / Game Loop
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const s = stateRef.current;
      const dt = Math.min((currentTime - s.lastTime) / 1000, 0.1);
      s.lastTime = currentTime;

      s.frameCount++;
      if (currentTime - s.lastFpsUpdate > 600) {
        setFps(Math.round((s.frameCount * 1000) / (currentTime - s.lastFpsUpdate)));
        s.frameCount = 0;
        s.lastFpsUpdate = currentTime;
      }

      // Update Realistic Sky (Sun and drifting clouds)
      s.realisticSky?.update(dt, isBloodMoon);

      // Player Movement Physics (WASD, Space, and Descend/Sneak!)
      updatePlayerPhysics(dt);

      // Realistic Humans Animation & Movement
      updateRealisticHumans(dt);

      // Physical Lucky Block Entities (TNTs, Gems, Beacons)
      updatePhysicalLuckyEntities(dt);

      // Magic Projectiles
      updateMagicProjectiles();

      // Check targeted block for HUD info
      updateTargetedBlockHUD();

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      }
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [currentServer, isBloodMoon, buildInstantCastle, handleBreakTargetedBlock, handlePlaceBlock]);

  // Flashlight toggle
  useEffect(() => {
    const s = stateRef.current;
    if (s.flashlightLight) {
      s.flashlightLight.intensity = isFlashlightOn ? 2.5 : 0;
    }
  }, [isFlashlightOn]);

  // Procedural Terrain Generator with Multi-Face HD Materials
  const generateProceduralTerrain = (scene: THREE.Scene) => {
    const s = stateRef.current;
    s.voxelMap.clear();
    s.instancedMeshes.clear();

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const types: BlockType[] = [
      'grass',
      'dirt',
      'stone',
      'wood',
      'leaves',
      'diamond_ore',
      'gold_ore',
      'redstone_ore',
      'obsidian',
      'tnt',
      'lucky_block',
      'glowstone',
      'cursed_flesh',
      'backrooms_wall',
      'bedrock',
    ];

    types.forEach((type) => {
      let mat: THREE.Material | THREE.Material[];

      if (type === 'grass') {
        // Multi-face realistic grass: [px, nx, py, ny, pz, nz]
        const sideMat = new THREE.MeshLambertMaterial({ map: getGrassSideTexture() });
        const topMat = new THREE.MeshLambertMaterial({ map: getGrassTopTexture() });
        const botMat = new THREE.MeshLambertMaterial({ map: getBlockTexture('dirt') });
        mat = [sideMat, sideMat, topMat, botMat, sideMat, sideMat];
      } else if (type === 'wood') {
        // Multi-face realistic wood log with bark sides and growth rings ends
        const barkMat = new THREE.MeshLambertMaterial({ map: getWoodBarkTexture() });
        const ringMat = new THREE.MeshLambertMaterial({ map: getWoodRingsTexture() });
        mat = [barkMat, barkMat, ringMat, ringMat, barkMat, barkMat];
      } else {
        const isEmissive = BLOCKS[type]?.emissive;
        mat = new THREE.MeshLambertMaterial({
          map: getBlockTexture(type),
          emissive: isEmissive ? new THREE.Color(isEmissive) : new THREE.Color(0x000000),
          emissiveIntensity: isEmissive ? 0.6 : 0,
        });
      }

      const instancedMesh = new THREE.InstancedMesh(boxGeo, mat, 2500);
      instancedMesh.count = 0;
      scene.add(instancedMesh);
      s.instancedMeshes.set(type, instancedMesh);
    });

    const size = 13;
    const dummy = new THREE.Object3D();

    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        addVoxelInstance('bedrock', x, 0, z, dummy);

        const hillHeight = Math.floor(Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2.5 + 2);
        const surfaceY = Math.max(2, 2 + hillHeight);

        for (let y = 1; y < surfaceY; y++) {
          if (y === 1 && Math.random() < 0.08) {
            addVoxelInstance('diamond_ore', x, y, z, dummy);
          } else if (y === 2 && Math.random() < 0.1) {
            addVoxelInstance('gold_ore', x, y, z, dummy);
          } else if (y === 2 && Math.random() < 0.12) {
            addVoxelInstance('redstone_ore', x, y, z, dummy);
          } else {
            addVoxelInstance('stone', x, y, z, dummy);
          }
        }

        addVoxelInstance('dirt', x, surfaceY, z, dummy);

        if (currentServer.id === 'the-backrooms') {
          addVoxelInstance('backrooms_wall', x, surfaceY + 1, z, dummy);
          addVoxelInstance('backrooms_wall', x, surfaceY + 2, z, dummy);
        } else if (isBloodMoon) {
          addVoxelInstance('cursed_flesh', x, surfaceY + 1, z, dummy);
        } else {
          addVoxelInstance('grass', x, surfaceY + 1, z, dummy);
        }

        // Realistic Trees with oak wood & canopy
        if (x % 7 === 0 && z % 7 === 0 && Math.abs(x) > 3 && Math.abs(z) > 3) {
          const treeY = surfaceY + 2;
          for (let ty = 0; ty < 4; ty++) {
            addVoxelInstance('wood', x, treeY + ty, z, dummy);
          }
          for (let lx = -1; lx <= 1; lx++) {
            for (let lz = -1; lz <= 1; lz++) {
              addVoxelInstance('leaves', x + lx, treeY + 3, z + lz, dummy);
              if (Math.abs(lx) + Math.abs(lz) < 2) {
                addVoxelInstance('leaves', x + lx, treeY + 4, z + lz, dummy);
              }
            }
          }
        }

        // Lucky Blocks
        if ((x === 4 && z === 5) || (x === -6 && z === -4) || (x === 8 && z === -8) || (x === -3 && z === 7)) {
          addVoxelInstance('lucky_block', x, surfaceY + 2, z, dummy);
        }
      }
    }

    s.playerPos.set(0, 6, 0);
  };

  const addVoxelInstance = (type: BlockType, x: number, y: number, z: number, dummy: THREE.Object3D) => {
    const s = stateRef.current;
    const key = `${x},${y},${z}`;
    s.voxelMap.set(key, type);

    const mesh = s.instancedMeshes.get(type);
    if (!mesh) return;

    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    mesh.setMatrixAt(mesh.count, dummy.matrix);
    mesh.count++;
    mesh.instanceMatrix.needsUpdate = true;
  };

  // Create Realistic Animated Humans
  const createSimulatedMultiplayer = (scene: THREE.Scene) => {
    const s = stateRef.current;
    s.realisticHumans = [];

    if (currentServer.type === 'solo') return;

    const npcs = [
      { name: 'Jasur_Craft', shirt: 0x2563eb, pants: 0x1e3a8a, hair: 0x451a03, skin: 0xc48b68, x: 3, z: 4, weapon: 'sword' as const },
      { name: 'Bekzod_Pro', shirt: 0x16a34a, pants: 0x14532d, hair: 0x18181b, skin: 0xd97706, x: -4, z: 2, weapon: 'none' as const },
      { name: 'Laylo_Girl', shirt: 0xdb2777, pants: 0x831843, hair: 0xd97706, skin: 0xfbcfe8, x: 2, z: -5, weapon: 'sword' as const },
    ];

    npcs.forEach((npc) => {
      const human = createRealisticHuman({
        name: npc.name,
        shirtColor: npc.shirt,
        pantsColor: npc.pants,
        skinColor: npc.skin,
        hairColor: npc.hair,
        heldItem: npc.weapon,
      });

      human.group.position.set(npc.x, 3, npc.z);
      scene.add(human.group);
      s.realisticHumans.push(human);
    });
  };

  // Update Player Movement & Physics with "Pasga Tushish" (Descend / Sneak)
  const updatePlayerPhysics = (dt: number) => {
    const s = stateRef.current;
    if (!s.camera) return;

    const isDescend =
      Boolean(s.keys['ShiftLeft']) ||
      Boolean(s.keys['ShiftRight']) ||
      Boolean(s.keys['KeyC']) ||
      Boolean(isDescendPressed);

    const moveSpeed = isDescend && s.isGrounded ? 3.2 : 6.2; // Slower while crouching/sneaking
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), s.cameraYaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), s.cameraYaw);

    const inputMove = new THREE.Vector3(0, 0, 0);
    if (s.keys['KeyW']) inputMove.add(forward);
    if (s.keys['KeyS']) inputMove.sub(forward);
    if (s.keys['KeyA']) inputMove.sub(right);
    if (s.keys['KeyD']) inputMove.add(right);

    if (inputMove.lengthSq() > 0) {
      inputMove.normalize().multiplyScalar(moveSpeed * dt);
      if (s.isGrounded && Math.random() < 0.05) {
        sound.playStep();
      }
    }

    // Jetpack or Jump / Fly Controls
    if (s.keys['Space']) {
      if (isJetpackEnabled) {
        s.playerVelocity.y = 6.5; // Fly up
        if (Math.random() < 0.15) sound.playStep();
      } else if (s.isGrounded) {
        s.playerVelocity.y = 7.5;
        s.isGrounded = false;
        sound.playStep();
      }
    }

    // PASGA TUSHISH (Descend / Sneak / Fly Down)
    if (isDescend) {
      if (isJetpackEnabled || !s.isGrounded) {
        s.playerVelocity.y = -6.5; // Controlled downward flight / landing!
      }
    }

    // Apply gravity
    if (!isJetpackEnabled) {
      s.playerVelocity.y -= 22 * dt;
    } else if (!s.keys['Space'] && !isDescend) {
      s.playerVelocity.y *= 0.88; // hover
    }

    s.playerPos.x += inputMove.x;
    s.playerPos.z += inputMove.z;
    s.playerPos.y += s.playerVelocity.y * dt;

    // Voxel Collision detection
    const blockX = Math.round(s.playerPos.x);
    const blockY = Math.floor(s.playerPos.y - 1.2);
    const blockZ = Math.round(s.playerPos.z);
    const groundKey = `${blockX},${blockY},${blockZ}`;

    // Crouch camera offset (drops camera slightly when sneaking)
    const crouchOffset = isDescend && s.isGrounded ? -0.35 : 0;

    if (s.voxelMap.has(groundKey)) {
      s.playerPos.y = blockY + 1.8;
      s.playerVelocity.y = 0;
      s.isGrounded = true;
    } else {
      s.isGrounded = false;
    }

    s.camera.position.set(s.playerPos.x, s.playerPos.y + crouchOffset, s.playerPos.z);
    s.camera.rotation.order = 'YXZ';
    s.camera.rotation.y = s.cameraYaw;
    s.camera.rotation.x = s.cameraPitch;

    setPlayerCoords({
      x: Math.round(s.playerPos.x),
      y: Math.round(s.playerPos.y),
      z: Math.round(s.playerPos.z),
    });
  };

  // Update Realistic Humans (Moving, walking cycles, looking around)
  const updateRealisticHumans = (dt: number) => {
    const s = stateRef.current;
    if (s.realisticHumans.length === 0) return;

    s.realisticHumans.forEach((human) => {
      const dist = human.group.position.distanceTo(human.target);
      const isMoving = dist > 0.4;

      if (!isMoving) {
        if (Math.random() < 0.02) {
          human.target.set(
            (Math.random() - 0.5) * 22,
            human.group.position.y,
            (Math.random() - 0.5) * 22
          );
        }
      } else {
        const dir = human.target.clone().sub(human.group.position).normalize();
        human.group.position.add(dir.multiplyScalar(human.speed * dt));
        human.group.lookAt(human.target.x, human.group.position.y, human.target.z);
      }

      updateRealisticHumanAnimation(human, dt, isMoving);
    });

    if (Math.random() < 0.001) {
      const msgs = [
        "Olmos topdim! Kimga kerak?",
        "Lucky Block sindirdim, TNT otilib chiqdi haha zo'rg'a qochdim!",
        "Realistik teksturalar zo'r ko'rinyapti!",
        "Shift tugmasi bilan pasga tushish juda qulay ekan!",
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const randomSender = s.realisticHumans[Math.floor(Math.random() * s.realisticHumans.length)]?.name || "Player_Uz";
      onChatMessage(randomSender, randomMsg, false);
      sound.playChatPing();
    }
  };

  // Update Physical Lucky Entities (TNTs, Gems, Beacons)
  const updatePhysicalLuckyEntities = (dt: number) => {
    const s = stateRef.current;

    // 1. Physical TNT Blocks flying in all directions & exploding
    for (let i = s.luckyTNTs.length - 1; i >= 0; i--) {
      const t = s.luckyTNTs[i];
      t.timer -= dt;

      // Physics motion
      t.mesh.position.addScaledVector(t.vel, dt);
      t.vel.y -= 16 * dt; // gravity
      t.mesh.rotation.x += dt * 5;
      t.mesh.rotation.y += dt * 4;

      // Bounce on ground
      if (t.mesh.position.y < 3) {
        t.mesh.position.y = 3;
        t.vel.y = -t.vel.y * 0.45;
        t.vel.x *= 0.7;
        t.vel.z *= 0.7;
      }

      // Flash white / red
      const isWhite = Math.floor(t.timer * 8) % 2 === 0;
      t.mesh.material = isWhite ? t.flashMat : t.origMat;

      // Explode!
      if (t.timer <= 0) {
        sound.playThunder();

        // Crater explosion: break blocks in radius 2.2
        const ex = Math.round(t.mesh.position.x);
        const ey = Math.round(t.mesh.position.y);
        const ez = Math.round(t.mesh.position.z);

        for (let ox = -2; ox <= 2; ox++) {
          for (let oy = -2; oy <= 2; oy++) {
            for (let oz = -2; oz <= 2; oz++) {
              if (ox * ox + oy * oy + oz * oz <= 5) {
                const k = `${ex + ox},${ey + oy},${ez + oz}`;
                if (s.voxelMap.has(k) && s.voxelMap.get(k) !== 'bedrock') {
                  s.voxelMap.delete(k);
                }
              }
            }
          }
        }

        // Calculate Damage to Player based on proximity
        const distToPlayer = t.mesh.position.distanceTo(s.playerPos);
        if (distToPlayer < 8.0) {
          let damage = 4;
          if (distToPlayer < 2.5) {
            damage = 12; // Direct hit: -6 hearts!
          } else if (distToPlayer < 5.0) {
            damage = 7; // Near hit: -3.5 hearts!
          } else {
            damage = 3; // Shockwave: -1.5 hearts!
          }

          // Physics Knockback
          const knockback = s.playerPos.clone().sub(t.mesh.position).normalize();
          knockback.y = Math.max(0.4, knockback.y + 0.35);
          const knockbackForce = Math.max(3.0, (8.0 - distToPlayer) * 2.2);
          s.playerVelocity.add(knockback.multiplyScalar(knockbackForce));
          s.isGrounded = false;

          sound.playPlayerHurt();
          setDamageFlash(true);
          setTimeout(() => setDamageFlash(false), 320);
          onTakeDamage?.(damage, "TNT Portlashi");
        }

        // Particle blast
        createBlockBreakParticles(t.mesh.position, 'tnt');

        s.scene?.remove(t.mesh);
        s.luckyTNTs.splice(i, 1);
      }
    }

    // 2. Physical Diamond & Emerald Gems
    for (let i = s.luckyGems.length - 1; i >= 0; i--) {
      const g = s.luckyGems[i];
      g.mesh.position.addScaledVector(g.vel, dt);
      g.vel.y -= 14 * dt;
      g.mesh.rotation.y += dt * g.rotSpeed;

      if (g.mesh.position.y < 3.2) {
        g.mesh.position.y = 3.2;
        g.vel.set(0, 0, 0);
      }

      // Player magnet collection
      const distToPlayer = g.mesh.position.distanceTo(s.playerPos);
      if (distToPlayer < 2.5) {
        sound.playGemCollect();
        confetti({ particleCount: 15, spread: 40 });
        s.scene?.remove(g.mesh);
        s.luckyGems.splice(i, 1);
      }
    }

    // 3. Beacons & God drops
    for (let i = s.luckyBeacons.length - 1; i >= 0; i--) {
      const b = s.luckyBeacons[i];
      b.life -= dt * 60;
      b.itemMesh.rotation.y += dt * 3;

      if (b.life <= 0) {
        s.scene?.remove(b.group);
        s.luckyBeacons.splice(i, 1);
      }
    }
  };

  // Update Magic Projectiles
  const updateMagicProjectiles = () => {
    const s = stateRef.current;
    for (let i = s.magicProjectiles.length - 1; i >= 0; i--) {
      const p = s.magicProjectiles[i];
      p.mesh.position.add(p.vel);
      p.life--;

      const k = `${Math.round(p.mesh.position.x)},${Math.round(p.mesh.position.y)},${Math.round(p.mesh.position.z)}`;
      if (s.voxelMap.has(k) || p.life <= 0) {
        sound.playThunder();
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            for (let oz = -1; oz <= 1; oz++) {
              const hitKey = `${Math.round(p.mesh.position.x) + ox},${Math.round(p.mesh.position.y) + oy},${Math.round(p.mesh.position.z) + oz}`;
              if (s.voxelMap.has(hitKey) && s.voxelMap.get(hitKey) !== 'bedrock') {
                s.voxelMap.delete(hitKey);
              }
            }
          }
        }
        s.scene?.remove(p.mesh);
        s.magicProjectiles.splice(i, 1);
      }
    }
  };

  // Update HUD targeted block info
  const updateTargetedBlockHUD = () => {
    const s = stateRef.current;
    if (!s.camera) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), s.camera);
    raycaster.far = 7.5;

    const meshes = Array.from(s.instancedMeshes.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const matrix = new THREE.Matrix4();
      (hit.object as THREE.InstancedMesh).getMatrixAt(hit.instanceId!, matrix);
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(matrix);
      const key = `${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.z)}`;
      const type = s.voxelMap.get(key);
      if (type) {
        setTargetedBlockInfo(BLOCKS[type]?.nameUz || type);
        return;
      }
    }
    setTargetedBlockInfo(null);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Damage Flash Red Vignette Overlay */}
      {damageFlash && (
        <div className="absolute inset-0 pointer-events-none z-30 bg-red-600/35 border-8 border-red-700/60 shadow-[inset_0_0_80px_rgba(220,38,38,0.7)] transition-opacity duration-150 animate-pulse" />
      )}

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <div className="w-1 h-3 bg-white/90 drop-shadow" />
          <div className="h-1 w-3 bg-white/90 drop-shadow absolute" />
          <div className="w-1 h-1 bg-amber-400 absolute" />
        </div>
      </div>

      {/* Target Block HUD info */}
      {targetedBlockInfo && (
        <div className="absolute top-1/2 left-1/2 translate-x-6 -translate-y-4 pointer-events-none z-10 bg-stone-900/80 px-2 py-0.5 border border-stone-700 text-xs font-pixel text-amber-300">
          {targetedBlockInfo}
        </div>
      )}

      {/* Top Left Stats & Performance HUD */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex flex-col gap-1 font-pixel text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">{fps} FPS</span>
          <span className="text-stone-400">·</span>
          <span className="text-amber-300">XYZ: {playerCoords.x} / {playerCoords.y} / {playerCoords.z}</span>
          <span className="text-stone-400">·</span>
          <span className="text-cyan-300">{currentServer.name}</span>
        </div>
        <div className="text-[11px] text-stone-300">
          Rejim: <span className="uppercase text-amber-400">{currentServer.gameMode}</span> | Ping: {currentServer.pingMs}ms | HD Realistik
        </div>
      </div>

      {/* Pointer Lock Overlay Prompt */}
      {!isPointerLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-auto">
          <div className="mc-panel p-6 text-center max-w-md mx-4">
            <h3 className="font-pixel text-lg text-amber-400 mb-2">3D Boshqaruvni Faollashtirish</h3>
            <p className="text-xs text-stone-300 mb-4 leading-relaxed">
              O'yin olamini aylanish va boshqarish uchun sichqonchani bosing.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-stone-300 bg-stone-950/70 p-3 border border-stone-800 mb-4">
              <div><span className="text-amber-400">W, A, S, D:</span> Harakat</div>
              <div><span className="text-amber-400">Space:</span> Sakrash / Yuqoriga</div>
              <div><span className="text-amber-400">Shift / C:</span> Pasga tushish / Sneak</div>
              <div><span className="text-amber-400">Chap Tugma:</span> Blok sindirish</div>
              <div><span className="text-amber-400">O'ng Tugma:</span> Blok qo'yish</div>
              <div><span className="text-amber-400">K Tugmasi:</span> 1-Click Bino</div>
            </div>
            <button
              onClick={() => {
                const s = stateRef.current;
                s.renderer?.domElement.requestPointerLock();
              }}
              className="mc-button mc-button-green w-full py-2.5 font-pixel text-xs text-white"
            >
              ▶ OLAMGA KIRISH (CLICK TO PLAY)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
