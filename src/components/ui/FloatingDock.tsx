import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import {
  Home,
  Layers,
  Network,
  BadgePercent,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  sectionId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',       label: 'Home',        icon: Home,          href: '#hero',      sectionId: 'hero'      },
  { id: 'pilastri',   label: 'Pilastri',    icon: Layers,        href: '#features',  sectionId: 'features'  },
  { id: 'ecosistema', label: 'Network',     icon: Network,       href: '#ecosystem', sectionId: 'ecosystem' },
  { id: 'opportunita',label: 'Protocollo',  icon: BadgePercent,  href: '#protocol',  sectionId: 'protocol'  },
  { id: 'contatti',   label: 'Team',        icon: Users,         href: '#team',      sectionId: 'team'      },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING DOCK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function FloatingDock() {
  const dockRef     = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs    = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const iconRefs    = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const isUserClick = useRef(false);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Intro animation on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!dockRef.current) return;
    gsap.fromTo(
      dockRef.current,
      { opacity: 0, y: -48 },
      {
        opacity: 1,
        y: 0,
        duration: reducedMotion ? 0.2 : 0.8,
        ease: 'back.out(1.4)',
        delay: reducedMotion ? 0 : 0.5,
      },
    );
  }, [reducedMotion]);

  // ── IntersectionObserver: active section detection ──────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserClick.current) return;
        // Find the entry that is most visible
        let best: { index: number; ratio: number } | null = null;
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          const index = NAV_ITEMS.findIndex((n) => n.sectionId === sectionId);
          if (index === -1) return;
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.ratio) {
              best = { index, ratio: entry.intersectionRatio };
            }
          }
        });
        if (best !== null) {
          setActiveIndex((best as { index: number; ratio: number }).index);
        }
      },
      { threshold: [0.1, 0.3, 0.5, 0.7], rootMargin: '-10% 0px -40% 0px' },
    );

    NAV_ITEMS.forEach(({ sectionId }) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ── Animate indicator & icons when activeIndex changes ──────────────────
  const animateToIndex = useCallback(
    (index: number) => {
      const indicator = indicatorRef.current;
      const targetBtn = itemRefs.current[index];
      if (!indicator || !targetBtn || !dockRef.current) return;

      const dockRect = dockRef.current.getBoundingClientRect();
      const btnRect  = targetBtn.getBoundingClientRect();
      // Center the 48px indicator on the button's center
      const targetX  = btnRect.left - dockRect.left + btnRect.width / 2 - 24;

      const dur  = reducedMotion ? 0.15 : 0.5;
      const ease = reducedMotion ? 'power1.out' : 'back.out(1.5)';

      // Indicator slide
      gsap.to(indicator, { x: targetX, duration: dur, ease, overwrite: true });

      // Icons: lift active, reset others
      iconRefs.current.forEach((iconEl, i) => {
        if (!iconEl) return;
        gsap.to(iconEl, {
          y:     i === index ? (reducedMotion ? -16 : -28) : 0,
          scale: i === index ? 1.15 : 1,
          duration: dur,
          ease,
          overwrite: true,
        });
        const svgEl = iconEl.querySelector('svg');
        if (svgEl) {
          gsap.to(svgEl, {
            color: i === index ? '#D4AF37' : 'rgba(242,242,242,0.5)',
            duration: dur * 0.8,
            ease: 'power2.out',
            overwrite: true,
          });
        }
      });

      // Labels: reveal active, hide others
      labelRefs.current.forEach((labelEl, i) => {
        if (!labelEl) return;
        if (i === index) {
          gsap.to(labelEl, {
            opacity: 1,
            y: 0,
            duration: reducedMotion ? 0.1 : 0.35,
            delay:   reducedMotion ? 0   : 0.15,
            ease: 'power2.out',
            overwrite: true,
          });
        } else {
          gsap.to(labelEl, {
            opacity: 0,
            y: 6,
            duration: reducedMotion ? 0.05 : 0.2,
            ease: 'power2.in',
            overwrite: true,
          });
        }
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    animateToIndex(activeIndex);
  }, [activeIndex, animateToIndex]);

  // ── Set initial indicator/icon/label states on mount ────────────────────
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const indicator = indicatorRef.current;
      const btn0      = itemRefs.current[0];
      if (!indicator || !btn0 || !dockRef.current) return;

      const dockRect = dockRef.current.getBoundingClientRect();
      const btnRect  = btn0.getBoundingClientRect();
      gsap.set(indicator, { x: btnRect.left - dockRect.left + btnRect.width / 2 - 24 });

      iconRefs.current.forEach((iconEl, i) => {
        if (!iconEl) return;
        gsap.set(iconEl, {
          y:     i === 0 ? (reducedMotion ? -16 : -28) : 0,
          scale: i === 0 ? 1.15 : 1,
        });
        const svgEl = iconEl.querySelector('svg');
        if (svgEl) gsap.set(svgEl, { color: i === 0 ? '#D4AF37' : 'rgba(242,242,242,0.5)' });
      });

      labelRefs.current.forEach((labelEl, i) => {
        if (!labelEl) return;
        gsap.set(labelEl, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 6 });
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // ── Click handler ────────────────────────────────────────────────────────
  const handleClick = useCallback(
    (index: number, href: string) => {
      isUserClick.current = true;
      setActiveIndex(index);
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      setTimeout(() => { isUserClick.current = false; }, 1400);
    },
    [reducedMotion],
  );

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <nav
      ref={dockRef}
      className="aurex-floating-dock"
      aria-label="Navigazione principale Aurex"
      style={{ opacity: 0 }}        /* GSAP animerà da 0 a 1 al mount */
    >
      {/* Glassmorphism pill */}
      <div className="aurex-dock-shell">

        {/* Gold glow indicator */}
        <div
          ref={indicatorRef}
          className="aurex-dock-indicator"
          aria-hidden="true"
        />

        {/* Nav items */}
        <ul className="aurex-dock-items" role="list">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="aurex-dock-item">
                <button
                  ref={(el) => { itemRefs.current[index] = el; }}
                  type="button"
                  id={`dock-btn-${item.id}`}
                  className="aurex-dock-btn"
                  onClick={() => handleClick(index, item.href)}
                  aria-label={item.label}
                  aria-current={activeIndex === index ? 'page' : undefined}
                >
                  {/* Icon */}
                  <div
                    ref={(el) => { iconRefs.current[index] = el; }}
                    className="aurex-dock-icon-wrap"
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </div>

                  {/* Label */}
                  <span
                    ref={(el) => { labelRefs.current[index] = el; }}
                    className="aurex-dock-label"
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
