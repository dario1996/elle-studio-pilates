import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { LezioniService, LezioneDto } from '../../../../core/services/lezioni.service';
import { TIPI_LEZIONE_CONFIG } from '../../../../modules/agenda/models/lezione.model';

@Component({
  selector: 'app-area-personale',
  standalone: true,
  templateUrl: './area-personale.component.html',
  styleUrls: ['./area-personale.component.css'],
  imports: [CommonModule, PageTitleComponent, LoggedUserComponent, NotificationComponent, RouterModule],
})
export class AreaPersonaleComponent implements OnInit {

  title: string = 'Area Personale';
  icon: string = 'fa-solid fa-user';

  loading = false;
  error: string | null = null;

  
  constructor(
    private router: Router,
    private lezioniService: LezioniService

  ) {}
  

  ngOnInit(): void {
    
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