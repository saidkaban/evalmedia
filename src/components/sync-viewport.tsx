"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Viewport = {
  scale: number;
  x: number;
  y: number;
};

const DEFAULT_VIEWPORT: Viewport = { scale: 1, x: 0, y: 0 };
const MIN_SCALE = 1;
const MAX_SCALE = 16;

type Ctx = {
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
  reset: () => void;
};

const ViewportContext = createContext<Ctx | null>(null);

export function SyncViewportProvider({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const reset = useCallback(() => setViewport(DEFAULT_VIEWPORT), []);
  const value = useMemo(() => ({ viewport, setViewport, reset }), [viewport, reset]);
  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>;
}

export function useSyncViewport(): Ctx {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error("useSyncViewport must be used inside SyncViewportProvider");
  return ctx;
}

type PaneProps = {
  src: string;
  alt: string;
  onReady?: () => void;
};

/**
 * An image pane that shares zoom/pan with its siblings through
 * SyncViewportProvider. Wheel zooms around the cursor; drag pans.
 *
 * The viewport is expressed as a normalized { x, y, scale } triplet
 * where x/y are clamped so the image always covers its container.
 * Every pane re-computes its own pixel transform from the shared state,
 * so images of different aspect ratios stay visually aligned on the
 * same region of the original subject.
 */
export function SyncPane({ src, alt, onReady }: PaneProps) {
  const { viewport, setViewport } = useSyncViewport();
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ startX: number; startY: number; vx: number; vy: number } | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const clampViewport = useCallback((next: Viewport): Viewport => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale));
    // Bound pan so image edges never leave the container.
    const maxOffset = (scale - 1) / (2 * scale);
    return {
      scale,
      x: Math.min(maxOffset, Math.max(-maxOffset, next.x)),
      y: Math.min(maxOffset, Math.max(-maxOffset, next.y)),
    };
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setViewport((v) => {
        const zoomFactor = Math.exp(-e.deltaY * 0.0015);
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * zoomFactor));
        // Keep the cursor locked on the same image point while zooming.
        const k = 1 / v.scale - 1 / nextScale;
        return clampViewport({
          scale: nextScale,
          x: v.x + px * k,
          y: v.y + py * k,
        });
      });
    },
    [setViewport, clampViewport],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      containerRef.current.setPointerCapture(e.pointerId);
      draggingRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        vx: viewport.x,
        vy: viewport.y,
      };
    },
    [viewport.x, viewport.y],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - draggingRef.current.startX) / rect.width;
      const dy = (e.clientY - draggingRef.current.startY) / rect.height;
      setViewport((v) =>
        clampViewport({
          scale: v.scale,
          // Convert screen delta into normalized viewport delta.
          x: draggingRef.current!.vx - dx / v.scale,
          y: draggingRef.current!.vy - dy / v.scale,
        }),
      );
    },
    [setViewport, clampViewport],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = null;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const onDoubleClick = useCallback(() => {
    setViewport(DEFAULT_VIEWPORT);
  }, [setViewport]);

  // Translate normalized viewport into CSS transform.
  const scale = viewport.scale;
  const translateX = -viewport.x * 100;
  const translateY = -viewport.y * 100;
  const transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;

  return (
    <div
      ref={containerRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      className="relative h-full w-full cursor-grab overflow-hidden rounded-md bg-black/40 active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform,
          transformOrigin: "center center",
          transition: draggingRef.current ? "none" : "transform 80ms linear",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => {
            setLoaded(true);
            onReady?.();
          }}
          className="max-h-full max-w-full select-none"
        />
      </div>
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted">
          loading...
        </div>
      )}
    </div>
  );
}
