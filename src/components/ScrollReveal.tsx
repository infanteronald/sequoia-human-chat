"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ReactNode } from "react";

type Animation = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const animations: Record<Animation, { hidden: string; visible: string }> = {
  "fade-up": {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  "fade-down": {
    hidden: "opacity-0 -translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  "fade-left": {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  "fade-right": {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  "zoom-in": {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
  "fade": {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ once });
  const anim = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${isVisible ? anim.visible : anim.hidden} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* Staggered children — wraps each child with incremental delay */
interface StaggerProps {
  children: ReactNode[];
  animation?: Animation;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  childClassName?: string;
}

export function StaggerReveal({
  children,
  animation = "fade-up",
  staggerDelay = 100,
  duration = 600,
  className = "",
  childClassName = "",
}: StaggerProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const anim = animations[animation];

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className={`transition-all ease-out ${isVisible ? anim.visible : anim.hidden} ${childClassName}`}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${i * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
