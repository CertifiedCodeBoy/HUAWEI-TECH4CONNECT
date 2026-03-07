import { useState, useEffect, useRef } from "react";

/**
 * Hook: returns true when the element is within `rootMargin` of the viewport.
 * Once visible, stays true (mounts once, never unmounts the heavy canvas).
 */
export function useInView(rootMargin = "200px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect(); // mount once, never unmount
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
