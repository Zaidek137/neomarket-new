import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import { useTheme } from "../../hooks/useTheme";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
    animationDuration?: number;
    animationDelay?: number;
  }>;
  lineColor?: string;
}

export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ 
    height: 150,
    grid: "diagonal",
    spacing: 28
  });
  
  const { theme } = useTheme();

  const svgMap = map.getSVG({
    radius: 0.18,
    color: theme === "dark" ? "#FFFFFF20" : "#00000020",
    shape: "circle",
    backgroundColor: "transparent"
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] bg-transparent rounded-lg relative font-sans">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        <defs>
          <radialGradient id="region-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: dot.animationDuration || 3,
                  delay: dot.animationDelay || 0,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                }}
              />
              
              {/* Animated dots at start and end points */}
              <motion.circle
                cx={startPoint.x}
                cy={startPoint.y}
                r="3"
                fill={lineColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  delay: dot.animationDelay || 0,
                  repeat: Infinity,
                  repeatDelay: dot.animationDuration ? dot.animationDuration - 2 : 1
                }}
              />
              
              <motion.circle
                cx={endPoint.x}
                cy={endPoint.y}
                r="3"
                fill={lineColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  delay: (dot.animationDelay || 0) + 1,
                  repeat: Infinity,
                  repeatDelay: dot.animationDuration ? dot.animationDuration - 2 : 1
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}