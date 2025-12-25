
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, COLORS } from '../types';

const TOTAL_COUNT = 7500;
const LEAF_RATIO = 0.85;
const LEAF_COUNT = Math.floor(TOTAL_COUNT * LEAF_RATIO);
const ORNAMENT_COUNT = TOTAL_COUNT - LEAF_COUNT;

interface TreeParticlesProps {
  treeState: TreeState;
  handDataRef: React.RefObject<{ x: number; y: number; isPinching: boolean; isOpen: boolean }>;
  gestureMode: boolean;
}

export const TreeParticles: React.FC<TreeParticlesProps> = ({ treeState, handDataRef, gestureMode }) => {
  const leafMeshRef = useRef<THREE.InstancedMesh>(null!);
  const ornamentMeshRef = useRef<THREE.InstancedMesh>(null!);
  
  // Storage for target positions and rotation/scale
  const leafTargets = useMemo(() => new Float32Array(LEAF_COUNT * 3), []);
  const ornamentTargets = useMemo(() => new Float32Array(ORNAMENT_COUNT * 3), []);
  
  // Initial current matrices to avoid jumping
  const tempObject = new THREE.Object3D();
  const rotationY = useRef(0);

  // Generate target points
  useEffect(() => {
    const isTree = treeState === TreeState.TREE;

    // Leaf Distribution (Octahedrons)
    for (let i = 0; i < LEAF_COUNT; i++) {
      if (isTree) {
        // Cone distribution
        const h = Math.random() * 10;
        const radius = (1 - (h / 11)) * 4.5 * Math.pow(Math.random(), 0.5);
        const theta = Math.random() * Math.PI * 2;
        leafTargets[i * 3 + 0] = Math.cos(theta) * radius;
        leafTargets[i * 3 + 1] = h;
        leafTargets[i * 3 + 2] = Math.sin(theta) * radius;
      } else {
        // Explode
        leafTargets[i * 3 + 0] = (Math.random() - 0.5) * 40;
        leafTargets[i * 3 + 1] = (Math.random() - 0.5) * 40 + 5;
        leafTargets[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }

    // Ornament Distribution (Cubes & Icosahedrons)
    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      if (isTree) {
        // Surface of the tree
        const h = Math.random() * 9.5 + 0.5;
        const radius = (1 - (h / 11)) * 4.6;
        const theta = Math.random() * Math.PI * 2;
        ornamentTargets[i * 3 + 0] = Math.cos(theta) * radius;
        ornamentTargets[i * 3 + 1] = h;
        ornamentTargets[i * 3 + 2] = Math.sin(theta) * radius;
      } else {
        ornamentTargets[i * 3 + 0] = (Math.random() - 0.5) * 45;
        ornamentTargets[i * 3 + 1] = (Math.random() - 0.5) * 45 + 5;
        ornamentTargets[i * 3 + 2] = (Math.random() - 0.5) * 45;
      }
    }
  }, [treeState, leafTargets, ornamentTargets]);

  const currentLeafPos = useMemo(() => new Float32Array(LEAF_COUNT * 3), []);
  const currentOrnamentPos = useMemo(() => new Float32Array(ORNAMENT_COUNT * 3), []);

  useFrame((state, delta) => {
    // Hand Rotation influence
    if (gestureMode && treeState === TreeState.EXPLODE) {
       const targetRot = (handDataRef.current.x - 0.5) * Math.PI * 4;
       rotationY.current = THREE.MathUtils.lerp(rotationY.current, targetRot, 0.1);
    } else {
       rotationY.current += delta * 0.2;
    }

    // Lerp and Update Matrices for Leaves
    for (let i = 0; i < LEAF_COUNT; i++) {
      const idx = i * 3;
      currentLeafPos[idx] = THREE.MathUtils.lerp(currentLeafPos[idx], leafTargets[idx], 0.05);
      currentLeafPos[idx + 1] = THREE.MathUtils.lerp(currentLeafPos[idx+1], leafTargets[idx + 1], 0.05);
      currentLeafPos[idx + 2] = THREE.MathUtils.lerp(currentLeafPos[idx+2], leafTargets[idx + 2], 0.05);
      
      tempObject.position.set(currentLeafPos[idx], currentLeafPos[idx+1], currentLeafPos[idx+2]);
      tempObject.rotation.y = rotationY.current + i * 0.01;
      tempObject.rotation.x = i * 0.005;
      tempObject.scale.setScalar(0.2);
      tempObject.updateMatrix();
      leafMeshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    leafMeshRef.current.instanceMatrix.needsUpdate = true;

    // Lerp and Update Matrices for Ornaments
    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      const idx = i * 3;
      currentOrnamentPos[idx] = THREE.MathUtils.lerp(currentOrnamentPos[idx], ornamentTargets[idx], 0.05);
      currentOrnamentPos[idx+1] = THREE.MathUtils.lerp(currentOrnamentPos[idx+1], ornamentTargets[idx+1], 0.05);
      currentOrnamentPos[idx+2] = THREE.MathUtils.lerp(currentOrnamentPos[idx+2], ornamentTargets[idx+2], 0.05);
      
      tempObject.position.set(currentOrnamentPos[idx], currentOrnamentPos[idx+1], currentOrnamentPos[idx+2]);
      tempObject.rotation.y = rotationY.current * 1.5 + i;
      tempObject.scale.setScalar(0.15 + Math.sin(state.clock.elapsedTime + i) * 0.05);
      tempObject.updateMatrix();
      ornamentMeshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    ornamentMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={leafMeshRef} args={[undefined, undefined, LEAF_COUNT]} castShadow>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial 
          color={COLORS.pink1} 
          metalness={0.6} 
          roughness={0.3} 
          emissive={COLORS.pink2} 
          emissiveIntensity={0.2} 
        />
      </instancedMesh>

      <instancedMesh ref={ornamentMeshRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow>
        <icosahedronGeometry args={[1]} />
        <meshStandardMaterial 
          color={COLORS.lavender} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={COLORS.white} 
          emissiveIntensity={0.4} 
        />
      </instancedMesh>
    </>
  );
};
