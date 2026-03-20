"use client";

import { useEffect } from "react";

export function HomeAnimations() {
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    sections.forEach((section, i) => {
      if (i === 0) return; // skip trust strip
      const el = section as HTMLElement;
      
      // Check if already in viewport (fast scroll / page bottom)
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (inView) {
        // Already visible — animate immediately with stagger
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        el.style.transition = "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });
      } else {
        // Not visible yet — set up observer
        el.style.opacity = "0";
        el.style.transform = "translateY(32px)";
        el.style.transition = "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
        observer.observe(el);
      }
    });

    // ── Stagger category tiles ──
    const categoryGrid = document.querySelector(".grid.grid-cols-2.md\\:grid-cols-3");
    if (categoryGrid) {
      const tileObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              Array.from((entry.target as HTMLElement).children).forEach((child, i) => {
                const el = child as HTMLElement;
                el.style.opacity = "0";
                el.style.transform = "translateY(24px) scale(0.97)";
                el.style.transition = `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s`;
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0) scale(1)";
                  });
                });
              });
              tileObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      tileObserver.observe(categoryGrid);
    }

    // ── Stagger stats counters ──
    const statsGrid = document.querySelector(".grid.grid-cols-3.gap-6");
    if (statsGrid) {
      const statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              Array.from((entry.target as HTMLElement).children).forEach((child, i) => {
                const el = child as HTMLElement;
                el.style.opacity = "0";
                el.style.transform = "translateY(16px)";
                el.style.transition = `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15 + 0.2}s`;
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                  });
                });
              });
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      statObserver.observe(statsGrid);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
