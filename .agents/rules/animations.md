# Linee Guida per Animazioni e Interazioni

- Integra il supporto ufficiale per GSAP Plugins, nello specifico: `Flip`, `ScrollTrigger` e `Observer`.
- Richiedi SEMPRE l'uso di `gsap.context()` all'interno dei componenti React per garantire una pulizia della memoria impeccabile ed evitare memory leaks.
- Aggiungi standard per GPU acceleration ove possibile: utilizza `will-change: transform` e favorisci le trasformazioni 3D (es. `translate3d(0,0,0)`) per scaricare il calcolo sulla GPU.
- Rispetta sempre la policy `prefers-reduced-motion` per l'accessibilità: invece di disattivare totalmente le animazioni, riducile a semplici transizioni a dissolvenza (fade-in/fade-out).