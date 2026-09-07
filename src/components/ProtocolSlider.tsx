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
const BULLET_DUR     = 0.9;                    // "proiettile" → fullscreen (Flip)
const REVEAL_DUR     = 0.6;                    // dissolvenza scudo → video
const RECOIL_DUR     = 0.7;                    // "rinculo" coda
const RECOIL_STAG    = 0.06;                   // stagger fra miniature
const TEXT_EXIT_DUR  = 0.3;                    // fade-out testo
const TEXT_ENTER_DUR = 0.6;                    // fade-in testo
const TEXT_STAG      = 0.08;                   // stagger elementi di testo

// ─────────────────────────────────────────────────────────────────────────────
// GPU-ACCELERATED VIDEO STYLES
// ─────────────────────────────────────────────────────────────────────────────
// Stili per il <video> unico. Forziamo il compositing GPU con translateZ(0)
// e will-change. Nessun filtro CSS direttamente sul video.
const VIDEO_GPU_STYLES: React.CSSProperties = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  imageRendering: 'auto',
  objectFit: 'cover',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolSlider() {
  /* ── Refs ──────────────────────────────────────────────────────────────── */
  const containerRef   = useRef<HTMLDivElement>(null);
  const progressRef    = useRef<HTMLDivElement>(null);
  const textBlockRef   = useRef<HTMLDivElement>(null);
  const timerTween     = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);

  // ── SINGLE VIDEO: unico tag <video> per il background ──────────────────
  // Il src viene aggiornato a runtime, ma è coperto dallo "scudo visivo"
  // (l'immagine orizzontale) durante il caricamento.
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── SHIELD (scudo visivo): immagine fullscreen sovrapposta al video ────
  // Viene Flip-animata dalla miniatura a fullscreen con GSAP, poi sfumata
  // a opacity 0 solo quando `canplay` conferma che il video è decodificato.
  const shieldRef = useRef<HTMLImageElement>(null);

  // Listener `canplay` cleanup ref — per evitare listener orfani
  const canplayCleanupRef = useRef<(() => void) | null>(null);

  /* ── State ────────────────────────────────────────────────────────────── */
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused]      = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeStep = PROTOCOL_DATA[activeIndex];

  // Variabile derivata: la fase attiva ha un video disponibile?
  // Usata per il rendering condizionale video / img-only.
  const activeHasVideo = activeStep.videoUrl !== null;

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

  /* ── Preload: immagini della coda + cover orizzontali ────────────────── */
  useEffect(() => {
    for (let i = 1; i <= VISIBLE_THUMBS + 1; i++) {
      const idx = (activeIndex + i) % TOTAL;
      const step = PROTOCOL_DATA[idx];
      // Preload sia la card verticale sia la cover orizzontale
      new Image().src = step.cardImage;
      new Image().src = step.coverImage;
    }
  }, [activeIndex]);

  /* ══════════════════════════════════════════════════════════════════════════
   * MOUNT: inizializza il video di background con il primo step (se presente)
   * ════════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const video = videoRef.current;
    const firstStep = PROTOCOL_DATA[0];
    if (video && firstStep.videoUrl) {
      video.src = firstStep.videoUrl;
      video.load();
      video.play().catch(() => {});
    }
    // Solo al mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup del listener canplay al unmount
  useEffect(() => {
    return () => {
      if (canplayCleanupRef.current) {
        canplayCleanupRef.current();
        canplayCleanupRef.current = null;
      }
    };
  }, []);

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

  /* ══════════════════════════════════════════════════════════════════════════
   * performTransition — Core della strategia "Image-to-Video Cover"
   *
   * Flusso:
   *  1. GSAP Flip espande l'immagine dello scudo dalla miniatura a fullscreen
   *  2. Sotto lo scudo, cambiamo `video.src` al nuovo step
   *  3. Ascoltiamo l'evento nativo `canplay` sul <video>
   *  4. Solo quando canplay è emesso, sfumiamo lo scudo (opacity 1→0)
   *  5. Il video è già in play sotto lo scudo → reveal perfetto, zero black frame
   *
   * Lo scudo usa l'immagine `coverImage` (orizzontale 16:9 .webp) che è
   * nativamente uguale al primo frame del video → transizione impercettibile.
   *
   * Il `videoRef` è gestito come ref singolo React. Il listener `canplay` è
   * registrato come evento DOM nativo e pulito ad ogni nuova transizione
   * (via canplayCleanupRef) per evitare listener duplicati.
   * ════════════════════════════════════════════════════════════════════════ */
  const performTransition = useCallback(
    (nextIndex: number) => {
      const video  = videoRef.current;
      const shield = shieldRef.current;
      if (!video || !shield) return;

      // Pulisci eventuali listener canplay precedenti non ancora scattati
      if (canplayCleanupRef.current) {
        canplayCleanupRef.current();
        canplayCleanupRef.current = null;
      }

      const nextStep = PROTOCOL_DATA[nextIndex];

      // ── 1. Posiziona lo scudo come fullscreen cover ─────────────────────
      shield.src = nextStep.coverImage;
      gsap.set(shield, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 1,
        visibility: 'visible',
        borderRadius: '0px',
        zIndex: 4, // sopra il video (z-0), sotto l'overlay testo (z-10)
      });

      // ── 2a. La prossima fase ha un video: carica e riproduci ────────────
      if (nextStep.videoUrl) {
        // Rendi il tag <video> visibile (potrebbe essere nascosto da una fase senza video)
        gsap.set(video, { autoAlpha: 1 });

        video.src = nextStep.videoUrl;
        video.load();

        // ── 3. Attendi canplay per un reveal senza black frame ──────────
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          canplayCleanupRef.current = null;

          video.play().catch(() => {});

          // ── 4. THE REVEAL: sfuma lo scudo, mostrando il video sotto ──
          gsap.to(shield, {
            opacity: 0,
            duration: REVEAL_DUR,
            ease: 'power2.inOut',
            force3D: true,
            onComplete: () => {
              gsap.set(shield, { visibility: 'hidden' });
              isAnimatingRef.current = false;
            },
          });
        };

        video.addEventListener('canplay', onCanPlay);
        canplayCleanupRef.current = () => video.removeEventListener('canplay', onCanPlay);

        // Fallback: se canplay non scatta entro 3s, forza il reveal
        const fallbackTimer = gsap.delayedCall(3, () => {
          if (canplayCleanupRef.current) {
            onCanPlay();
          }
        });

        const originalCleanup = canplayCleanupRef.current;
        canplayCleanupRef.current = () => {
          originalCleanup();
          fallbackTimer.kill();
        };

      } else {
        // ── 2b. La prossima fase NON ha video: ferma e nascondi il <video>
        //       Mostra solo la coverImage (lo scudo) in modo stabile. ──────
        video.pause();
        // Svuota src per liberare risorse del decoder
        video.removeAttribute('src');
        video.load();
        // Nascondi completamente il tag <video> — sotto lo scudo non serve
        gsap.set(video, { autoAlpha: 0 });

        // Lo scudo rimane visibile (opacity 1) come sfondo permanente.
        // Nessun listener canplay necessario.
        // Dopo REVEAL_DUR lasciamo lo scudo visibile anziché sfumarlo.
        gsap.delayedCall(REVEAL_DUR, () => {
          // Lo scudo rimane, ma segniamo la transizione come completata.
          isAnimatingRef.current = false;
        });
      }
    },
    [] // nessuna dipendenza esterna necessaria (accede a ref e costanti)
  );

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

      // ── Reduced-motion: salta GSAP Flip, swap istantaneo ───────────────
      if (prefersReducedMotion) {
        performTransition(nextIndex);
        setActiveIndex(nextIndex);
        return;
      }

      const isForward = nextIndex > activeIndex || (activeIndex === TOTAL - 1 && nextIndex === 0);

      // 1. Snapshot coda per Flip
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

      // 3. GSAP Flip: miniatura → scudo fullscreen ────────────────────────
      //    L'immagine nella thumbnail usa object-cover con aspect 9:16 ma
      //    la sorgente è 16:9. Lo scudo (coverImage) è la stessa scena in
      //    orizzontale → visivamente coerente durante il Flip.
      const thumbEl = container.querySelector(`[data-queue-index="${nextIndex}"]`) as HTMLElement | null;
      const shield  = shieldRef.current;
      let hasBullet = false;

      if (thumbEl && shield) {
        hasBullet = true;
        const thumbRect     = thumbEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Imposta lo scudo nella posizione della miniatura
        shield.src = PROTOCOL_DATA[nextIndex].coverImage;
        gsap.set(shield, {
          position: 'absolute',
          top:  thumbRect.top  - containerRect.top,
          left: thumbRect.left - containerRect.left,
          width:  thumbRect.width,
          height: thumbRect.height,
          opacity: 1,
          visibility: 'visible',
          borderRadius: '4px',
          zIndex: 4,
        });

        // Cattura stato iniziale per Flip
        const bulletState = Flip.getState(shield);

        // Imposta stato finale: fullscreen
        gsap.set(shield, {
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '0px',
        });

        // Anima il Flip
        Flip.from(bulletState, {
          duration: BULLET_DUR,
          ease: 'power3.inOut',
          force3D: true,
          onComplete: () => {
            // Lo scudo è ora fullscreen → avvia il caricamento del video sotto
            performTransition(nextIndex);
          },
        });
      } else {
        // Nessuna miniatura visibile (frecce o auto-advance):
        // Mostra lo scudo istantaneamente come fullscreen, poi transiziona
        performTransition(nextIndex);
      }

      // 4. Commit state → React re-render (testi, coda)
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
    [activeIndex, prefersReducedMotion, performTransition]
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
      className="relative w-full h-[100vh] h-[100dvh] min-h-[600px] md:min-h-[700px] bg-[#000] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="region"
      aria-label="Protocollo Aurex — Slider delle 10 fasi"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
       *  BACKGROUND — Logica condizionale video / immagine statica.
       *
       *  Il tag <video> è sempre in DOM (necessario per la strategia
       *  shield + GSAP Flip), ma viene nascosto con autoAlpha:0 quando
       *  la fase attiva non ha un video (videoUrl === null).
       *  In quel caso lo sfondo viene fornito dallo <shield> img rimasto
       *  visibile (opacity:1) dalla transizione performTransition.
       *
       *  Attributi video: muted, loop, playsInline, autoPlay.
       *  Nessun filtro CSS direttamente sul video.
       * ═══════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        {/* Elemento <video> — sempre in DOM, visibile solo se activeHasVideo */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full"
          style={{
            ...VIDEO_GPU_STYLES,
            // Quando la fase non ha video, lo rendiamo invisibile.
            // GSAP gestisce autoAlpha durante le transizioni.
            opacity: activeHasVideo ? undefined : 0,
            visibility: activeHasVideo ? undefined : 'hidden',
          }}
        />

        {/* ── OVERLAY: effetti visivi separati dal video ───────────────────
         *  Gradiente, brightness, vignette vanno QUI — mai sul <video>.
         * ──────────────────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
       *  SHIELD (Scudo Visivo) — <img> con coverImage orizzontale 16:9.
       *
       *  Ciclo di vita:
       *   1. Parte hidden (visibility:hidden, opacity:0)
       *   2. Quando l'utente clicca una thumbnail, GSAP Flip la espande
       *      dalla posizione della miniatura a fullscreen (z-index 4)
       *   3. Sotto lo scudo, il video carica il nuovo src
       *   4. Al `canplay` del video, lo scudo sfuma (opacity 1→0)
       *   5. Torna hidden, pronto per la prossima transizione
       * ═══════════════════════════════════════════════════════════════════ */}
      <img
        ref={shieldRef}
        alt=""
        aria-hidden="true"
        className="absolute object-cover pointer-events-none"
        style={{
          visibility: 'hidden',
          opacity: 0,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          zIndex: 4,
        }}
      />

      {/* ── MAIN LAYOUT: Content left + Queue right ──────────────────────── */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto
                      flex flex-col justify-between pt-20 pb-4 px-4
                      md:flex-row md:px-12 md:py-12">

        {/* LEFT — Text content: grouped vertically, no absolute CTA */}
        <div
          ref={textBlockRef}
          className="flex flex-col items-start gap-3 max-w-xl
                     pt-4 md:pt-0 md:flex-1 md:justify-center md:pr-16 md:gap-0"
        >
          {/* Eyebrow badge */}
          <span
            className="inline-flex items-center gap-2 w-fit text-[11px] uppercase tracking-[0.3em] font-mono
                       text-[#D4AF37]/80 border border-[#D4AF37]/25 bg-[#080808]/60
                       px-4 py-1.5 rounded-sm backdrop-blur-md md:mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            {activeStep.stepNumber} // {TOTAL}
          </span>

          {/* Title H2 */}
          <h2
            className="text-2xl font-bold md:text-5xl lg:text-6xl xl:text-7xl font-display
                       tracking-tight text-white leading-[1.08] md:mb-6"
            style={{ willChange: 'transform' }}
          >
            {activeStep.title}
          </h2>

          {/* Tagline / Short Description */}
          <p className="text-sm text-neutral-300 line-clamp-3
                        md:line-clamp-none md:text-xl font-sans md:text-white/60 leading-relaxed max-w-xl md:mb-10">
            {activeStep.shortDescription}
          </p>

          {/* CTA — inline nel flusso, mt-2 su mobile, mt-0 su desktop (già spaziato da mb-10) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-3 w-fit px-6 py-3 mt-2
                       md:px-8 md:py-4 md:mt-0
                       bg-[#D4AF37] text-[#000] font-mono text-xs md:text-sm uppercase tracking-[0.2em] font-bold
                       hover:bg-[#F3E5AB] active:scale-[0.97] transition-all duration-200 rounded-sm"
          >
            Approfondisci SOP
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* RIGHT — Queue Desktop: miniature 9:16 (max 4, bottom-aligned)
         *  Spaziatura: gap-4 (16px = 2×8) e pb-24 (96px = 12×8) → griglia 8px */}
        <div
          className="hidden md:flex items-end gap-4 pb-24 shrink-0"
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
                className="group relative w-[136px] rounded-sm overflow-hidden flex-shrink-0 cursor-pointer aspect-[9/16]
                           border border-white/10 hover:border-[#D4AF37]/30 bg-[#080808] transition-all duration-300"
                style={{ willChange: 'transform' }}
              >
                {/* Immagine viva — usa la card verticale per il thumbnail */}
                <img
                  src={step.cardImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
                
                {/* Gradiente nero sottile in basso per leggibilità testo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                
                {/* Label — padding p-3 (12px) ≈ 1.5×8 arrotondato */}
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

      {/* ── MOBILE: Thumbnails strip — isolated, bottom-anchored ─────────── */}
      <div
        className="md:hidden relative z-20 w-full shrink-0 mt-auto pt-2 pb-2 px-4"
      >
        <div
          className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory
                     touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none]
                     [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Seleziona una fase del protocollo"
        >
          {PROTOCOL_DATA.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.id}
                data-queue-thumb=""
                data-queue-index={idx}
                data-flip-id={`queue-mobile-${step.id}`}
                onClick={() => goTo(idx)}
                role="tab"
                aria-selected={isActive}
                aria-label={`Vai a: ${step.title}`}
                className={`relative shrink-0 w-[72px] h-[128px] rounded-sm overflow-hidden snap-start
                           border transition-all duration-300 ${
                  isActive
                    ? 'border-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.2)] scale-[1.03]'
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
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-left">
                  <span className="block text-[8px] font-mono text-[#D4AF37] tracking-widest uppercase">
                    {step.stepNumber}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM BAR: Progress + Controls ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#000]/80 backdrop-blur-md border-t border-[#D4AF37]/15"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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

          {/* Nav arrows — gap-2 (8px) → griglia 8px */}
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
            {/* Header — padding p-8 (32px = 4×8) → griglia 8px */}
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

            {/* Body — padding p-8 (32px = 4×8), mb-8 (32px), space-y gap 12px → griglia 8px */}
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
