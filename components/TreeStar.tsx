
import React, { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../types';

export const TreeStar: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1;
    const innerRadius = 0.4;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / points) * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <group position={position}>
      <mesh>
        <shapeGeometry args={[starShape]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh scale={[1.2, 1.2, 1.2]}>
         <shapeGeometry args={[starShape]} />
         <meshBasicMaterial color={COLORS.pink2} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <pointLight intensity={10} color={COLORS.white} />
      <Sparkles count={50} scale={3} size={2} speed={0.4} color={COLORS.pink1} />
    </group>
  );
};
