
import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX, Hand, MousePointer2 } from 'lucide-react';
import { TreeState } from '../types';

interface OverlayProps {
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  gestureMode: boolean;
  treeState: TreeState;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  audioEnabled, 
  setAudioEnabled, 
  gestureMode, 
  treeState 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null!);

  useEffect(() => {
    if (audioEnabled) {
      audioRef.current.play().catch(() => {
        // Autoplay might fail, usually fine in this case
      });
    } else {
      audioRef.current.pause();
    }
  }, [audioEnabled]);

  return (
    <>
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/audio/2021/11/24/audio_3327666f85.mp3" // Lofi Xmas
      />

      <div className="fixed top-8 left-8 z-50 pointer-events-none">
        <h2 className="text-2xl font-serif text-pink-200 tracking-tighter italic">DREAMY XMAS</h2>
        <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${treeState === TreeState.TREE ? 'bg-green-400' : 'bg-pink-400'} animate-pulse shadow-lg`} />
            <span className="text-[10px] text-pink-100/40 uppercase tracking-widest font-bold">
              Current Mode: {treeState}
            </span>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50 flex gap-4">
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
        >
          {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <div className="fixed bottom-8 left-8 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xs pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          {gestureMode ? <Hand size={18} className="text-pink-400" /> : <MousePointer2 size={18} className="text-pink-400" />}
          <span className="text-xs font-bold text-pink-100/80 uppercase tracking-wider">
            {gestureMode ? 'Gesture Controls Active' : 'Mouse Controls Active'}
          </span>
        </div>
        <p className="text-[10px] text-pink-100/40 leading-relaxed uppercase tracking-tighter">
          {gestureMode ? (
            <>Pinch to <b>Assemble</b><br/>Open Palm to <b>Explode</b><br/>Move Hand to <b>Rotate</b></>
          ) : (
            <>Click anywhere to <b>Toggle States</b><br/>Drag to Orbit Camera</>
          )}
        </p>
      </div>
    </>
  );
};
