import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';
import { 
  ComboWizardState, 
  CategoriaSelection, 
  ComboPreviewItem,
  PrenotazioneComboRequest,
  CategoriaSelectionDTO
} from '../../../../shared/models/combo-wizard.model';
import { TipoLezione, Pacchetto } from '../../../../shared/models/prenotazione.model';
import { PrenotazioneService } from '../../../../shared/services/prenotazione.service';
import { ToastrUniversaleService } from '../../../../shared/services/toastr-universale.service';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-prenotazione-combo-wizard',
  templateUrl: './prenotazione-combo-wizard.component.html',
  styleUrls: ['./prenotazione-combo-wizard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PrenotazioneComboWizardComponent implements OnInit {
  @Input() pacchetto!: Pacchetto;
  @Input() venditaId!: number;
  @Output() confermaCompleta = new EventEmitter<void>();

  wizardState: ComboWizardState | null = null;
  
  // Templates disponibili per la categoria corrente
  templatesPerGiorno: Map<string, TipoLezione[]> = new Map();
  giorniConOrari: string[] = [];
  accordionAperto: string | null = null;
  
  // Selezione corrente nello step
  categoriaCorrente: string = '';
  templateSelezionato: TipoLezione | null = null;
  numeroLezioniSelezionate: number = 0;
  
  // Preview finale
  previewItems: ComboPreviewItem[] = [];
  
  loading = false;
  confermaInCorso = false;

  private prenotazioneService = inject(PrenotazioneService);
  private toastr = inject(ToastrUniversaleService);
  private modaleService = inject(ModaleService);

  constructor() {}

  ngOnInit(): void {
    // Ascolta i dati dal modale solo una volta
    this.modaleService.config$.pipe(take(1)).subscribe(config => {
      if (config?.dati) {
        this.pacchetto = config.dati.pacchetto;
        this.venditaId = config.dati.venditaId;
        if (this.pacchetto && this.venditaId) {
          this.inizializzaWizard();
        }
      }
    });
  }

  inizializzaWizard(): void {
    try {
      // Parse categorieLezioni (può essere stringa JSON o array)
      let categorie: string[] = [];
      
      if (typeof this.pacchetto.categorieLezioni === 'string') {
        categorie = JSON.parse(this.pacchetto.categorieLezioni);
      } else if (Array.isArray(this.pacchetto.categorieLezioni)) {
        categorie = this.pacchetto.categorieLezioni;
      }

      if (categorie.length === 0) {
        this.toastr.error('Pacchetto COMBO non configurato correttamente');
        this.modaleService.chiudi();
        return;
      }

      // Parse distribuzioneLezioni se presente
      let distribuzione: { [categoria: string]: number } = {};
      if (this.pacchetto.distribuzioneLezioni) {
        if (typeof this.pacchetto.distribuzioneLezioni === 'string') {
          distribuzione = JSON.parse(this.pacchetto.distribuzioneLezioni);
        } else {
          distribuzione = this.pacchetto.distribuzioneLezioni;
        }
      }

      this.wizardState = {
        venditaId: this.venditaId,
        pacchetto: {
          nome: this.pacchetto.nome,
          categoria: this.pacchetto.categoria,
          lezioniRimanenti: this.pacchetto.lezioniRimanenti || 0
        },
        categorieDisponibili: categorie,
        selezioni: new Map(),
        stepCorrente: 0,
        completato: false
      };

      // Calcola distribuzione iniziale
      if (Object.keys(distribuzione).length > 0) {
        // Usa distribuzione predefinita dal pacchetto
        this.calcolaDistribuzioneConPredefinita(distribuzione);
      } else {
        // Fallback: distribuzione proporzionale
        this.calcolaDistribuzioneProporzionale();
      }
      
      // Carica templates per la prima categoria
      this.categoriaCorrente = categorie[0];
      
      // Inizializza numeroLezioniSelezionate dal valore predefinito della prima categoria
      const selezioneIniziale = this.wizardState.selezioni.get(this.categoriaCorrente);
      this.numeroLezioniSelezionate = selezioneIniziale ? selezioneIniziale.numeroLezioni : 0;
      
      this.caricaTemplatesPerCategoria(this.categoriaCorrente);
      
    } catch (error) {
      console.error('Errore inizializzazione wizard:', error);
      this.toastr.error('Errore durante l\'inizializzazione del wizard');
      this.modaleService.chiudi();
    }
  }

  calcolaDistribuzioneConPredefinita(distribuzione: { [categoria: string]: number }): void {
    if (!this.wizardState) return;
    
    this.wizardState.categorieDisponibili.forEach(categoria => {
      const numeroLezioniPredefinito = distribuzione[categoria] || 0;
      const selezione: CategoriaSelection = {
        categoria: categoria,
        templateSelezionato: null,
        numeroLezioni: numeroLezioniPredefinito,
        numeroLezioniPredefinito: numeroLezioniPredefinito,
        dateGenerate: []
      };
      this.wizardState!.selezioni.set(categoria, selezione);
    });
  }

  calcolaDistribuzioneProporzionale(): void {
    if (!this.wizardState) return;
    
    const totaleLezioni = this.wizardState.pacchetto.lezioniRimanenti;
    const numeroCategorie = this.wizardState.categorieDisponibili.length;
    const lezioniPerCategoria = Math.floor(totaleLezioni / numeroCategorie);
    const resto = totaleLezioni % numeroCategorie;

    this.wizardState.categorieDisponibili.forEach((categoria, index) => {
      const numeroLezioniCalcolato = lezioniPerCategoria + (index < resto ? 1 : 0);
      const selezione: CategoriaSelection = {
        categoria: categoria,
        templateSelezionato: null,
        numeroLezioni: numeroLezioniCalcolato,
        numeroLezioniPredefinito: numeroLezioniCalcolato,
        dateGenerate: []
      };
      this.wizardState!.selezioni.set(categoria, selezione);
    });
  }

  caricaTemplatesPerCategoria(categoria: string): void {
    this.loading = true;
    this.prenotazioneService.getTemplatesPerTipoLezione(categoria).subscribe({
      next: (templates) => {
        this.raggruppaPergiornoSettimana(templates);
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore caricamento templates:', error);
        this.toastr.error('Errore durante il caricamento degli orari disponibili');
        this.loading = false;
      }
    });
  }

  raggruppaPergiornoSettimana(templates: TipoLezione[]): void {
    this.templatesPerGiorno = new Map();
    this.giorniConOrari = [];
    
    const giorniOrdinati = ['LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO', 'DOMENICA'];
    
    templates.forEach(template => {
      const giorno = template.giornoSettimana;
      if (!this.templatesPerGiorno.has(giorno)) {
        this.templatesPerGiorno.set(giorno, []);
      }
      this.templatesPerGiorno.get(giorno)!.push(template);
    });

    this.giorniConOrari = giorniOrdinati.filter(g => this.templatesPerGiorno.has(g));
  }

  toggleAccordion(giorno: string): void {
    this.accordionAperto = this.accordionAperto === giorno ? null : giorno;
  }

  selezionaTemplate(template: TipoLezione): void {
    this.templateSelezionato = template;
    
    if (this.wizardState) {
      const selezione = this.wizardState.selezioni.get(this.categoriaCorrente);
      if (selezione) {
        selezione.templateSelezionato = template;
        selezione.numeroLezioni = selezione.numeroLezioni;
        
        // Genera preview date per questo template
        this.generaPreviewDate(template.giornoSettimana, selezione.numeroLezioni);
      }
    }
  }

  generaPreviewDate(giornoSettimana: string, numeroLezioni: number): void {
    if (!this.wizardState) return;
    
    const giorniMap: {[key: string]: number} = {
      'LUNEDI': 1, 'MARTEDI': 2, 'MERCOLEDI': 3, 'GIOVEDI': 4,
      'VENERDI': 5, 'SABATO': 6, 'DOMENICA': 0
    };
    
    const targetDay = giorniMap[giornoSettimana.toUpperCase()];
    const oggi = new Date();
    
    let primaData = new Date(oggi);
    while (primaData.getDay() !== targetDay) {
      primaData.setDate(primaData.getDate() + 1);
    }
    
    if (primaData.toDateString() === oggi.toDateString()) {
      primaData.setDate(primaData.getDate() + 7);
    }
    
    const date: string[] = [];
    for (let i = 0; i < numeroLezioni; i++) {
      const data = new Date(primaData);
      data.setDate(data.getDate() + (i * 7));
      date.push(data.toISOString().split('T')[0]);
    }
    
    const selezione = this.wizardState.selezioni.get(this.categoriaCorrente);
    if (selezione) {
      selezione.dateGenerate = date;
    }
  }

  onNumeroLezioniChange(): void {
    if (!this.wizardState || !this.templateSelezionato) return;
    
    const selezione = this.wizardState.selezioni.get(this.categoriaCorrente);
    if (selezione) {
      selezione.numeroLezioni = this.numeroLezioniSelezionate;
      this.generaPreviewDate(this.templateSelezionato.giornoSettimana, this.numeroLezioniSelezionate);
    }
  }

  getTotaleLezioniSelezionate(): number {
    if (!this.wizardState) return 0;
    let totale = 0;
    this.wizardState.selezioni.forEach(s => totale += s.numeroLezioni);
    return totale;
  }

  puoAvanzare(): boolean {
    if (!this.wizardState) return false;
    const selezione = this.wizardState.selezioni.get(this.categoriaCorrente);
    return !!selezione && selezione.templateSelezionato !== null && selezione.numeroLezioni > 0;
  }

  avanti(): void {
    if (!this.wizardState || !this.puoAvanzare()) return;
    
    const isUltimaCategoria = this.wizardState.stepCorrente === this.wizardState.categorieDisponibili.length - 1;
    
    if (isUltimaCategoria) {
      // Mostra preview finale
      this.generaPreviewFinale();
      this.wizardState.stepCorrente++;
    } else {
      // Passa alla categoria successiva
      this.wizardState.stepCorrente++;
      this.categoriaCorrente = this.wizardState.categorieDisponibili[this.wizardState.stepCorrente];
      this.templateSelezionato = null;
      
      // Inizializza numeroLezioniSelezionate dal valore predefinito della selezione
      const selezione = this.wizardState.selezioni.get(this.categoriaCorrente);
      this.numeroLezioniSelezionate = selezione ? selezione.numeroLezioni : 0;
      
      this.caricaTemplatesPerCategoria(this.categoriaCorrente);
    }
  }

  indietro(): void {
    if (!this.wizardState || this.wizardState.stepCorrente === 0) return;
    
    this.wizardState.stepCorrente--;
    
    if (this.wizardState.stepCorrente < this.wizardState.categorieDisponibili.length) {
      // Torna a una categoria precedente
      this.categoriaCorrente = this.wizardState.categorieDisponibili[this.wizardState.stepCorrente];
      const selezione = this.wizardState.selezioni.get(this.categoriaCorrente);
      
      if (selezione) {
        this.templateSelezionato = selezione.templateSelezionato;
        this.numeroLezioniSelezionate = selezione.numeroLezioni;
      }
      
      this.caricaTemplatesPerCategoria(this.categoriaCorrente);
    }
  }

  generaPreviewFinale(): void {
    if (!this.wizardState) return;
    
    this.previewItems = [];
    
    this.wizardState.selezioni.forEach((selezione) => {
      if (selezione.templateSelezionato) {
        this.previewItems.push({
          categoria: selezione.categoria,
          titolo: selezione.templateSelezionato.titolo,
          giornoSettimana: this.formatGiorno(selezione.templateSelezionato.giornoSettimana),
          oraInizio: selezione.templateSelezionato.oraInizio,
          oraFine: selezione.templateSelezionato.oraFine,
          istruttore: selezione.templateSelezionato.istruttore,
          numeroLezioni: selezione.numeroLezioni,
          date: selezione.dateGenerate.map(d => this.formatDataItaliana(d))
        });
      }
    });
  }

  conferma(): void {
    if (!this.wizardState) return;
    
    // Verifica totale lezioni
    const totale = this.getTotaleLezioniSelezionate();
    if (totale !== this.wizardState.pacchetto.lezioniRimanenti) {
      this.toastr.error(`Devi selezionare esattamente ${this.wizardState.pacchetto.lezioniRimanenti} lezioni`);
      return;
    }
    
    // Prepara richiesta
    const selezioniDTO: CategoriaSelectionDTO[] = [];
    this.wizardState.selezioni.forEach((selezione) => {
      if (selezione.templateSelezionato) {
        selezioniDTO.push({
          categoria: selezione.categoria,
          templateId: selezione.templateSelezionato.id,
          numeroLezioni: selezione.numeroLezioni
        });
      }
    });
    
    const request: PrenotazioneComboRequest = {
      venditaId: this.wizardState.venditaId,
      selezioni: selezioniDTO
    };
    
    console.log('Request COMBO da inviare:', request);
    console.log('venditaId:', this.wizardState.venditaId);
    
    this.confermaInCorso = true;
    
    this.prenotazioneService.prenotaCombo(request).subscribe({
      next: (response) => {
        this.confermaInCorso = false;
        this.toastr.success(`${response.numeroPrenotazioni} lezioni prenotate con successo!`);
        this.modaleService.chiudi();
        this.confermaCompleta.emit();
      },
      error: (error) => {
        this.confermaInCorso = false;
        const errorMsg = error.error?.message || 'Errore durante la prenotazione COMBO';
        this.toastr.error(errorMsg);
      }
    });
  }

  annulla(): void {
    this.modaleService.chiudi();
  }

  isPreviewStep(): boolean {
    if (!this.wizardState) return false;
    return this.wizardState.stepCorrente >= this.wizardState.categorieDisponibili.length;
  }

  formatGiorno(giorno: string): string {
    const giorniMap: {[key: string]: string} = {
      'LUNEDI': 'Lunedì',
      'MARTEDI': 'Martedì',
      'MERCOLEDI': 'Mercoledì',
      'GIOVEDI': 'Giovedì',
      'VENERDI': 'Venerdì',
      'SABATO': 'Sabato',
      'DOMENICA': 'Domenica'
    };
    return giorniMap[giorno] || giorno;
  }

  formatCategoria(categoria: string): string {
    // Trasforma STUDIO_INTERMEDIO -> Studio Intermedio
    return categoria
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatDataItaliana(dataString: string): string {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getProgressoPercentuale(): number {
    if (!this.wizardState) return 0;
    const totale = this.wizardState.categorieDisponibili.length + 1; // +1 per preview
    return (this.wizardState.stepCorrente / totale) * 100;
  }
}
