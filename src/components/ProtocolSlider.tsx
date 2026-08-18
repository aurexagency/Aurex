import { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowRight, ChevronRight, X } from 'lucide-react';
import { PROTOCOL_DATA } from '../data/protocolData';

gsap.registerPlugin(Flip);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL          = PROTOCOL_DATA.length;   // 10
const VISIBLE_THUMBS = 4;                      // max miniature nella coda
const AUTO_DELAY     = 8;                      // secondi per auto-advance
const BULLET_DUR     = 0.9;                    // "proiettile" → fullscreen
const RECOIL_DUR     = 0.7;                    // "rinculo" coda
const RECOIL_STAG    = 0.06;                   // stagger fra miniature
const TEXT_EXIT_DUR  = 0.3;                    // fade-out testo
const TEXT_ENTER_DUR = 0.6;                    // fade-in testo
const TEXT_STAG      = 0.08;                   // stagger elementi di testo

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolSlider() {
  /* ── Refs ──────────────────────────────────────────────────────────────── */
  const containerRef   = useRef<HTMLDivElement>(null);
  const progressRef    = useRef<HTMLDivElement>(null);
  const bgMediaRef     = useRef<HTMLDivElement>(null);
  const flyerRef       = useRef<HTMLImageElement>(null);
  const textBlockRef   = useRef<HTMLDivElement>(null);
  const timerTween     = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);

  /* ── State ────────────────────────────────────────────────────────────── */
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused]      = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const activeStep = PROTOCOL_DATA[activeIndex];
  const videoSrc = isDesktop ? activeStep.videoDesktop : (activeStep.videoMobile || activeStep.videoDesktop);

  // Detect reduced-motion once
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  /* ── Queue: prossimi VISIBLE_THUMBS step dopo l'attivo (circolare) ──── */
  const queueIndices: number[] = [];
  for (let i = 1; i <= VISIBLE_THUMBS; i++) {
    queueIndices.push((activeIndex + i) % TOTAL);
  }

  /* ── Preload immagini della coda ────────────────────────────────────── */
  useEffect(() => {
    for (let i = 1; i <= VISIBLE_THUMBS + 1; i++) {
      const idx = (activeIndex + i) % TOTAL;
      const img = new Image();
      img.src = PROTOCOL_DATA[idx].cardImage;
    }
  }, [activeIndex]);

  /* ── Initial mount animation ────────────────────────────────────────── */
  useGSAP(() => {
    if (textBlockRef.current) {
      gsap.fromTo(
        textBlockRef.current.children,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: TEXT_STAG, duration: TEXT_ENTER_DUR, ease: 'power4.out', delay: 0.3 }
      );
    }
    const thumbs = containerRef.current?.querySelectorAll('[data-queue-thumb]');
    if (thumbs?.length) {
      gsap.fromTo(
        thumbs,
        { x: 50, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.7, ease: 'back.out(1.5)', delay: 0.5 }
      );
    }
  }, { scope: containerRef });

  /* ── Navigate ─────────────────────────────────────────────────────────── */
  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const container = containerRef.current;
      if (!container) {
        setActiveIndex(nextIndex);
        isAnimatingRef.current = false;
        return;
      }

      if (timerTween.current) timerTween.current.kill();

      // ── Reduced-motion: simple crossfade ───────────────────────────────
      if (prefersReducedMotion) {
        gsap.to(bgMediaRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setActiveIndex(nextIndex);
            gsap.to(bgMediaRef.current, { opacity: 1, duration: 0.3 });
            isAnimatingRef.current = false;
          },
        });
        return;
      }

      const isForward = nextIndex > activeIndex || (activeIndex === TOTAL - 1 && nextIndex === 0);

      // 1. Snapshot coda
      const queueThumbs = Array.from(
        container.querySelectorAll('[data-queue-thumb]')
      ).filter((el) => {
        const idx = parseInt(el.getAttribute('data-queue-index') || '-1', 10);
        return idx !== nextIndex;
      });
      const queueFlipState = Flip.getState(queueThumbs);

      // 2. Text exit
      if (textBlockRef.current) {
        gsap.killTweensOf(textBlockRef.current.children);
        gsap.to(textBlockRef.current.children, {
          y: -15,
          opacity: 0,
          duration: TEXT_EXIT_DUR,
          stagger: 0.04,
          ease: 'power2.in',
        });
      }

      // 3. Bullet: Flip (miniatura → fullscreen)
      const thumbEl = container.querySelector(`[data-queue-index="${nextIndex}"]`) as HTMLElement | null;
      const flyer = flyerRef.current;
      let hasBullet = false;

      if (thumbEl && flyer) {
        hasBullet = true;
        const thumbRect = thumbEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        flyer.src = PROTOCOL_DATA[nextIndex].cardImage;
        gsap.set(flyer, {
          position: 'absolute',
          top:  thumbRect.top  - containerRect.top,
          left: thumbRect.left - containerRect.left,
          width:  thumbRect.width,
          height: thumbRect.height,
          opacity: 1,
          visibility: 'visible',
          borderRadius: '4px',
          zIndex: 5,
        });

        const bulletState = Flip.getState(flyer);

        gsap.set(flyer, {
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '0px',
        });

        Flip.from(bulletState, {
          duration: BULLET_DUR,
          ease: 'power3.inOut',
          force3D: true,
          onComplete: () => {
            requestAnimationFrame(() => {
              gsap.set(flyer, { visibility: 'hidden', opacity: 0 });
              isAnimatingRef.current = false;
            });
          },
        });
      } else {
        gsap.fromTo(
          bgMediaRef.current,
          { opacity: 0.5, scale: 1.06 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'expo.out',
            force3D: true,
            overwrite: true,
            onComplete: () => {
              isAnimatingRef.current = false;
            },
          }
        );
      }

      // 4. Commit state (React re-render → new video starts loading under flyer)
      setActiveIndex(nextIndex);

      // 5. Rinculo coda + Text enter
      requestAnimationFrame(() => {
        Flip.from(queueFlipState, {
          duration: RECOIL_DUR,
          ease: 'back.out(1.5)',
          stagger: RECOIL_STAG,
          absolute: true,
          force3D: true,
          onEnter: (elements) =>
            gsap.fromTo(
              elements,
              { x: isForward ? 80 : -80, opacity: 0, scale: 0.85 },
              { x: 0, opacity: 1, scale: 1, duration: RECOIL_DUR, ease: 'back.out(1.5)' }
            ),
          onLeave: (elements) =>
            gsap.to(elements, {
              x: isForward ? -80 : 80,
              opacity: 0,
              duration: 0.3,
            }),
        });

        requestAnimationFrame(() => {
          if (textBlockRef.current) {
            gsap.fromTo(
              textBlockRef.current.children,
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                stagger: TEXT_STAG,
                duration: TEXT_ENTER_DUR,
                ease: 'power4.out',
                delay: hasBullet ? 0.15 : 0,
              }
            );
          }
        });
      });
    },
    [activeIndex, prefersReducedMotion]
  );

  const handleNext = useCallback(() => goTo((activeIndex + 1) % TOTAL), [activeIndex, goTo]);
  const handlePrev = useCallback(() => goTo(activeIndex === 0 ? TOTAL - 1 : activeIndex - 1), [activeIndex, goTo]);

  /* ── Timer ───────────────────────────────────────────────────────────── */
  useGSAP(
    () => {
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
    },
    {
      dependencies: [activeIndex, isPaused, isModalOpen, handleNext],
      scope: containerRef,
    }
  );

  /* ── Keyboard navigation ──────────────────────────────────────────────── */
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    },
    [handleNext, handlePrev]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
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
      {/* ── FULLSCREEN BACKGROUND MEDIA ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div ref={bgMediaRef} className="absolute inset-0 w-full h-full" style={{ willChange: 'transform, opacity' }}>
          {videoSrc ? (
            <video
              key={videoSrc}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <img
              key={activeStep.cardImage}
              src={activeStep.cardImage}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Gradient overlays: Cinematic Radial */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-brand-black/40 to-brand-black/90"
          aria-hidden="true"
        ></div>
      </div>

      {/* ── FLYER (target dell'animazione "proiettile") ───────────────────── */}
      <img
        ref={flyerRef}
        alt=""
        aria-hidden="true"
        className="absolute object-cover pointer-events-none"
        style={{
          visibility: 'hidden',
          opacity: 0,
          willChange: 'transform',
          zIndex: 5,
        }}
      />

      {/* ── MAIN LAYOUT: Content left + Queue right ──────────────────────── */}
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
            {activeStep.stepNumber} // {TOTAL}
          </span>

          {/* Title H2 */}
          <h2
            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold
                       tracking-tight text-white leading-[1.08] mb-6"
            style={{ willChange: 'transform' }}
          >
            {activeStep.title}
          </h2>

          {/* Tagline / Short Description */}
          <p className="text-lg md:text-xl font-sans text-white/60 leading-relaxed max-w-xl mb-10">
            {activeStep.shortDescription}
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

        {/* RIGHT — Queue: miniature 9:16 (max 4, bottom-aligned) ─────────── */}
        <div
          className="hidden md:flex items-end gap-3 pb-24 shrink-0"
          role="tablist"
          aria-label="Seleziona una fase del protocollo"
        >
          {queueIndices.map((idx) => {
            const step = PROTOCOL_DATA[idx];
            return (
              <button
                key={step.id}
                data-queue-thumb=""
                data-queue-index={idx}
                data-flip-id={`queue-${step.id}`}
                onClick={() => goTo(idx)}
                role="tab"
                aria-selected={false}
                aria-label={`Vai a: ${step.title}`}
                className="group relative w-36 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer aspect-[9/16]
                           border border-white/10 hover:border-[#D4AF37]/30 bg-[#080808] transition-all duration-300"
                style={{ willChange: 'transform' }}
              >
                {/* Immagine viva */}
                <img
                  src={step.cardImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
                
                {/* Gradiente nero sottile in basso per leggibilità testo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                
                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 p-3 z-10 flex flex-col gap-1">
                  <span className="block text-[10px] font-mono text-[#D4AF37] tracking-[0.2em] uppercase">
                    {step.stepNumber}
                  </span>
                  <span className="block text-xs font-sans text-white/90 leading-tight line-clamp-2">
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
        >
          {PROTOCOL_DATA.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.id}
                onClick={() => goTo(idx)}
                role="tab"
                aria-selected={isActive}
                className={`relative shrink-0 w-24 aspect-[9/16] rounded-sm overflow-hidden snap-start
                           border transition-all duration-300 ${
                  isActive
                    ? 'border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'border-white/10 opacity-60'
                }`}
              >
                <img
                  src={step.cardImage}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    isActive ? 'scale-105 opacity-100' : 'opacity-70'
                  }`}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <span className="block text-[9px] font-mono text-[#D4AF37] tracking-widest uppercase mb-0.5">
                    {step.stepNumber}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM BAR: Progress + Controls ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#000]/80 backdrop-blur-md border-t border-[#D4AF37]/15">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-6">
          {/* Step counter */}
          <span className="text-xs font-mono text-[#D4AF37]/60 tracking-[0.25em] whitespace-nowrap">
            {activeStep.stepNumber.replace('FASE ', '')} / {TOTAL}
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
          <div
            className="absolute inset-0 bg-[#000]/92 backdrop-blur-xl cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          <div
            className="relative z-10 w-full max-w-3xl bg-[#080808] border border-[#D4AF37]/25
                       rounded-sm shadow-2xl shadow-[#D4AF37]/5 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 md:p-8 border-b border-[#D4AF37]/10">
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37]/60 tracking-[0.25em] uppercase">
                  {activeStep.stepNumber} // STANDARD OPERATING PROCEDURE
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
                {activeStep.fullDescription}
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
