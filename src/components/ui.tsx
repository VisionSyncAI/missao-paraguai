"use client";

import { motion, type MotionProps } from "framer-motion";

export function Fade({ children, className = "", delay = 0, ...rest }: MotionProps & { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] tracking-[0.28em] uppercase text-gray mb-4">{children}</p>;
}
