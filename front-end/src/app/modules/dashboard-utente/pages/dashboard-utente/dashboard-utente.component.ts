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
  pagamentiPendenti: { titolo: string; importo: number }[] = [];
  lezioniSuggerite: ILezione[] = [];

  constructor(
    private router: Router,
    private lezioniService: LezioniService,
    private authService: AuthJwtService
  ) {}

  @ViewChildren('userCard', { read: ElementRef }) userCardEls!: QueryList<ElementRef>;

  ngOnInit(): void {
    const username = this.authService.loggedUser();
    if (username) {
      this.lezioniService.getLezioniPrenotate(username).subscribe({
        next: (lezioni) => {
          // Ordina per dataInizio crescente e filtra solo le lezioni future o di oggi
          const oggi = new Date();
          oggi.setHours(0, 0, 0, 0);
          
          this.lezioniPrenotate = lezioni
            .filter(lezione => {
              const dataLezione = new Date(lezione.dataInizio);
              dataLezione.setHours(0, 0, 0, 0);
              return dataLezione >= oggi; // Mostra solo lezioni di oggi o future
            })
            .sort((a, b) => {
              const dateA = new Date(a.dataInizio).getTime();
              const dateB = new Date(b.dataInizio).getTime();
              return dateA - dateB;
            });
          this.lezioneIndex = 0;

          // SUGGERIMENTI: prendi lezioni già frequentate, scegli 3 random (se disponibili)
          const lezioniUniche = this.lezioniPrenotate.filter((lez, idx, arr) =>
            arr.findIndex(l => l.titolo === lez.titolo && l.tipo === lez.tipo) === idx
          );
          this.lezioniSuggerite = this.getRandomLezioni(lezioniUniche, 3);
        },
        error: (err) => {
          this.error = 'Errore nel caricamento delle lezioni prenotate';
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
}