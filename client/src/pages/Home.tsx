/**
 * Foundations of AI Ethics — Interactive Kiosk
 * Design: Dark navy + gold accents + white/cream text
 * Portrait orientation optimized for vertical kiosk (1080x1920)
 * Touch-first with progressive disclosure (3 levels)
 * 7-minute idle auto-reset
 * 
 * Uses ref-based measurement for connection lines between nodes.
 */

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
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

const BG_IMAGE_URL = "https://private-us-east-1.manuscdn.com/sessionFile/dvPvZT8Fdt169EOFpRSN1m/sandbox/x5hGUKJgUkDWHWodJDe1Go-img-1_1771864241000_na1fn_YmdfZXRoaWNz.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZHZQdlpUOEZkdDE2OUVPRnBSU04xbS9zYW5kYm94L3g1aEdVS0pnVWtEV0hXb2RKRGUxR28taW1nLTFfMTc3MTg2NDI0MTAwMF9uYTFmbl9ZbWRmWlhSb2FXTnoucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=mECrdXdGyJ1RQyL8xIjbxxKyp1HY~Zj~R6YGN86Mq6FUDFk3Dz7g~~Xbpzyw5xfI78rBzm~1QXjOEJ4nwx5zTnzbkDKRXtoz9AfiHoCD7cYF6Is~mqRd-VeV8xnsz-3HtOTD9b5LlVTGBIm2H4CONoBomGcp3-48nY9~It1bHUcSUoekmMAtyefw4Tp7bcA3~AEhhoIOnDQSHP9iNeNVZLZNGsGJTv9m9Uyrk~DjvpJO-2Ug7pwWtHAeh~D23Umoswu1WZn4MZJcfGOVUIz5Aw7-LPAWW40Sj2LLl7yimz-Gfj7TwLXKyoEL~u7YDlAvzufsYW0U66Lqf~aZCBPE3A__";

/* ===== Subtle Floating Particles ===== */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            top: `${5 + (i * 3.8) % 90}%`,
            left: `${2 + (i * 4.1) % 96}%`,
            background: i % 4 === 0 ? "rgba(212,175,55,0.2)" : "rgba(200,210,230,0.12)",
            animation: `floatDot ${14 + (i % 6) * 3}s ease-in-out infinite`,
            animationDelay: `${(i * 1.1) % 10}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatDot {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-12px) scale(1.4); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [activeConnection, setActiveConnection] = useState<ActiveConnection>(null);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("idle");
  const [idleAnimIndex, setIdleAnimIndex] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for measuring node positions
  const containerRef = useRef<HTMLDivElement>(null);
  const philRefs = useRef<(HTMLDivElement | null)[]>([]);
  const princRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineCoords, setLineCoords] = useState<
    { x1: number; y1: number; x2top: number; y2top: number; x2bot: number; y2bot: number; x3: number; y3: number }[]
  >([]);

  // Measure positions
  const measurePositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const coords = connections.map((conn, i) => {
      const philEl = philRefs.current[i];
      const princEl = princRefs.current[i];
      const pionEl = pionRefs.current[i];
      if (!philEl || !princEl || !pionEl) return { x1: 0, y1: 0, x2top: 0, y2top: 0, x2bot: 0, y2bot: 0, x3: 0, y3: 0 };
      const pRect = philEl.getBoundingClientRect();
      const prRect = princEl.getBoundingClientRect();
      const piRect = pionEl.getBoundingClientRect();
      const dcx = prRect.left + prRect.width / 2 - containerRect.left;
      const dcy = prRect.top + prRect.height / 2 - containerRect.top;
      const dHalfH = prRect.height / 2;
      return {
        x1: pRect.left + pRect.width / 2 - containerRect.left,
        // Find the portrait circle img inside this element and use its bottom edge
        y1: (() => {
          const imgEl = philEl.querySelector('img');
          if (imgEl) {
            const imgRect = imgEl.getBoundingClientRect();
            return imgRect.bottom - containerRect.top;
          }
          return pRect.top + pRect.height * 0.45 - containerRect.top;
        })(),
        x2top: dcx,
        y2top: dcy - dHalfH,
        x2bot: dcx,
        y2bot: dcy + dHalfH,
        x3: piRect.left + piRect.width / 2 - containerRect.left,
        // Find the portrait circle img inside this element and use its top edge
        y3: (() => {
          const imgEl = pionEl.querySelector('img');
          if (imgEl) {
            const imgRect = imgEl.getBoundingClientRect();
            return imgRect.top - containerRect.top;
          }
          return piRect.top - containerRect.top;
        })(),
      };
    });
    setLineCoords(coords);
  }, []);

  useLayoutEffect(() => {
    measurePositions();
    window.addEventListener("resize", measurePositions);
    return () => window.removeEventListener("resize", measurePositions);
  }, [measurePositions]);

  // Also re-measure after images load
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

  useEffect(() => {
    if (detailLevel !== "idle") return;
    const interval = setInterval(() => {
      setIdleAnimIndex((prev) => (prev + 1) % connections.length);
    }, 3000);
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
    return isNodeActive(id) ? 1 : 0.2;
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative flex flex-col"
      style={{
        background: `url(${BG_IMAGE_URL}) center/cover no-repeat`,
      }}
    >
      {/* Dark overlay to ensure readability */}
      <div className="absolute inset-0" style={{ background: "rgba(13,16,32,0.55)", zIndex: 0 }} />
      {/* Floating particles */}
      <FloatingParticles />
      {/* ===== SVG OVERLAY FOR CONNECTIONS ===== */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#d4af37" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#f5d76e" />
            <stop offset="50%" stopColor="#fff8dc" />
            <stop offset="70%" stopColor="#f5d76e" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {lineCoords.map((coords, i) => {
          if (!coords.x1 && !coords.y1) return null;
          const conn = connections[i];
          const dimmed =
            detailLevel !== "idle" && !isNodeActive(conn.philosopherId);

          // Top path: philosopher bottom → diamond top point
          const topPath = `M ${coords.x1} ${coords.y1} C ${coords.x1} ${
            coords.y1 + (coords.y2top - coords.y1) * 0.6
          }, ${coords.x2top} ${coords.y2top - (coords.y2top - coords.y1) * 0.4}, ${
            coords.x2top
          } ${coords.y2top}`;

          // Bottom path: diamond bottom point → pioneer top
          const bottomPath = `M ${coords.x2bot} ${coords.y2bot} C ${coords.x2bot} ${
            coords.y2bot + (coords.y3 - coords.y2bot) * 0.6
          }, ${coords.x3} ${coords.y3 - (coords.y3 - coords.y2bot) * 0.4}, ${
            coords.x3
          } ${coords.y3}`;

          // Static lines — always visible, no glow, no pulse
          const strokeColor = dimmed
            ? "rgba(212,175,55,0.12)"
            : "rgba(212,175,55,0.55)";
          const strokeWidth = 2.2;

          return (
            <g key={conn.philosopherId}>
              <path
                d={topPath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{ transition: "stroke 0.6s" }}
              />
              <path
                d={bottomPath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{ transition: "stroke 0.6s" }}
              />
            </g>
          );
        })}
      </svg>

      {/* ===== TITLE ===== */}
      <div className="text-center pt-[2.5vh] pb-[0.8vh] shrink-0 relative z-[2]">
        <h1
          className="tracking-[0.12em]"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            color: "#d4af37",
            fontWeight: 700,
            fontSize: "clamp(20px, 3.5vw, 40px)",
          }}
        >
          FOUNDATIONS OF AI ETHICS
        </h1>
      </div>

      {/* ===== CLASSICAL PHILOSOPHY BANNER ===== */}
      <div className="flex justify-center shrink-0 mb-[1vh] relative z-[2]">
        <div
          className="px-6 py-1 tracking-[0.2em] font-semibold uppercase"
          style={{
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
            color: "#1a1f3d",
            fontFamily: '"Inter", sans-serif',
            fontSize: "clamp(8px, 1.4vw, 12px)",
          }}
        >
          Classical Philosophy
        </div>
      </div>

      {/* ===== PHILOSOPHERS ROW (convex arc) ===== */}
      <div className="flex justify-around items-start px-2 shrink-0 relative z-[2]" style={{ height: "22vh" }}>
        {philosophers.map((p, i) => {
          // Convex arc: edges lower, center higher (mirroring pioneer concave arc)
          const arcOffsets = [3.5, 1.2, 0, 1.2, 3.5]; // vh units, positive = push down
          const arcOffset = arcOffsets[i] || 0;
          return (
          <div
            key={p.id}
            ref={(el) => { philRefs.current[i] = el; }}
            className="flex flex-col items-center cursor-pointer"
            style={{
              opacity: getNodeOpacity(p.id),
              transition: "opacity 0.5s, transform 0.5s",
              width: "18%",
              transform: `translateY(${arcOffset}vh)`,
            }}
            onClick={() => handleNodeClick(p.id)}
          >
            {/* 3D Portrait with depth */}
            <div style={{ perspective: "500px" }}>
              {/* Shadow beneath portrait */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "70%",
                  height: "10px",
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(4px)",
                }}
              />
              <div
                className="rounded-full overflow-hidden relative"
                style={{
                  width: "clamp(65px, 11vw, 100px)",
                  height: "clamp(65px, 11vw, 100px)",
                  border: `3px solid ${
                    isNodeActive(p.id) ||
                    (detailLevel === "idle" && connections[idleAnimIndex]?.philosopherId === p.id)
                      ? "#f5d76e"
                      : "#4a4a30"
                  }`,
                  boxShadow:
                    isNodeActive(p.id) ||
                    (detailLevel === "idle" && connections[idleAnimIndex]?.philosopherId === p.id)
                      ? "0 6px 24px rgba(212,175,55,0.5), 0 10px 32px rgba(0,0,0,0.3), inset 0 -4px 10px rgba(0,0,0,0.3), inset 0 4px 10px rgba(255,255,255,0.12)"
                      : "0 4px 14px rgba(0,0,0,0.35), inset 0 -3px 8px rgba(0,0,0,0.25), inset 0 3px 8px rgba(255,255,255,0.06)",
                  transform: "rotateX(12deg) rotateY(-3deg)",
                  transition: "box-shadow 0.6s, border-color 0.6s, transform 0.6s",
                }}
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="eager" />
                {/* Top highlight ring */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(170deg, rgba(255,255,255,0.15) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.2) 100%)",
                  }}
                />
              </div>
            </div>
            <p
              className="mt-1.5 text-center font-semibold leading-tight"
              style={{
                fontSize: "clamp(9px, 1.6vw, 13px)",
                color: "#fff",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {p.name}
            </p>
            <p
              className="text-center italic leading-tight"
              style={{
                fontSize: "clamp(6px, 1.1vw, 9px)",
                color: "#d4af37cc",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {p.framework}
            </p>
            <p
              className="text-center leading-tight mt-0.5"
              style={{
                fontSize: "clamp(5px, 0.9vw, 7.5px)",
                color: "rgba(255,255,255,0.5)",
                fontFamily: '"Inter", sans-serif',
                fontStyle: "italic",
                maxWidth: "90%",
              }}
            >
              '{p.quote}'
            </p>
          </div>
          );
        })}
      </div>

      {/* ===== SPACER FOR TOP CONNECTIONS ===== */}
      <div className="shrink-0" style={{ height: "4vh" }} />

      {/* ===== CORE AI ETHICS PRINCIPLES BANNER ===== */}
      <div className="flex justify-center shrink-0 mb-[0.5vh] relative z-[2]">
        <div
          className="px-6 py-1 tracking-[0.2em] font-semibold uppercase"
          style={{
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
            color: "#1a1f3d",
            fontFamily: '"Inter", sans-serif',
            fontSize: "clamp(8px, 1.4vw, 12px)",
          }}
        >
          Core AI Ethics Principles
        </div>
      </div>

      {/* ===== PRINCIPLES ROW ===== */}
      <div className="flex justify-around items-center px-2 shrink-0 relative z-[2]" style={{ height: "12vh" }}>
        {principles.map((pr, i) => {
          const glowing =
            isNodeActive(pr.id) ||
            (detailLevel === "idle" && connections[idleAnimIndex]?.principleId === pr.id);
          return (
            <div
              key={pr.id}
              ref={(el) => { princRefs.current[i] = el; }}
              className="flex items-center justify-center cursor-pointer"
              style={{
                opacity: getNodeOpacity(pr.id),
                transition: "opacity 0.5s",
                width: "18%",
              }}
              onClick={() => handleNodeClick(pr.id)}
            >
              {/* 3D Diamond with layered depth */}
              <div style={{ perspective: "400px" }}>
                {/* Shadow beneath diamond */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "8px",
                    background: "radial-gradient(ellipse, rgba(212,175,55,0.25) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(3px)",
                    opacity: glowing ? 1 : 0.3,
                    transition: "opacity 0.5s",
                  }}
                />
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "clamp(110px, 18vw, 170px)",
                    height: "clamp(65px, 11vw, 95px)",
                    background: glowing
                      ? "linear-gradient(160deg, #f5d76e 0%, #d4af37 35%, #b8941e 65%, #8a6d14 100%)"
                      : "linear-gradient(160deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 50%, rgba(140,110,30,0.08) 100%)",
                    border: `1.5px solid ${glowing ? "#f5d76e" : "rgba(212,175,55,0.25)"}`,
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    boxShadow: glowing
                      ? "0 4px 16px rgba(212,175,55,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.2), inset 0 2px 6px rgba(255,255,255,0.15)"
                      : "0 2px 8px rgba(0,0,0,0.2), inset 0 -1px 4px rgba(0,0,0,0.15), inset 0 1px 4px rgba(255,255,255,0.05)",
                    transform: "rotateX(15deg) rotateY(-2deg)",
                    transition: "all 0.5s",
                  }}
                >
                  {/* Inner highlight streak */}
                  <div
                    style={{
                      position: "absolute",
                      top: "15%",
                      left: "25%",
                      width: "50%",
                      height: "20%",
                      background: glowing
                        ? "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                      clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    className="text-center font-bold uppercase relative"
                    style={{
                      fontSize: "clamp(9px, 1.4vw, 13px)",
                      letterSpacing: "0.04em",
                      color: glowing ? "#1a1f3d" : "#d4af37",
                      fontFamily: '"Inter", sans-serif',
                      lineHeight: 1,
                      textShadow: glowing ? "none" : "0 1px 2px rgba(0,0,0,0.3)",
                      zIndex: 1,
                    }}
                  >
                    {pr.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== SPACER FOR BOTTOM CONNECTIONS ===== */}
      <div className="shrink-0" style={{ height: "4vh" }} />

      {/* ===== MODERN PIONEERS BANNER ===== */}
      <div className="flex justify-center shrink-0 mb-[0.8vh] relative z-[2]">
        <div
          className="px-6 py-1 tracking-[0.2em] font-semibold uppercase"
          style={{
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
            color: "#1a1f3d",
            fontFamily: '"Inter", sans-serif',
            fontSize: "clamp(8px, 1.4vw, 12px)",
          }}
        >
          Modern AI Ethics Pioneers
        </div>
      </div>

      {/* ===== PIONEERS ROW (curved arc) ===== */}
      <div className="flex justify-around items-start px-2 shrink-0 relative z-[2]" style={{ height: "24vh" }}>
        {pioneers.map((p, i) => {
          // U-shape arc: edges high, center low (inverted from philosopher's arch)
          const arcOffsets = [0, 1.2, 2.5, 1.2, 0]; // vh units, positive = push down, edges stay up
          const arcOffset = arcOffsets[i] || 0;
          return (
          <div
            key={p.id}
            ref={(el) => { pionRefs.current[i] = el; }}
            className="flex flex-col items-center cursor-pointer"
            style={{
              opacity: getNodeOpacity(p.id),
              transition: "opacity 0.5s, transform 0.5s",
              width: "18%",
              transform: `translateY(${arcOffset}vh)`,
            }}
            onClick={() => handleNodeClick(p.id)}
          >
            {/* 3D Portrait with depth */}
            <div style={{ perspective: "500px" }}>
              {/* Shadow beneath portrait */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "70%",
                  height: "10px",
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(4px)",
                }}
              />
              <div
                className="rounded-full overflow-hidden relative"
                style={{
                  width: "clamp(65px, 11vw, 100px)",
                  height: "clamp(65px, 11vw, 100px)",
                  border: `3px solid ${
                    isNodeActive(p.id) ||
                    (detailLevel === "idle" && connections[idleAnimIndex]?.pioneerId === p.id)
                      ? "#f5d76e"
                      : "#4a4a30"
                  }`,
                  boxShadow:
                    isNodeActive(p.id) ||
                    (detailLevel === "idle" && connections[idleAnimIndex]?.pioneerId === p.id)
                      ? "0 4px 20px rgba(212,175,55,0.5), 0 8px 30px rgba(0,0,0,0.3), inset 0 -3px 8px rgba(0,0,0,0.25), inset 0 3px 8px rgba(255,255,255,0.1)"
                      : "0 3px 12px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.2), inset 0 2px 6px rgba(255,255,255,0.05)",
                  transform: "rotateX(12deg) rotateY(-3deg)",
                  transition: "box-shadow 0.6s, border-color 0.6s, transform 0.6s",
                }}
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="eager" />
                {/* Top highlight ring */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.15) 100%)",
                  }}
                />
              </div>
            </div>
            <p
              className="mt-1.5 text-center font-semibold leading-tight"
              style={{
                fontSize: "clamp(9px, 1.6vw, 13px)",
                color: "#fff",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {p.name}
            </p>
            <p
              className="text-center italic leading-tight"
              style={{
                fontSize: "clamp(6px, 1.1vw, 9px)",
                color: "#d4af37cc",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {p.field}
            </p>
          </div>
          );
        })}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="text-center shrink-0 mt-auto pb-[1.5vh] relative z-[2]">
        <p
          className="tracking-widest"
          style={{ color: "#5a5a6a", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.2vw, 11px)" }}
        >
          AI-CCORE | University of Nebraska Omaha
        </p>
      </div>

      {/* ===== IDLE HINT ===== */}
      <AnimatePresence>
        {detailLevel === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-[2vh] right-3 z-10"
          >
            <p
              className="italic"
              style={{ color: "rgba(212,175,55,0.45)", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.1vw, 11px)" }}
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
            className="absolute top-[2vh] left-3 z-50 px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.35)",
              color: "#d4af37",
              fontFamily: '"Inter", sans-serif',
              fontSize: "clamp(9px, 1.3vw, 12px)",
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
      className="absolute inset-0 z-40 flex items-center justify-center"
      onClick={onClose}
    >
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.35 }}
      className="w-[88%] max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(13, 16, 32, 0.96)",
          border: "1px solid rgba(212,175,55,0.35)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.08)",
        }}
        onClick={onExpand}
      >
        <div className="flex items-center gap-3 mb-2">
          <img src={phil.image} alt={phil.name} className="w-11 h-11 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
          <div>
            <p className="font-semibold" style={{ color: "#fff", fontFamily: '"Inter", sans-serif', fontSize: "clamp(11px, 1.6vw, 14px)" }}>
              {phil.name} <span style={{ color: "#6a6a7a", fontSize: "0.85em" }}>({phil.dates})</span>
            </p>
            <p className="italic" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(9px, 1.3vw, 11px)" }}>
              {phil.framework}
            </p>
          </div>
        </div>
        <p style={{ color: "#c8c5b8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(9px, 1.3vw, 11px)", lineHeight: 1.5 }}>
          {phil.shortDesc}
        </p>
        <div className="flex items-center gap-2 my-2.5">
          <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.2)" }} />
          <span className="font-bold uppercase tracking-widest" style={{ color: "#d4af37", fontSize: "clamp(8px, 1.1vw, 10px)" }}>
            {princ.name}
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.2)" }} />
        </div>
        <div className="flex items-center gap-3">
          <img src={pion.image} alt={pion.name} className="w-11 h-11 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
          <div>
            <p className="font-semibold" style={{ color: "#fff", fontFamily: '"Inter", sans-serif', fontSize: "clamp(11px, 1.6vw, 14px)" }}>
              {pion.name}
            </p>
            <p className="italic" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(9px, 1.3vw, 11px)" }}>
              {pion.field}
            </p>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span style={{ color: "rgba(212,175,55,0.5)", fontSize: "clamp(8px, 1.1vw, 10px)" }}>Tap to learn more →</span>
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
      className="absolute inset-0 z-40 flex items-center justify-center p-3"
      style={{ background: "rgba(10, 13, 28, 0.94)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #111530 0%, #1a1f3d 100%)",
          border: "1px solid rgba(212,175,55,0.25)",
          maxHeight: "92vh",
          boxShadow: "0 0 60px rgba(212,175,55,0.06)",
        }}
      >
        <div className="p-4 text-center" style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
          <p className="tracking-[0.15em] uppercase font-semibold" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.2vw, 10px)" }}>
            {phil.name} → {princ.name} → {pion.name}
          </p>
        </div>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
          <div className="flex items-center gap-3 mb-2">
            <img src={phil.image} alt={phil.name} className="w-14 h-14 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h3 className="font-bold" style={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: "clamp(14px, 2vw, 18px)" }}>{phil.name}</h3>
              <p style={{ color: "#6a6a7a", fontSize: "clamp(8px, 1.1vw, 10px)" }}>{phil.dates}</p>
              <p className="italic" style={{ color: "#d4af37", fontSize: "clamp(10px, 1.3vw, 12px)" }}>{phil.framework}</p>
            </div>
          </div>
          <blockquote className="italic pl-3 mb-2" style={{ color: "#c8c5b8", borderLeft: "2px solid #d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>
            "{phil.quote}"
          </blockquote>
          <p style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.6 }}>{phil.shortDesc}</p>
        </div>
        <div className="p-4 text-center" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)", background: "rgba(212,175,55,0.03)" }}>
          <h4 className="font-bold uppercase tracking-wider mb-1" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(12px, 1.6vw, 15px)" }}>{princ.name}</h4>
          <p style={{ color: "#c8c5b8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.6 }}>{princ.shortDesc}</p>
          <p className="italic mt-1.5" style={{ color: "#6a6a7a", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.1vw, 10px)" }}>{connection.bridgeText}</p>
        </div>
        <div className="p-4" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
          <div className="flex items-center gap-3 mb-2">
            <img src={pion.image} alt={pion.name} className="w-14 h-14 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h3 className="font-bold" style={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: "clamp(14px, 2vw, 18px)" }}>{pion.name}</h3>
              <p className="italic" style={{ color: "#d4af37", fontSize: "clamp(10px, 1.3vw, 12px)" }}>{pion.field}</p>
              <p style={{ color: "#6a6a7a", fontSize: "clamp(8px, 1.1vw, 10px)" }}>{pion.institution}</p>
            </div>
          </div>
          <p style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.6 }}>{pion.shortDesc}</p>
          <p className="mt-1.5" style={{ color: "#6a6a7a", fontSize: "clamp(8px, 1.1vw, 10px)" }}>
            📖 <em>{pion.book}</em> ({pion.bookYear})
          </p>
        </div>
        <div className="p-3 flex gap-3 justify-center">
          <button onClick={onBack} className="px-4 py-2 rounded-full font-medium" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>← Back</button>
          <button onClick={onDeepDive} className="px-4 py-2 rounded-full font-semibold" style={{ background: "linear-gradient(135deg, #d4af37, #b8941e)", color: "#1a1f3d", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>Read More →</button>
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
      className="absolute inset-0 z-40 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #0d1020 0%, #1a1f3d 8%, #1a1f3d 92%, #0d1020 100%)" }}
    >
      <div className="max-w-lg mx-auto p-4 pb-16">
        <div className="text-center mb-5 pt-3">
          <p className="tracking-[0.15em] uppercase font-semibold" style={{ color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.2vw, 10px)" }}>
            {phil.name} → {princ.name} → {pion.name}
          </p>
          <div className="mt-2 h-px" style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />
        </div>

        {/* Classical Foundation */}
        <section className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <img src={phil.image} alt={phil.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h2 className="font-bold" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(16px, 2.2vw, 20px)" }}>Classical Foundation</h2>
              <p style={{ color: "#fff", fontSize: "clamp(10px, 1.4vw, 13px)" }}>{phil.name} — {phil.framework}</p>
            </div>
          </div>
          <blockquote className="italic pl-3 mb-2" style={{ color: "#c8c5b8", borderLeft: "2px solid #d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>"{phil.quote}"</blockquote>
          <p style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.7 }}>{phil.fullDesc}</p>
        </section>

        <div className="h-px my-5" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />

        {/* Core Principle */}
        <section className="mb-5">
          <div className="text-center mb-2">
            <h2 className="font-bold uppercase tracking-wider" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(16px, 2.2vw, 20px)" }}>{princ.name}</h2>
            <p className="italic mt-0.5" style={{ color: "#6a6a7a", fontSize: "clamp(8px, 1.1vw, 10px)" }}>Core AI Ethics Principle</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.1)" }}>
            <p style={{ color: "#c8c5b8", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.7 }}>{princ.fullDesc}</p>
          </div>
          <p className="italic text-center mt-2" style={{ color: "#6a6a7a", fontFamily: '"Inter", sans-serif', fontSize: "clamp(8px, 1.1vw, 10px)" }}>{connection.bridgeText}</p>
        </section>

        <div className="h-px my-5" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />

        {/* Modern Application */}
        <section className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <img src={pion.image} alt={pion.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #d4af37" }} />
            <div>
              <h2 className="font-bold" style={{ color: "#d4af37", fontFamily: '"Playfair Display", serif', fontSize: "clamp(16px, 2.2vw, 20px)" }}>Modern Application</h2>
              <p style={{ color: "#fff", fontSize: "clamp(10px, 1.4vw, 13px)" }}>{pion.name} — {pion.field}</p>
              <p style={{ color: "#6a6a7a", fontSize: "clamp(8px, 1.1vw, 10px)" }}>{pion.institution}</p>
            </div>
          </div>
          <p className="mb-2" style={{ color: "#a8a598", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)", lineHeight: 1.7 }}>{pion.fullDesc}</p>
          <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.1)" }}>
            <p style={{ color: "#d4af37", fontSize: "clamp(8px, 1.1vw, 10px)" }}>📖 <em>{pion.book}</em> ({pion.bookYear}) — {pion.institution}</p>
          </div>
        </section>

        <div className="flex gap-3 justify-center pt-3">
          <button onClick={onBack} className="px-4 py-2 rounded-full font-medium" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>← Back</button>
          <button onClick={onOverview} className="px-4 py-2 rounded-full font-semibold" style={{ background: "linear-gradient(135deg, #d4af37, #b8941e)", color: "#1a1f3d", fontFamily: '"Inter", sans-serif', fontSize: "clamp(10px, 1.3vw, 12px)" }}>Back to Overview</button>
        </div>
      </div>
    </motion.div>
  );
}
