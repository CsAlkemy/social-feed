import { useEffect, useRef } from "react";

export function useInfiniteScroll<T extends HTMLElement>(
  onLoadMore: () => void,
  enabled: boolean,
) {
  const ref = useRef<T>(null);
  const callback = useRef(onLoadMore);
  callback.current = onLoadMore;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) callback.current();
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
