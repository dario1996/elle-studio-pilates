import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModaleService } from '../../../../core/services/modal.service';
import { LezioniService } from '../../services/lezioni.service';
import { ToastrService } from 'ngx-toastr';
import { ILezione, TipoLezione } from '../../models/lezione.model';
import { IModalButton } from '../../../../shared/models/ui/modal-config';
import { FormLezioneComponent } from '../form-lezione/form-lezione.component';

@Component({
  selector: 'app-dettaglio-lezione',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dettaglio-lezione.component.html',
  styleUrl: './dettaglio-lezione.component.css'
})
export class DettaglioLezioneComponent implements OnInit {
  private modaleService = inject(ModaleService);
  private toastr = inject(ToastrService);
  private lezioniService = inject(LezioniService);

  lezione?: ILezione;
  isLoading = false;

  tipiLezioneLabels = {
    [TipoLezione.PRIVATA]: 'Lezione Privata',
    [TipoLezione.PRIMA_LEZIONE]: 'Prima Lezione',
    [TipoLezione.SEMI_PRIVATA_DUETTO]: 'Semi-Privata Duetto',
    [TipoLezione.SEMI_PRIVATA_GRUPPO]: 'Semi-Privata Gruppo',
    [TipoLezione.MATWORK]: 'Matwork',
    [TipoLezione.YOGA]: 'Yoga'
  };

  istruttori = [
    { id: 1, nome: 'Eleonora', cognome: 'Bianchi' },
    { id: 2, nome: 'Marco', cognome: 'Rossi' },
    { id: 3, nome: 'Sofia', cognome: 'Verdi' }
  ];

  ngOnInit() {
    this.setupModalSubscription();
  }

  private setupModalSubscription() {
    this.modaleService.config$.subscribe(config => {
      if (config && config.dati) {
        this.lezione = config.dati as ILezione;
      }
    });
  }

  getCustomButtons(): IModalButton[] {
    if (!this.lezione) return [];

    return [
      {
        text: 'Chiudi',
        cssClass: 'btn-secondary',
        action: () => this.onClose()
      },
      {
        text: this.lezione.attiva ? 'Disattiva' : 'Attiva',
        cssClass: 'btn-warning',
        action: () => this.onToggleStatus(),
        loading: this.isLoading
      },
      {
        text: 'Modifica',
        cssClass: 'btn-primary',
        action: () => this.onEdit()
      },
      {
        text: 'Elimina',
        cssClass: 'btn-danger',
        action: () => this.onDelete(),
        disabled: !this.canCancel
      }
    ];
  }

  get istruttoreNome(): string {
    if (!this.lezione?.istruttoreId) return 'Non assegnato';
    const istruttore = this.istruttori.find(i => i.id === this.lezione?.istruttoreId);
    return istruttore ? `${istruttore.nome} ${istruttore.cognome}` : 'Sconosciuto';
  }

  get dataOraFormatted(): string {
    if (!this.lezione?.dataInizio) return '';
    const data = new Date(this.lezione.dataInizio);
    return data.toLocaleString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get dataFineFormatted(): string {
    if (!this.lezione?.dataFine) return '';
    const data = new Date(this.lezione.dataFine);
    return data.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get tipoLezioneLabel(): string {
    return this.lezione?.tipo ? this.tipiLezioneLabels[this.lezione.tipo] : '';
  }

  get postiDisponibili(): number {
    return (this.lezione?.maxPartecipanti || 0) - (this.lezione?.partecipantiIscritti || 0);
  }

  get isCompleta(): boolean {
    return this.postiDisponibili <= 0;
  }

  get canCancel(): boolean {
    if (!this.lezione?.dataInizio) return false;
    const now = new Date();
    const lezioneStart = new Date(this.lezione.dataInizio);
    const hoursUntilLesson = (lezioneStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilLesson > 24; // Cancellazione entro 24 ore
  }

  onEdit() {
    if (this.lezione) {
      // Clona l'oggetto per evitare problemi con getter/setter
      const lezioneCloned = {
        id: this.lezione.id,
        titolo: this.lezione.titolo,
        dataInizio: this.lezione.dataInizio,
        dataFine: this.lezione.dataFine,
        tipo: this.lezione.tipo,
        durata: this.lezione.durata,
        maxPartecipanti: this.lezione.maxPartecipanti,
        partecipantiIscritti: this.lezione.partecipantiIscritti,
        istruttoreId: this.lezione.istruttoreId,
        descrizione: this.lezione.descrizione,
        prezzo: this.lezione.prezzo,
        note: this.lezione.note,
        attiva: this.lezione.attiva
      };
      
      this.modaleService.apri({
        titolo: 'Modifica Lezione',
        componente: FormLezioneComponent,
        dati: lezioneCloned,
      });
    }
  }

  onDelete() {
    if (!this.lezione) return;

    const confirmMessage = `Sei sicuro di voler eliminare la lezione "${this.lezione.titolo}"?`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      
      this.lezioniService.deleteLezione(this.lezione.id).subscribe({
        next: () => {
          this.toastr.success('Lezione eliminata con successo');
          this.modaleService.chiudi();
        },
        error: (error) => {
          console.error('Errore nell\'eliminazione della lezione:', error);
          this.toastr.error('Errore nell\'eliminazione della lezione');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onToggleStatus() {
    if (!this.lezione) return;

    this.isLoading = true;
    
    const updatedLezione = {
      ...this.lezione,
      attiva: !this.lezione.attiva
    };

    this.lezioniService.updateLezione(this.lezione.id, updatedLezione).subscribe({
      next: (lezioneAggiornata) => {
        this.lezione = lezioneAggiornata;
        this.toastr.success(
          `Lezione ${this.lezione.attiva ? 'attivata' : 'disattivata'} con successo`
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore nell\'aggiornamento dello stato:', error);
        this.toastr.error('Errore nell\'aggiornamento dello stato');
        this.isLoading = false;
      }
    });
  }

  onClose() {
    this.modaleService.chiudi();
  }
}
