"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Determine video source based on connection
  const getVideoSrc = useCallback(() => {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (conn) {
      const type = conn.effectiveType;
      const connType = conn.type;
      if (connType === "wifi" || connType === "ethernet" || type === "4g") {
        return "/hero-video-wifi.mp4";
      }
    } else if (window.innerWidth >= 1024) {
      return "/hero-video-wifi.mp4";
    }

    return "/hero-video.mp4";
  }, []);

  // Load and play video only after page is idle (lazy load)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoLoaded) return;

    const loadVideo = () => {
      const src = getVideoSrc();
      video.src = src;
      video.load();
      video.muted = true;
      video.play().catch(() => {});
      setVideoLoaded(true);
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(loadVideo, { timeout: 3000 });
    } else {
      setTimeout(loadVideo, 1500);
    }
  }, [getVideoSrc, videoLoaded]);

  // Observe visibility — pause/play on scroll
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!videoLoaded) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [videoLoaded]);

  // Handle mute/unmute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isMuted && isVisible) {
      video.muted = false;
      video.volume = 0.5;
    } else {
      video.muted = true;
    }
  }, [isMuted, isVisible]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = 0.5;
      video.play().catch(() => {});
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-neutral-950"
      style={{ backgroundImage: "url(/hero-poster.webp)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Video — NO autoPlay, NO preload. Poster is LCP, video loads after idle */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.webp"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <track kind="descriptions" label="Descripción del video" />
      </video>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent" />

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-8 right-6 z-10 flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full px-4 py-2.5 transition-all duration-300 border border-white/10 hover:border-white/30 cursor-pointer group"
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Activar sonido</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Sonido activo</span>
          </>
        )}
      </button>
    </section>
  );
}
