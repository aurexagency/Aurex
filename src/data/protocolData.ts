export interface ProtocolStep {
  id: number;
  stepNumber: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  sopDetails: string[];
  videoDesktop: string;
  videoMobile: string;
  cardImage: string;
  /** Immagine orizzontale 16:9 hi-res usata come "scudo" durante il GSAP Flip */
  coverImage: string;
}

export const PROTOCOL_DATA: ProtocolStep[] = [
  {
    id: 1,
    stepNumber: 'FASE 01',
    title: 'Analisi di Posizionamento e Qualificazione',
    shortDescription: 'Scopri se il tuo brand ha i requisiti per scalare e dominare il mercato digitale.',
    fullDescription: 'Fase preliminare in cui valutiamo il DNA della tua azienda. Analizziamo il posizionamento attuale, i competitor e le reali potenzialità di crescita per capire se esistono i presupposti per una collaborazione profittevole.',
    sopDetails: [
      'Valutazione iniziale dei requisiti di mercato.',
      'Analisi dei competitor diretti e indiretti.',
      'Definizione del target ideale e della buyer persona.',
      'Calcolo del potenziale di scalabilità del brand.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/video card 1.mp4',
    videoMobile: '/media/protocol/video desktop 2/video card 1.mp4',
    cardImage: '/media/protocol/cards/1 (orizontale).webp',
    coverImage: '/media/protocol/cards/1 (orizontale).webp'
  },
  {
    id: 2,
    stepNumber: 'FASE 02',
    title: 'Audit Strategico Multimediale',
    shortDescription: 'Ricevi una mappa esatta delle tue criticità attuali e la roadmap per diventare leader di settore.',
    fullDescription: 'Un\'analisi approfondita degli asset digitali attuali. Esaminiamo sito web, canali social e campagne attive per identificare i colli di bottiglia che stanno limitando le tue conversioni.',
    sopDetails: [
      'Analisi tecnica e prestazionale del sito web.',
      'Revisione della comunicazione sui canali social.',
      'Identificazione dei gap di conversione attuali.',
      'Creazione di una roadmap strategica personalizzata.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 2.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 2.webm',
    cardImage: '/media/protocol/cards/2 (Orizzontale).webp',
    coverImage: '/media/protocol/cards/2 (Orizzontale).webp'
  },
  {
    id: 3,
    stepNumber: 'FASE 03',
    title: 'Partnership e Contrattualistica Trasparente',
    shortDescription: 'Inizia il tuo percorso di crescita organica senza vincoli, basato su fiducia e ROI reale.',
    fullDescription: 'Formalizziamo l\'accordo in totale trasparenza. Nessun vincolo a lungo termine, ma una partnership basata sul raggiungimento di obiettivi concreti e misurabili mese dopo mese.',
    sopDetails: [
      'Definizione chiara dei KPI (Key Performance Indicators).',
      'Stesura di accordi flessibili senza lock-in.',
      'Allineamento su obiettivi di business condivisi.',
      'Inizio operativo del percorso di crescita.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 3.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 3.webm',
    cardImage: '/media/protocol/cards/3 (Orizzontale).webp',
    coverImage: '/media/protocol/cards/3 (Orizzontale).webp'
  },
  {
    id: 4,
    stepNumber: 'FASE 04',
    title: 'Architettura Funnel e Ingegnerizzazione',
    shortDescription: 'Progettiamo un imbuto di conversione per trasformare l\'attenzione degli utenti in contatti qualificati.',
    fullDescription: 'Costruiamo l\'infrastruttura tecnica che trasforma il traffico in clienti. Ingegnerizziamo landing page, sequenze email e sistemi di tracciamento per massimizzare il ROI di ogni visita.',
    sopDetails: [
      'Mappatura del customer journey ideale.',
      'Sviluppo e ottimizzazione di Landing Page.',
      'Integrazione di sistemi CRM e tracciamento avanzato.',
      'Configurazione di automazioni e sequenze di follow-up.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 4.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 4.webm',
    cardImage: '/media/protocol/cards/4 (orizontale).webp',
    coverImage: '/media/protocol/cards/4 (orizontale).webp'
  },
  {
    id: 5,
    stepNumber: 'FASE 05',
    title: 'Copywriting Persuasivo e Sceneggiatura',
    shortDescription: 'Trasformiamo il tuo know-how aziendale in script video ad alto tasso di conversione.',
    fullDescription: 'Scriviamo le parole che vendono. Dai testi per le campagne agli script per i video aziendali, ogni parola è calibrata per risuonare con il tuo pubblico e spingerlo all\'azione.',
    sopDetails: [
      'Ricerca del tono di voce (ToV) ideale.',
      'Stesura di angoli comunicativi persuasivi.',
      'Creazione di script dettagliati per shooting video.',
      'Ottimizzazione dei messaggi per la conversione.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 5.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 5.webm',
    cardImage: '/media/protocol/cards/5 (orizontale).webp',
    coverImage: '/media/protocol/cards/5 (orizontale).webp'
  },
  {
    id: 6,
    stepNumber: 'FASE 06',
    title: 'Produzione Video e Shooting Aziendale',
    shortDescription: 'Portiamo la qualità cinematografica direttamente nella tua azienda con operatori certificati.',
    fullDescription: 'Trasformiamo l\'identità della tua azienda in immagini spettacolari. Il nostro team di produzione on-site cattura la vera essenza del tuo brand con attrezzature di altissima gamma e taglio cinematografico.',
    sopDetails: [
      'Pianificazione logistica dello shooting.',
      'Produzione on-site con attrezzature cinema-grade.',
      'Direzione artistica e gestione del set.',
      'Cattura di asset visivi premium e B-roll.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 6.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 6.webm',
    cardImage: '/media/protocol/cards/6 (Orizzontale).webp',
    coverImage: '/media/protocol/cards/6 (Orizzontale).webp'
  },
  {
    id: 7,
    stepNumber: 'FASE 07',
    title: 'Editing Video Neuro-Comportamentale',
    shortDescription: 'Montaggio strategico avanzato per catturare l\'attenzione e battere l\'algoritmo.',
    fullDescription: 'Non semplice montaggio, ma ingegneria dell\'attenzione. Utilizziamo pattern neuro-comportamentali nel montaggio per mantenere alto l\'engagement dello spettatore e massimizzare il watch time.',
    sopDetails: [
      'Montaggio rapido e dinamico (pattern interrupt).',
      'Inserimento strategico di hook visivi e testuali.',
      'Color grading cinematografico in linea col brand.',
      'Sound design e ottimizzazione per piattaforme social.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 7.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 7.webm',
    cardImage: '/media/protocol/cards/7 (Orizzontale).webp',
    coverImage: '/media/protocol/cards/7 (Orizzontale).webp'
  },
  {
    id: 8,
    stepNumber: 'FASE 08',
    title: 'Revisione e Distribuzione Strategica',
    shortDescription: 'Pubblichiamo i tuoi contenuti nelle fasce orarie a maggior rendimento.',
    fullDescription: 'Il tempismo è tutto. Analizziamo i dati storici e le abitudini del tuo pubblico per distribuire i contenuti esattamente quando la probabilità di engagement è al massimo.',
    sopDetails: [
      'Controllo qualità (QA) finale di tutti gli asset.',
      'Analisi predittiva degli orari di picco.',
      'Pianificazione e schedulazione multi-canale.',
      'Lancio sincronizzato per massimizzare l\'impatto.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 8.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 8.webm',
    cardImage: '/media/protocol/cards/8 (Orizzontale).webp',
    coverImage: '/media/protocol/cards/8 (Orizzontale).webp'
  },
  {
    id: 9,
    stepNumber: 'FASE 09',
    title: 'Boost Algoritmico e Gestione Community',
    shortDescription: 'Sfruttiamo i primi 30 minuti vitali per inviare segnali positivi e innescare la viralità.',
    fullDescription: 'Interveniamo attivamente nella finestra critica post-pubblicazione. Gestiamo i primi commenti e interazioni per segnalare all\'algoritmo la rilevanza del contenuto e spingerlo organicamente.',
    sopDetails: [
      'Monitoraggio attivo nei primi 30-60 minuti dal lancio.',
      'Risposta strategica a commenti per stimolare discussioni.',
      'Attivazione della rete di contatti per initial boost.',
      'Costruzione e moderazione continua della community.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 9.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 9.webm',
    cardImage: '/media/protocol/cards/9 (Orizzontale).webp',
    coverImage: '/media/protocol/cards/9 (Orizzontale).webp'
  },
  {
    id: 10,
    stepNumber: 'FASE 10',
    title: 'Analisi Dati, KPI e Ottimizzazione',
    shortDescription: 'Monitoriamo i numeri ogni settimana per scalare i tuoi profitti e ottimizzare le performance.',
    fullDescription: 'Ogni azione produce dati che trasformiamo in intuizioni strategiche. Analizziamo i risultati, perfezioniamo il tiro e ottimizziamo l\'intero processo per un miglioramento continuo (Kaizen).',
    sopDetails: [
      'Reportistica avanzata su metriche di conversione.',
      'A/B testing su angoli creativi e copy.',
      'Riunioni di allineamento strategico mensili/settimanali.',
      'Ottimizzazione iterativa per scalare il ROI.'
    ],
    videoDesktop: '/media/protocol/video desktop 2/orizontale 10.webm',
    videoMobile: '/media/protocol/video desktop 2/orizontale 10.webm',
    cardImage: '/media/protocol/cards/10 (orizontale).webp',
    coverImage: '/media/protocol/cards/10 (orizontale).webp'
  }
];
