
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { HandTracker } from './components/HandTracker';
import { AppState, TreeState, HandData } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE);
  const [gestureMode, setGestureMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const handDataRef = useRef<HandData>({ x: 0.5, y: 0.5, isPinching: false, isOpen: true });

  const handleEnter = (useGesture: boolean) => {
    setGestureMode(useGesture);
    setAppState(AppState.PLAYING);
    setAudioEnabled(true);
  };

  const toggleTreeState = useCallback(() => {
    setTreeState(prev => prev === TreeState.TREE ? TreeState.EXPLODE : TreeState.TREE);
  }, []);

  // Update tree state based on gestures
  useEffect(() => {
    if (!gestureMode) return;
    
    let lastHandState: 'pinch' | 'open' | null = null;
    
    const checkGesture = setInterval(() => {
      const { isPinching, isOpen } = handDataRef.current;
      
      if (isPinching && lastHandState !== 'pinch') {
        setTreeState(TreeState.TREE);
        lastHandState = 'pinch';
      } else if (isOpen && lastHandState !== 'open') {
        setTreeState(TreeState.EXPLODE);
        lastHandState = 'open';
      }
    }, 100);

    return () => clearInterval(checkGesture);
  }, [gestureMode]);

  return (
    <div className="w-full h-screen relative bg-[#050103]">
      {appState === AppState.INTRO ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050103]/80 backdrop-blur-xl">
          <div className="text-center p-12 rounded-3xl border border-white/10 bg-white/5 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-serif text-pink-300 mb-2 tracking-tighter italic">DREAMY XMAS</h1>
            <p className="text-pink-100/40 text-sm mb-12 tracking-widest uppercase font-light">Interactive 3D Experience</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleEnter(false)}
                className="w-full py-4 rounded-full bg-pink-500 hover:bg-pink-400 text-white font-semibold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95"
              >
                ENTER
              </button>
              <button 
                onClick={() => handleEnter(true)}
                className="w-full py-4 rounded-full border border-pink-500/50 text-pink-400 hover:bg-pink-500/10 font-semibold transition-all hover:scale-105 active:scale-95"
              >
                GESTURE MODE (Camera)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Experience 
            treeState={treeState} 
            toggleTreeState={toggleTreeState} 
            handDataRef={handDataRef}
            gestureMode={gestureMode}
          />
          <Overlay 
            audioEnabled={audioEnabled} 
            setAudioEnabled={setAudioEnabled} 
            gestureMode={gestureMode}
            treeState={treeState}
          />
          {gestureMode && <HandTracker handDataRef={handDataRef} />}
        </>
      )}
    </div>
  );
};

export default App;
