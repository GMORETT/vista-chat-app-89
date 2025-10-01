import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  fileName: string;
  fileSize: number;
  isOutgoing: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  fileName, 
  fileSize, 
  isOutgoing 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg min-w-0
      ${isOutgoing 
        ? 'bg-primary/10 border border-primary/20' 
        : 'bg-muted/50 border border-border'
      }
    `}>
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
          ${isOutgoing 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }
        `}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Waveform/Progress Bar */}
      <div className="flex-1 min-w-0">
        <div 
          className="relative h-6 cursor-pointer group"
          onClick={handleSeek}
        >
          {/* Background */}
          <div className={`
            absolute inset-0 rounded-full 
            ${isOutgoing ? 'bg-primary/20' : 'bg-muted-foreground/20'}
          `} />
          
          {/* Progress */}
          <div 
            className={`
              absolute left-0 top-0 h-full rounded-full transition-all duration-100
              ${isOutgoing ? 'bg-primary/60' : 'bg-primary/60'}
            `}
            style={{ width: `${progress}%` }}
          />
          
          {/* Waveform-like bars (visual effect) */}
          <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-2">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className={`
                  w-0.5 rounded-full transition-all duration-100
                  ${i * 3.33 < progress 
                    ? isOutgoing ? 'bg-primary' : 'bg-primary'
                    : isOutgoing ? 'bg-primary/30' : 'bg-muted-foreground/30'
                  }
                `}
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Time and file info */}
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span className={`text-xs ${isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {(fileSize / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
      />
    </div>
  );
};