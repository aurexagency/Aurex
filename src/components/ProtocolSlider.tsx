import { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowRight, X, ChevronRight } from 'lucide-react';
import { PROTOCOL_DATA } from '../data/protocolData';

gsap.registerPlugin(Flip);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL        = PROTOCOL_DATA.length;       // 10
const AUTO_DELAY   = 5;                          // seconds per auto-advance
const BULLET_DUR   = 0.55;                       // "proiettile" → background
const RECOIL_DUR   = 0.7;                        // "rinculo" miniature
const RECOIL_STAG  = 0.06;                       // stagger tra miniature

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolSlider() {
  /* ── Refs ──────────────────────────────────────────────────────────────── */
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const thumbRefs     = useRef<(HTMLButtonElement | null)[]>([]);
  const bgImageRef    = useRef<HTMLImageElement>(null);
  const textBlockRef  = useRef<HTMLDivElement>(null);
  const timerTween    = useRef<gsap.core.Tween | null>(null);

  /* ── State ────────────────────────────────────────────────────────────── */
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused]       = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeStep = PROTOCOL_DATA[activeIndex];

  // Detect reduced-motion once
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  /* ── Navigate ─────────────────────────────────────────────────────────── */
  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex) return;

      const container = containerRef.current;
      if (!container) { setActiveIndex(nextIndex); return; }

      // ── Reduced-motion path: simple crossfade ──────────────────────────
      if (prefersReducedMotion) {
        gsap.to(bgImageRef.current, { opacity: 0, duration: 0.3, onComplete: () => {
          setActiveIndex(nextIndex);
          gsap.to(bgImageRef.current, { opacity: 1, duration: 0.3 });
        }});
        return;
      }

      // ── 1. Snapshot all thumb positions BEFORE state change ────────────
      const thumbEls = thumbRefs.current.filter(Boolean) as HTMLButtonElement[];
      const flipState = Flip.getState(thumbEls);

      // ── 2. Bullet: crossfade background ───────────────────────────────
      const bgEl = bgImageRef.current;
      if (bgEl) {
        // Quick scale-up punch (simulates "impact")
        gsap.fromTo(bgEl,
          { scale: 1.08, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: BULLET_DUR,
            ease: 'expo.out',
            force3D: true,
            overwrite: true,
          }
        );
      }

      // ── 3. Text content punch-in ──────────────────────────────────────
      if (textBlockRef.current) {
        gsap.fromTo(
          textBlockRef.current.children,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power4.out',
            force3D: true,
            delay: 0.05,
          }
        );
      }

      // ── 4. Commit state (React re-render) ─────────────────────────────
      setActiveIndex(nextIndex);

      // ── 5. Recoil: animate thumbs from old → new positions ────────────
      // requestAnimationFrame ensures the DOM has updated after setState
      requestAnimationFrame(() => {
        const newThumbs = thumbRefs.current.filter(Boolean) as HTMLButtonElement[];
        if (newThumbs.length === 0) return;

        Flip.from(flipState, {
          duration: RECOIL_DUR,
          ease: 'back.out(1.5)',
          stagger: RECOIL_STAG,
          absolute: true,
          force3D: true,
          onEnter: (elements) =>
            gsap.fromTo(elements,
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: RECOIL_DUR, ease: 'back.out(1.5)' }
            ),
          onLeave: (elements) =>
            gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.3 }),
        });
      });
    },
    [activeIndex, prefersReducedMotion]
  );

  const handleNext = useCallback(
    () => goTo((activeIndex + 1) % TOTAL),
    [activeIndex, goTo]
  );

  const handlePrev = useCallback(
    () => goTo(activeIndex === 0 ? TOTAL - 1 : activeIndex - 1),
    [activeIndex, goTo]
  );

  /* ── Timer (progress bar) ─────────────────────────────────────────────── */
  useGSAP(() => {
    if (timerTween.current) timerTween.current.kill();
    if (isModalOpen) return;

    gsap.set(progressRef.current, { scaleX: 0 });

    timerTween.current = gsap.to(progressRef.current, {
      scaleX: 1,
      duration: AUTO_DELAY,
      ease: 'none',
      transformOrigin: 'left center',
      force3D: true,
      onComplete: handleNext,
    });

    if (isPaused) timerTween.current.pause();
  }, { dependencies: [activeIndex, isPaused, isModalOpen, handleNext], scope: containerRef });

  /* ── Keyboard navigation ──────────────────────────────────────────────── */
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    },
    [handleNext, handlePrev]
  );

  /* ── Build thumb indices (all except active) ──────────────────────────── */
  const thumbIndices: number[] = [];
  for (let i = 0; i < TOTAL; i++) {
    if (i !== activeIndex) thumbIndices.push(i);
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100vh] min-h-[700px] bg-[#000] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="region"
      aria-label="Protocollo Aurex — Slider delle 10 fasi"
    >
      {/* ── FULLSCREEN BACKGROUND IMAGE (active step) ────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          ref={bgImageRef}
          key={`bg-${activeStep.id}`}
          src={activeStep.posterUrl}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ willChange: 'transform, opacity' }}
          draggable={false}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-[#000]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-transparent to-[#000]/30" />
        {/* Gold vignette at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#000] to-transparent" />
      </div>

      {/* ── MAIN LAYOUT: Content left + Thumbs right ─────────────────────── */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row">

        {/* LEFT — Text content */}
        <div
          ref={textBlockRef}
          className="flex-1 flex flex-col justify-center py-32 md:py-0 pr-0 md:pr-16"
        >
          {/* Eyebrow badge */}
          <span
            className="inline-flex items-center gap-2 w-fit text-[11px] uppercase tracking-[0.3em] font-mono
                       text-[#D4AF37]/80 border border-[#D4AF37]/25 bg-[#080808]/60
                       px-4 py-1.5 rounded-sm backdrop-blur-md mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            PHASE {activeStep.step} // {TOTAL}
          </span>

          {/* Title H2 */}
          <h2
            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold
                       tracking-tight text-white leading-[1.08] mb-6"
            style={{ willChange: 'transform' }}
          >
            {activeStep.title}
          </h2>

          {/* Tagline */}
          <p className="text-lg md:text-xl font-sans text-white/60 leading-relaxed max-w-xl mb-10">
            {activeStep.tagline}
          </p>

          {/* CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-3 w-fit px-8 py-4
                       bg-[#D4AF37] text-[#000] font-mono text-sm uppercase tracking-[0.2em] font-bold
                       hover:bg-[#F3E5AB] active:scale-[0.97] transition-all duration-200 rounded-sm"
          >
            Approfondisci SOP
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* RIGHT — Vertical thumb strip (9:16 cards) */}
        <div
          className="hidden md:flex items-center gap-3 shrink-0 py-8 md:py-0"
          aria-label="Seleziona una fase del protocollo"
          role="tablist"
        >
          {thumbIndices.map((idx) => {
            const step = PROTOCOL_DATA[idx];
            return (
              <button
                key={step.id}
                ref={(el) => { thumbRefs.current[idx] = el; }}
                data-flip-id={`thumb-${step.id}`}
                onClick={() => goTo(idx)}
                role="tab"
                aria-selected={false}
                aria-label={`Vai alla Fase ${step.step}: ${step.title}`}
                className="group relative w-[72px] rounded-sm overflow-hidden
                           border border-[#D4AF37]/20 hover:border-[#D4AF37]/60
                           transition-colors duration-300
                           bg-[#080808] flex-shrink-0"
                style={{
                  aspectRatio: '9 / 16',
                  willChange: 'transform',
                }}
              >
                <img
                  src={step.posterUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40
                             group-hover:opacity-70 grayscale group-hover:grayscale-0
                             transition-all duration-300"
                  draggable={false}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-[#000]/30 to-transparent" />
                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 p-2 z-10">
                  <span className="block text-[9px] font-mono text-[#D4AF37]/60 tracking-[0.2em] mb-0.5">
                    {step.step}
                  </span>
                  <span className="block text-[10px] font-display text-white/80 leading-tight line-clamp-2">
                    {step.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE: horizontal scroll strip ──────────────────────────────── */}
      <div className="md:hidden absolute bottom-24 left-0 right-0 z-20 px-4">
        <div
          className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory
                     scrollbar-thin scrollbar-thumb-[#D4AF37]/30 scrollbar-track-transparent"
          role="tablist"
          aria-label="Seleziona una fase del protocollo"
        >
          {PROTOCOL_DATA.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => goTo(idx)}
              role="tab"
              aria-selected={idx === activeIndex}
              className={`relative shrink-0 w-14 rounded-sm overflow-hidden snap-start
                         border transition-all duration-200 ${
                idx === activeIndex
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                  : 'border-[#D4AF37]/20'
              }`}
              style={{ aspectRatio: '9 / 16' }}
            >
              <img
                src={step.posterUrl}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                  idx === activeIndex ? 'opacity-80' : 'opacity-40'
                }`}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000] to-transparent" />
              <span className="absolute bottom-1 left-1 text-[8px] font-mono text-[#D4AF37]/70">
                {step.step}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR: Progress + Controls ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#000]/80 backdrop-blur-md border-t border-[#D4AF37]/15">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-6">

          {/* Step counter */}
          <span className="text-xs font-mono text-[#D4AF37]/60 tracking-[0.25em] whitespace-nowrap">
            {activeStep.step} / {TOTAL}
          </span>

          {/* Progress bar */}
          <div className="flex-1 max-w-sm h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full w-full bg-[#D4AF37] origin-left rounded-full"
              style={{ willChange: 'transform' }}
            />
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2.5 border border-[#D4AF37]/20 rounded-sm text-[#D4AF37]
                         hover:bg-[#D4AF37] hover:text-[#000] transition-colors duration-200"
              aria-label="Fase precedente"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 border border-[#D4AF37]/20 rounded-sm text-[#D4AF37]
                         hover:bg-[#D4AF37] hover:text-[#000] transition-colors duration-200"
              aria-label="Fase successiva"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SOP MODAL ────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#000]/92 backdrop-blur-xl cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-3xl bg-[#080808] border border-[#D4AF37]/25
                       rounded-sm shadow-2xl shadow-[#D4AF37]/5 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 md:p-8 border-b border-[#D4AF37]/10">
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37]/60 tracking-[0.25em] uppercase">
                  PHASE {activeStep.step} // STANDARD OPERATING PROCEDURE
                </span>
                <h3 className="text-2xl md:text-3xl font-display text-white mt-2">
                  {activeStep.title}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-white/40 hover:text-[#D4AF37] transition-colors"
                aria-label="Chiudi dettagli"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
                {activeStep.description}
              </p>

              <h4 className="text-xs font-mono text-[#D4AF37] uppercase tracking-[0.25em] mb-6 pl-4 border-l-2 border-[#D4AF37]">
                Protocollo Operativo
              </h4>

              <ul className="space-y-3">
                {activeStep.sopDetails.map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 p-4 bg-[#000]/50 rounded-sm border border-white/[0.04]"
                  >
                    <span className="text-[#D4AF37]/40 font-mono text-sm shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-white/60 leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
