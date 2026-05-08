import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, FastForward, Rewind, Download, Camera, Maximize, Volume2, VolumeX } from 'lucide-react';
import './CustomVideoPlayer.css';

interface CustomVideoPlayerProps {
  src: string;
  title: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setProgress((current / dur) * 100);
      setCurrentTime(formatTime(current));
      
      // Update duration if it wasn't available on load
      if (!isNaN(dur) && duration === '0:00') {
        setDuration(formatTime(dur));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (!isNaN(dur)) {
        setDuration(formatTime(dur));
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const newTime = videoRef.current.currentTime + amount;
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullScreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        try {
          const dataURL = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataURL;
          a.download = `screenshot_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Math.floor(videoRef.current.currentTime)}s.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (err) {
          alert("Cannot take screenshot due to cross-origin restrictions on this video URL.");
        }
      }
    }
  };

  const downloadVideo = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isEmbed = src.includes('youtube.com') || 
                  src.includes('youtu.be') || 
                  src.includes('restream.io') || 
                  src.includes('facebook.com') ||
                  src.startsWith('http') && !src.match(/\.(mp4|webm|ogg|mov)$/i);

  // Helper to convert regular YouTube/Restream links to embed links
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div 
      className={`custom-video-container ${showControls || !isPlaying || isEmbed ? 'show-controls' : 'hide-controls'}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isEmbed ? (
        <div className="iframe-wrapper">
          <iframe 
            src={getEmbedUrl(src)} 
            title={title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            className="custom-video-iframe"
          ></iframe>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            className="custom-video-element"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            crossOrigin="anonymous"
            autoPlay
          />
          
          {!isPlaying && (
            <div className="big-play-button" onClick={togglePlay}>
              <Play size={48} />
            </div>
          )}
        </>
      )}

      {/* Only show custom controls for direct video files, not iframes */}
      {!isEmbed && (
        <div className="custom-video-controls">
        <div className="progress-container">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={handleSeek}
            className="progress-slider"
          />
        </div>
        
        <div className="controls-row">
          <div className="controls-left">
            <button onClick={togglePlay} className="control-btn" title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => skip(-10)} className="control-btn" title="Rewind 10s">
              <Rewind size={20} />
            </button>
            <button onClick={() => skip(10)} className="control-btn" title="Fast Forward 10s">
              <FastForward size={20} />
            </button>
            <div className="volume-container">
              <button onClick={toggleMute} className="control-btn" title={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            <span className="time-display">{currentTime} / {duration}</span>
          </div>

          <div className="controls-right">
            <button onClick={takeScreenshot} className="control-btn" title="Take Screenshot">
              <Camera size={20} />
            </button>
            <button onClick={downloadVideo} className="control-btn" title="Download Video">
              <Download size={20} />
            </button>
            <button onClick={toggleFullScreen} className="control-btn" title="Full Screen">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
