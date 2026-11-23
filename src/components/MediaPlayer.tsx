import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Radio,
} from 'lucide-react';

interface MediaPlayerProps {
  src?: string;
  fallbackSrc?: string;
  poster?: string;
  isLive?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  aspectClassName?: string;
  badgeText?: string;
  title?: string;
  className?: string;
  onPlayStateChange?: (playing: boolean) => void;
}

function toYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const watchMatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1`;
  return null;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  src,
  fallbackSrc = '/videos/vtc-product-demo.mp4',
  poster,
  isLive = false,
  autoPlay = false,
  loop = false,
  aspectClassName = 'aspect-video',
  badgeText,
  title,
  className = '',
  onPlayStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [activeSrc, setActiveSrc] = useState<string>(src || fallbackSrc);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(autoPlay);
  const [volume, setVolume] = useState(85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusNote, setStatusNote] = useState<string>('');
  const [isBuffering, setIsBuffering] = useState(false);

  const ytEmbed = toYouTubeEmbedUrl(src);

  useEffect(() => {
    setActiveSrc(src || fallbackSrc);
    setUsedFallback(false);
    setStatusNote('');
  }, [src, fallbackSrc]);

  useEffect(() => {
    if (ytEmbed) return;
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const currentUrl = activeSrc || fallbackSrc;
    const isHls = currentUrl.includes('.m3u8');

    video.muted = isMuted;
    video.volume = Math.max(0, Math.min(1, volume / 100));

    const tryAutoPlay = () => {
      if (!autoPlay) return;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChange?.(true);
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              onPlayStateChange?.(true);
            })
            .catch(() => {
              setIsPlaying(false);
              onPlayStateChange?.(false);
            });
        });
    };

    if (isHls) {
      if (Hls.isSupported()) {
        setIsBuffering(true);
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });
        hlsRef.current = hls;
        hls.loadSource(currentUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          setStatusNote('');
          tryAutoPlay();
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setIsBuffering(false);
            hls.destroy();
            hlsRef.current = null;
            if (!usedFallback && fallbackSrc && fallbackSrc !== currentUrl) {
              setUsedFallback(true);
              setActiveSrc(fallbackSrc);
              setStatusNote('Mengalihkan ke server cadangan lancar...');
            } else {
              setStatusNote('Koneksi stream sibuk — tekan Coba Lagi.');
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentUrl;
        tryAutoPlay();
      } else if (!usedFallback && fallbackSrc) {
        setUsedFallback(true);
        setActiveSrc(fallbackSrc);
      }
    } else {
      video.src = currentUrl;
      video.load();
      tryAutoPlay();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
    };
  }, [activeSrc, autoPlay, ytEmbed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));
  }, [isMuted, volume]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      } catch {
        video.muted = true;
        setIsMuted(true);
        await video.play().catch(() => undefined);
      }
    } else {
      video.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(80);
    }
    if (video) {
      video.muted = nextMuted;
      if (!nextMuted && video.paused) {
        video.play().catch(() => undefined);
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (nextVal: number) => {
    setVolume(nextVal);
    if (nextVal > 0 && isMuted) {
      setIsMuted(false);
    } else if (nextVal === 0 && !isMuted) {
      setIsMuted(true);
    }
    if (videoRef.current) {
      videoRef.current.volume = nextVal / 100;
      videoRef.current.muted = nextVal === 0;
    }
  };

  const handleSeek = (nextSec: number) => {
    if (!videoRef.current || isLive) return;
    videoRef.current.currentTime = nextSec;
    setCurrentTime(nextSec);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Fallback to native video fullscreen on iOS Safari
      const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      v?.webkitEnterFullscreen?.();
    }
  };

  const handleRetry = () => {
    setUsedFallback(false);
    setStatusNote('');
    setActiveSrc(src || fallbackSrc);
    window.setTimeout(() => {
      videoRef.current?.play().catch(() => undefined);
    }, 150);
  };

  const formatSec = (s: number) => {
    if (!Number.isFinite(s) || s <= 0) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (ytEmbed) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden ${aspectClassName} ${className}`}
      >
        <iframe
          src={ytEmbed}
          title={title || 'VTC YouTube Player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-zinc-950 rounded-2xl overflow-hidden select-none group ${aspectClassName} ${className}`}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        loop={loop && !isLive}
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => {
          setIsPlaying(true);
          onPlayStateChange?.(true);
        }}
        onPause={() => {
          setIsPlaying(false);
          onPlayStateChange?.(false);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setStatusNote('');
        }}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration || 0);
        }}
        onError={() => {
          setIsBuffering(false);
          if (!usedFallback && fallbackSrc && activeSrc !== fallbackSrc) {
            setUsedFallback(true);
            setActiveSrc(fallbackSrc);
          } else {
            setStatusNote('Gagal memuat video. Tekan Coba Lagi.');
          }
        }}
        className="w-full h-full object-contain bg-black cursor-pointer"
      />

      {/* Top Left Badge */}
      {(badgeText || isLive) && (
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          {isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-extrabold shadow">
              <Radio className="w-3 h-3" />
              <span>LIVE</span>
            </span>
          )}
          {badgeText && (
            <span className="px-2.5 py-1 rounded-md bg-black/75 text-white text-[10px] font-bold">
              {badgeText}
            </span>
          )}
        </div>
      )}

      {/* Top Right Quick Sound Unmute Prompt when Muted */}
      {isMuted && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>Aktifkan Suara</span>
        </button>
      )}

      {/* Center Play Overlay when Paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Putar Video"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#FF6A00]/95 hover:bg-[#FF6A00] text-white flex items-center justify-center shadow-2xl cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </button>
      )}

      {/* Status Note / Retry Banner */}
      {(statusNote || isBuffering) && (
        <div className="absolute top-12 left-3 right-3 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-black/75 text-white text-[11px]">
          <span className="truncate">
            {isBuffering ? 'Menghubungkan siaran langsung...' : statusNote}
          </span>
          {statusNote && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-2 py-0.5 rounded bg-[#FF6A00] text-white font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Coba Lagi</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Interactive Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-3 pb-2.5 pt-6 space-y-1.5">
        {!isLive && duration > 0 && (
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={Math.min(currentTime, duration)}
            onChange={(e) => handleSeek(Number(e.target.value))}
            aria-label="Posisi Video"
            className="w-full h-1.5 accent-[#FF6A00] cursor-pointer"
          />
        )}

        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="Volume Suara"
              className="w-16 sm:w-24 h-1.5 accent-[#FF6A00] cursor-pointer"
            />

            <span className="text-[11px] font-mono text-zinc-200 tabular-nums shrink-0">
              {isLive
                ? 'SIARAN LIVE'
                : `${formatSec(currentTime)} / ${formatSec(duration)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
