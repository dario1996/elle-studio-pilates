import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenditeService, Vendita } from '../../../../shared/services/vendite.service';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrUniversaleService } from '../../../../shared/services/toastr-universale.service';

@Component({
  selector: 'app-modifica-pagamenti-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifica-pagamenti-overlay.component.html',
  styleUrls: ['./modifica-pagamenti-overlay.component.css']
})
export class ModificaPagamentiOverlayComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();
  
  venditesPending: Vendita[] = [];
  venditeSelezionate: Map<number, number> = new Map(); // Map<venditaId, importo>
  loading = false;
  error: string | null = null;

  constructor(
    private venditeService: VenditeService,
    private modaleService: ModaleService,
    private toastrUniversale: ToastrUniversaleService
  ) {}

  ngOnInit(): void {
    this.caricaVenditePending();
  }

  private caricaVenditePending(): void {
    this.loading = true;
    this.error = null;
    
    this.venditeService.getVenditePending().subscribe({
      next: (vendite) => {
        this.venditesPending = vendite;
        this.loading = false;
        console.log('Vendite pending caricate:', vendite);
      },
      error: (err) => {
        console.error('Errore nel caricamento vendite pending:', err);
        this.error = 'Errore nel caricamento delle vendite in attesa';
        this.loading = false;
        this.toastrUniversale.error('Errore nel caricamento delle vendite');
      }
    });
  }

  selezionaVendita(vendita: Vendita): void {
    if (this.venditeSelezionate.has(vendita.id!)) {
      // Deseleziona se già selezionata
      this.venditeSelezionate.delete(vendita.id!);
    } else {
      // Seleziona senza precompilare l'importo (campo vuoto)
      this.venditeSelezionate.set(vendita.id!, 0);
    }
  }

  isVenditaSelezionata(vendita: Vendita): boolean {
    return this.venditeSelezionate.has(vendita.id!);
  }

  getImportoVendita(venditaId: number): number | null {
    const importo = this.venditeSelezionate.get(venditaId);
    return (importo === 0) ? null : importo!;
  }

  aggiornaImporto(venditaId: number, importo: number): void {
    if (this.venditeSelezionate.has(venditaId)) {
      this.venditeSelezionate.set(venditaId, importo);
    }
  }

  // Metodo chiamato dal pulsante Conferma del modale
  onSubmit(): void {
    this.confermaPagamento();
  }

  confermaPagamento(): void {
    if (this.venditeSelezionate.size === 0) {
      this.toastrUniversale.warning('Seleziona almeno una vendita da confermare');
      return;
    }

    // Valida che tutti gli importi siano validi
    for (const [id, importo] of this.venditeSelezionate.entries()) {
      if (!importo || importo <= 0) {
        this.toastrUniversale.warning('Tutti gli importi devono essere maggiori di zero');
        return;
      }
    }

    this.loading = true;
    const conferme: Promise<any>[] = [];

    // Crea un array di promesse per confermare tutti i pagamenti
    this.venditeSelezionate.forEach((importo, venditaId) => {
      const promise = this.venditeService.confermaPagamento(venditaId, importo).toPromise();
      conferme.push(promise);
    });

    // Esegui tutte le conferme in parallelo
    Promise.all(conferme)
      .then((risultati) => {
        console.log('Pagamenti confermati:', risultati);
        this.loading = false;
        // Emetti l'evento conferma con i risultati - il toastr sarà gestito dal componente padre
        this.conferma.emit(risultati);
      })
      .catch((err) => {
        console.error('Errore nella conferma dei pagamenti:', err);
        this.toastrUniversale.error('Errore nella conferma di uno o più pagamenti');
        this.loading = false;
      });
  }

  annulla(): void {
    this.modaleService.chiudi();
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatTime(time: string): string {
    if (!time) return '';
    // time è in formato HH:mm:ss, prendiamo solo HH:mm
    return time.substring(0, 5);
  }

  getNomeCompleto(vendita: Vendita): string {
    if (vendita.utente?.nome && vendita.utente?.cognome) {
      return `${vendita.utente.nome} ${vendita.utente.cognome}`;
    }
    return vendita.utente?.username || 'Utente sconosciuto';
  }

  getNomePacchetto(vendita: Vendita): string {
    return vendita.pacchetto?.nome || `Pacchetto ${vendita.pacchettoId}`;
  }
}
