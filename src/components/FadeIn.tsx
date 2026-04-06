"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export default function FadeIn({ children, delay = 0, direction = "up", className = "" }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldBypassAnimation = Boolean(prefersReducedMotion);

  const directionOffset = 40;
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? directionOffset : direction === "down" ? -directionOffset : 0,
      x: direction === "left" ? directionOffset : direction === "right" ? -directionOffset : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      initial={shouldBypassAnimation ? "visible" : "hidden"}
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
