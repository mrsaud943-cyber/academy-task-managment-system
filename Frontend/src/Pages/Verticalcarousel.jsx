// src/components/VerticalCarousel.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Data ─────────────────────────────────────────────────────────
const CARD_DATA = [
  { title: "Gretel-ACTGAN", desc: "Model for generating highly dimensional, mostly numeric, tabular data" },
  { title: "Gretel-ACTGAN", desc: "Model for generating highly dimensional, mostly numeric, tabular data" },
  { title: "Gretel-ACTGAN", desc: "Model for generating highly dimensional, mostly numeric, tabular data" },
  { title: "Gretel-ACTGAN", desc: "Model for generating highly dimensional, mostly numeric, tabular data" },
  { title: "Gretel-ACTGAN", desc: "Model for generating highly dimensional, mostly numeric, tabular data" },
  { title: "Gretel-ACTGAN", desc: "Model for generating highly dimensional, mostly numeric, tabular data" },
];

// ─── Config ─────────────────────────────────────────────────────────
const ITEM_HEIGHT = 130;
const SPEED = 36;
const CARD_WIDTH = 320;
const CARD_MIN_HEIGHT = 100;

// ─── CSS Code Block Component (LEFT side) ─────────────────────────
function CSSCodeBlock() {
  const codeLines = [
    { num: 1,  text: ".center-circle {",                                    color: "#d73a49" },
    { num: 2,  text: "  position: absolute;",                                color: "#6f42c1" },
    { num: 3,  text: "  width: 230px;",                                      color: "#005cc5" },
    { num: 4,  text: "  aspect-ratio: 1 / 1;",                               color: "#6f42c1" },
    { num: 5,  text: "  left: 50%;",                                          color: "#005cc5" },
    { num: 6,  text: "  top: 50%;",                                           color: "#005cc5" },
    { num: 7,  text: "  transform: translate(-50%, -50%);",                   color: "#6f42c1" },
    { num: 8,  text: "  background: #FFFFFF;",                                color: "#005cc5" },
    { num: 9,  text: "  border-radius: 50%;",                                  color: "#6f42c1" },
    { num: 10, text: "}",                                                    color: "#d73a49" },
    { num: 11, text: ".second-circle {",                                     color: "#d73a49" },
    { num: 12, text: "  position: absolute;",                                color: "#6f42c1" },
    { num: 13, text: "  width: 40%;",                                         color: "#005cc5" },
    { num: 14, text: "  aspect-ratio: 1 / 1;",                               color: "#6f42c1" },
    { num: 15, text: "  left: 50%;",                                          color: "#005cc5" },
    { num: 16, text: "  top: 50%;",                                           color: "#005cc5" },
    { num: 17, text: "  transform: translate(-50%, -50%);",                   color: "#6f42c1" },
    { num: 18, text: "  background: #F5F4FE;",                                color: "#005cc5" },
    { num: 19, text: "  opacity: 0.5;",                                       color: "#005cc5" },
    { num: 20, text: "  border-radius: 50%;",                                  color: "#6f42c1" },
    { num: 21, text: "}",                                                    color: "#d73a49" },
    { num: 22, text: ".last-circle {",                                       color: "#d73a49" },
    { num: 23, text: "  position: absolute;",                                color: "#6f42c1" },
    { num: 24, text: "  width: 66%;",                                         color: "#005cc5" },
    { num: 25, text: "  aspect-ratio: 1 / 1;",                               color: "#6f42c1" },
    { num: 26, text: "  left: 50%;",                                          color: "#005cc5" },
    { num: 27, text: "  top: 50%;",                                           color: "#005cc5" },
    { num: 28, text: "  transform: translate(-50%, -50%);",                   color: "#6f42c1" },
    { num: 29, text: "  background: #F5F4FE;",                                color: "#005cc5" },
    { num: 30, text: "  opacity: 0.25;",                                      color: "#005cc5" },
    { num: 31, text: "  border-radius: 50%;",                                  color: "#6f42c1" },
    { num: 32, text: "}",                                                    color: "#d73a49" },
  ];

  return (
    <div 
      className="absolute z-30 rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden"
      style={{
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 340,
        fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
        fontSize: 13,
      }}
    >
      {/* Window title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="ml-2 text-xs text-gray-400 font-medium">style.css</span>
      </div>

      {/* Code content */}
      <div className="py-3 px-2">
        {codeLines.map((line) => (
          <div key={line.num} className="flex">
            <span 
              className="select-none text-right pr-4 text-gray-300"
              style={{ width: 32, fontSize: 12 }}
            >
              {line.num}
            </span>
            <span style={{ color: line.color, whiteSpace: "pre" }}>
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Concentric Circles (CENTER of the page) ──────────────────────
function ConcentricCircles() {
  return (
    <div 
      className="absolute z-10"
      style={{ 
        left: "50%",
        top: "50%", 
        transform: "translate(-50%, -50%)",
        width: 460,
        height: 460,
      }}
    >
      {/* Vertical purple line - full height through center */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 2,
          height: 700,
          background: "rgba(124,109,242,0.18)",
          borderRadius: 9999,
        }}
      />

      {/* Outer circle - .last-circle (largest, opacity 0.25) */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 460,
          height: 460,
          background: "#F5F4FE",
          opacity: 0.25,
          borderRadius: "50%",
        }}
      />

      {/* Middle circle - .second-circle (medium, opacity 0.5) */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          height: 320,
          background: "#F5F4FE",
          opacity: 0.5,
          borderRadius: "50%",
        }}
      />

      {/* Inner circle - .center-circle (230px, white with shadow) */}
      <div
        className="absolute bg-white"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 230,
          height: 230,
          borderRadius: "50%",
          boxShadow: "0 20px 60px rgba(124,109,242,0.18)",
        }}
      />
    </div>
  );
}

// ─── Carousel Cards (RIGHT side, with arc curve) ───────────────────
function CarouselCards({ height }) {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef();
  const lastTimeRef = useRef(performance.now());
  const totalHeight = CARD_DATA.length * ITEM_HEIGHT;

  const tick = useCallback((time) => {
    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    setOffset((prev) => (prev - dt * SPEED + totalHeight) % totalHeight);
    rafRef.current = requestAnimationFrame(tick);
  }, [totalHeight]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const centerY = height / 2;
  // Circle center X is at 50% of container
  const circleCenterX = 0; // relative to center

  return (
    <div className="absolute inset-0">
      {CARD_DATA.map((card, i) =>
        [-1, 0, 1].map((copy) => {
          const y = i * ITEM_HEIGHT - offset + copy * totalHeight + height * 0.15;
          if (y < -ITEM_HEIGHT || y > height + ITEM_HEIGHT) return null;

          const distFromCenter = y + ITEM_HEIGHT / 2 - centerY;
          const norm = Math.max(-1, Math.min(1, distFromCenter / centerY));
          const easeOut = Math.cos((Math.abs(norm) * Math.PI) / 2);

          // Cards positioned to the RIGHT of center with arc
          const xOffset = 140 + easeOut * 220;
          const scale = 0.85 + easeOut * 0.15;
          const opacity = 0.15 + easeOut * 0.85;
          const zIndex = easeOut > 0.4 ? 20 : 0;

          return (
            <div
              key={`${i}-${copy}`}
              className="absolute rounded-2xl bg-white px-6 py-5 shadow-[0_10px_30px_rgba(30,20,80,0.08)] ring-1 ring-slate-100"
              style={{
                top: y,
                left: `calc(50% + ${xOffset}px)`,
                width: CARD_WIDTH,
                minHeight: CARD_MIN_HEIGHT,
                transform: `translateX(-50%) scale(${scale})`,
                opacity,
                zIndex,
              }}
            >
              <p className="text-[16px] font-semibold text-[#6c5ce7]">{card.title}</p>
              <p className="mt-2 text-[14px] leading-snug text-slate-500">{card.desc}</p>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────
export default function VerticalCarousel() {
  const stageHeight = 700;
  return (
    <section className="bg-white py-20">
      <div className="mx-auto flex items-center justify-center px-6">
        <div 
          className="relative w-full" 
          style={{ 
            height: stageHeight,
            maxWidth: 1100,
          }}
        >
          <CSSCodeBlock />
          <ConcentricCircles />
          <CarouselCards height={stageHeight} />
        </div>
      </div>
    </section>
  );
}