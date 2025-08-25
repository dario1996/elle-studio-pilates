import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { UserService } from '../../../../core/services/data/user.service';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-dettaglio-utenti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dettaglio-utenti.component.html',
  styleUrl: './dettaglio-utenti.component.css'
})
export class DettaglioUtentiComponent implements OnInit {
  dati: IUsers | null = null;

  private modaleService = inject(ModaleService);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.modaleService.config$.subscribe(config => {
      this.dati = config?.dati;
    });
  }

  downloadCertificato(): void {
    if (this.dati?.username) {
      this.userService.downloadCertificatoMedico(this.dati.username).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificato_${this.dati?.username || 'utente'}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Errore nel download del certificato:', error);
          // Qui potresti aggiungere una notifica di errore
        }
      });
    }
  }

  getRuoliDisplay(): string {
    if (!this.dati?.ruoli || this.dati.ruoli.length === 0) {
      return 'Nessun ruolo assegnato';
    }
    return this.dati.ruoli.join(', ');
  }

  getStatoBadgeClass(): string {
    return this.dati?.attivo === 'Si' ? 'badge bg-success' : 'badge bg-danger';
  }

  getStatoText(): string {
    return this.dati?.attivo === 'Si' ? 'Attivo' : 'Non attivo';
  }
}
