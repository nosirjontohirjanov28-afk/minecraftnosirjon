import * as THREE from 'three';
import { BlockType } from '../types/minecraft';

const textureCache = new Map<string, THREE.CanvasTexture>();

function createHDCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement, cacheKey: string): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

// 1. Grass Top Texture (Lush green with blade depth)
export function getGrassTopTexture(): THREE.CanvasTexture {
  const key = 'grass_top';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const { canvas, ctx } = createHDCanvas();
  // Base lush green gradient
  const grad = ctx.createLinearGradient(0, 0, 64, 64);
  grad.addColorStop(0, '#53a828');
  grad.addColorStop(1, '#438e1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  // High detail grass blades & specks
  for (let i = 0; i < 400; i++) {
    const x = Math.floor(Math.random() * 64);
    const y = Math.floor(Math.random() * 64);
    const w = Math.random() > 0.7 ? 2 : 1;
    const h = Math.random() > 0.7 ? 3 : 1;
    const r = Math.random();
    ctx.fillStyle = r > 0.65 ? '#6bc935' : r > 0.35 ? '#367717' : '#5db32c';
    ctx.fillRect(x, y, w, h);
  }

  // Soft border vignette for 3D bevel depth
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, 63, 63);

  return toTexture(canvas, key);
}

// 2. Grass Side Texture (Rich earth with hanging 3D grass fringe)
export function getGrassSideTexture(): THREE.CanvasTexture {
  const key = 'grass_side';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const { canvas, ctx } = createHDCanvas();
  // Rich brown soil base
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, 0, 64, 64);

  // Dirt pebbles & shading
  for (let i = 0; i < 350; i++) {
    const x = Math.floor(Math.random() * 64);
    const y = Math.floor(Math.random() * 64);
    const r = Math.random();
    ctx.fillStyle = r > 0.7 ? '#4e3318' : r > 0.4 ? '#7c542c' : '#59391a';
    ctx.fillRect(x, y, Math.random() > 0.6 ? 2 : 1, Math.random() > 0.6 ? 2 : 1);
  }

  // Hanging grass fringe on top 16px
  for (let x = 0; x < 64; x += 2) {
    const hang = 10 + Math.floor(Math.sin(x * 0.4) * 4 + (Math.random() * 4));
    ctx.fillStyle = '#4c9823';
    ctx.fillRect(x, 0, 2, hang);
    // highlight tip
    ctx.fillStyle = '#65c432';
    ctx.fillRect(x, hang - 2, 2, 2);
  }
  // Grass top band
  ctx.fillStyle = '#489320';
  ctx.fillRect(0, 0, 64, 8);

  return toTexture(canvas, key);
}

// 3. Wood Log Bark Side
export function getWoodBarkTexture(): THREE.CanvasTexture {
  const key = 'wood_bark';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const { canvas, ctx } = createHDCanvas();
  ctx.fillStyle = '#5c3e21';
  ctx.fillRect(0, 0, 64, 64);

  // Vertical bark ridges
  for (let x = 0; x < 64; x += 3) {
    const isCrevice = x % 6 === 0;
    ctx.fillStyle = isCrevice ? '#382513' : '#734f2b';
    ctx.fillRect(x, 0, 2, 64);

    for (let y = 0; y < 64; y += 4) {
      if (Math.random() > 0.4) {
        ctx.fillStyle = Math.random() > 0.5 ? '#825932' : '#452e18';
        ctx.fillRect(x, y, 2, 3);
      }
    }
  }

  return toTexture(canvas, key);
}

// 4. Wood Log Rings Top & Bottom
export function getWoodRingsTexture(): THREE.CanvasTexture {
  const key = 'wood_rings';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const { canvas, ctx } = createHDCanvas();
  // Sapwood bark rim
  ctx.fillStyle = '#452e18';
  ctx.fillRect(0, 0, 64, 64);

  // Heartwood circle
  ctx.fillStyle = '#bc8f5b';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();

  // Annual growth rings
  ctx.strokeStyle = '#9c6f3d';
  ctx.lineWidth = 2;
  for (let r = 6; r <= 26; r += 5) {
    ctx.beginPath();
    ctx.arc(32, 32, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Pith center
  ctx.fillStyle = '#7a5127';
  ctx.beginPath();
  ctx.arc(32, 32, 3, 0, Math.PI * 2);
  ctx.fill();

  return toTexture(canvas, key);
}

// 5. General Block Texture generator (HD 64x64)
export function getBlockTexture(type: BlockType): THREE.CanvasTexture {
  if (textureCache.has(type)) {
    return textureCache.get(type)!;
  }

  const { canvas, ctx } = createHDCanvas();

  switch (type) {
    case 'grass':
      return getGrassSideTexture();

    case 'dirt': {
      ctx.fillStyle = '#6d4825';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 400; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        ctx.fillStyle = Math.random() > 0.5 ? '#553618' : '#825830';
        ctx.fillRect(x, y, Math.random() > 0.5 ? 2 : 1, Math.random() > 0.5 ? 2 : 1);
      }
      break;
    }

    case 'stone': {
      // Realistic chiselled masonry
      ctx.fillStyle = '#787878';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 500; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        const r = Math.random();
        ctx.fillStyle = r > 0.7 ? '#919191' : r > 0.35 ? '#616161' : '#4d4d4d';
        ctx.fillRect(x, y, 2, 2);
      }
      // Mortar bevel lines
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, 63, 63);
      break;
    }

    case 'diamond_ore': {
      // Stone base
      ctx.fillStyle = '#707070';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#595959' : '#878787';
        ctx.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 64), 2, 2);
      }
      // Glowing Cyan Diamond Clusters with specular facets
      const clusters = [
        [14, 14], [18, 16], [16, 20],
        [42, 36], [46, 38], [44, 42],
        [24, 46], [28, 48],
      ];
      clusters.forEach(([cx, cy]) => {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - 3, cy - 3, 10, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 1, cy - 1, 7, 7);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(cx, cy, 3, 3);
      });
      break;
    }

    case 'gold_ore': {
      ctx.fillStyle = '#707070';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#595959' : '#878787';
        ctx.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 64), 2, 2);
      }
      const clusters = [[16, 18], [40, 16], [28, 38], [46, 44]];
      clusters.forEach(([cx, cy]) => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx - 3, cy - 3, 10, 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 1, cy - 1, 7, 7);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx, cy, 3, 3);
      });
      break;
    }

    case 'redstone_ore': {
      ctx.fillStyle = '#707070';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#595959' : '#878787';
        ctx.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 64), 2, 2);
      }
      const clusters = [[18, 16], [42, 22], [22, 42], [38, 44]];
      clusters.forEach(([cx, cy]) => {
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx - 3, cy - 3, 10, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 1, cy - 1, 7, 7);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(cx, cy, 3, 3);
      });
      break;
    }

    case 'lucky_block': {
      // Golden metallic cube with bevel and radiant '?'
      const grad = ctx.createLinearGradient(0, 0, 64, 64);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.3, '#f59e0b');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      // Metallic frame border
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 60, 60);

      // Corner gold rivets
      ctx.fillStyle = '#fffbeb';
      [[6, 6], [54, 6], [6, 54], [54, 54]].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sharp embossed '?' symbol
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 32, 33);
      ctx.shadowBlur = 0;
      break;
    }

    case 'tnt': {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 64, 64);
      // White TNT banner
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 22, 64, 20);
      ctx.fillStyle = '#171717';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TNT', 32, 37);
      break;
    }

    case 'leaves': {
      ctx.fillStyle = '#225522';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 400; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        ctx.fillStyle = Math.random() > 0.5 ? '#368038' : '#1b441c';
        ctx.fillRect(x, y, 3, 3);
      }
      break;
    }

    case 'glowstone': {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 350; i++) {
        ctx.fillStyle = Math.random() > 0.6 ? '#fef08a' : '#ca8a04';
        ctx.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 64), 3, 3);
      }
      break;
    }

    case 'obsidian': {
      ctx.fillStyle = '#150d24';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = Math.random() > 0.7 ? '#3b1c6e' : Math.random() > 0.4 ? '#251347' : '#0d0717';
        ctx.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 64), 2, 2);
      }
      break;
    }

    case 'wood':
      return getWoodBarkTexture();

    case 'bedrock':
    default: {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#2c2724' : '#0a0908';
        ctx.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 64), 2, 2);
      }
      break;
    }
  }

  return toTexture(canvas, type);
}
