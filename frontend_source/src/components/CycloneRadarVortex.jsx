import { useTheme } from '../context/ThemeContext';

/**
 * CycloneRadarVortex
 * High-fidelity meteorological Doppler radar & cyclone swirl graphic.
 * Hardware-accelerated SVG with rotating convective spiral arms, sweeping Doppler radar beam,
 * range rings, and pulsing eyewall core.
 */
export default function CycloneRadarVortex({
  size = 'hero', // 'hero' | 'large' | 'medium' | 'header' | 'badge' | number
  status = 'default', // 'default' | 'safe' | 'intermediate' | 'severe' | 'cyan'
  showScanline = true,
  showLabels = false,
  showRings = true,
  interactive = true,
  speed = 'normal', // 'slow' | 'normal' | 'fast'
  className = '',
}) {
  const { isDark } = useTheme();

  // Determine pixel dimensions based on preset
  const dimension = typeof size === 'number'
    ? size
    : {
        hero: 380,
        large: 260,
        medium: 130,
        header: 64,
        badge: 36,
      }[size] || 380;

  // Status color palettes
  const colorMap = {
    default: {
      primary: '#00d4ff',
      secondary: '#0077b6',
      accent: '#38bdf8',
      core: '#e0f2fe',
      glow: 'rgba(0, 212, 255, 0.45)',
      ring: isDark ? 'rgba(0, 212, 255, 0.18)' : 'rgba(2, 132, 199, 0.25)',
      sweep: isDark ? 'rgba(0, 212, 255, 0.22)' : 'rgba(2, 132, 199, 0.25)',
      arm1: isDark ? '#00d4ff' : '#0284c7',
      arm2: isDark ? '#38bdf8' : '#0369a1',
      arm3: isDark ? '#7dd3fc' : '#0ea5e9',
    },
    cyan: {
      primary: '#00d4ff',
      secondary: '#0284c7',
      accent: '#38bdf8',
      core: '#f0f9ff',
      glow: 'rgba(0, 212, 255, 0.45)',
      ring: isDark ? 'rgba(0, 212, 255, 0.18)' : 'rgba(2, 132, 199, 0.25)',
      sweep: isDark ? 'rgba(0, 212, 255, 0.22)' : 'rgba(2, 132, 199, 0.25)',
      arm1: isDark ? '#00d4ff' : '#0284c7',
      arm2: isDark ? '#38bdf8' : '#0369a1',
      arm3: isDark ? '#7dd3fc' : '#0ea5e9',
    },
    safe: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      core: '#ecfdf5',
      glow: 'rgba(16, 185, 129, 0.45)',
      ring: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.25)',
      sweep: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(5, 150, 105, 0.25)',
      arm1: isDark ? '#10b981' : '#059669',
      arm2: isDark ? '#34d399' : '#10b981',
      arm3: isDark ? '#6ee7b7' : '#047857',
    },
    intermediate: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      core: '#fffbeb',
      glow: 'rgba(245, 158, 11, 0.45)',
      ring: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.25)',
      sweep: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(217, 119, 6, 0.25)',
      arm1: isDark ? '#f59e0b' : '#d97706',
      arm2: isDark ? '#fbbf24' : '#b45309',
      arm3: isDark ? '#fcd34d' : '#f59e0b',
    },
    severe: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
      core: '#fef2f2',
      glow: 'rgba(239, 68, 68, 0.55)',
      ring: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(220, 38, 38, 0.28)',
      sweep: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(220, 38, 38, 0.28)',
      arm1: isDark ? '#ef4444' : '#dc2626',
      arm2: isDark ? '#f87171' : '#b91c1c',
      arm3: isDark ? '#fca5a5' : '#ef4444',
    },
  };

  const colors = colorMap[status] || colorMap.default;

  // Animation duration
  const vortexDuration = speed === 'fast' ? '7s' : speed === 'slow' ? '18s' : '12s';
  const sweepDuration = speed === 'fast' ? '2.5s' : speed === 'slow' ? '6s' : '4s';
  const counterDuration = speed === 'fast' ? '14s' : speed === 'slow' ? '30s' : '22s';

  const isCompact = dimension <= 72;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full overflow-visible"
        style={{ filter: `drop-shadow(0 0 ${isCompact ? '8px' : '24px'} ${colors.glow})` }}
      >
        <defs>
          {/* Radial Gradient for Radar Background Glow */}
          <radialGradient id={`vortex-glow-${status}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity={isDark ? "0.22" : "0.15"} />
            <stop offset="45%" stopColor={colors.secondary} stopOpacity={isDark ? "0.08" : "0.05"} />
            <stop offset="100%" stopColor={colors.secondary} stopOpacity="0" />
          </radialGradient>

          {/* Sweeper Conic / Wedge Gradient */}
          <linearGradient id={`sweep-grad-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.85" />
            <stop offset="40%" stopColor={colors.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </linearGradient>

          {/* Eyewall Core Pulse Gradient */}
          <radialGradient id={`eyewall-grad-${status}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor={colors.primary} stopOpacity="0.8" />
            <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </radialGradient>

          {/* Spiral Arm 1 Gradient */}
          <linearGradient id={`arm1-grad-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.arm1} stopOpacity="0.95" />
            <stop offset="50%" stopColor={colors.arm2} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.arm3} stopOpacity="0.05" />
          </linearGradient>

          {/* Spiral Arm 2 Gradient */}
          <linearGradient id={`arm2-grad-${status}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.arm2} stopOpacity="0.9" />
            <stop offset="60%" stopColor={colors.arm3} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.arm1} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ambient Radar Dish Background */}
        <circle cx="200" cy="200" r="195" fill={`url(#vortex-glow-${status})`} />

        {/* 1. DOPPLER RADAR CONCENTRIC RANGE RINGS */}
        {showRings && (
          <g className="radar-rings" stroke={colors.ring} strokeWidth="1" fill="none">
            {/* Range Rings: 50km, 100km, 150km, 200km */}
            <circle cx="200" cy="200" r="45" strokeDasharray="3 3" />
            <circle cx="200" cy="200" r="90" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="140" strokeDasharray="5 5" />
            <circle cx="200" cy="200" r="190" strokeWidth="1.5" />

            {/* Azimuth Crosshairs */}
            <line x1="200" y1="5" x2="200" y2="395" strokeWidth="0.8" strokeDasharray="6 6" />
            <line x1="5" y1="200" x2="395" y2="200" strokeWidth="0.8" strokeDasharray="6 6" />
            <line x1="62" y1="62" x2="338" y2="338" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.6" />
            <line x1="338" y1="62" x2="62" y2="338" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.6" />

            {/* Range Ring Distance Markers */}
            {showLabels && !isCompact && (
              <g fontSize="9" fontFamily="monospace" fill={colors.primary} opacity="0.75" textAnchor="middle">
                <text x="200" y="105">100 KM</text>
                <text x="200" y="55">200 KM</text>
                <text x="200" y="18">300 KM</text>
                <text x="382" y="203" fontSize="8">090°</text>
                <text x="200" y="396" fontSize="8">180°</text>
                <text x="18" y="203" fontSize="8">270°</text>
                <text x="200" y="12" fontSize="8" fontWeight="bold">N 000°</text>
              </g>
            )}
          </g>
        )}

        {/* 2. OUTER SLOW COUNTER-SWIRL CONVECTIVE FEEDER BANDS */}
        <g
          className="cyclone-outer-spiral origin-center"
          style={{
            animation: `cyclone-rotate-cw ${counterDuration} linear infinite`,
            transformOrigin: '200px 200px',
          }}
        >
          {/* Feeder Band 1 */}
          <path
            d="M 200,200 Q 260,140 320,100 T 385,160"
            fill="none"
            stroke={colors.primary}
            strokeWidth={isCompact ? 1.5 : 2.5}
            strokeLinecap="round"
            strokeDasharray="8 6"
            opacity="0.35"
          />
          {/* Feeder Band 2 */}
          <path
            d="M 200,200 Q 140,260 80,300 T 15,240"
            fill="none"
            stroke={colors.accent}
            strokeWidth={isCompact ? 1.5 : 2.5}
            strokeLinecap="round"
            strokeDasharray="8 6"
            opacity="0.35"
          />
        </g>

        {/* 3. MAIN LOGARITHMIC CYCLONE SPIRAL ARMS (Counter-Clockwise Rotation) */}
        <g
          className="cyclone-main-vortex origin-center"
          style={{
            animation: `cyclone-rotate-ccw ${vortexDuration} linear infinite`,
            transformOrigin: '200px 200px',
          }}
        >
          {/* Main Primary Inflow Arm */}
          <path
            d="M 200 200 C 240 170, 290 190, 310 240 C 330 290, 290 350, 220 370 C 150 390, 70 340, 50 260 C 30 180, 80 90, 160 55 C 240 20, 340 70, 375 150"
            fill="none"
            stroke={`url(#arm1-grad-${status})`}
            strokeWidth={isCompact ? 4 : 8}
            strokeLinecap="round"
            strokeDasharray="180 30"
            opacity="0.88"
          />

          {/* Secondary Secondary Inflow Arm (180° offset) */}
          <path
            d="M 200 200 C 160 230, 110 210, 90 160 C 70 110, 110 50, 180 30 C 250 10, 330 60, 350 140 C 370 220, 320 310, 240 345 C 160 380, 60 330, 25 250"
            fill="none"
            stroke={`url(#arm2-grad-${status})`}
            strokeWidth={isCompact ? 3 : 6}
            strokeLinecap="round"
            strokeDasharray="150 25"
            opacity="0.75"
          />

          {/* Inner High-Density Convective Eyewall Band */}
          <path
            d="M 200 200 C 215 185, 235 190, 240 210 C 245 230, 225 255, 195 255 C 165 255, 145 225, 150 195 C 155 165, 190 145, 220 150"
            fill="none"
            stroke={colors.primary}
            strokeWidth={isCompact ? 2.5 : 4.5}
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Embedded Doppler Reflectivity Rainband Blobs */}
          {!isCompact && (
            <g fill={colors.primary} opacity="0.6">
              <circle cx="280" cy="210" r="4" />
              <circle cx="295" cy="245" r="5" />
              <circle cx="260" cy="300" r="4.5" />
              <circle cx="120" cy="190" r="4" />
              <circle cx="105" cy="155" r="5" />
              <circle cx="140" cy="100" r="4.5" />
              <circle cx="230" cy="85" r="3.5" />
              <circle cx="330" cy="130" r="4" />
            </g>
          )}
        </g>

        {/* 4. ROTATING DOPPLER RADAR SWEEP BEAM */}
        {showScanline && (
          <g
            className="radar-sweep-beam origin-center"
            style={{
              animation: `radar-sweep ${sweepDuration} linear infinite`,
              transformOrigin: '200px 200px',
            }}
          >
            {/* Scan Wedge */}
            <path
              d="M 200 200 L 200 10 A 190 190 0 0 1 334 65 Z"
              fill={`url(#sweep-grad-${status})`}
              opacity="0.6"
            />
            {/* Sharp Leading Sweep Ray */}
            <line
              x1="200"
              y1="200"
              x2="334"
              y2="65"
              stroke={colors.primary}
              strokeWidth={isCompact ? 1.5 : 2}
              strokeLinecap="round"
              opacity="0.95"
            />
            <circle cx="334" cy="65" r={isCompact ? 2 : 3} fill={colors.core} />
          </g>
        )}

        {/* 5. CENTRAL CYCLONE EYE & PULSING EYEWALL RING */}
        <g className="cyclone-eyewall">
          {/* Eyewall Halo */}
          <circle
            cx="200"
            cy="200"
            r={isCompact ? 14 : 26}
            fill={`url(#eyewall-grad-${status})`}
            className="animate-pulse"
            style={{ animationDuration: '2s' }}
          />

          {/* Eyewall Boundary */}
          <circle
            cx="200"
            cy="200"
            r={isCompact ? 10 : 18}
            fill="none"
            stroke={colors.primary}
            strokeWidth={isCompact ? 1.5 : 2.5}
            strokeDasharray="4 2"
            className="origin-center"
            style={{
              animation: `cyclone-rotate-cw 4s linear infinite`,
              transformOrigin: '200px 200px',
            }}
          />

          {/* Calm Center Eye (Low Pressure Core) */}
          <circle
            cx="200"
            cy="200"
            r={isCompact ? 4 : 7}
            fill={isDark ? '#0a1628' : '#ffffff'}
            stroke={colors.primary}
            strokeWidth={isCompact ? 1.2 : 2}
          />
          <circle cx="200" cy="200" r={isCompact ? 1.5 : 2.5} fill={colors.primary} />
        </g>
      </svg>
    </div>
  );
}
