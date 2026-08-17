export interface ProtocolStep {
  id: number;
  step: string;
  title: string;
  tagline: string;
  description: string;
  sopDetails: string[];
  videoUrl: string;
  posterUrl: string;
}

export const PROTOCOL_DATA: ProtocolStep[] = [
  {
    id: 1,
    step: '01',
    title: 'Analisi di Posizionamento e Qualificazione',
    tagline: 'Scopri se il tuo brand ha i requisiti per scalare e dominare il mercato digitale.',
    description: 'Fase preliminare in cui valutiamo il DNA della tua azienda. Analizziamo il posizionamento attuale, i competitor e le reali potenzialità di crescita per capire se esistono i presupposti per una collaborazione profittevole.',
    sopDetails: [
      'Valutazione iniziale dei requisiti di mercato.',
      'Analisi dei competitor diretti e indiretti.',
      'Definizione del target ideale e della buyer persona.',
      'Calcolo del potenziale di scalabilità del brand.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2020/05/25/40141-424754593_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 2,
    step: '02',
    title: 'Audit Strategico Multimediale',
    tagline: 'Ricevi una mappa esatta delle tue criticità attuali e la roadmap per diventare leader di settore.',
    description: 'Un\'analisi approfondita degli asset digitali attuali. Esaminiamo sito web, canali social e campagne attive per identificare i colli di bottiglia che stanno limitando le tue conversioni.',
    sopDetails: [
      'Analisi tecnica e prestazionale del sito web.',
      'Revisione della comunicazione sui canali social.',
      'Identificazione dei gap di conversione attuali.',
      'Creazione di una roadmap strategica personalizzata.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/04/83863-584738734_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 3,
    step: '03',
    title: 'Partnership e Contrattualistica Trasparente',
    tagline: 'Inizia il tuo percorso di crescita organica senza vincoli, basato su fiducia e ROI reale.',
    description: 'Formalizziamo l\'accordo in totale trasparenza. Nessun vincolo a lungo termine, ma una partnership basata sul raggiungimento di obiettivi concreti e misurabili mese dopo mese.',
    sopDetails: [
      'Definizione chiara dei KPI (Key Performance Indicators).',
      'Stesura di accordi flessibili senza lock-in.',
      'Allineamento su obiettivi di business condivisi.',
      'Inizio operativo del percorso di crescita.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2019/11/22/29440-375001229_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 4,
    step: '04',
    title: 'Architettura Funnel e Ingegnerizzazione',
    tagline: 'Progettiamo un imbuto di conversione per trasformare l\'attenzione degli utenti in contatti qualificati.',
    description: 'Costruiamo l\'infrastruttura tecnica che trasforma il traffico in clienti. Ingegnerizziamo landing page, sequenze email e sistemi di tracciamento per massimizzare il ROI di ogni visita.',
    sopDetails: [
      'Mappatura del customer journey ideale.',
      'Sviluppo e ottimizzazione di Landing Page.',
      'Integrazione di sistemi CRM e tracciamento avanzato.',
      'Configurazione di automazioni e sequenze di follow-up.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2022/02/16/108035-678912850_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 5,
    step: '05',
    title: 'Copywriting Persuasivo e Sceneggiatura',
    tagline: 'Trasformiamo il tuo know-how aziendale in script video ad alto tasso di conversione.',
    description: 'Scriviamo le parole che vendono. Dai testi per le campagne agli script per i video aziendali, ogni parola è calibrata per risuonare con il tuo pubblico e spingerlo all\'azione.',
    sopDetails: [
      'Ricerca del tono di voce (ToV) ideale.',
      'Stesura di angoli comunicativi persuasivi.',
      'Creazione di script dettagliati per shooting video.',
      'Ottimizzazione dei messaggi per la conversione.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/24/72097-541571520_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 6,
    step: '06',
    title: 'Produzione Video e Shooting Aziendale',
    tagline: 'Portiamo la qualità cinematografica direttamente nella tua azienda con operatori certificati.',
    description: 'Trasformiamo l\'identità della tua azienda in immagini spettacolari. Il nostro team di produzione on-site cattura la vera essenza del tuo brand con attrezzature di altissima gamma e taglio cinematografico.',
    sopDetails: [
      'Pianificazione logistica dello shooting.',
      'Produzione on-site con attrezzature cinema-grade.',
      'Direzione artistica e gestione del set.',
      'Cattura di asset visivi premium e B-roll.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2023/11/05/187903-881373510_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c746765288?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 7,
    step: '07',
    title: 'Editing Video Neuro-Comportamentale',
    tagline: 'Montaggio strategico avanzato per catturare l\'attenzione e battere l\'algoritmo.',
    description: 'Non semplice montaggio, ma ingegneria dell\'attenzione. Utilizziamo pattern neuro-comportamentali nel montaggio per mantenere alto l\'engagement dello spettatore e massimizzare il watch time.',
    sopDetails: [
      'Montaggio rapido e dinamico (pattern interrupt).',
      'Inserimento strategico di hook visivi e testuali.',
      'Color grading cinematografico in linea col brand.',
      'Sound design e ottimizzazione per piattaforme social.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2021/02/10/64627-511522079_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1576400883215-7083980b6193?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 8,
    step: '08',
    title: 'Revisione e Distribuzione Strategica',
    tagline: 'Pubblichiamo i tuoi contenuti nelle fasce orarie a maggior rendimento.',
    description: 'Il tempismo è tutto. Analizziamo i dati storici e le abitudini del tuo pubblico per distribuire i contenuti esattamente quando la probabilità di engagement è al massimo.',
    sopDetails: [
      'Controllo qualità (QA) finale di tutti gli asset.',
      'Analisi predittiva degli orari di picco.',
      'Pianificazione e schedulazione multi-canale.',
      'Lancio sincronizzato per massimizzare l\'impatto.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2022/10/24/136236-764048479_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 9,
    step: '09',
    title: 'Boost Algoritmico e Gestione Community',
    tagline: 'Sfruttiamo i primi 30 minuti vitali per inviare segnali positivi e innescare la viralità.',
    description: 'Interveniamo attivamente nella finestra critica post-pubblicazione. Gestiamo i primi commenti e interazioni per segnalare all\'algoritmo la rilevanza del contenuto e spingerlo organicamente.',
    sopDetails: [
      'Monitoraggio attivo nei primi 30-60 minuti dal lancio.',
      'Risposta strategica a commenti per stimolare discussioni.',
      'Attivazione della rete di contatti per initial boost.',
      'Costruzione e moderazione continua della community.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2021/09/11/88219-604085449_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1080&auto=format&fit=crop'
  },
  {
    id: 10,
    step: '10',
    title: 'Analisi Dati, KPI e Ottimizzazione',
    tagline: 'Monitoriamo i numeri ogni settimana per scalare i tuoi profitti e ottimizzare le performance.',
    description: 'Ogni azione produce dati che trasformiamo in intuizioni strategiche. Analizziamo i risultati, perfezioniamo il tiro e ottimizziamo l\'intero processo per un miglioramento continuo (Kaizen).',
    sopDetails: [
      'Reportistica avanzata su metriche di conversione.',
      'A/B testing su angoli creativi e copy.',
      'Riunioni di allineamento strategico mensili/settimanali.',
      'Ottimizzazione iterativa per scalare il ROI.'
    ],
    videoUrl: 'https://cdn.pixabay.com/video/2020/03/11/33527-397985474_large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop'
  }
];
