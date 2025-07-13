import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WordBreakdown } from '../types';

interface TooltipProps {
  breakdown: WordBreakdown;
  targetRect: DOMRect;
}

const Tooltip: React.FC<TooltipProps> = ({ breakdown, targetRect }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (tooltipRef.current && targetRect) {
      const tooltipEl = tooltipRef.current;
      const { width: tooltipWidth, height: tooltipHeight } = tooltipEl.getBoundingClientRect();

      let top = targetRect.top - tooltipHeight - 8; // 8px gap above
      let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);

      // Adjust if it goes off-screen
      if (top < 8) { // If it's off the top of the screen, place it below
        top = targetRect.bottom + 8;
      }
      if (left < 8) { // Left edge
        left = 8;
      }
      if (left + tooltipWidth > window.innerWidth - 8) { // Right edge
        left = window.innerWidth - tooltipWidth - 8;
      }

      setPosition({ top, left });
    }
  }, [targetRect, breakdown]);

  const tooltipElement = document.getElementById('tooltip-root');
  if (!tooltipElement) return null;

  return createPortal(
    <div 
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: position.top === -9999 ? 0 : 1,
        transition: 'opacity 0.1s ease-in-out',
      }}
      className="w-72 p-4 bg-slate-950 border-2 border-amber-300 rounded-lg shadow-2xl z-50"
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Root</h4>
          <p className="text-lg">
            <span className="font-bold text-sky-300">{breakdown.root.text}</span>: <span className="text-slate-200">{breakdown.root.meaning}</span>
          </p>
        </div>
        
        {breakdown.suffixes.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Suffixes</h4>
            <ul className="space-y-2 mt-1">
              {breakdown.suffixes.map((suffix, index) => (
                <li key={index}>
                  <p className="font-bold text-lg">
                    <span className="text-fuchsia-400">{suffix.text}</span>: <span className="text-slate-200">{suffix.meaning}</span>
                  </p>
                  <p className="text-sm text-slate-400 italic">Function: {suffix.function}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
       <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">This word has been added to your glossary.</p>
       </div>
    </div>,
    tooltipElement
  );
};

export default Tooltip;