import * as THREE from 'three';

export interface RealisticHumanOptions {
  name: string;
  shirtColor: number;
  pantsColor: number;
  skinColor: number;
  hairColor: number;
  heldItem?: 'sword' | 'staff' | 'pickaxe' | 'none';
}

export interface RealisticHumanInstance {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  name: string;
  target: THREE.Vector3;
  speed: number;
  animTime: number;
  isMoving: boolean;
}

export function createRealisticHuman(opts: RealisticHumanOptions): RealisticHumanInstance {
  const root = new THREE.Group();

  // Materials with specular shading for realistic light reflection
  const skinMat = new THREE.MeshLambertMaterial({ color: opts.skinColor });
  const hairMat = new THREE.MeshLambertMaterial({ color: opts.hairColor });
  const shirtMat = new THREE.MeshLambertMaterial({ color: opts.shirtColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: opts.pantsColor });
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });

  // 1. Torso
  const torsoGeo = new THREE.BoxGeometry(0.72, 0.9, 0.38);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.25;
  root.add(torso);

  // Shirt collar / detail
  const collarGeo = new THREE.BoxGeometry(0.35, 0.15, 0.4);
  const collar = new THREE.Mesh(collarGeo, skinMat);
  collar.position.set(0, 0.4, 0);
  torso.add(collar);

  // Belt
  const beltGeo = new THREE.BoxGeometry(0.74, 0.1, 0.4);
  const belt = new THREE.Mesh(beltGeo, new THREE.MeshLambertMaterial({ color: 0x3d2817 }));
  belt.position.set(0, -0.4, 0);
  torso.add(belt);

  // 2. Head with Neck Pivot
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.55, 0);
  torso.add(headGroup);

  // Head base
  const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // 3D Hair layer on top & sides
  const hairTopGeo = new THREE.BoxGeometry(0.58, 0.18, 0.58);
  const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
  hairTop.position.set(0, 0.22, 0);
  headGroup.add(hairTop);

  const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.56), hairMat);
  hairSideL.position.set(-0.28, 0.1, 0);
  const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.56), hairMat);
  hairSideR.position.set(0.28, 0.1, 0);
  headGroup.add(hairSideL, hairSideR);

  // Expressive 3D Eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.03), eyeMat);
  eyeL.position.set(-0.13, 0.02, 0.28);
  const pupilL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), pupilMat);
  pupilL.position.set(-0.13, 0.02, 0.285);

  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.03), eyeMat);
  eyeR.position.set(0.13, 0.02, 0.28);
  const pupilR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), pupilMat);
  pupilR.position.set(0.13, 0.02, 0.285);

  headGroup.add(eyeL, pupilL, eyeR, pupilR);

  // Smile / mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: 0x854d0e }));
  mouth.position.set(0, -0.15, 0.28);
  headGroup.add(mouth);

  // 3. Left Arm with shoulder pivot
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.52, 0.38, 0);
  torso.add(leftArmPivot);

  const armGeo = new THREE.BoxGeometry(0.28, 0.82, 0.28);
  const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
  leftArmMesh.position.y = -0.38;
  leftArmPivot.add(leftArmMesh);

  // Hand
  const handL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.26), skinMat);
  handL.position.set(0, -0.32, 0);
  leftArmMesh.add(handL);

  // 4. Right Arm with shoulder pivot
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.52, 0.38, 0);
  torso.add(rightArmPivot);

  const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
  rightArmMesh.position.y = -0.38;
  rightArmPivot.add(rightArmMesh);

  // Hand
  const handR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.26), skinMat);
  handR.position.set(0, -0.32, 0);
  rightArmMesh.add(handR);

  // 3D Diamond Sword in hand
  if (opts.heldItem === 'sword') {
    const swordGroup = new THREE.Group();
    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.08, 0.7, 0.03);
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 0.45, 0);

    // Guard
    const guardGeo = new THREE.BoxGeometry(0.24, 0.06, 0.06);
    const guardMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(0, 0.1, 0);

    // Handle
    const handleGeo = new THREE.BoxGeometry(0.05, 0.2, 0.05);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const handle = new THREE.Mesh(handleGeo, handleMat);

    swordGroup.add(blade, guard, handle);
    swordGroup.rotation.x = Math.PI / 3;
    swordGroup.position.set(0, -0.15, 0.2);
    handR.add(swordGroup);
  }

  // 5. Left Leg with hip pivot
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.2, -0.45, 0);
  torso.add(leftLegPivot);

  const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.38;
  leftLegPivot.add(leftLegMesh);

  // Shoe
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.18, 0.35), shoeMat);
  shoeL.position.set(0, -0.35, 0.02);
  leftLegMesh.add(shoeL);

  // 6. Right Leg with hip pivot
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.2, -0.45, 0);
  torso.add(rightLegPivot);

  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.38;
  rightLegPivot.add(rightLegMesh);

  // Shoe
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.18, 0.35), shoeMat);
  shoeR.position.set(0, -0.35, 0.02);
  rightLegMesh.add(shoeR);

  // 7. Floating Name Tag above head
  const nameCanvas = document.createElement('canvas');
  nameCanvas.width = 160;
  nameCanvas.height = 40;
  const nameCtx = nameCanvas.getContext('2d')!;
  nameCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  nameCtx.fillRect(0, 0, 160, 40);
  nameCtx.strokeStyle = '#38bdf8';
  nameCtx.lineWidth = 2;
  nameCtx.strokeRect(1, 1, 158, 38);

  nameCtx.font = 'bold 20px monospace';
  nameCtx.fillStyle = '#ffffff';
  nameCtx.textAlign = 'center';
  nameCtx.textBaseline = 'middle';
  nameCtx.fillText(opts.name, 80, 20);

  const nameTexture = new THREE.CanvasTexture(nameCanvas);
  const nameSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: nameTexture, transparent: true })
  );
  nameSprite.scale.set(1.4, 0.35, 1);
  nameSprite.position.set(0, 2.3, 0);
  root.add(nameSprite);

  return {
    group: root,
    head: headGroup,
    torso,
    leftArm: leftArmPivot,
    rightArm: rightArmPivot,
    leftLeg: leftLegPivot,
    rightLeg: rightLegPivot,
    name: opts.name,
    target: new THREE.Vector3(0, 0, 0),
    speed: 1.6 + Math.random() * 0.8,
    animTime: Math.random() * 10,
    isMoving: false,
  };
}

// Animate human walking cycle and breathing
export function updateRealisticHumanAnimation(human: RealisticHumanInstance, dt: number, isMoving: boolean) {
  human.animTime += dt * (isMoving ? 7.5 : 2.0);

  if (isMoving) {
    // Natural opposite swing for arms and legs
    const swing = Math.sin(human.animTime) * 0.65;
    human.leftArm.rotation.x = swing;
    human.rightArm.rotation.x = -swing;
    human.leftLeg.rotation.x = -swing * 0.85;
    human.rightLeg.rotation.x = swing * 0.85;

    // Head subtle bobbing
    human.head.rotation.y = Math.sin(human.animTime * 0.5) * 0.15;
    human.torso.position.y = 1.25 + Math.abs(Math.sin(human.animTime * 2)) * 0.05;
  } else {
    // Idle breathing & gentle relaxation
    const breath = Math.sin(human.animTime) * 0.03;
    human.torso.position.y = 1.25 + breath;
    human.leftArm.rotation.x = THREE.MathUtils.lerp(human.leftArm.rotation.x, 0, dt * 5);
    human.rightArm.rotation.x = THREE.MathUtils.lerp(human.rightArm.rotation.x, 0, dt * 5);
    human.leftLeg.rotation.x = THREE.MathUtils.lerp(human.leftLeg.rotation.x, 0, dt * 5);
    human.rightLeg.rotation.x = THREE.MathUtils.lerp(human.rightLeg.rotation.x, 0, dt * 5);
    human.head.rotation.y = Math.sin(human.animTime * 0.3) * 0.2;
  }
}
