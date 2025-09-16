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
  selector: 'app-area-personale',
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
  lezioniPrenotabili: LezioneDto[] = [];
  pagamentiPendenti: { titolo: string; importo: number }[] = [];

  constructor(
    private router: Router,
    private lezioniService: LezioniService,
    private authService: AuthJwtService,
    private lezioniServ: LezioniService
  ) {}

  ngOnInit(): void {

    const username = this.authService.loggedUser(); // recupera username utente loggato
    if (username) {
      this.lezioniService.getLezioniPrenotate(username).subscribe({
        next: (lezioni) => {
          this.lezioniPrenotate = lezioni;
        },
        error: (err) => {
          this.error = 'Errore nel caricamento delle lezioni prenotate';
        }
      });
    } else {
      this.error = 'Utente non autenticato';
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
}