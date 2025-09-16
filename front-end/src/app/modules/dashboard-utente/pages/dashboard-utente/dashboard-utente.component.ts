import { Component, OnInit } from '@angular/core';
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
  imports: [CommonModule, PageTitleComponent, LoggedUserComponent, NotificationComponent],
})
export class DashboardUtenteComponent implements OnInit {

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

  ngOnInit(): void {
    const username = this.authService.loggedUser();
    if (username) {
      this.lezioniService.getLezioniPrenotate(username).subscribe({
        next: (lezioni) => {
          // Ordina per dataInizio crescente
          this.lezioniPrenotate = lezioni.sort((a, b) => {
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
    const inizio = typeof dataInizio === 'string' ? new Date(dataInizio) : dataInizio;
    const fine = typeof dataFine === 'string' ? new Date(dataFine) : dataFine;
    return `${inizio.getHours().toString().padStart(2, '0')}:${inizio.getMinutes().toString().padStart(2, '0')}-${fine.getHours().toString().padStart(2, '0')}:${fine.getMinutes().toString().padStart(2, '0')}`;
  }

  getLabelTipoLezione(tipo: string): string {
    return TIPI_LEZIONE_CONFIG[tipo as keyof typeof TIPI_LEZIONE_CONFIG]?.label || tipo;
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