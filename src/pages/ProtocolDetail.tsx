import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PROTOCOL_STEPS } from '../data/protocolSteps';
import type { ProtocolStep } from '../data/protocolSteps';

// ─────────────────────────────────────────────────────────────────────────────
// PROTOCOL DETAIL PAGE — Pagina di dettaglio dinamica per ogni fase
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stepIndex = PROTOCOL_STEPS.findIndex((s) => s.slug === slug);
  const step: ProtocolStep | undefined = PROTOCOL_STEPS[stepIndex];

  const prevStep = stepIndex > 0 ? PROTOCOL_STEPS[stepIndex - 1] : null;
  const nextStep = stepIndex < PROTOCOL_STEPS.length - 1 ? PROTOCOL_STEPS[stepIndex + 1] : null;

  // ── SEO: document.title + meta description ───────────────────────────────
  useEffect(() => {
    if (step) {
      document.title = `${step.number}. ${step.title} — Protocollo Aurex`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', step.hook);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = step.hook;
        document.head.appendChild(meta);
      }
    }
    return () => {
      document.title = 'Aurex — Luxury Tech Marketing Agency';
    };
  }, [step]);

  // ── GSAP intro animations ────────────────────────────────────────────────
  useEffect(() => {
    if (!step) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: reducedMotion ? 0 : 40 },
        { opacity: 1, y: 0, duration: reducedMotion ? 0.2 : 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: reducedMotion ? 0 : 30 },
        { opacity: 1, y: 0, duration: reducedMotion ? 0.2 : 0.8, ease: 'power3.out', delay: reducedMotion ? 0 : 0.2 }
      );
    });

    return () => ctx.revert();
  }, [step]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // ── 404 Fallback ─────────────────────────────────────────────────────────
  if (!step) {
    return (
      <div className="min-h-screen bg-brand-anthracite flex flex-col items-center justify-center text-center px-6">
        <span className="text-8xl font-serif italic text-brand-gold/20 mb-6" aria-hidden="true">404</span>
        <h1 className="text-3xl font-display uppercase tracking-widest text-brand-marble mb-4">
          Fase non trovata
        </h1>
        <p className="text-base font-sans text-brand-marble/50 mb-8 max-w-md">
          Lo slug <code className="text-brand-gold font-mono">"{slug}"</code> non corrisponde a nessuna fase del Protocollo Aurex.
        </p>
        <Link
          to="/#protocol"
          className="inline-flex items-center gap-2 px-6 py-3 border border-brand-gold/40 text-brand-gold font-mono text-sm uppercase tracking-widest
                     hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300 rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al Protocollo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-anthracite text-brand-marble selection:bg-brand-gold selection:text-brand-black">
      {/* ── NOISE OVERLAY ──────────────────────────────────────────────────── */}
      <div className="noise-overlay" />

      {/* ── HERO BANNER ────────────────────────────────────────────────────── */}
      <header
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 lg:px-12 bg-brand-black border-b border-brand-gold/10"
      >
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            to="/#protocol"
            className="inline-flex items-center gap-2 text-sm font-mono text-brand-gold/60 tracking-widest uppercase mb-12
                       hover:text-brand-gold transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Il Protocollo Aurex
          </Link>

          {/* Phase number */}
          <span
            className="block text-[8rem] md:text-[12rem] font-serif italic text-brand-gold/10 leading-none select-none -mb-12 md:-mb-20"
            aria-hidden="true"
          >
            {step.number}
          </span>

          {/* Title — H1 SEO */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-wide text-brand-marble leading-tight mb-6">
            {step.title}
          </h1>

          {/* Hook */}
          <p className="text-lg md:text-xl font-sans text-brand-marble/60 max-w-2xl leading-relaxed">
            {step.hook}
          </p>
        </div>

        {/* Bottom gold accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" aria-hidden="true" />
      </header>

      {/* ── BODY CONTENT ───────────────────────────────────────────────────── */}
      <main ref={contentRef} className="py-20 px-6 lg:px-12">
        <article className="max-w-3xl mx-auto">
          {/* Structured content area — ready for extended copy */}
          <div className="prose-aurex space-y-8">
            <section>
              <h2 className="text-2xl font-display uppercase tracking-wide text-brand-gold mb-4">
                Panoramica
              </h2>
              <p className="text-base font-sans text-brand-marble/70 leading-relaxed">
                {/* TODO: inserisci qui il contenuto esteso della fase {step.number} */}
                Contenuto dettagliato della fase <strong className="text-brand-gold">{step.number}. {step.title}</strong> — 
                questa sezione è pronta per ricevere i tuoi contenuti estesi con paragrafi, liste e formattazione strutturata.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display uppercase tracking-wide text-brand-gold mb-4">
                Come Funziona
              </h2>
              <ul className="space-y-3">
                {['Analisi iniziale e assessment', 'Definizione della strategia operativa', 'Esecuzione e monitoraggio continuo'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base font-sans text-brand-marble/70">
                    <span className="text-brand-gold font-mono text-sm mt-0.5 shrink-0">0{i + 1}.</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-sans text-brand-marble/40 italic">
                {/* TODO: sostituisci i bullet point sopra con i contenuti reali */}
                Sostituisci questi placeholder con i contenuti specifici di questa fase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display uppercase tracking-wide text-brand-gold mb-4">
                Risultati Attesi
              </h2>
              <p className="text-base font-sans text-brand-marble/70 leading-relaxed">
                {/* TODO: inserisci qui i risultati attesi */}
                Sezione dedicata ai risultati misurabili e ai KPI che questa fase del protocollo produce per il tuo business.
              </p>
            </section>
          </div>

          {/* ── NAVIGATION PREV / NEXT ─────────────────────────────────────── */}
          <nav
            className="mt-20 pt-12 border-t border-brand-gold/10 grid grid-cols-1 md:grid-cols-2 gap-6"
            aria-label="Navigazione tra le fasi del protocollo"
          >
            {prevStep ? (
              <Link
                to={`/protocollo/${prevStep.slug}`}
                className="group flex items-center gap-4 p-6 border border-brand-gold/20 rounded-sm
                           hover:border-brand-gold/50 hover:bg-brand-black transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 text-brand-gold/50 group-hover:text-brand-gold transition-colors shrink-0" />
                <div className="text-left">
                  <span className="block text-xs font-mono text-brand-gold/40 uppercase tracking-widest mb-1">Fase precedente</span>
                  <span className="block text-sm font-display uppercase tracking-wide text-brand-marble group-hover:text-brand-gold transition-colors">
                    {prevStep.number}. {prevStep.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div /> /* Empty cell for grid alignment */
            )}

            {nextStep ? (
              <Link
                to={`/protocollo/${nextStep.slug}`}
                className="group flex items-center gap-4 p-6 border border-brand-gold/20 rounded-sm
                           hover:border-brand-gold/50 hover:bg-brand-black transition-all duration-300
                           md:justify-end md:text-right"
              >
                <div className="text-right">
                  <span className="block text-xs font-mono text-brand-gold/40 uppercase tracking-widest mb-1">Fase successiva</span>
                  <span className="block text-sm font-display uppercase tracking-wide text-brand-marble group-hover:text-brand-gold transition-colors">
                    {nextStep.number}. {nextStep.title}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-gold/50 group-hover:text-brand-gold transition-colors shrink-0" />
              </Link>
            ) : (
              <Link
                to="/#protocol"
                className="group flex items-center gap-4 p-6 border border-brand-gold/20 rounded-sm
                           hover:border-brand-gold/50 hover:bg-brand-black transition-all duration-300
                           md:justify-end md:text-right md:col-start-2"
              >
                <div className="text-right">
                  <span className="block text-xs font-mono text-brand-gold/40 uppercase tracking-widest mb-1">Torna a</span>
                  <span className="block text-sm font-display uppercase tracking-wide text-brand-marble group-hover:text-brand-gold transition-colors">
                    Il Protocollo Aurex
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-brand-gold/50 group-hover:text-brand-gold transition-colors shrink-0" />
              </Link>
            )}
          </nav>
        </article>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-brand-black text-center border-t border-brand-gold/20">
        <div className="text-xl font-display font-bold text-brand-gold tracking-widest uppercase mb-4">Aurex</div>
        <p className="text-xs font-sans text-[#F2F2F2]/40 tracking-widest uppercase">Luxury Tech Marketing Agency &copy; 2026</p>
      </footer>
    </div>
  );
}
