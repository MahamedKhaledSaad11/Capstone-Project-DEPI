// ──────────────────────────────────────────────
// EVGuard — useIntersectionObserver Hook
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

/**
 * Detect when an element enters the viewport.
 * @param {object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (default 0.1)
 * @param {string} options.rootMargin - Root margin (default "0px")
 * @returns {{ ref: React.RefObject, isIntersecting: boolean }}
 */
export default function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
} = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Once visible, stop observing
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold, rootMargin]);

  return { ref, isIntersecting };
}
