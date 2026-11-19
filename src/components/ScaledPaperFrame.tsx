import React, { useEffect, useRef, useState } from 'react';

interface ScaledPaperFrameProps {
  children: React.ReactNode;
  pageLabel: string;
}

const PAPER_WIDTH = 1122;
const PAPER_HEIGHT = 793;

export const ScaledPaperFrame: React.FC<ScaledPaperFrameProps> = ({
  children,
  pageLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableWidth = el.clientWidth;
      if (availableWidth > 0) {
        const nextScale = Math.min(1, availableWidth / PAPER_WIDTH);
        setScale(nextScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="print-sheet-page w-full flex flex-col items-center">
      <div className="no-print w-full max-w-[1123px] flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-medium text-slate-600">{pageLabel}</span>
        <span className="text-xs font-mono-num text-slate-500">
          A4 แนวนอน · 297 × 210 มม. · ย่อ/ขยาย {Math.round(scale * 100)}%
        </span>
      </div>

      <div
        ref={containerRef}
        className="print-inner-box w-full max-w-[1123px]"
        style={{
          height: `${Math.round(PAPER_HEIGHT * scale)}px`,
        }}
      >
        <div
          className="print-scale-wrapper origin-top-left bg-white shadow-sm border border-slate-300"
          style={{
            width: `${PAPER_WIDTH}px`,
            height: `${PAPER_HEIGHT}px`,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
