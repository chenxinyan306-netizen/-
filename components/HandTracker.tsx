
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandData } from '../types';

interface HandTrackerProps {
  handDataRef: React.MutableRefObject<HandData>;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ handDataRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [loading, setLoading] = useState(true);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let active = true;

    async function setup() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      if (!active) return;
      landmarkerRef.current = landmarker;

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setLoading(false);
      };
    }

    setup();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let frameId: number;
    const process = () => {
      if (landmarkerRef.current && videoRef.current.readyState === 4) {
        const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
          const hand = results.landmarks[0];
          // Mirroring X: 1 - hand[8].x
          const x = 1 - hand[8].x;
          const y = hand[8].y;

          // Simple gesture detection
          // Distance between thumb (4) and index (8) tips
          const dPinch = Math.sqrt(
            Math.pow(hand[4].x - hand[8].x, 2) + 
            Math.pow(hand[4].y - hand[8].y, 2) + 
            Math.pow(hand[4].z - hand[8].z, 2)
          );
          
          // Is hand open? check if fingertips (8, 12, 16, 20) are above palm base (0)
          const isOpen = hand[8].y < hand[5].y && hand[12].y < hand[9].y;

          // Smoothing
          handDataRef.current = {
            x: handDataRef.current.x * 0.7 + x * 0.3,
            y: handDataRef.current.y * 0.7 + y * 0.3,
            isPinching: dPinch < 0.08,
            isOpen: isOpen && dPinch > 0.12
          };
        }
      }
      frameId = requestAnimationFrame(process);
    };
    process();
    return () => cancelAnimationFrame(frameId);
  }, [handDataRef]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] group">
      <div className="relative w-48 h-36 rounded-2xl overflow-hidden border-2 border-pink-500/50 bg-black shadow-2xl transition-transform group-hover:scale-105">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover scale-x-[-1]" 
          playsInline 
          muted 
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-pink-300 text-xs font-semibold animate-pulse">
            LOADING AI...
          </div>
        )}
        <div 
          className="absolute w-4 h-4 rounded-full bg-pink-400 shadow-[0_0_10px_#FF69B4] border-2 border-white pointer-events-none"
          style={{ 
            left: `${handDataRef.current.x * 100}%`, 
            top: `${handDataRef.current.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
      <div className="mt-2 text-[10px] text-pink-300/60 uppercase tracking-widest text-center font-bold">
        {handDataRef.current.isPinching ? 'GRABBED (TREE)' : handDataRef.current.isOpen ? 'OPEN (EXPLODE)' : 'HAND DETECTED'}
      </div>
    </div>
  );
};
