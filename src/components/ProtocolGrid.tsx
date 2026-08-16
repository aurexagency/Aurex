import { Link } from 'react-router-dom';
import { PROTOCOL_STEPS } from '../data/protocolSteps';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PROTOCOL GRID — 10 card interattive con link alle pagine di dettaglio
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {PROTOCOL_STEPS.map((step) => (
        <article
          key={step.slug}
          className="protocol-card group relative bg-brand-black border border-brand-gold/20 rounded-sm overflow-hidden
                     transition-all duration-500 ease-out
                     hover:border-brand-gold/60
                     hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]
                     hover:-translate-y-1
                     motion-reduce:hover:translate-y-0 motion-reduce:transition-none
                     flex flex-col"
        >
          {/* Gold accent line — top */}
          <div
            className="absolute top-0 left-0 h-[2px] w-0 bg-brand-gold group-hover:w-full transition-all duration-700"
            aria-hidden="true"
          />

          <div className="p-8 lg:p-10 flex flex-col flex-1">
            {/* Phase number */}
            <span
              className="text-5xl font-serif italic text-brand-gold/20 group-hover:text-brand-gold/50 transition-colors duration-500 mb-4"
              aria-hidden="true"
            >
              {step.number}
            </span>

            {/* Title — H3 SEO-friendly */}
            <h3 className="text-lg font-display uppercase tracking-wide text-brand-marble mb-3 leading-snug">
              {step.title}
            </h3>

            {/* Hook */}
            <p className="text-sm font-sans text-brand-marble/50 leading-relaxed mb-8 flex-1">
              {step.hook}
            </p>

            {/* CTA */}
            <Link
              to={`/protocollo/${step.slug}`}
              className="inline-flex items-center gap-2 text-sm font-mono text-brand-gold tracking-widest uppercase
                         group-hover:gap-3 transition-all duration-300
                         focus-visible:outline-2 focus-visible:outline-brand-gold focus-visible:outline-offset-4 rounded-sm"
              aria-label={`Scopri la fase ${step.number}: ${step.title}`}
            >
              <span>Scopri la Fase {step.number}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
