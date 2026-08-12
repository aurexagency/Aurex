# Direttive per Micro-Interazioni e Canvas

- **Gestione Canvas 2D/3D**: Applica il memory pooling per riutilizzare oggetti e particelle invece di crearli/distruggerli continuamente.
- **Throttling e Debouncing**: Applica il throttling per tutti gli eventi ad alta frequenza legati a mouse e touch per evitare colli di bottiglia nel Main Thread.
- **Ciclo di Vita RequestAnimationFrame**: Usa sempre e solo `requestAnimationFrame` per la sincronizzazione del rendering, evitando `setTimeout` o `setInterval` per le animazioni.
- **Performance Target**: Stabilisci una soglia target di **60 FPS costanti**.
- **Fallback Progressivo**: Implementa sistemi di fallback automatico (es. disattivazione di shader pesanti o riduzione del numero di particelle) se rilevato su dispositivi mobile o hardware a basse prestazioni, per garantire sempre una navigazione fluida.
