import { Component, OnInit } from '@angular/core';
import { AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { LezioniService, LezioneDto } from '../../../../core/services/lezioni.service';
import { TIPI_LEZIONE_CONFIG } from '../../../../modules/agenda/models/lezione.model';
import { ILezione, TipoLezione, StatoLezione } from '../../../../shared/models/Lezione';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { VenditeService, Vendita, PacchettoAcquistato } from '../../../../shared/services/vendite.service';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-utente',
  standalone: true,
  templateUrl: './dashboard-utente.component.html',
  styleUrls: ['./dashboard-utente.component.css'],
  imports: [
    CommonModule, 
    PageTitleComponent, 
    LoggedUserComponent, 
    // NotificationComponent
  ],
})
export class DashboardUtenteComponent implements OnInit, AfterViewInit {

  title: string = 'Dashboard';
  icon: string = 'fas fa-user';

  loading = false;
  error: string | null = null;

  lezioniPrenotate: ILezione[] = [];
  lezioneIndex: number = 0;
  lezioniPrenotabili: LezioneDto[] = [];
  pacchettiAcquistati: PacchettoAcquistato[] = [];
  
  // Statistiche dashboard
  totaleLezioniPrenotate: number = 0;
  lezioniCompletate: number = 0;
  prossimaLezione: ILezione | null = null;
  
  // Mini calendario (prossimi 7 giorni)
  giorniCalendario: { data: Date; lezioni: ILezione[] }[] = [];
  giornoSelezionato: Date | null = null;
  lezioniGiornoSelezionato: ILezione[] = [];
  visualizzaTutte: boolean = true; // Modificato: mostra tutte le lezioni di default

  // Configurazione immagini per tipi lezione (URL o icone)
  readonly LEZIONI_IMAGES: Record<string, { image: string; gradient: string; icon: string }> = {
    'PRIVATA': {
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      icon: 'fas fa-user'
    },
    'SEMI_PRIVATA': {
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      gradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
      icon: 'fas fa-user-friends'
    },
    'PILATES_MATWORK': {
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      gradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
      icon: 'fas fa-dumbbell'
    },
    'YOGA': {
      image: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      gradient: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
      icon: 'fas fa-spa'
    },
    'PRIMA_LEZIONE': {
      image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      gradient: 'linear-gradient(135deg, rgba(250, 112, 154, 0.1) 0%, rgba(254, 225, 64, 0.1) 100%)',
      icon: 'fas fa-star'
    }
  };

  constructor(
    private router: Router,
    private lezioniService: LezioniService,
    private authService: AuthJwtService,
    private venditeService: VenditeService,
    private dashboardService: DashboardService
  ) {}

  @ViewChildren('userCard', { read: ElementRef }) userCardEls!: QueryList<ElementRef>;

  ngOnInit(): void {
    const username = this.authService.loggedUser();
    if (username) {
      this.loading = true;
      
      // Carica tutti i dati in parallelo
      forkJoin({
        statistiche: this.dashboardService.getStatisticheUtente(),
        lezioniPrenotate: this.lezioniService.getLezioniPrenotate(username),
        pacchettiAcquistati: this.venditeService.getPacchettiAcquistatiByUtente(username)
      }).subscribe({
        next: (result) => {
          // Usa le statistiche dal backend
          this.totaleLezioniPrenotate = result.statistiche.totaleLezioniPrenotate;
          this.lezioniCompletate = result.statistiche.lezioniCompletate;
          
          // Imposta la prossima lezione
          if (result.statistiche.prossimaLezione) {
            const pl = result.statistiche.prossimaLezione;
            // Crea un oggetto ILezione dalla prossima lezione
            const dataInizio = new Date(pl.dataLezione + 'T' + pl.oraInizio);
            const dataFine = new Date(pl.dataLezione + 'T' + pl.oraFine);
            
            this.prossimaLezione = {
              id: 0,
              titolo: pl.tipoLezione, // Usa il tipo come titolo
              tipo: pl.tipoLezione, // Proprieta 'tipo' invece di 'tipoLezione'
              dataInizio: dataInizio, // Date invece di string
              dataFine: dataFine, // Date invece di string
              stato: pl.stato,
              istruttore: '',
              numeroPartecipanti: 0,
              maxPartecipanti: 0,
              attiva: true,
              partecipanti: [] // Aggiungi array vuoto per partecipanti
            } as ILezione;
          } else {
            this.prossimaLezione = null;
          }
          
          // Processa lezioni prenotate per la visualizzazione
          const oggi = new Date();
          oggi.setHours(0, 0, 0, 0);
          
          this.lezioniPrenotate = result.lezioniPrenotate
            .filter(lezione => {
              const dataLezione = new Date(lezione.dataInizio);
              dataLezione.setHours(0, 0, 0, 0);
              return dataLezione >= oggi;
            })
            .sort((a, b) => {
              const dateA = new Date(a.dataInizio).getTime();
              const dateB = new Date(b.dataInizio).getTime();
              return dateA - dateB;
            });
          
          this.lezioneIndex = 0;
          
          // Genera mini calendario
          this.generaMiniCalendario();
          
          // Pacchetti acquistati
          this.pacchettiAcquistati = result.pacchettiAcquistati.filter(p => p.lezioniRimaste > 0);
          
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Errore nel caricamento dei dati';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.error = 'Utente non autenticato';
    }
  }

  ngAfterViewInit(): void {
    // initial equalization after view init
    setTimeout(() => this.equalizeCardHeights(), 50);
  }

  @HostListener('window:resize')
  onResize() {
    // recompute heights on resize
    this.equalizeCardHeights();
  }

  private equalizeCardHeights(): void {
    if (!this.userCardEls || this.userCardEls.length === 0) return;
    // reset min-heights
    this.userCardEls.forEach(el => (el.nativeElement.style.minHeight = '0px'));
    // find max height
    let max = 0;
    this.userCardEls.forEach(el => {
      const h = el.nativeElement.getBoundingClientRect().height;
      if (h > max) max = h;
    });
    // apply max height to all
    this.userCardEls.forEach(el => (el.nativeElement.style.minHeight = `${max}px`));
  }



  // Restituisce n lezioni random dalla lista (o tutte se meno di n)
  getRandomLezioni(lista: ILezione[], n: number): ILezione[] {
    if (lista.length <= n) return [...lista];
    const shuffled = lista.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }



  /** Restituisce la coppia di lezioni da visualizzare nella card (2 a 2) */
  get lezioniCorrenti(): ILezione[] {
    if (this.lezioniPrenotate.length === 0) return [];
    return this.lezioniPrenotate.slice(this.lezioneIndex, this.lezioneIndex + 2);
  }

  nextLezione(): void {
    if (this.lezioniPrenotate.length > 0 && this.lezioneIndex < this.lezioniPrenotate.length - 2) {
      this.lezioneIndex += 2;
    }
  }

  prevLezione(): void {
    if (this.lezioniPrenotate.length > 0 && this.lezioneIndex > 0) {
      this.lezioneIndex -= 2;
      if (this.lezioneIndex < 0) this.lezioneIndex = 0;
    }
  }

  formatTime(dataInizio: string | Date, dataFine: string | Date): string {
    const inizio = typeof dataInizio === 'string' ? new Date(dataInizio) : dataInizio as Date;
    const fine = typeof dataFine === 'string' ? new Date(dataFine) : dataFine as Date;
    const dd = inizio.getDate().toString().padStart(2, '0');
    const mm = (inizio.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = inizio.getFullYear();
    const h1 = inizio.getHours().toString().padStart(2, '0');
    const min1 = inizio.getMinutes().toString().padStart(2, '0');
    const h2 = fine.getHours().toString().padStart(2, '0');
    const min2 = fine.getMinutes().toString().padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${h1}:${min1}-${h2}:${min2}`;
  }

  /** Restituisce solo la data in formato dd-MM-yyyy */
  formatDateOnly(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data as Date;
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  /** Restituisce solo l'intervallo orario HH:mm-HH:mm */
  formatTimeRange(dataInizio: string | Date, dataFine: string | Date): string {
    const inizio = typeof dataInizio === 'string' ? new Date(dataInizio) : dataInizio as Date;
    const fine = typeof dataFine === 'string' ? new Date(dataFine) : dataFine as Date;
    const h1 = inizio.getHours().toString().padStart(2, '0');
    const min1 = inizio.getMinutes().toString().padStart(2, '0');
    const h2 = fine.getHours().toString().padStart(2, '0');
    const min2 = fine.getMinutes().toString().padStart(2, '0');
    return `${h1}:${min1}-${h2}:${min2}`;
  }

  /** Formatta il giorno della settimana e la data completa */
  formatGiornoData(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data as Date;
    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const giornoSettimana = giorni[d.getDay()];
    const giorno = d.getDate();
    const mese = mesi[d.getMonth()];
    return `${giornoSettimana} ${giorno} ${mese}`;
  }

  /** Formatta solo l'ora nel formato HH:mm */
  formatOra(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data as Date;
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${min}`;
  }

  getLabelTipoLezione(tipo: string): string {
    return TIPI_LEZIONE_CONFIG[tipo as keyof typeof TIPI_LEZIONE_CONFIG]?.label || tipo;
  }

  // Calcola i giorni mancanti da oggi alla data della lezione
  getGiorniMancanti(dataLezione: string | Date): number {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const lezione = new Date(dataLezione);
    lezione.setHours(0, 0, 0, 0);
    const diffTime = lezione.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Restituisce un messaggio testuale sui giorni mancanti
  getGiorniMancantiText(dataLezione: string | Date): string {
    const giorni = this.getGiorniMancanti(dataLezione);
    if (giorni === 0) return 'Oggi';
    if (giorni === 1) return 'Domani';
    if (giorni === -1) return 'Ieri';
    if (giorni < 0) return `${Math.abs(giorni)} giorni fa`;
    return `Tra ${giorni} giorni`;
  }

  // Restituisce la classe CSS per il badge dei giorni in base alla vicinanza
  getGiorniBadgeClass(dataLezione: string | Date): string {
    const giorni = this.getGiorniMancanti(dataLezione);
    if (giorni === 0) return 'badge-oggi';
    if (giorni === 1) return 'badge-domani';
    if (giorni >= 2 && giorni <= 7) return 'badge-settimana';
    if (giorni < 0) return 'badge-passato';
    return 'badge-futuro';
  }

  // Popup suggerimento
  openSuggerimentoPopup(lezione: ILezione): void {
    alert('Dettagli lezione:\n\n' +
      'Titolo: ' + lezione.titolo + '\n' +
      'Tipo: ' + this.getLabelTipoLezione(lezione.tipo) + '\n' +
      'Orario: ' + this.formatTime(lezione.dataInizio, lezione.dataFine) + '\n' +
      'Istruttore: ' + lezione.istruttore);
  }

  prenotaSuggerita(lezione: ILezione): void {
    // Placeholder per azione futura
    alert('Prenotazione per la lezione: ' + lezione.titolo);
  }

  /** Indice finale della coppia di lezioni visualizzate (per la paginazione) */
  getLezioneIndexEnd(): number {
    return Math.min(this.lezioneIndex + 2, this.lezioniPrenotate.length);
  }

  /** Genera il mini calendario con i prossimi 7 giorni */
  generaMiniCalendario(): void {
    this.giorniCalendario = [];
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const data = new Date(oggi);
      data.setDate(data.getDate() + i);
      
      const lezioniDelGiorno = this.lezioniPrenotate.filter(lezione => {
        const dataLezione = new Date(lezione.dataInizio);
        dataLezione.setHours(0, 0, 0, 0);
        return dataLezione.getTime() === data.getTime();
      });
      
      this.giorniCalendario.push({ data, lezioni: lezioniDelGiorno });
    }
  }

  /** Ottiene l'immagine/gradient per un tipo lezione */
  getLezioneImage(tipo: string): string {
    return this.LEZIONI_IMAGES[tipo]?.image || this.LEZIONI_IMAGES['PRIVATA'].image;
  }

  /** Ottiene il gradient di sfondo per un tipo lezione */
  getLezioneGradient(tipo: string): string {
    return this.LEZIONI_IMAGES[tipo]?.gradient || this.LEZIONI_IMAGES['PRIVATA'].gradient;
  }

  /** Ottiene l'icona per un tipo lezione */
  getLezioneIcon(tipo: string): string {
    return this.LEZIONI_IMAGES[tipo]?.icon || 'fas fa-calendar';
  }

  /** Calcola la percentuale di utilizzo del pacchetto */
  getProgressPercentage(pacchetto: PacchettoAcquistato): number {
    if (pacchetto.lezioniTotali === 0) return 0;
    return Math.round(((pacchetto.lezioniTotali - pacchetto.lezioniRimaste) / pacchetto.lezioniTotali) * 100);
  }

  /** Restituisce il nome abbreviato del giorno */
  getNomeGiorno(data: Date): string {
    const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return giorni[data.getDay()];
  }

  /** Controlla se una data è oggi */
  isOggi(data: Date): boolean {
    const oggi = new Date();
    return data.getDate() === oggi.getDate() &&
           data.getMonth() === oggi.getMonth() &&
           data.getFullYear() === oggi.getFullYear();
  }

  /** Seleziona un giorno nel calendario per visualizzare le lezioni */
  selezionaGiorno(data: Date): void {
    // Se clicco sullo stesso giorno già selezionato, torno a visualizzare tutte
    if (this.isGiornoSelezionato(data)) {
      this.mostraLeTutteLezioni();
      return;
    }
    
    this.visualizzaTutte = false; // Disattiva la visualizzazione "tutte"
    this.giornoSelezionato = data;
    
    // Filtra le lezioni per il giorno selezionato
    this.lezioniGiornoSelezionato = this.lezioniPrenotate.filter(lezione => {
      const dataLezione = new Date(lezione.dataInizio);
      dataLezione.setHours(0, 0, 0, 0);
      const dataSelezionata = new Date(data);
      dataSelezionata.setHours(0, 0, 0, 0);
      return dataLezione.getTime() === dataSelezionata.getTime();
    });
  }

  /** Verifica se un giorno è selezionato */
  isGiornoSelezionato(data: Date): boolean {
    if (!this.giornoSelezionato) return false;
    return data.getDate() === this.giornoSelezionato.getDate() &&
           data.getMonth() === this.giornoSelezionato.getMonth() &&
           data.getFullYear() === this.giornoSelezionato.getFullYear();
  }

  /** Mostra tutte le lezioni in ordine cronologico */
  mostraLeTutteLezioni(): void {
    this.visualizzaTutte = true;
    this.giornoSelezionato = null;
  }

  /** Reset della visualizzazione */
  resetVisualizzazione(): void {
    this.visualizzaTutte = false;
    this.giornoSelezionato = null;
    this.lezioniGiornoSelezionato = [];
  }

  /** Ottiene le lezioni da visualizzare nella card principale */
  getLezioniDaVisualizzare(): ILezione[] {
    if (this.visualizzaTutte) {
      return this.lezioniPrenotate; // Già ordinate per data
    }
    if (this.giornoSelezionato) {
      return this.lezioniGiornoSelezionato;
    }
    return [];
  }

  /** Ottiene il titolo della card in base alla modalità */
  getTitoloCard(): string {
    if (this.visualizzaTutte) {
      return 'Tutte le Tue Lezioni';
    }
    if (this.giornoSelezionato) {
      return 'Lezioni del ' + this.formatDateOnly(this.giornoSelezionato);
    }
    return 'Le Tue Lezioni';
  }

  /** Formatta giorno della settimana in italiano */
  formatGiornoSettimana(data: Date | string): string {
    const d = typeof data === 'string' ? new Date(data) : data;
    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return giorni[d.getDay()];
  }

  /** Naviga alla pagina prenotazioni */
  vaiAPrenotazioni(): void {
    this.router.navigate(['/prenotazioni']);
  }

  /** Naviga alla pagina pacchetti */
  vaiAPacchetti(): void {
    this.router.navigate(['/gestione-pacchetti']);
  }
}