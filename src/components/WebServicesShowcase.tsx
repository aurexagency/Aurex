import React, { useState, useEffect } from 'react';
import { Code2, Activity, Cpu, ShieldCheck, Zap, Server, GlobeLock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES & PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// BENTO CARD WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
const BentoCard: React.FC<BentoCardProps> = ({ title, description, icon, className = '', children }) => {
  return (
    <div
      className={`bento-card group relative overflow-hidden bg-brand-black border border-white/5 hover:border-brand-gold/30 rounded-sm p-8 md:p-10 transition-all duration-700 ease-out flex flex-col justify-between ${className}`}
    >
      {/* ── Glow Radiale su Hover ── */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06)_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
        style={{ willChange: 'opacity' }}
      />
      
      <div className="relative z-10 mb-10">
        <div className="w-12 h-12 bg-[#080808] border border-white/5 rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-brand-gold/20 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500 text-brand-gold">
          {icon}
        </div>
        <h3 className="text-2xl md:text-3xl font-display text-brand-marble uppercase tracking-wide mb-4">
          {title}
        </h3>
        <p className="text-sm font-sans text-brand-marble/60 leading-relaxed max-w-lg">
          {description}
        </p>
      </div>

      <div className="relative z-10 w-full mt-auto">
         {children}
      </div>
      
      {/* ── Bordo superiore luminescente ── */}
      <div className="absolute top-0 left-0 w-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold to-transparent group-hover:w-full transition-all duration-1000 ease-in-out opacity-0 group-hover:opacity-100" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 1: Stack & Architecture (Static)
// ─────────────────────────────────────────────────────────────────────────────
const TechStackWidget = () => (
  <div className="flex flex-wrap gap-2">
    {['React 19', 'TypeScript', 'GSAP', 'WebGL', 'TailwindCSS'].map(tech => (
      <span 
        key={tech} 
        className="px-3 py-1.5 bg-[#050505] border border-white/5 rounded-sm text-[10px] font-mono text-brand-gold/60 uppercase tracking-widest hover:border-brand-gold/40 hover:text-brand-gold transition-colors duration-300"
      >
        {tech}
      </span>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 2: Interactive Telemetry (Dynamic)
// ─────────────────────────────────────────────────────────────────────────────
const TelemetryWidget = () => {
  const [metrics, setMetrics] = useState({ fps: 60, ttfb: 42, lcp: 0.8 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        fps: Math.floor(Math.random() * 3) + 58,       // 58 - 60 FPS
        ttfb: Math.floor(Math.random() * 15) + 35,     // 35 - 50 ms
        lcp: Number((Math.random() * 0.4 + 0.6).toFixed(1)), // 0.6 - 1.0 s
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-5 bg-[#050505] border border-white/5 shadow-inner rounded-sm font-mono text-[10px] sm:text-[11px] tracking-widest text-brand-marble/50 uppercase">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-brand-gold/70" /> Render Engine</span>
        <span className="text-brand-gold metric-value transition-all duration-300">{metrics.fps} FPS</span>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2"><Server className="w-3 h-3 text-brand-gold/70" /> Time To First Byte</span>
        <span className="text-brand-gold metric-value transition-all duration-300">{metrics.ttfb} MS</span>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2"><GlobeLock className="w-3 h-3 text-brand-gold/70" /> Largest Contentful Paint</span>
        <span className="text-brand-gold metric-value transition-all duration-300">{metrics.lcp} S</span>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2"><Code2 className="w-3 h-3 text-brand-gold/70" /> Lighthouse Score</span>
        <span className="text-brand-gold metric-value animate-pulse">100 / 100</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT: WebServicesShowcase
// ─────────────────────────────────────────────────────────────────────────────
export default function WebServicesShowcase() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6" aria-label="Aurex Web Engineering Capabilities">
      
      {/* CARD 1: Full-Custom Architecture (Larga) */}
      <BentoCard
        title="Full-Custom Architecture"
        description="Nessun template commerciale. Codice nativo cucito sulle esigenze specifiche del tuo brand. Sviluppiamo ecosistemi web che si distinguono per design estremo e performance ineguagliabili."
        icon={<Code2 className="w-5 h-5" />}
        className="md:col-span-12 lg:col-span-8"
      >
        <TechStackWidget />
      </BentoCard>

      {/* CARD 2: Interactive Telemetry (Alta/Quadrata) */}
      <BentoCard
        title="Ingegneria delle Performance"
        description="Ottimizzazione millimetrica del Critical Rendering Path. Fluidità assoluta e tempi di caricamento azzerati."
        icon={<Activity className="w-5 h-5" />}
        className="md:col-span-6 lg:col-span-4"
      >
        <TelemetryWidget />
      </BentoCard>

      {/* CARD 3: AI & Algorithmic Integration */}
      <BentoCard
        title="Integrazione AI & Algoritmi"
        description="Automatizziamo i processi vitali integrando LLMs, agenti autonomi e algoritmi predittivi direttamente nel core del sito."
        icon={<Cpu className="w-5 h-5" />}
        className="md:col-span-6 lg:col-span-5"
      >
        <div className="mt-4 p-4 border border-brand-gold/10 bg-[#050505] rounded-sm font-mono text-[10px] text-brand-gold flex items-center justify-between">
           <span className="uppercase tracking-widest opacity-70">Neural Link Status</span>
           <span className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             ACTIVE
           </span>
        </div>
      </BentoCard>

      {/* CARD 4: Security & High-Scalability */}
      <BentoCard
        title="Edge Infrastructure & Security"
        description="Delivery globale tramite infrastruttura Edge CDN, protocolli Zero-Trust e crittografia militare. Scalabilità infinita, 99.99% uptime."
        icon={<ShieldCheck className="w-5 h-5" />}
        className="md:col-span-12 lg:col-span-7"
      >
        <div className="mt-4 flex gap-4 overflow-hidden">
          {['Global CDN Node', 'DDoS Mitigation', 'WAF Protection', 'SSL/TLS'].map((badge, i) => (
             <div key={i} className="flex items-center gap-2 px-3 py-1.5 border border-white/5 rounded-full bg-brand-black/50 text-[10px] font-sans text-brand-marble/40 whitespace-nowrap">
               <ShieldCheck className="w-3 h-3 text-brand-gold/40" />
               {badge}
             </div>
          ))}
        </div>
      </BentoCard>
      
    </div>
  );
}
