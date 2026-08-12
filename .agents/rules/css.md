# Linee Guida per CSS, Tailwind e Theming

- Usa variabili CSS per tutti i colori per abilitare facilmente il cambio di tema.
- Estendi le utility Tailwind nel `tailwind.config.js` per supportare:
  - SVG filters avanzati (es. `#gooey-filter`, `#frost-filter`).
  - `clip-path` dinamici per forme futuristiche o tagli netti.
  - Bagliori al neon (es. ombre esterne o interne color oro metallico per enfatizzare il contrasto "Luxury Tech").
- Abilita l'iniezione e l'utilizzo di variabili CSS dinamiche (es. `--x`, `--y`, `--progress`). Queste devono poter essere aggiornate in tempo reale via JavaScript per produrre effetti fisici (es. cursor tracking) e magnetici.