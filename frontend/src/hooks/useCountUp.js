// ──────────────────────────────────────────────
// EVGuard — useCountUp Hook
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

/**
 * Animate a number from 0 to target value.
 * @param {number} target - Target value to count up to
 * @param {number} duration - Animation duration in ms (default 2000)
 * @param {number} decimals - Number of decimal places (default 0)
 * @param {boolean} startOnView - Whether to start when element is in view
 * @returns {number} Current animated value
 */
export default function useCountUp(target, duration = 2000, decimals = 0, startOnView = true) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, target, duration, decimals]);

  return { value, ref };
}
