"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";
import type { HeroSlide } from "@/lib/siteData";
import styles from "./HeroSlider.module.css";

const AUTOPLAY_MS = 7000;

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Non-MP4 slides use a timed fallback. MP4 slides advance precisely when playback ends.
  useEffect(() => {
    if (hovering || !playing || slides.length < 2) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    if (slides[active]?.media.type === "mp4") return;

    const timer = setTimeout(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => clearTimeout(timer);
  }, [active, hovering, playing, slides]);

  const handleVideoEnded = useCallback(
    (index: number) => {
      if (index !== active || slides.length < 2) return;
      setActive((current) => (current + 1) % slides.length);
    },
    [active, slides.length]
  );

  const syncVideo = useCallback(
    (index: number) => {
      const video = videoRefs.current[index];
      if (!video) return;
      if (index !== active) {
        video.pause();
        video.currentTime = 0;
        return;
      }
      video.muted = muted;
      if (playing) {
        // A freshly-mounted <video> may not have buffered enough yet for play() to take —
        // ignore the rejection here and let its onLoadedData handler retry once it's ready.
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    },
    [active, playing, muted]
  );

  // Only the active slide's video actually plays; every other one stays paused and reset.
  useEffect(() => {
    videoRefs.current.forEach((_, index) => syncVideo(index));
  }, [syncVideo]);

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      aria-roledescription="carousel"
      aria-label="Featured Kivo videos"
    >
      {slides.map((slide, index) => {
        const isActive = index === active;
        return (
          <div
            key={slide.id}
            className={[styles.slide, isActive ? styles.slideActive : ""].join(" ")}
            aria-hidden={!isActive}
          >
            <div className={styles.mediaWrap}>
              {slide.media.type === "mp4" ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  className={styles.video}
                  src={slide.media.src}
                  playsInline
                  preload={index === 0 ? "auto" : "none"}
                  onLoadedData={() => syncVideo(index)}
                  onEnded={() => handleVideoEnded(index)}
                />
              ) : (
                <div className={styles.youtubeWrap}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${slide.media.id}?autoplay=${
                      isActive ? 1 : 0
                    }&mute=1&loop=1&playlist=${slide.media.id}&controls=0&modestbranding=1&rel=0&playsinline=1`}
                    title={slide.heading}
                    allow="autoplay; encrypted-media"
                  />
                </div>
              )}
            </div>

            <div className={styles.overlay}>
              <div className="container">
                <h1>{slide.heading}</h1>
                <p>{slide.subheading}</p>
                <Button href={slide.ctaHref} variant="white">
                  {slide.ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <div className={styles.mediaControls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute video" : "Mute video"}
          aria-pressed={!muted}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
              <path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
              <path
                d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause video" : "Play video"}
          aria-pressed={!playing}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 5v14l12-7z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      {slides.length > 1 ? (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={prev} aria-label="Previous slide">
            ‹
          </button>
          <div className={styles.dots} role="tablist" aria-label="Slides">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Go to slide ${index + 1}: ${slide.heading}`}
                className={[styles.dot, index === active ? styles.dotActive : ""].join(" ")}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <button type="button" className={styles.arrow} onClick={next} aria-label="Next slide">
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
