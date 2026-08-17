import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Cpu, Zap, Globe, Users, Lock } from 'lucide-react';
import FloatingDock from './components/ui/FloatingDock';
import ProtocolSlider from './components/ProtocolSlider';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY FUNCTION: setupCanvasSequence
//
// Astrazione a livello logico (non un componente React) che incapsula
// il preloading dei frame, il render con aspect-ratio "cover" e lo
// ScrollTrigger con pin sull'elemento container.
// Restituisce una funzione di cleanup per essere usata nel return del
// blocco matchMedia di App.
// ─────────────────────────────────────────────────────────────────────────────
const setupCanvasSequence = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  frameCount: number,
  getFrameUrl: (index: number) => string,
  scrollEnd: string = '+=5000',
  onProgress?: (pct: number) => void,
  onLoadComplete?: () => void,
): (() => void) => {
  let images: HTMLImageElement[] = [];
  const imageSeq = { frame: 0 };
  let loadedCount = 0;
  let imagesLoaded = false;  // flag: fetch avviato?

  // ── Riutilizzo frame precaricati (evita re-decode sul main thread) ─────────
  const cachedFrames = (window as any).__aurexFrames as HTMLImageElement[] | undefined;
  if (cachedFrames && cachedFrames.length === frameCount) {
    images = cachedFrames;
    imagesLoaded = true;
    loadedCount = frameCount;
  }

  // ── Render Pixel-Perfect — High-DPI / Retina / 4K ────────────────────────
  // Guard clause: se le immagini non sono ancora arrivate, usciamo silenziosamente.
  // Questo previene errori in console quando lo scrub GSAP scatta prima del fetch.
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Guard clause lazy-load ───────────────────────────────────────────────
    if (images.length === 0) return;
    const img = images[Math.round(imageSeq.frame)];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // ── 1. Imposta buffer fisico ─────────────────────────────────────────────
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // ── 2. Azzera trasformazioni e scala al pixel CSS ────────────────────────
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // ── 3. Interpolazione (smoothing senza quality 'high' per FPS su mobile) ─
    ctx.imageSmoothingEnabled = true;

    // ── 4. Cover centrato in coordinate CSS ──────────────────────────────────
    const hRatio = rect.width / img.naturalWidth;
    const vRatio = rect.height / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (rect.width - img.naturalWidth * ratio) / 2;
    const centerShift_y = (rect.height - img.naturalHeight * ratio) / 2;

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight,
      centerShift_x, centerShift_y,
      img.naturalWidth * ratio, img.naturalHeight * ratio,
    );
  };

  // ── Resize listener ───────────────────────────────────────────────────────
  const handleResize = () => { render(); };
  handleResize();
  window.addEventListener('resize', handleResize);

  // ── ScrollTrigger animazione frame (scrub) ────────────────────────────────
  if (!triggerRef.current) return () => { };
  const st = gsap.to(imageSeq, {
    frame: frameCount - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: triggerRef.current,
      start: 'top top',
      end: scrollEnd,
      scrub: 0.5,
      pin: true,
    },
    onUpdate: render,
  });

  // ── Tilt 3D canvas al mouse ────────────────────────────────────────────────
  const hero = triggerRef.current;
  const canvasEl = canvasRef.current;
  let onMouseMove: ((e: MouseEvent) => void) | null = null;
  let onMouseLeave: (() => void) | null = null;

  if (hero && canvasEl) {
    onMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      gsap.to(canvasEl, {
        rotateY: dx * 4, rotateX: -dy * 3,
        x: dx * 8, y: dy * 5,
        duration: 0.8, ease: 'power2.out',
        transformPerspective: 800, transformOrigin: 'center center',
        overwrite: 'auto',
        force3D: true,
      });
    };
    onMouseLeave = () => {
      gsap.to(canvasEl, {
        rotateY: 0, rotateX: 0, x: 0, y: 0,
        duration: 1.2, ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto',
        force3D: true,
      });
    };
    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);
  }

  // ── LAZY LOAD: funzione di fetch immagini ─────────────────────────────────
  // Viene invocata dal preloadTrigger (sotto) solo quando la sezione
  // si avvicina alla viewport — non immediatamente all'avvio.
  const loadImages = () => {
    if (imagesLoaded) return;       // idempotente: esegui una sola volta
    imagesLoaded = true;

    const onLoad = () => {
      loadedCount += 1;
      onProgress?.(Math.round((loadedCount / frameCount) * 100));
      if (loadedCount === frameCount) {
        render();
        onLoadComplete?.();
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = onLoad;
      img.onerror = onLoad;         // conta anche gli errori per non bloccare
      images.push(img);
    }
  };

  // ── ScrollTrigger di prossimità (lazy trigger) ────────────────────────────
  // `once: true` + `onEnter` → il fetch parte una sola volta quando la sezione
  // entra nella viewport con 150% di anticipo (1.5 viewport di distanza).
  const triggerEl = triggerRef.current;
  if (!triggerEl) return () => { };
  const preloadTrigger = ScrollTrigger.create({
    trigger: triggerEl,
    start: 'top bottom+=150%',    // inizia a caricare 1.5 viewport prima
    once: true,
    onEnter: loadImages,
  });

  // ── Funzione di cleanup (ritornata al chiamante) ───────────────────────────
  return () => {
    window.removeEventListener('resize', handleResize);
    preloadTrigger.kill();          // rimuove il proximity listener
    if (st?.scrollTrigger) st.scrollTrigger.kill();
    st?.kill();
    const h = triggerRef.current;
    if (h && onMouseMove) h.removeEventListener('mousemove', onMouseMove);
    if (h && onMouseLeave) h.removeEventListener('mouseleave', onMouseLeave);
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 1: Diagnostic Shuffler
// ─────────────────────────────────────────────────────────────────────────────
const DECK_DATA = [
  { label: 'PROB. MODEL', value: '94.7%', sub: 'BAYES_CORE_v3' },
  { label: 'DATA POINTS', value: '12.4K', sub: 'DATASET_Ω' },
  { label: 'CONFIDENCE', value: '99.1%', sub: 'SIGMA_FILTER' },
];

function DiagnosticShuffler({ reducedMotion }: { reducedMotion: boolean }) {
  const deckRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef([0, 1, 2]);
  const isAnimRef = useRef(false);

  const getCardEl = (i: number) =>
    deckRef.current?.children[i] as HTMLElement | undefined;

  const POSITIONS = [
    { x: 0, y: 0, rotateY: 0, scale: 1, zIndex: 3 },
    { x: 10, y: 8, rotateY: -8, scale: 0.92, zIndex: 2 },
    { x: 20, y: 16, rotateY: -16, scale: 0.84, zIndex: 1 },
  ];

  const applyOrder = useCallback((order: number[], animate: boolean) => {
    order.forEach((cardIdx, posIdx) => {
      const el = getCardEl(cardIdx);
      if (!el) return;
      animate
        ? gsap.to(el, { ...POSITIONS[posIdx], duration: 0.55, ease: 'power3.inOut', overwrite: true })
        : gsap.set(el, POSITIONS[posIdx]);
    });
  }, []);

  useEffect(() => {
    applyOrder(orderRef.current, false);
  }, [applyOrder]);

  const shuffle = useCallback(() => {
    if (isAnimRef.current || reducedMotion) return;
    isAnimRef.current = true;

    const [front, ...rest] = orderRef.current;
    const frontEl = getCardEl(front);
    if (!frontEl) { isAnimRef.current = false; return; }

    gsap.to(frontEl, {
      x: 120, opacity: 0, rotateY: 20, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        orderRef.current = [...rest, front];
        applyOrder(orderRef.current, false);
        gsap.set(frontEl, { x: 120, opacity: 0, rotateY: 20 });
        gsap.to(frontEl, {
          x: 20, opacity: 1, duration: 0.3, ease: 'power2.out',
          onComplete: () => { isAnimRef.current = false; },
        });
      },
    });

    rest.forEach((_, i) => {
      const el = getCardEl(rest[i]);
      if (!el) return;
      gsap.to(el, { ...POSITIONS[i], duration: 0.55, ease: 'power3.inOut', overwrite: true });
    });
  }, [applyOrder, reducedMotion]);

  return (
    <div
      className="h-20 relative cursor-pointer"
      style={{ perspective: '400px' }}
      onMouseEnter={shuffle}
      aria-label="Deck interattivo di modelli diagnostici"
    >
      <div ref={deckRef} className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {DECK_DATA.map((d, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-[#0d0d0d] border border-brand-gold/30 flex items-center justify-between px-4"
            style={{ borderRadius: 2 }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] text-brand-gold/50 tracking-widest uppercase">{d.label}</span>
              <span className="font-mono text-xs text-brand-gold/30 tracking-widest">{d.sub}</span>
            </div>
            <span className="font-mono text-lg font-bold text-brand-gold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 2: Telemetry Typewriter
// ─────────────────────────────────────────────────────────────────────────────
const LOG_LINES = [
  '> INIT AI_ENGINE_AUREX... SUCCESS',
  '> LOADING GENERATIVE_FILL... 100%',
  '> SYNC NEURAL_NETWORK... OK',
  '> CALIBRATING PROMPT_OPTIMIZER... DONE',
  '> DEPLOY MODEL_AUREX_v4... ONLINE',
  '> ANALYZING VISUAL_DATASET... 98.7%',
  '> PUSH CONTENT → VIRAL... ✓',
  '> AI_CORE READY. AWAITING INPUT...',
];

function TelemetryTypewriter({ reducedMotion }: { reducedMotion: boolean }) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const MAX_VISIBLE = 3;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayLines(LOG_LINES.slice(-MAX_VISIBLE));
      return;
    }

    let rafId: number;
    let lastTime = 0;
    const CHAR_DELAY = 38;

    const tick = (now: number) => {
      if (now - lastTime < CHAR_DELAY) { rafId = requestAnimationFrame(tick); return; }
      lastTime = now;

      const line = LOG_LINES[lineIdxRef.current];
      if (charIdxRef.current < line.length) {
        setCurrentLine(line.slice(0, charIdxRef.current + 1));
        charIdxRef.current += 1;
      } else {
        setDisplayLines(prev => {
          const next = [...prev, line];
          return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
        });
        setCurrentLine('');
        charIdxRef.current = 0;
        lineIdxRef.current = (lineIdxRef.current + 1) % LOG_LINES.length;
        cancelAnimationFrame(rafId);
        setTimeout(() => { rafId = requestAnimationFrame(tick); }, 600);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion]);

  return (
    <div
      className="h-20 bg-[#0d0d0d] border border-brand-gold/10 p-3 overflow-hidden"
      aria-label="Feed telemetria AI in tempo reale"
      aria-live="polite"
    >
      <div className="font-mono text-[10px] flex flex-col gap-[3px] h-full justify-end">
        {displayLines.map((line, i) => (
          <span key={i} className="text-brand-gold/30 truncate">{line}</span>
        ))}
        {currentLine && (
          <span className="text-brand-gold/80 truncate">
            {currentLine}
            <span className="inline-block w-[6px] h-[10px] bg-brand-gold/80 ml-[1px] animate-[pulse_0.8s_ease-in-out_infinite]" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 3: Data Grid (SVG Line Chart)
// ─────────────────────────────────────────────────────────────────────────────
const CHART_POINTS = [2, 14, 8, 20, 12, 24, 16, 28, 20, 30, 22, 26, 28, 18, 30];

function buildPath(points: number[], w: number, h: number): string {
  const step = w / (points.length - 1);
  const max = Math.max(...points);
  const pad = 4;
  return points
    .map((v, i) => {
      const x = i * step;
      const y = h - pad - ((v / max) * (h - pad * 2));
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function DataGrid({ reducedMotion }: { reducedMotion: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const W = 256, H = 64;
  const d = buildPath(CHART_POINTS, W, H);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();

    if (reducedMotion) {
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: 0 });
      return;
    }

    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
      onEnter: () => gsap.to(el, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }),
      onLeaveBack: () => gsap.to(el, { strokeDashoffset: length, duration: 0.8, ease: 'power2.in' }),
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <div
      className="h-20 bg-[#0d0d0d] border border-brand-gold/10 flex items-center px-3"
      aria-label="Grafico delle performance in tempo reale"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" aria-hidden="true">
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="rgba(212,175,55,0.08)" strokeWidth="1" />
        ))}
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#chartFill)" />
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={(CHART_POINTS.length - 1) * (W / (CHART_POINTS.length - 1))}
          cy={H - 4 - ((CHART_POINTS[CHART_POINTS.length - 1] / Math.max(...CHART_POINTS)) * (H - 8))}
          r="3"
          fill="#D4AF37"
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA — Team members
// ─────────────────────────────────────────────────────────────────────────────
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  alt: string;
  isPartner?: boolean;
  videoUrl?: string;
}

const founders: TeamMember[] = [
  {
    id: '01',
    name: 'Simone',
    role: 'Co-Founder & Account Manager',
    bio: `Visione cinematografica e strategia data-driven. Traduce l'identità di ogni brand in narrazioni che vendono prima ancora di parlare.`,
    photo: '/Team/Foto Profilo Simone2.jpeg',
    alt: 'Simone, Co-Founder & Account Manager — Aurex',
    isPartner: false,
    videoUrl: '/Team/simo video .mp4',
  },
  {
    id: '02',
    name: 'GIGI',
    role: 'Co- Founder & Strategy Manager e Ai Engineer',
    bio: `Il team Aurex cresce con ogni collaborazione. Il prossimo a entrare nell'ecosistema potresti essere tu.`,
    photo: '/Team/Foto Profilo Luigi Cirianni.jpeg',
    alt: `Slot partner Aurex — entra nell'ecosistema`,
    isPartner: false,
  },
];

const collaborators: TeamMember[] = [
  {
    id: '03',
    name: 'Alessio Ginanneschi',
    role: 'Video/Foto Strategist',
    bio: `Descrizione del collaboratore e del suo ruolo nel team Aurex.`,
    photo: '/Team/Foto Profilo Alessio Ginanneschi.jpeg',
    alt: `Alessio Ginanneschi — Aurex`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEAM CARD — Cinematic Hover Effect
// Mostra la foto statica a riposo; al hover, fonde in un video in loop.
// Rispetta prefers-reduced-motion: se attivo, l'hover viene ignorato.
// ─────────────────────────────────────────────────────────────────────────────
function TeamCard({ member }: { member: TeamMember }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isFounder = founders.some((f) => f.id === member.id);

  const handleMouseEnter = () => {
    if (reducedMotion || !videoRef.current || !member.videoUrl) return;
    videoRef.current.play().catch(() => { /* autoplay policy: ignora errori silenziosi */ });
    gsap.to(videoRef.current, { opacity: 1, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
  };

  const handleMouseLeave = () => {
    if (!videoRef.current || !member.videoUrl) return;
    gsap.to(videoRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      },
    });
  };

  if (isFounder) {
    return (
      <li
        className="team-card group relative overflow-hidden bg-brand-black border border-brand-gold/20 hover:border-brand-gold transition-colors duration-500 rounded-sm"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {member.isPartner && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-brand-gold/10 border border-brand-gold/40 rounded-full flex items-center gap-2" aria-label="Posizione disponibile">
            <span className="relative flex h-2 w-2" aria-hidden="true"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold" /></span>
            <span className="font-mono text-[10px] text-brand-gold tracking-widest uppercase">Open</span>
          </div>
        )}
        <div className="relative h-[420px] overflow-hidden">
          {/* Foto statica — scala su hover quando il video non è attivo */}
          <img
            src={member.photo}
            alt={member.alt}
            className={`w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 ${
              member.isPartner ? 'grayscale opacity-40 group-hover:opacity-70' : 'grayscale group-hover:grayscale-0'
            }`}
          />
          {/* Video cinematografico — visibile solo al hover tramite GSAP */}
          {member.videoUrl && (
            <video
              ref={videoRef}
              src={member.videoUrl}
              muted
              loop
              playsInline
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 z-10"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent z-20" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-gold group-hover:w-full transition-all duration-700 z-30" aria-hidden="true" />
        </div>
        <div className="p-8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-display text-brand-marble uppercase tracking-wide">{member.name}</h3>
              <p className="text-sm font-mono text-brand-gold mt-1 tracking-widest">{member.role}</p>
            </div>
            <span className="text-3xl font-serif italic text-brand-gold/20 group-hover:text-brand-gold/60 transition-colors duration-500" aria-hidden="true">{member.id}</span>
          </div>
          <p className="text-sm font-sans text-brand-marble/60 leading-relaxed">{member.bio}</p>
        </div>
      </li>
    );
  }

  // Collaboratori
  return (
    <li
      className="team-card group relative overflow-hidden bg-brand-black border border-brand-gold/20 hover:border-brand-gold transition-colors duration-500 rounded-sm"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={member.photo}
          alt={member.alt}
          className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
        />
        {member.videoUrl && (
          <video
            ref={videoRef}
            src={member.videoUrl}
            muted
            loop
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 z-10"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent z-20" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-gold group-hover:w-full transition-all duration-700 z-30" aria-hidden="true" />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-display text-brand-marble uppercase tracking-wide">{member.name}</h3>
            <p className="text-xs font-mono text-brand-gold mt-1 tracking-widest">{member.role}</p>
          </div>
          <span className="text-2xl font-serif italic text-brand-gold/20 group-hover:text-brand-gold/60 transition-colors duration-500" aria-hidden="true">{member.id}</span>
        </div>
        <p className="text-xs font-sans text-brand-marble/60 leading-relaxed">{member.bio}</p>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLHeadingElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const protocolRef = useRef<HTMLDivElement>(null);

  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );



  // ── GSAP centralizzato — unico useEffect con gsap.context() ────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero text intro ─────────────────────────────────────────────────
      gsap.fromTo(heroTitleRef.current,
        { y: reducedMotion ? 0 : 60, opacity: 0 },
        { y: 0, opacity: 1, duration: reducedMotion ? 0.3 : 1.2, ease: 'power4.out', delay: reducedMotion ? 0 : 0.1 }
      );
      gsap.fromTo(heroSubRef.current,
        { y: reducedMotion ? 0 : 60, opacity: 0 },
        { y: 0, opacity: 1, duration: reducedMotion ? 0.3 : 1.2, ease: 'power4.out', delay: reducedMotion ? 0 : 0.25 }
      );

      const mm = gsap.matchMedia();

      // ──────────────────────────────────────────────────────────────────────
      // CONDIZIONE A: RENDERING STANDARD (motion consentito)
      // setupCanvasSequence è richiamata QUI, dentro lo stesso mm.add(),
      // così il suo ScrollTrigger (con pin) viene registrato nello stesso
      // batch degli altri trigger → GSAP calcola il pinSpacing corretto
      // prima di posizionare Features/Protocol/Team.
      // ──────────────────────────────────────────────────────────────────────
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // ── Canvas image sequence (pinning Hero) ───────────────────────
        const cleanupHeroCanvas = setupCanvasSequence(
          canvasRef,
          heroRef,
          155,
          (index) => `/animazione_orizzontale/animazione orizzontale _${index.toString().padStart(3, '0')}.jpg`,
          '+=5000',
        );

        // Cleanup del branch: uccide il canvas ST hero e i mouse-listener
        return () => {
          cleanupHeroCanvas();
        };
      });

      // ──────────────────────────────────────────────────────────────────────
      // CONDIZIONE B: RENDERING RIDOTTA MOBILITÀ (accessibilità)
      // ──────────────────────────────────────────────────────────────────────
      mm.add('(prefers-reduced-motion: reduce)', () => {

        // Canvas: solo primo frame statico — nessun pin, nessun tilt
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      });

      // ── Features stagger — entrambi i branch ───────────────────────────
      gsap.fromTo('.feature-card',
        { y: reducedMotion ? 0 : 100, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: reducedMotion ? 0.4 : 1,
          stagger: reducedMotion ? 0 : 0.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 70%' },
        }
      );

      // ── Team cards ──────────────────────────────────────────────────────
      gsap.fromTo('.team-card',
        { y: reducedMotion ? 0 : 80, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: reducedMotion ? 0.4 : 1.2,
          stagger: reducedMotion ? 0 : 0.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#team', start: 'top 75%' },
        }
      );

    }); // fine gsap.context()

    // ── Cleanup globale ─────────────────────────────────────────────────────
    // ctx.revert() invoca automaticamente mm.revert() e uccide tutti i
    // tween/ScrollTrigger creati all'interno del context.
    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);



  return (
    <div className="relative w-full min-h-screen text-brand-marble bg-brand-anthracite selection:bg-brand-gold selection:text-brand-black">
      <div className="noise-overlay" />

      {/* FLOATING DOCK NAVIGATION */}
      <FloatingDock />




      <main>
        {/* B. Hero: "The Human Bridge" */}
        <section
          ref={heroRef}
          id="hero"
          className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-brand-black"
          style={{ perspective: '800px', willChange: 'transform' }}
        >
          <div className="absolute inset-0 z-0">
            {/* Canvas nativo — la logica è in setupCanvasSequence, richiamata nel mm */}
            <canvas
              ref={canvasRef}
              className="w-full h-full opacity-60 mix-blend-screen"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-anthracite/30 to-brand-anthracite" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center px-4 mt-20">
            <div className="overflow-hidden pb-2">
              <h1 ref={heroTitleRef} className="text-2xl md:text-4xl font-sans font-bold tracking-widest uppercase text-[#F2F2F2]">
                Ingegneria del Contenuto,
              </h1>
            </div>
            <div className="overflow-hidden pt-2 pb-6">
              <h2 ref={heroSubRef} className="text-5xl md:text-8xl lg:text-9xl font-serif italic text-brand-gold text-shadow-sm leading-tight">
                Storytelling con l'Anima.
              </h2>
            </div>
            <p className="mt-4 max-w-2xl text-base md:text-lg font-sans text-brand-marble/60 leading-relaxed tracking-wide">
              Un'incrocio tra
              {' '}<span className="text-brand-gold font-semibold">Codice &amp; AI</span>{' '}
              e{' '}<span className="text-brand-gold font-semibold">Video Production di Alta Gamma</span>.
              Non vendiamo visibilità — costruiamo ecosistemi digitali che durano.
            </p>
          </div>
        </section>

        {/* C. Features: "The Strategic Pillars" */}
        <section id="features" ref={featuresRef} className="py-32 px-6 lg:px-12 bg-black relative z-10">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
              <h3 className="text-lg md:text-xl font-sans font-bold uppercase tracking-[0.3em] text-brand-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">I Pilastri Strategici</h3>
              <h2 className="text-4xl md:text-6xl font-display text-[#F2F2F2] max-w-3xl mx-auto">
                Architettura Avanzata per la <span className="font-serif italic text-brand-gold">Crescita Digitale</span>.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Card 1: Approccio Algoritmico */}
              <div className="feature-card group relative h-[480px] bg-transparent hover:bg-black/90 hover:backdrop-blur-sm border border-brand-gold/20 p-8 rounded-sm overflow-hidden hover:border-brand-gold hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(212,175,55,0.10)] transition-all duration-500 ease-out motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
                <div className="relative z-10 h-full flex flex-col">
                  <Code2 className="w-10 h-10 text-brand-gold mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <h4 className="text-xl font-display text-brand-gold mb-3 uppercase tracking-wide">Approccio Informatico &amp; Algoritmico</h4>
                  <p className="text-sm font-sans text-[#F2F2F2]/60 leading-relaxed mb-auto">
                    Ogni campagna è un algoritmo. Analizziamo dataset, modelliamo probabilità e ottimizziamo ogni variabile con metodo scientifico — zero supposizioni, solo dati.
                  </p>
                  <DiagnosticShuffler reducedMotion={reducedMotion} />
                </div>
              </div>

              {/* Card 2: AI Generativa */}
              <div className="feature-card group relative h-[480px] bg-transparent hover:bg-black/90 hover:backdrop-blur-sm border border-brand-gold/20 p-8 rounded-sm overflow-hidden hover:border-brand-gold hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(212,175,55,0.10)] transition-all duration-500 ease-out motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
                <div className="relative z-10 h-full flex flex-col">
                  <Cpu className="w-10 h-10 text-brand-gold mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <h4 className="text-xl font-display text-brand-gold mb-3 uppercase tracking-wide">AI Generativa &amp; Generative Fill</h4>
                  <p className="text-sm font-sans text-[#F2F2F2]/60 leading-relaxed mb-auto">
                    Usiamo modelli generativi all'avanguardia per trasformare idee in asset visivi production-ready. Dal prompt al pixel, in tempo reale.
                  </p>
                  <TelemetryTypewriter reducedMotion={reducedMotion} />
                </div>
              </div>

              {/* Card 3: Web Tailor-Made */}
              <div className="feature-card group relative h-[480px] bg-transparent hover:bg-black/90 hover:backdrop-blur-sm border border-brand-gold/20 p-8 rounded-sm overflow-hidden hover:border-brand-gold hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(212,175,55,0.10)] transition-all duration-500 ease-out motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
                <div className="relative z-10 h-full flex flex-col">
                  <Globe className="w-10 h-10 text-brand-gold mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-xl font-display text-brand-gold uppercase tracking-wide">Sviluppo Web Tailor-Made</h4>
                    <span className="shrink-0 px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/40 rounded-full font-mono text-[9px] text-brand-gold tracking-widest uppercase">100% Codice</span>
                  </div>
                  <p className="text-sm font-sans text-[#F2F2F2]/60 leading-relaxed mb-auto">
                    Nessun template. Nessuna limitazione. Ogni sito è ingegnerizzato da zero per performance, SEO tecnico e conversioni misurabili.
                  </p>
                  <DataGrid reducedMotion={reducedMotion} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* C2. B2B Ecosystem & Community */}
        <section id="ecosystem" className="py-32 px-6 lg:px-12 bg-[#080808] border-y border-brand-gold/10 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-sm font-mono uppercase tracking-[0.3em] text-brand-gold mb-4">Network &amp; Sinergie</p>
              <h2 className="text-4xl md:text-6xl font-display text-[#F2F2F2] max-w-3xl mx-auto">
                L'Ecosistema <span className="font-serif italic text-brand-gold">B2B Aurex</span>.
              </h2>
              <p className="mt-6 text-base font-sans text-brand-marble/50 max-w-2xl mx-auto leading-relaxed">
                Una rete di partner cross-settoriali attivata in meno di 30 minuti. Il tuo contenuto diventa virale prima ancora che il tuo competitor finisca il brief.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="w-7 h-7 text-brand-gold" />, title: 'Attivazione Virale 30min', body: 'Il network B2B Aurex moltiplica la portata organica entro la prima mezz’ora di pubblicazione grazie ai partner (clienti Aurex)' },
                { icon: <Users className="w-7 h-7 text-brand-gold" />, title: 'Community Cross-Partner', body: 'Sinergie reali tra brand: la tua audience si espande in verticale ogni post senza costo pubblicitario aggiuntivo. Solo esclusivamente spunto Organico.' },
                { icon: <Lock className="w-7 h-7 text-brand-gold" />, title: 'Zero Penali. Zero Lock-In.', body: 'Nessun contratto capestro. Lavoriamo per guadagnarci la tua fiducia mese dopo mese: non solo attraverso KPI trasparenti e reportistica verificabile, ma anche costruendo relazioni umane oneste e guidate dal buon senso.' },
              ].map((item, i) => (
                <div key={i} className="group bg-brand-black border border-brand-gold/20 hover:border-brand-gold/60 p-8 rounded-sm transition-all duration-500 hover:shadow-[0_0_32px_rgba(212,175,55,0.08)]">
                  <div className="mb-5 p-3 w-fit border border-brand-gold/20 rounded-sm group-hover:border-brand-gold/50 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-display uppercase tracking-wide text-brand-marble mb-3">{item.title}</h3>
                  <p className="text-sm font-sans text-brand-marble/50 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* D. Philosophy & Transparency */}
        <section id="philosophy" className="py-40 px-6 bg-[#0a0a0a] border-y border-brand-gold/10 text-center flex flex-col items-center justify-center min-h-[70vh]">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-brand-gold/60 mb-8">Filosofia &amp; Trasparenza</p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-brand-gold max-w-5xl leading-tight">
            "Noi estraiamo l'anima della tua azienda."
          </h2>
        </section>

        {/* E. Protocol: "Il Protocollo Aurex" — 10 Fasi */}
        <div id="protocol" ref={protocolRef}>
          <ProtocolSlider />
        </div>

        {/* F. Team */}
        <section id="team" aria-labelledby="team-heading" className="py-32 px-6 lg:px-12 bg-brand-anthracite border-t border-brand-gold/10">
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-20">
              <p className="text-sm font-mono uppercase tracking-[0.3em] text-brand-gold mb-6">Le Persone</p>
              <h2 id="team-heading" className="text-4xl md:text-6xl font-serif italic text-brand-marble leading-tight">Il Team <span className="text-brand-gold">Aurex</span>.</h2>
              <p className="mt-6 text-lg font-sans text-brand-marble/50 max-w-2xl mx-auto">Professionisti con un'unica ossessione: estrarre l'anima della tua azienda e trasformarla in conversioni reali.</p>
            </header>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full" role="list" aria-label="Team Aurex">
              {[...founders, ...collaborators].sort((a, b) => a.id.localeCompare(b.id)).map((m) => <TeamCard key={m.id} member={m} />)}
            </ul>
          </div>
        </section>


      </main>

      <footer className="py-12 bg-brand-black text-center border-t border-brand-gold/20">
        <div className="text-xl font-display font-bold text-brand-gold tracking-widest uppercase mb-4">Aurex</div>
        <p className="text-xs font-sans text-[#F2F2F2]/40 tracking-widest uppercase">Luxury Tech Marketing Agency &copy; 2026</p>
      </footer>
    </div>
  );
}

export default App;
