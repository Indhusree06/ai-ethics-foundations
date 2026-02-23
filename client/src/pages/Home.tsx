/**
 * Foundations of AI Ethics — Interactive Kiosk
 * Design: Dark navy + gold accents + white/cream text
 * Portrait orientation optimized for vertical kiosk (1080x1920)
 * Touch-first with progressive disclosure (3 levels)
 * 7-minute idle auto-reset
 *
 * Redesigned idle state:
 * - Floating constellation particle background
 * - "CORE AI ETHICS PRINCIPLES" banner labeling the middle tier
 * - Shield-shaped principle nodes with descriptive icons
 * - Organic curved connection lines with traveling light pulses
 * - Gold + white + cream color palette (not just gold)
 * - "Touch any node to explore the connections" prompt
 */

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  philosophers,
  principles,
  pioneers,
  connections,
  type Connection,
} from "@/lib/data";

type ActiveConnection = Connection | null;
type DetailLevel = "idle" | "level1" | "level2" | "level3";

const IDLE_TIMEOUT = 7 * 60 * 1000;

/* ===== Principle Icons as inline SVG ===== */
const principleIcons: Record<string, React.ReactNode> = {
  explicability: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M7.05 7.05 5.636 5.636M18.364 18.364 16.95 16.95M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05" />
    </svg>
  ),
  autonomy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21c0-3.5 2.9-6.5 6.5-6.5s6.5 3 6.5 6.5" />
    </svg>
  ),
  beneficence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  justice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 3v18M4 7h16M7 7l-3 8h6L7 7zM17 7l-3 8h6L17 7z" />
    </svg>
  ),
  "non-maleficence": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

/* ===== Floating Constellation Particles ===== */
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }[] = [];

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const colors = ["#d4af37", "#f5d76e", "#fff8dc", "#ffffff", "#c8a82e", "#e8dcc8"];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.15 + 0.08,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.06;
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55, zIndex: 0 }}
    />
  );
}

/* ===== Main Component ===== */
export default function Home() {
  const [activeConnection, setActiveConnection] = useState<ActiveConnection>(null);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("idle");
  const [idleAnimIndex, setIdleAnimIndex] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const philRefs = useRef<(HTMLDivElement | null)[]>([]);
  const princRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineCoords, setLineCoords] = useState<
    { x1: number; y1: number; x2: number; y2: number; x2top: number; y2top: number; x2bot: number; y2bot: number; x3: number; y3: number }[]
  >([]);

  const measurePositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const coords = connections.map((_conn, i) => {
      const philEl = philRefs.current[i];
      const princEl = princRefs.current[i];
      const pionEl = pionRefs.current[i];
      if (!philEl || !princEl || !pionEl) return { x1: 0, y1: 0, x2: 0, y2: 0, x2top: 0, y2top: 0, x2bot: 0, y2bot: 0, x3: 0, y3: 0 };
      const pRect = philEl.getBoundingClientRect();
      const prRect = princEl.getBoundingClientRect();
      const piRect = pionEl.getBoundingClientRect();
      // Diamond center
      const dcx = prRect.left + prRect.width / 2 - containerRect.left;
      const dcy = prRect.top + prRect.height / 2 - containerRect.top;
      // Diamond half-size (it's rotated 45deg, so top point is center - half height)
      const dHalf = prRect.height / 2;
      return {
        x1: pRect.left + pRect.width / 2 - containerRect.left,
        y1: pRect.bottom - containerRect.top,
        x2: dcx,
        y2: dcy,
        x2top: dcx,
        y2top: dcy - dHalf, // top point of diamond
        x2bot: dcx,
        y2bot: dcy + dHalf, // bottom point of diamond
        x3: piRect.left + piRect.width / 2 - containerRect.left,
        y3: piRect.top - containerRect.top,
      };
    });
    setLineCoords(coords);
  }, []);

  useLayoutEffect(() => {
    measurePositions();
    window.addEventListener("resize", measurePositions);
    return () => window.removeEventListener("resize", measurePositions);
  }, [measurePositions]);

  useEffect(() => {
    const timer = setTimeout(measurePositions, 500);
    return () => clearTimeout(timer);
  }, [measurePositions]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setActiveConnection(null);
      setDetailLevel("idle");
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    const handler = () => resetIdleTimer();
    window.addEventListener("touchstart", handler);
    window.addEventListener("click", handler);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("click", handler);
    };
  }, [resetIdleTimer]);

  // Idle animation: cycle through connections
  useEffect(() => {
    if (detailLevel !== "idle") return;
    const interval = setInterval(() => {
      setIdleAnimIndex((prev) => (prev + 1) % connections.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [detailLevel]);

  const handleNodeClick = (connectionOrId: string) => {
    const conn = connections.find(
      (c) =>
        c.philosopherId === connectionOrId ||
        c.principleId === connectionOrId ||
        c.pioneerId === connectionOrId
    );
    if (!conn) return;
    if (
      activeConnection &&
      activeConnection.philosopherId === conn.philosopherId &&
      detailLevel === "level1"
    ) {
      setDetailLevel("level2");
    } else {
      setActiveConnection(conn);
      setDetailLevel("level1");
    }
  };

  const handleBackToOverview = () => {
    setActiveConnection(null);
    setDetailLevel("idle");
  };

  const isNodeActive = (id: string) => {
    if (!activeConnection) return false;
    return (
      activeConnection.philosopherId === id ||
      activeConnection.principleId === id ||
      activeConnection.pioneerId === id
    );
  };

  const getNodeOpacity = (id: string) => {
    if (detailLevel === "idle") return 1;
    return isNodeActive(id) ? 1 : 0.15;
  };

  const isIdleHighlighted = (id: string) => {
    if (detailLevel !== "idle") return false;
    const conn = connections[idleAnimIndex];
    return conn?.philosopherId === id || conn?.principleId === id || conn?.pioneerId === id;
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #1a2040 0%, #111530 30%, #0a0e20 70%, #060810 100%)",
      }}
    >
      {/* ===== FLOATING PARTICLES BACKGROUND ===== */}
      <FloatingParticles />

      {/* ===== SVG OVERLAY FOR CONNECTIONS ===== */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible", zIndex: 1 }}
      >
        <defs>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#e8dcc8" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#e8dcc8" floodOpacity="0.2" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="creamPulse" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8dcc8" />
            <stop offset="50%" stopColor="#fff8dc" />
            <stop offset="100%" stopColor="#e8dcc8" />
          </linearGradient>
        </defs>
        {lineCoords.map((coords, i) => {
          if (!coords.x1 && !coords.y1) return null;
          const conn = connections[i];
          const glowing =
            isNodeActive(conn.philosopherId) ||
            (detailLevel === "idle" && idleAnimIndex === i);
          const dimmed =
            detailLevel !== "idle" && !isNodeActive(conn.philosopherId);

          // Tree branch: philosopher bottom → diamond top point
          // Organic curve like poster: control points create visible curvature
          const topDy = coords.y2top - coords.y1;
          const topDx = coords.x2top - coords.x1;
          // Add horizontal offset for organic feel (even when vertically aligned)
          const topBulge = Math.abs(topDx) < 30 ? (i % 2 === 0 ? 40 : -40) : 0;
          const topPath = `M ${coords.x1} ${coords.y1} C ${coords.x1 + topBulge} ${coords.y1 + topDy * 0.65}, ${coords.x2top - topBulge * 0.3} ${coords.y2top - topDy * 0.35}, ${coords.x2top} ${coords.y2top}`;

          // Tree root: diamond bottom point → pioneer top
          const botDy = coords.y3 - coords.y2bot;
          const botDx = coords.x3 - coords.x2bot;
          const botBulge = Math.abs(botDx) < 30 ? (i % 2 === 0 ? -40 : 40) : 0;
          const bottomPath = `M ${coords.x2bot} ${coords.y2bot} C ${coords.x2bot + botBulge} ${coords.y2bot + botDy * 0.65}, ${coords.x3 - botBulge * 0.3} ${coords.y3 - botDy * 0.35}, ${coords.x3} ${coords.y3}`;

          // Cream/gold palette — not too much gold
          // All lines visible; active ones brighter
          const baseStroke = dimmed
            ? "rgba(232,220,200,0.06)"
            : glowing
            ? "#e8dcc8"
            : "rgba(232,220,200,0.25)";
          const baseWidth = glowing ? 2 : 1.5;

          return (
            <g key={conn.philosopherId}>
              {/* Base paths */}
              <path d={topPath} fill="none" stroke={baseStroke} strokeWidth={baseWidth} strokeLinecap="round" style={{ transition: "all 0.8s ease" }} />
              <path d={bottomPath} fill="none" stroke={baseStroke} strokeWidth={baseWidth} strokeLinecap="round" style={{ transition: "all 0.8s ease" }} />

              {glowing && (
                <>
                  {/* Soft glow behind active line */}
                  <path d={topPath} fill="none" stroke="#e8dcc8" strokeWidth={5} filter="url(#softGlow)" opacity={0.2} />
                  <path d={bottomPath} fill="none" stroke="#e8dcc8" strokeWidth={5} filter="url(#softGlow)" opacity={0.2} />

                  {/* Traveling light pulse — top path */}
                  <path
                    d={topPath}
                    fill="none"
                    stroke="url(#creamPulse)"
                    strokeWidth={2.5}
                    strokeDasharray="20 200"
                    strokeLinecap="round"
                    filter="url(#goldGlow)"
                    opacity={0.75}
                  >
                    <animate attributeName="stroke-dashoffset" from="220" to="0" dur="2.5s" repeatCount="indefinite" />
                  </path>

                  {/* Traveling light pulse — bottom path */}
                  <path
                    d={bottomPath}
                    fill="none"
                    stroke="url(#creamPulse)"
                    strokeWidth={2.5}
                    strokeDasharray="20 200"
                    strokeLinecap="round"
                    filter="url(#goldGlow)"
                    opacity={0.75}
                  >
                    <animate attributeName="stroke-dashoffset" from="220" to="0" dur="2.5s" repeatCount="indefinite" begin="1s" />
                  </path>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* ===== TITLE ===== */}
      <div className="text-center pt-[2.5vh] pb-[0.5vh] shrink-0 relative" style={{ zIndex: 2 }}>
        <h1
          className="tracking-[0.12em]"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            color: "#d4af37",
            fontWeight: 700,
            fontSize: "clamp(20px, 3.5vw, 40px)",
            textShadow: "0 0 30px rgba(212,175,55,0.12)",
          }}
        >
          FOUNDATIONS OF AI ETHICS
        </h1>
        <div className="mx-auto mt-1" style={{ width: "55%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)" }} />
      </div>

      {/* ===== CLASSICAL PHILOSOPHY BANNER ===== */}
      <div className="flex justify-center shrink-0 mb-[0.6vh] relative" style={{ zIndex: 2 }}>
        <div
          className="px-6 py-0.5 tracking-[0.2em] font-semibold uppercase"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)",
            color: "#e8dcc8",
            fontFamily: '"Inter", sans-serif',
            fontSize: "clamp(7px, 1.2vw, 11px)",
            borderTop: "1px solid rgba(212,175,55,0.12)",
            borderBottom: "1px solid rgba(212,175,55,0.12)",
          }}
        >
          Classical Philosophy
        </div>
      </div>

      {/* ===== PHILOSOPHERS ROW ===== */}
      <div className="flex justify-around items-start px-2 shrink-0 relative" style={{ zIndex: 2 }}>
        {philosophers.map((p, i) => {
          const highlighted = isIdleHighlighted(p.id);
          return (
            <div
              key={p.id}
              ref={(el) => { philRefs.current[i] = el; }}
              className="flex flex-col items-center cursor-pointer"
              style={{
                opacity: getNodeOpacity(p.id),
                transition: "opacity 0.6s, transform 0.4s",
                width: "18%",
                transform: highlighted ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => handleNodeClick(p.id)}
            >
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: "clamp(50px, 9vw, 82px)",
                  height: "clamp(50px, 9vw, 82px)",
                  border: `2.5px solid ${
                    isNodeActive(p.id) || highlighted ? "#d4af37" : "rgba(255,248,220,0.12)"
                  }`,
                  boxShadow:
                    isNodeActive(p.id) || highlighted
                      ? "0 0 20px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.12)"
                      : "0 0 6px rgba(0,0,0,0.25)",
                  transition: "box-shadow 0.6s, border-color 0.6s",
                }}
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="eager" />
              </div>
              <p
                className="mt-1.5 text-center font-semibold leading-tight"
                style={{
                  fontSize: "clamp(8px, 1.5vw, 12px)",
                  color: highlighted ? "#ffffff" : "#e0dcd0",
                  fontFamily: '"Inter", sans-serif',
                  transition: "color 0.4s",
                }}
              >
                {p.name}
              </p>
              <p
                className="text-center italic leading-tight"
                style={{
                  fontSize: "clamp(6px, 1.1vw, 9px)",
                  color: highlighted ? "#d4af37" : "rgba(212,175,55,0.45)",
                  fontFamily: '"Inter", sans-serif',
                  transition: "color 0.4s",
                }}
              >
                {p.framework}
              </p>
            </div>
          );
        })}
      </div>

      {/* ===== SPACER ===== */}
      <div className="grow" style={{ minHeight: "2vh" }} />

      {/* ===== CORE AI ETHICS PRINCIPLES BANNER ===== */}
      <div className="flex justify-center shrink-0 mb-[0.3vh] relative" style={{ zIndex: 2 }}>
        <div
          className="px-5 py-0.5 tracking-[0.25em] font-semibold uppercase"
          style={{
            color: "#d4af37",
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: "clamp(7px, 1.1vw, 10px)",
            textShadow: "0 0 15px rgba(212,175,55,0.15)",
          }}
        >
          Core AI Ethics Principles
        </div>
      </div>

      {/* ===== PRINCIPLES ROW (Diamond shapes with icons) ===== */}
      <div className="flex justify-around items-center px-1 shrink-0 relative" style={{ zIndex: 2, minHeight: "8vh" }}>
        {principles.map((pr, i) => {
          const glowing =
            isNodeActive(pr.id) ||
            (detailLevel === "idle" && connections[idleAnimIndex]?.principleId === pr.id);
          return (
            <div
              key={pr.id}
              ref={(el) => { princRefs.current[i] = el; }}
              className="flex flex-col items-center cursor-pointer"
              style={{
                opacity: getNodeOpacity(pr.id),
                transition: "opacity 0.6s, transform 0.4s",
                width: "18%",
                transform: glowing ? "scale(1.1)" : "scale(1)",
              }}
              onClick={() => handleNodeClick(pr.id)}
            >
              {/* Diamond shape via CSS rotate with principle name text inside */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: "clamp(56px, 10vw, 82px)",
                  height: "clamp(56px, 10vw, 82px)",
                  background: glowing
                    ? "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.06))"
                    : "rgba(255,248,220,0.02)",
                  border: `1.5px solid ${glowing ? "#d4af37" : "rgba(255,248,220,0.1)"}`,
                  transform: "rotate(45deg)",
                  boxShadow: glowing
                    ? "0 0 18px rgba(212,175,55,0.3), inset 0 0 10px rgba(212,175,55,0.06)"
                    : "none",
                  transition: "background 0.6s, border-color 0.6s, box-shadow 0.6s",
                }}
              >
                <span
                  className="font-bold uppercase text-center leading-tight"
                  style={{
                    transform: "rotate(-45deg)",
                    fontSize: "clamp(5px, 0.8vw, 7px)",
                    letterSpacing: "0.03em",
                    color: glowing ? "#d4af37" : "rgba(255,248,220,0.4)",
                    fontFamily: '"Inter", sans-serif',
                    transition: "color 0.6s",
                    maxWidth: "clamp(42px, 8vw, 62px)",
                    wordBreak: "break-word",
                    lineHeight: 1.1,
                  }}
                >
                  {pr.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== SPACER ===== */}
      <div className="grow" style={{ minHeight: "2vh" }} />

      {/* ===== MODERN AI ETHICS PIONEERS BANNER ===== */}
      <div className="flex justify-center shrink-0 mb-[0.6vh] relative" style={{ zIndex: 2 }}>
        <div
          className="px-6 py-0.5 tracking-[0.2em] font-semibold uppercase"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)",
            color: "#e8dcc8",
            fontFamily: '"Inter", sans-serif',
            fontSize: "clamp(7px, 1.2vw, 11px)",
            borderTop: "1px solid rgba(212,175,55,0.12)",
            borderBottom: "1px solid rgba(212,175,55,0.12)",
          }}
        >
          Modern AI Ethics Pioneers
        </div>
      </div>

      {/* ===== PIONEERS ROW ===== */}
      <div className="flex justify-around items-start px-2 shrink-0 relative" style={{ zIndex: 2 }}>
        {pioneers.map((p, i) => {
          const highlighted = isIdleHighlighted(p.id);
          return (
            <div
              key={p.id}
              ref={(el) => { pionRefs.current[i] = el; }}
              className="flex flex-col items-center cursor-pointer"
              style={{
                opacity: getNodeOpacity(p.id),
                transition: "opacity 0.6s, transform 0.4s",
                width: "18%",
                transform: highlighted ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => handleNodeClick(p.id)}
            >
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: "clamp(50px, 9vw, 82px)",
                  height: "clamp(50px, 9vw, 82px)",
                  border: `2.5px solid ${
                    isNodeActive(p.id) || highlighted ? "#d4af37" : "rgba(255,248,220,0.12)"
                  }`,
                  boxShadow:
                    isNodeActive(p.id) || highlighted
                      ? "0 0 20px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.12)"
                      : "0 0 6px rgba(0,0,0,0.25)",
                  transition: "box-shadow 0.6s, border-color 0.6s",
                }}
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="eager" />
              </div>
              <p
                className="mt-1.5 text-center font-semibold leading-tight"
                style={{
                  fontSize: "clamp(8px, 1.5vw, 12px)",
                  color: highlighted ? "#ffffff" : "#e0dcd0",
                  fontFamily: '"Inter", sans-serif',
                  transition: "color 0.4s",
                }}
              >
                {p.name}
              </p>
              <p
                className="text-center italic leading-tight"
                style={{
                  fontSize: "clamp(6px, 1.1vw, 9px)",
                  color: highlighted ? "#d4af37" : "rgba(212,175,55,0.45)",
                  fontFamily: '"Inter", sans-serif',
                  transition: "color 0.4s",
                }}
              >
                {p.field}
              </p>
            </div>
          );
        })}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="text-center shrink-0 pb-[1.5vh] pt-[1.5vh] relative" style={{ zIndex: 2 }}>
        <p
          className="tracking-widest"
          style={{ color: "rgba(255,248,220,0.2)", fontFamily: '"Inter", sans-serif', fontSize: "clamp(7px, 1vw, 10px)" }}
        >
          AI-CCORE | University of Nebraska Omaha
        </p>
      </div>

      {/* ===== IDLE HINT (bottom-right corner) ===== */}
      <AnimatePresence>
        {detailLevel === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 0.65, 0.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="absolute bottom-[0.8vh] right-3"
            style={{ zIndex: 10 }}
          >
            <p
              className="italic"
              style={{
                color: "rgba(255,248,220,0.45)",
                fontFamily: '"Inter", sans-serif',
                fontSize: "clamp(8px, 1.1vw, 11px)",
                letterSpacing: "0.05em",
              }}
            >
              Touch any node to explore
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BACK BUTTON ===== */}
      <AnimatePresence>
        {detailLevel !== "idle" && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleBackToOverview}
            className="absolute top-[2vh] left-3 px-3 py-1.5 rounded-full font-medium"
            style={{
              zIndex: 50,
              background: "rgba(10,14,32,0.85)",
              border: "1px solid rgba(212,175,55,0.35)",
              color: "#e8dcc8",
              fontFamily: '"Inter", sans-serif',
              fontSize: "clamp(9px, 1.3vw, 12px)",
              backdropFilter: "blur(8px)",
            }}
          >
            ← Overview
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== LEVEL 1 INFO CARD ===== */}
      <AnimatePresence>
        {detailLevel === "level1" && activeConnection && (
          <Level1Card connection={activeConnection} onExpand={() => setDetailLevel("level2")} onClose={handleBackToOverview} />
        )}
      </AnimatePresence>

      {/* ===== LEVEL 2 PANEL ===== */}
      <AnimatePresence>
        {detailLevel === "level2" && activeConnection && (
          <Level2Panel
            connection={activeConnection}
            onDeepDive={() => setDetailLevel("level3")}
            onBack={() => setDetailLevel("level1")}
            onClose={handleBackToOverview}
          />
        )}
      </AnimatePresence>

      {/* ===== LEVEL 3 PANEL ===== */}
      <AnimatePresence>
        {detailLevel === "level3" && activeConnection && (
          <Level3Panel
            connection={activeConnection}
            onBack={() => setDetailLevel("level2")}
            onOverview={handleBackToOverview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Level 1 Card ============ */
function Level1Card({ connection, onExpand, onClose }: { connection: Connection; onExpand: () => void; onClose: () => void }) {
  const phil = philosophers.find((p) => p.id === connection.philosopherId)!;
  const princ = principles.find((p) => p.id === connection.principleId)!;
  const pion = pioneers.find((p) => p.id === connection.pioneerId)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 40 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.35 }}
        className="w-[88%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(10, 14, 32, 0.96)",
            border: "1px solid rgba(212,175,55,0.3)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.05)",
          }}
          onClick={onExpand}
        >
          {/* Philosopher */}
          <div className="flex items-center gap-3 mb-2">
            <img src={phil.image} alt={phil.name} className="w-11 h-11 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <p className="font-semibold" style={{ color: "#ffffff", fontFamily: '"Inter", sans-serif', fontSize: "clamp(11px, 1.6vw, 14px)" }}>
                {phil.name} <span style={{ color: "rgba(255,248,220,0.35)", fontSize: "0.85em" }}>({phil.dates})</span>
              </p>
              <p className="italic" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(9px, 1.3vw, 11px)" }}>
                {phil.framework}
              </p>
            </div>
          </div>
          <p style={{ color: "#c8c5b8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(9px, 1.3vw, 11px)", lineHeight: 1.5 }}>
            {phil.shortDesc}
          </p>

          {/* Principle divider with icon */}
          <div className="flex items-center gap-2 my-2.5">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.25))" }} />
            <div className="flex items-center gap-1.5">
              <div style={{ width: "14px", height: "14px", color: "#d4af37" }}>
                {principleIcons[connection.principleId]}
              </div>
              <span className="font-bold uppercase tracking-widest" style={{ color: "#d4af37", fontSize: "clamp(8px, 1.1vw, 10px)" }}>
                {princ.name}
              </span>
            </div>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.25), transparent)" }} />
          </div>

          {/* Pioneer */}
          <div className="flex items-center gap-3">
            <img src={pion.image} alt={pion.name} className="w-11 h-11 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <p className="font-semibold" style={{ color: "#ffffff", fontFamily: '"Inter", sans-serif', fontSize: "clamp(11px, 1.6vw, 14px)" }}>
                {pion.name}
              </p>
              <p className="italic" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(9px, 1.3vw, 11px)" }}>
                {pion.field}
              </p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span style={{ color: "rgba(255,248,220,0.35)", fontSize: "clamp(8px, 1.1vw, 10px)", letterSpacing: "0.05em" }}>Tap to learn more →</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============ Level 2 Panel ============ */
function Level2Panel({
  connection,
  onDeepDive,
  onBack,
  onClose,
}: {
  connection: Connection;
  onDeepDive: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const phil = philosophers.find((p) => p.id === connection.philosopherId)!;
  const princ = principles.find((p) => p.id === connection.principleId)!;
  const pion = pioneers.find((p) => p.id === connection.pioneerId)!;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 flex items-center justify-center p-3"
      style={{ zIndex: 40, background: "rgba(6, 8, 16, 0.93)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #0e1228 0%, #141833 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
          maxHeight: "92vh",
          boxShadow: "0 0 80px rgba(212,175,55,0.03)",
        }}
      >
        {/* Header */}
        <div className="p-4 text-center" style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div className="flex items-center justify-center gap-2">
            <div style={{ width: "16px", height: "16px", color: "#d4af37" }}>
              {principleIcons[connection.principleId]}
            </div>
            <p className="tracking-[0.15em] uppercase font-semibold" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.2vw, 10px)" }}>
              {phil.name} → {princ.name} → {pion.name}
            </p>
          </div>
        </div>

        {/* Philosopher section */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,248,220,0.04)" }}>
          <div className="flex items-center gap-3 mb-2">
            <img src={phil.image} alt={phil.name} className="w-14 h-14 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h3 className="font-bold" style={{ color: "#ffffff", fontFamily: '"Playfair Display", serif', fontSize: "clamp(14px, 2vw, 18px)" }}>{phil.name}</h3>
              <p style={{ color: "rgba(255,248,220,0.3)", fontSize: "clamp(8px, 1.1vw, 10px)" }}>{phil.dates}</p>
              <p className="italic" style={{ color: "#d4af37", fontSize: "clamp(10px, 1.3vw, 12px)" }}>{phil.framework}</p>
            </div>
          </div>
          <blockquote className="italic pl-3 mb-2" style={{ color: "#e8dcc8", borderLeft: "2px solid #d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>
            "{phil.quote}"
          </blockquote>
          <p style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.6 }}>{phil.shortDesc}</p>
        </div>

        {/* Principle section */}
        <div className="p-4 text-center" style={{ borderBottom: "1px solid rgba(255,248,220,0.04)", background: "rgba(212,175,55,0.015)" }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div style={{ width: "20px", height: "20px", color: "#d4af37" }}>
              {principleIcons[connection.principleId]}
            </div>
            <h4 className="font-bold uppercase tracking-wider" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(12px, 1.6vw, 15px)" }}>{princ.name}</h4>
          </div>
          <p style={{ color: "#c8c5b8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.6 }}>{princ.shortDesc}</p>
          <p className="italic mt-1.5" style={{ color: "rgba(255,248,220,0.25)", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.1vw, 10px)" }}>{connection.bridgeText}</p>
        </div>

        {/* Pioneer section */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,248,220,0.04)" }}>
          <div className="flex items-center gap-3 mb-2">
            <img src={pion.image} alt={pion.name} className="w-14 h-14 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h3 className="font-bold" style={{ color: "#ffffff", fontFamily: '"Playfair Display", serif', fontSize: "clamp(14px, 2vw, 18px)" }}>{pion.name}</h3>
              <p className="italic" style={{ color: "#d4af37", fontSize: "clamp(10px, 1.3vw, 12px)" }}>{pion.field}</p>
              <p style={{ color: "rgba(255,248,220,0.3)", fontSize: "clamp(8px, 1.1vw, 10px)" }}>{pion.institution}</p>
            </div>
          </div>
          <p style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.6 }}>{pion.shortDesc}</p>
          <p className="mt-1.5" style={{ color: "rgba(255,248,220,0.25)", fontSize: "clamp(8px, 1.1vw, 10px)" }}>
            📖 <em>{pion.book}</em> ({pion.bookYear})
          </p>
        </div>

        {/* Buttons */}
        <div className="p-3 flex gap-3 justify-center">
          <button onClick={onBack} className="px-4 py-2 rounded-full font-medium" style={{ background: "rgba(255,248,220,0.03)", border: "1px solid rgba(212,175,55,0.2)", color: "#e8dcc8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>← Back</button>
          <button onClick={onDeepDive} className="px-4 py-2 rounded-full font-semibold" style={{ background: "linear-gradient(135deg, #d4af37, #b8941e)", color: "#0a0e20", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>Read More →</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============ Level 3 Panel ============ */
function Level3Panel({
  connection,
  onBack,
  onOverview,
}: {
  connection: Connection;
  onBack: () => void;
  onOverview: () => void;
}) {
  const phil = philosophers.find((p) => p.id === connection.philosopherId)!;
  const princ = principles.find((p) => p.id === connection.principleId)!;
  const pion = pioneers.find((p) => p.id === connection.pioneerId)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 overflow-y-auto"
      style={{ zIndex: 40, background: "radial-gradient(ellipse at 50% 20%, #111530 0%, #0a0e20 50%, #060810 100%)" }}
    >
      <div className="max-w-lg mx-auto p-4 pb-16">
        {/* Header */}
        <div className="text-center mb-5 pt-3">
          <div className="flex items-center justify-center gap-2">
            <div style={{ width: "18px", height: "18px", color: "#d4af37" }}>
              {principleIcons[connection.principleId]}
            </div>
            <p className="tracking-[0.15em] uppercase font-semibold" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.2vw, 10px)" }}>
              {phil.name} → {princ.name} → {pion.name}
            </p>
          </div>
          <div className="mt-2 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)" }} />
        </div>

        {/* Classical Foundation */}
        <section className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <img src={phil.image} alt={phil.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h2 className="font-bold" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(16px, 2.2vw, 20px)" }}>Classical Foundation</h2>
              <p style={{ color: "#ffffff", fontSize: "clamp(10px, 1.4vw, 13px)" }}>{phil.name} — {phil.framework}</p>
            </div>
          </div>
          <blockquote className="italic pl-3 mb-2" style={{ color: "#e8dcc8", borderLeft: "2px solid #d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>"{phil.quote}"</blockquote>
          <p style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.7 }}>{phil.fullDesc}</p>
        </section>

        <div className="h-px my-5" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)" }} />

        {/* Core Principle */}
        <section className="mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{ width: "22px", height: "22px", color: "#d4af37" }}>
              {principleIcons[connection.principleId]}
            </div>
            <h2 className="font-bold uppercase tracking-wider" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(16px, 2.2vw, 20px)" }}>{princ.name}</h2>
          </div>
          <p className="italic text-center mb-2" style={{ color: "rgba(255,248,220,0.3)", fontSize: "clamp(8px, 1.1vw, 10px)" }}>Core AI Ethics Principle</p>
          <div className="rounded-lg p-3" style={{ background: "rgba(212,175,55,0.015)", border: "1px solid rgba(212,175,55,0.06)" }}>
            <p style={{ color: "#c8c5b8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.7 }}>{princ.fullDesc}</p>
          </div>
          <p className="italic text-center mt-2" style={{ color: "rgba(255,248,220,0.25)", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.1vw, 10px)" }}>{connection.bridgeText}</p>
        </section>

        <div className="h-px my-5" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)" }} />

        {/* Modern Application */}
        <section className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <img src={pion.image} alt={pion.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h2 className="font-bold" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(16px, 2.2vw, 20px)" }}>Modern Application</h2>
              <p style={{ color: "#ffffff", fontSize: "clamp(10px, 1.4vw, 13px)" }}>{pion.name} — {pion.field}</p>
              <p style={{ color: "rgba(255,248,220,0.3)", fontSize: "clamp(8px, 1.1vw, 10px)" }}>{pion.institution}</p>
            </div>
          </div>
          <p className="mb-2" style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.7 }}>{pion.fullDesc}</p>
          <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.015)", border: "1px solid rgba(212,175,55,0.06)" }}>
            <p style={{ color: "#d4af37", fontSize: "clamp(8px, 1.1vw, 10px)" }}>📖 <em>{pion.book}</em> ({pion.bookYear}) — {pion.institution}</p>
          </div>
        </section>

        {/* Buttons */}
        <div className="flex gap-3 justify-center pt-3">
          <button onClick={onBack} className="px-4 py-2 rounded-full font-medium" style={{ background: "rgba(255,248,220,0.03)", border: "1px solid rgba(212,175,55,0.2)", color: "#e8dcc8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>← Back</button>
          <button onClick={onOverview} className="px-4 py-2 rounded-full font-semibold" style={{ background: "linear-gradient(135deg, #d4af37, #b8941e)", color: "#0a0e20", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>Back to Overview</button>
        </div>
      </div>
    </motion.div>
  );
}
