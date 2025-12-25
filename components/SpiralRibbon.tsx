
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, COLORS } from '../types';

const RIBBON_COUNT = 400;

export const SpiralRibbon: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = new THREE.Object3D();
  
  const ribbonTargets = useMemo(() => {
    const arr = new Float32Array(RIBBON_COUNT * 3);
    for (let i = 0; i < RIBBON_COUNT; i++) {
      const progress = i / RIBBON_COUNT;
      const h = progress * 10;
      const theta = progress * Math.PI * 6; // ~3 loops
      const radius = (1 - (h / 11)) * 4.8;
      arr[i * 3 + 0] = Math.cos(theta) * radius;
      arr[i * 3 + 1] = h;
      arr[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return arr;
  }, []);

  const currentPos = useMemo(() => new Float32Array(RIBBON_COUNT * 3), []);

  useFrame((state) => {
    const isTree = treeState === TreeState.TREE;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < RIBBON_COUNT; i++) {
      const idx = i * 3;
      const tx = isTree ? ribbonTargets[idx] : (Math.random() - 0.5) * 50;
      const ty = isTree ? ribbonTargets[idx+1] : (Math.random() - 0.5) * 50 + 5;
      const tz = isTree ? ribbonTargets[idx+2] : (Math.random() - 0.5) * 50;

      currentPos[idx] = THREE.MathUtils.lerp(currentPos[idx], tx, 0.04);
      currentPos[idx+1] = THREE.MathUtils.lerp(currentPos[idx+1], ty, 0.04);
      currentPos[idx+2] = THREE.MathUtils.lerp(currentPos[idx+2], tz, 0.04);

      tempObject.position.set(currentPos[idx], currentPos[idx+1], currentPos[idx+2]);
      tempObject.scale.setScalar(0.1);
      tempObject.rotation.set(time * 2 + i, time * 1.5, i);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RIBBON_COUNT]}>
      <tetrahedronGeometry args={[0.5]} />
      <meshBasicMaterial color={COLORS.white} transparent opacity={0.8} />
    </instancedMesh>
  );
};
