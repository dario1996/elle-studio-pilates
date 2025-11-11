import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { UserService } from '../../../../core/services/data/user.service';
import { ModaleService } from '../../../../core/services/modal.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dettaglio-utenti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dettaglio-utenti.component.html',
  styleUrl: './dettaglio-utenti.component.css'
})
export class DettaglioUtentiComponent implements OnInit {
  dati: IUsers | null = null;
  downloadingCertificate = false;

  private modaleService = inject(ModaleService);
  private http = inject(HttpClient);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.modaleService.config$.subscribe(config => {
      this.dati = config?.dati;
      console.log('Dati utente caricati:', this.dati);
    });
  }

  // Verifica se il certificato è presente (controlla solo certificato_medico_file)
  hasCertificate(): boolean {
    if (!this.dati) return false;
    
    // Controlla il campo BLOB certificato_medico_file
    const certFile = (this.dati as any).certificato_medico_file || (this.dati as any).certificatoMedicoFile;
    
    // Se il campo esiste e non è null/undefined/vuoto, il certificato è presente
    return certFile !== null && 
           certFile !== undefined && 
           certFile !== '';
  }

  // Ottiene la data di upload del certificato
  getCertificateDate(): string {
    if (!this.dati) return '–';
    
    const dataUpload = (this.dati as any).certificato_medico_data_upload || 
                       (this.dati as any).certificatoMedicoDataUpload;
    
    if (!dataUpload) return '–';
    
    // Formatta la data se è una stringa o oggetto Date
    try {
      const date = new Date(dataUpload);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(dataUpload);
    }
  }

  downloadCertificate() {
    if (!this.dati?.id) {
      console.error('ID utente non disponibile');
      return;
    }

    this.downloadingCertificate = true;
    
    this.http.get(`http://localhost:8080/api/upload/certificato-medico/${this.dati.id}`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.downloadingCertificate = false;
        const blob = response.body;
        if (!blob) {
          console.error('Nessun file trovato');
          return;
        }

        // Estrai il nome del file dall'header Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `certificato_${this.dati?.cognome || ''}_${this.dati?.nome || ''}.pdf`.replace(/\s+/g, '_');
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        // Crea un link temporaneo per il download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Certificato scaricato con successo');
      },
      error: (error) => {
        console.error('Errore download certificato:', error);
        this.downloadingCertificate = false;
        
        if (error.status === 404) {
          alert('Certificato medico non trovato');
        } else {
          alert('Errore durante il download del certificato');
        }
      }
    });
  }

  display(value: any): string {
    if (value === null || value === undefined || value === '') return '–';
    return String(value);
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
