import React, { useState, useEffect, useRef } from 'react';

const AudioController = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedVolume = localStorage.getItem('valorant-music-volume');
    const savedMuted = localStorage.getItem('valorant-music-muted') === 'true';
    const savedPlaying = localStorage.getItem('valorant-music-playing') === 'true';
    
    if (savedVolume) setVolume(parseFloat(savedVolume));
    setIsMuted(savedMuted);

    // Initialize audio
    const initializeAudio = async () => {
      try {
        audioRef.current = new Audio('/audio/valorant-lobby-theme.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = savedMuted ? 0 : (savedVolume || 0.3);
        audioRef.current.preload = 'auto';

        // Event listeners
        audioRef.current.addEventListener('loadeddata', () => {
          setIsLoading(false);
        });

        audioRef.current.addEventListener('error', (e) => {
          console.warn('Audio loading failed:', e);
          setIsLoading(false);
        });

        // Auto-play if user previously had it playing
        if (savedPlaying) {
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.log('Auto-play blocked, waiting for user interaction');
          }
        }

      } catch (error) {
        console.error('Audio initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem('valorant-music-playing', 'false');
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        localStorage.setItem('valorant-music-playing', 'true');
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
    
    localStorage.setItem('valorant-music-volume', newVolume.toString());
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
    
    localStorage.setItem('valorant-music-muted', newMuted.toString());
  };

  if (isLoading) {
    return (
      <div className="audio-controller">
        <div className="audio-button">⏳</div>
      </div>
    );
  }

  return (
    <div className="audio-controller">
      <button 
        className="audio-button" 
        onClick={togglePlay}
        title={isPlaying ? 'Pause Music' : 'Play Music'}
        disabled={isLoading}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      
      <button 
        className="audio-button" 
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
        disabled={isLoading}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-control"
        title={`Volume: ${Math.round(volume * 100)}%`}
        disabled={isLoading}
      />
    </div>
  );
};

export default AudioController;
