// ─────────────────────────────────────────────────────────────────────────────
// PROTOCOL STEPS — Dati delle 10 fasi del Protocollo Aurex
// ─────────────────────────────────────────────────────────────────────────────

export interface ProtocolStep {
  /** Numero della fase (es. "01") */
  number: string;
  /** Titolo completo con numerazione */
  title: string;
  /** Frase ad alto impatto / hook */
  hook: string;
  /** Slug URL-safe per routing dinamico */
  slug: string;
}

export const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    number: '01',
    title: 'Studio del Potenziale Cliente',
    hook: 'Scopri se il tuo brand ha i requisiti per scalare e dominare il mercato digitale.',
    slug: '01-analisi-posizionamento',
  },
  {
    number: '02',
    title: 'Audit Strategico Multimediale',
    hook: 'Ricevi una mappa esatta delle tue criticità attuali e la roadmap per diventare leader di settore.',
    slug: '02-audit-strategico',
  },
  {
    number: '03',
    title: 'Partnership e Contrattualistica Trasparente',
    hook: 'Inizia il tuo percorso di crescita organica senza vincoli, basato su fiducia e ROI reale.',
    slug: '03-partnership-trasparente',
  },
  {
    number: '04',
    title: 'Architettura Funnel e Ingegnerizzazione',
    hook: 'Progettiamo un imbuto di conversione per trasformare l\'attenzione degli utenti in contatti qualificati.',
    slug: '04-architettura-funnel',
  },
  {
    number: '05',
    title: 'Copywriting Persuasivo e Sceneggiatura',
    hook: 'Trasformiamo il tuo know-how aziendale in script video ad alto tasso di conversione.',
    slug: '05-copywriting-sceneggiatura',
  },
  {
    number: '06',
    title: 'Produzione Video e Shooting Aziendale',
    hook: 'Portiamo la qualità cinematografica direttamente nella tua azienda con operatori certificati.',
    slug: '06-produzione-video',
  },
  {
    number: '07',
    title: 'Editing Video Neuro-Comportamentale',
    hook: 'Montaggio strategico avanzato per catturare l\'attenzione e battere l\'algoritmo.',
    slug: '07-editing-neuro-comportamentale',
  },
  {
    number: '08',
    title: 'Revisione e Distribuzione Strategica',
    hook: 'Pubblichiamo i tuoi contenuti nelle fasce orarie a maggior rendimento.',
    slug: '08-revisione-distribuzione',
  },
  {
    number: '09',
    title: 'Boost Algoritmico e Gestione Community',
    hook: 'Sfruttiamo i primi 30 minuti vitali per inviare segnali positivi e innescare la viralità.',
    slug: '09-boost-algoritmico',
  },
  {
    number: '10',
    title: 'Analisi Dati, KPI e Ottimizzazione',
    hook: 'Monitoriamo i numeri ogni settimana per scalare i tuoi profitti e ottimizzare le performance.',
    slug: '10-analisi-dati',
  },
];
