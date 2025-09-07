import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { LezioniService, LezioneDto } from '../../../../core/services/lezioni.service';
import { TIPI_LEZIONE_CONFIG } from '../../../../modules/agenda/models/lezione.model';
import { ILezione, TipoLezione, StatoLezione } from '../../../../shared/models/Lezione';

@Component({
  selector: 'app-area-personale',
  standalone: true,
  templateUrl: './area-personale.component.html',
  styleUrls: ['./area-personale.component.css'],
  imports: [CommonModule, PageTitleComponent, LoggedUserComponent, NotificationComponent],
})
export class AreaPersonaleComponent implements OnInit {

  title: string = 'Area Personale';
  icon: string = 'fas fa-user';

  loading = false;
  error: string | null = null;

  lezioniPrenotate: LezioneDto[] = [];
  lezioniPrenotabili: LezioneDto[] = [];
  pagamentiPendenti: { titolo: string; importo: number }[] = [];

  constructor(
    private router: Router,
    private lezioniService: LezioniService
  ) {}

  ngOnInit(): void {
    // Mock dati per la bozza
    this.lezioniPrenotate = [
      {
        titolo: 'Yoga Relax',
        tipoLezione: TipoLezione.YOGA,
        dataInizio: '2025-09-09T18:00:00',
        dataFine: '2025-09-09T19:00:00',
        istruttore: 'Laura Caratti',
      }
    ];
    this.lezioniPrenotabili = [
      {
        titolo: 'Matwork Group',
        tipoLezione: TipoLezione.MATWORK,
        dataInizio: '2025-09-10T08:00:00',
        dataFine: '2025-09-10T09:00:00',
        istruttore: 'Laura Caratti',
      }
    ];
    this.pagamentiPendenti = [
      {
        titolo: 'Corso Pilates Mensile',
        importo: 49.99
      }
    ];
  }

  formatTime(dataInizio: string, dataFine: string): string {
    const inizio = new Date(dataInizio);
    const fine = new Date(dataFine);
    return `${inizio.getHours().toString().padStart(2, '0')}:${inizio.getMinutes().toString().padStart(2, '0')}-${fine.getHours().toString().padStart(2, '0')}:${fine.getMinutes().toString().padStart(2, '0')}`;
  }

  getLabelTipoLezione(tipo: string): string {
    return TIPI_LEZIONE_CONFIG[tipo as keyof typeof TIPI_LEZIONE_CONFIG]?.label || tipo;
  }
}