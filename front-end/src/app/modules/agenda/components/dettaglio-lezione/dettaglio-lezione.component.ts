import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModaleService } from '../../../../core/services/modal.service';
import { LezioniService } from '../../../../core/services/lezioni.service';
import { UserService } from '../../../../core/services/data/user.service';
import { ToastrService } from 'ngx-toastr';
import { ILezione, TipoLezione } from '../../../../shared/models/Lezione';
import { IUsers } from '../../../../shared/models/Users';
import { IModalButton } from '../../../../shared/models/ui/modal-config';
import { FormLezioneComponent } from '../form-lezione/form-lezione.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dettaglio-lezione',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dettaglio-lezione.component.html',
  styleUrl: './dettaglio-lezione.component.css'
})
export class DettaglioLezioneComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private modaleService = inject(ModaleService);
  private toastr = inject(ToastrService);
  private lezioniService = inject(LezioniService);
  private userService = inject(UserService);

  lezione?: ILezione;
  partecipantiDettagli: IUsers[] = [];
  isLoading = false;
  private partecipantiLoaded = false;

  tipiLezioneLabels = {
    [TipoLezione.PRIVATA]: 'Lezione Privata',
    [TipoLezione.PRIMA_LEZIONE]: 'Prima Lezione',
    [TipoLezione.SEMI_PRIVATA]: 'Semi-Privata',
    [TipoLezione.PILATES_MATWORK]: 'Matwork',
    [TipoLezione.YOGA]: 'Yoga'
  };

  istruttori = [
    { id: 1, nome: 'Laura', cognome: 'Caratti' },
  ];


  private setupModalSubscription() {
    this.modaleService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        if (config && config.dati) {
          this.lezione = config.dati as ILezione;
          this.partecipantiLoaded = false;
        }
      });
  }
  ngOnInit() {
    this.setupModalSubscription();
    // Carica i dettagli partecipanti solo una volta per apertura
    this.loadPartecipantiDettagli();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPartecipantiDettagli() {
    if (this.partecipantiLoaded) return;
    this.partecipantiLoaded = true;
    
    // Se partecipanti è già un array di oggetti con nome, usalo direttamente
    if (this.lezione?.partecipanti && this.lezione.partecipanti.length > 0) {
      // Controlla se il primo elemento è un oggetto con proprietà 'nome'
      if (typeof this.lezione.partecipanti[0] === 'object' && 'nome' in this.lezione.partecipanti[0]) {
        this.partecipantiDettagli = this.lezione.partecipanti as any[];
        return;
      }
      
      // Altrimenti sono username, caricali dal servizio
      this.userService.getUtentiByUsernames(this.lezione.partecipanti as string[]).subscribe({
        next: (utenti) => {
          this.partecipantiDettagli = utenti;
        },
        error: (error) => {
          console.error('Errore nel caricamento dettagli partecipanti:', error);
          this.partecipantiDettagli = [];
        }
      });
    } else {
      this.partecipantiDettagli = [];
    }
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
        action: () => this.onDelete()
      }
    ];
  }

  get istruttoreNome(): string {
    // Prima prova con istruttoreId se disponibile
    if (this.lezione?.istruttoreId) {
      const istruttore = this.istruttori.find(i => i.id === this.lezione?.istruttoreId);
      if (istruttore) {
        return `${istruttore.nome} ${istruttore.cognome}`;
      }
    }
    
    // Fallback: usa il campo istruttore (string) se disponibile
    if (this.lezione?.istruttore) {
      return this.lezione.istruttore;
    }
    
    return 'Non assegnato';
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

  get durataFormatted(): string {
    if (this.lezione?.durata) {
      return `${this.lezione.durata} minuti`;
    }
    
    // Calcolo fallback se la durata non è disponibile
    if (this.lezione?.dataInizio && this.lezione?.dataFine) {
      const inizio = new Date(this.lezione.dataInizio);
      const fine = new Date(this.lezione.dataFine);
      const durataMinuti = Math.round((fine.getTime() - inizio.getTime()) / (1000 * 60));
      return `${durataMinuti} minuti`;
    }
    
    return 'Non disponibile';
  }

  get tipoLezioneLabel(): string {
    return this.lezione?.tipo ? this.tipiLezioneLabels[this.lezione.tipo] : '';
  }

  get postiDisponibili(): number {
    const maxPartecipanti = this.lezione?.maxPartecipanti || 0;
    const partecipantiAttuali = this.lezione?.partecipanti?.length || 0;
    return maxPartecipanti - partecipantiAttuali;
  }

  get partecipantiIscritti(): number {
    return this.lezione?.partecipanti?.length || 0;
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
        partecipanti: this.lezione.partecipanti || [],
        istruttoreId: this.lezione.istruttoreId,
        // descrizione: this.lezione.descrizione,
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
    if (!this.lezione?.id) return;

    const confirmMessage = `Sei sicuro di voler eliminare la lezione "${this.lezione.titolo}"?`;
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      
      this.lezioniService.deleteLezione(this.lezione.id).subscribe({
        next: () => {
          this.toastr.success('Lezione eliminata con successo');
          this.modaleService.emitRefreshList();
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
    if (!this.lezione?.id) return;

    this.isLoading = true;
    
    this.lezioniService.toggleLezioneStatus(this.lezione.id).subscribe({
      next: () => {
        // Chiudi il modale subito
        this.modaleService.chiudi();
        this.toastr.success(
          `Lezione ${this.lezione?.attiva ? 'disattivata' : 'attivata'} con successo`
        );
        this.modaleService.emitRefreshList();
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
