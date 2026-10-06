import * as THREE from 'three';

export interface RealisticSkyInstance {
  skyMesh: THREE.Mesh;
  sunGroup: THREE.Group;
  cloudsGroup: THREE.Group;
  sunLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  update: (dt: number, isBloodMoon: boolean) => void;
}

export function createRealisticSky(scene: THREE.Scene): RealisticSkyInstance {
  // 1. Realistic Sky Dome with vertex shader or atmospheric hemisphere
  const skyGeo = new THREE.SphereGeometry(120, 32, 16);
  // Inverted normals for interior view
  skyGeo.scale(-1, 1, 1);

  // High quality sky canvas gradient
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 16;
  skyCanvas.height = 256;
  const sCtx = skyCanvas.getContext('2d')!;

  const skyGrad = sCtx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0, '#1d4ed8');   // Zenith deep rich azure blue
  skyGrad.addColorStop(0.45, '#60a5fa'); // Mid sky bright cerulean
  skyGrad.addColorStop(0.75, '#bfdbfe'); // Atmospheric haze horizon
  skyGrad.addColorStop(1, '#e0f2fe');   // Warm horizon glow
  sCtx.fillStyle = skyGrad;
  sCtx.fillRect(0, 0, 16, 256);

  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTexture,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);

  // 2. Realistic Glowing Sun with Corona
  const sunGroup = new THREE.Group();
  // Core blazing disc
  const sunCoreGeo = new THREE.SphereGeometry(3.5, 16, 16);
  const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat);

  // Outer golden corona glow
  const coronaCanvas = document.createElement('canvas');
  coronaCanvas.width = 128;
  coronaCanvas.height = 128;
  const cCtx = coronaCanvas.getContext('2d')!;
  const cGrad = cCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  cGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
  cGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.5)');
  cGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  cCtx.fillStyle = cGrad;
  cCtx.fillRect(0, 0, 128, 128);

  const coronaTexture = new THREE.CanvasTexture(coronaCanvas);
  const coronaSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: coronaTexture, transparent: true, blending: THREE.AdditiveBlending })
  );
  coronaSprite.scale.set(16, 16, 1);

  sunGroup.add(sunCore, coronaSprite);
  sunGroup.position.set(50, 60, -40);
  scene.add(sunGroup);

  // 3. Directional Sunlight with warm color
  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.35);
  sunLight.position.copy(sunGroup.position);
  scene.add(sunLight);

  // Ambient Light with natural skylight tone
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
  scene.add(ambientLight);

  // 4. 3D Drifting Fluffy Cumulus Clouds
  const cloudsGroup = new THREE.Group();
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
  });

  // Generate 18 fluffy cloud clusters across the sky
  const cloudBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  for (let c = 0; c < 16; c++) {
    const cx = (Math.random() - 0.5) * 110;
    const cz = (Math.random() - 0.5) * 110;
    const cy = 20 + Math.random() * 2;

    const clusterWidth = 3 + Math.floor(Math.random() * 5);
    const clusterLength = 4 + Math.floor(Math.random() * 6);

    for (let x = 0; x < clusterWidth; x++) {
      for (let z = 0; z < clusterLength; z++) {
        if (Math.random() > 0.25) {
          const cloudBlock = new THREE.Mesh(cloudBoxGeo, cloudMat);
          cloudBlock.scale.set(3, 1.4, 3);
          cloudBlock.position.set(cx + x * 3, cy, cz + z * 3);
          cloudsGroup.add(cloudBlock);
        }
      }
    }
  }
  scene.add(cloudsGroup);

  return {
    skyMesh,
    sunGroup,
    cloudsGroup,
    sunLight,
    ambientLight,
    update: (dt: number, isBloodMoon: boolean) => {
      // Drift clouds slowly
      cloudsGroup.position.x += dt * 0.6;
      if (cloudsGroup.position.x > 60) {
        cloudsGroup.position.x = -60;
      }

      // Rotate sun subtle glow
      coronaSprite.rotation.z += dt * 0.05;

      if (isBloodMoon) {
        sunLight.color.setHex(0xdc2626);
        sunLight.intensity = 0.6;
        ambientLight.color.setHex(0x450a0a);
        ambientLight.intensity = 0.45;
        sunCoreMat.color.setHex(0xff0000);
      } else {
        sunLight.color.setHex(0xfffaed);
        sunLight.intensity = 1.35;
        ambientLight.color.setHex(0xdbeafe);
        ambientLight.intensity = 0.75;
        sunCoreMat.color.setHex(0xffffff);
      }
    },
  };
}
