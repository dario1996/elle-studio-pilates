import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { DashboardService } from '../../../../shared/services/dashboard.service';
import { LezioniService, LezioneDto } from '../../../../core/services/lezioni.service';
import { TIPI_LEZIONE_CONFIG } from '../../../../modules/agenda/models/lezione.model';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css'],
  imports: [CommonModule, PageTitleComponent, LoggedUserComponent, NotificationComponent],
})
export class HomeDashboardComponent implements OnInit {

  title: string = 'Dashboard';
  icon: string = 'fa-solid fa-tachometer-alt';
  
  appuntamentiOggi: LezioneDto[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private lezioniService: LezioniService
  ) {}

  ngOnInit(): void {
    this.caricaAppuntamentiOggi();
  }

  private caricaAppuntamentiOggi(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getAppuntamentiOggi().subscribe({
      next: (appuntamenti) => {
        this.appuntamentiOggi = appuntamenti;
        this.loading = false;
        console.log('Appuntamenti di oggi caricati:', appuntamenti);
      },
      error: (err) => {
        console.error('Errore nel caricamento appuntamenti:', err);
        this.error = 'Errore nel caricamento degli appuntamenti';
        this.loading = false;
      }
    });
  }

  aggiungiLezione(): void {
    this.router.navigate(['/gestionale-elle-studio/agenda'], { queryParams: { openForm: 'true' } });
  }

  modificaLezione(id: number): void {
    this.router.navigate(['/gestionale-elle-studio/agenda'], { 
      queryParams: { 
        edit: id.toString()
      } 
    });
  }

  formatTime(dataInizio: string, dataFine: string): string {
    const inizio = new Date(dataInizio);
    const fine = new Date(dataFine);
    const dd = inizio.getDate().toString().padStart(2, '0');
    const mm = (inizio.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = inizio.getFullYear();
    const h1 = inizio.getHours().toString().padStart(2, '0');
    const min1 = inizio.getMinutes().toString().padStart(2, '0');
    const h2 = fine.getHours().toString().padStart(2, '0');
    const min2 = fine.getMinutes().toString().padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${h1}:${min1}-${h2}:${min2}`;
  }

  getLabelTipoLezione(tipo: string): string {
    return TIPI_LEZIONE_CONFIG[tipo as keyof typeof TIPI_LEZIONE_CONFIG]?.label || tipo;
  }
}