
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { TreeStar } from './TreeStar';
import { SpiralRibbon } from './SpiralRibbon';
import { TreeState, COLORS } from '../types';

interface ExperienceProps {
  treeState: TreeState;
  toggleTreeState: () => void;
  handDataRef: React.RefObject<{ x: number; y: number; isPinching: boolean; isOpen: boolean }>;
  gestureMode: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ 
  treeState, 
  toggleTreeState, 
  handDataRef,
  gestureMode 
}) => {
  return (
    <Canvas 
      shadows 
      onPointerDown={toggleTreeState}
      gl={{ antialias: false, stencil: false, depth: true }}
    >
      <color attach="background" args={[COLORS.bg]} />
      
      <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={35} />
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate={!gestureMode}
        autoRotateSpeed={0.5}
      />

      <Suspense fallback={null}>
        <Environment preset="city" />
        
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={500} 
          color={COLORS.pink2} 
          castShadow 
        />
        <pointLight position={[0, -2, 0]} intensity={100} color={COLORS.pink1} />

        <group position={[0, -5, 0]}>
          <TreeParticles treeState={treeState} handDataRef={handDataRef} gestureMode={gestureMode} />
          <SpiralRibbon treeState={treeState} />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
             <TreeStar position={[0, 12, 0]} />
          </Float>

          <ContactShadows 
            opacity={0.4} 
            scale={20} 
            blur={2.4} 
            far={4.5} 
            resolution={256} 
            color="#000000" 
          />
        </group>

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4} 
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
