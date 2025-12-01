import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { VenditeService, StatisticheVendite, Vendita } from '../../../../shared/services/vendite.service';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { SpinnerComponent } from '../../../../core/spinner/spinner.component';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { IAzioneDef, AzioneType, AzioneColor } from '../../../../shared/models/ui/azione-def';

Chart.register(...registerables);

@Component({
  selector: 'app-statistiche',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PageTitleComponent,
    LoggedUserComponent,
    // NotificationComponent,
    SpinnerComponent,
    TabellaGenericaComponent
  ],
  templateUrl: './statistiche.component.html',
  styleUrls: ['./statistiche.component.css']
})
export class StatisticheComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  @ViewChild('andamentoGuadagniChart', { static: false }) andamentoGuadagniChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('andamentoPacchettiChart', { static: false }) andamentoPacchettiChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  
  // Dati
  statistiche: StatisticheVendite | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  venditeTabella: any[] = [];
  
  // Proprietà calcolate per il template
  cardTitles = {
    fatturato: '',
    vendite: '',
    performance: '',
    media: ''
  };
  
  trendLabels = {
    fatturato: '',
    vendite: '',
    performance: '',
    media: ''
  };
  
  titoliGrafici = {
    fatturato: '',
    vendite: ''
  };
  
  formattedValues = {
    totaleFatturato: '',
    totaleFatturatoClass: '',
    totaleVendite: '',
    totaleVenditeClass: '',
    venditeMese: '',
    venditeMeseClass: '',
    fatturateMese: '',
    mediaVenditaGiornaliera: '',
    mediaVenditaGiornalieraClass: ''
  };
  
  // Grafici
  private andamentoGuadagniChart?: Chart;
  private andamentoPacchettiChart?: Chart;
  
  // Configurazione buttons per PageTitle
  buttons = [
    {
      text: 'Aggiorna',
      class: 'btn-outline-primary',
      icon: 'refresh',
      action: 'refresh'
    },
    {
      text: 'Esporta',
      class: 'btn-primary',
      icon: 'file_download',
      action: 'export'
    }
  ];
  
  // Filtri
  filtri = {
    periodo: 'ultimo_mese',
    dataInizio: '',
    dataFine: ''
  };
  
  // Configurazione tabella vendite recenti
  venditeTabellaColumns: IColumnDef[] = [
    { key: 'dataAcquisto', label: 'Data', type: 'date', width: '12%' },
    { key: 'nome', label: 'Nome', type: 'text', width: '15%' },
    { key: 'cognome', label: 'Cognome', type: 'text', width: '15%' },
    { key: 'utenteId', label: 'Username', type: 'text', width: '15%' },
    { key: 'pacchettoNome', label: 'Pacchetto', type: 'text', width: '20%' },
    { key: 'importo', label: 'Importo', type: 'text', width: '13%' },
    { key: 'stato', label: 'Stato', type: 'badge', statusType: 'vendita', width: '10%' }
  ];

  constructor(
    private venditeService: VenditeService
  ) {}

  ngOnInit(): void {
    this.caricaStatistiche();
  }

  ngAfterViewInit(): void {
    // I grafici verranno inizializzati quando i dati sono caricati
    setTimeout(() => {
      if (this.statistiche) {
        this.creaGrafici();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.distruggiGrafici();
  }

  caricaStatistiche(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Prepara i filtri
    const filtri: any = {
      periodo: this.filtri.periodo
    };
    
    // Aggiungi le date solo se è selezionato il filtro personalizzato
    if (this.filtri.periodo === 'personalizzato') {
      filtri.dataInizio = this.filtri.dataInizio;
      filtri.dataFine = this.filtri.dataFine;
    }
    
    console.log('Filtri inviati:', filtri);
    
    this.venditeService.getStatistiche(filtri)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Dati statistiche ricevuti:', data);
          console.log('andamentoMensile:', data.andamentoMensile);
          this.statistiche = data;
          this.aggiornaValoriCalcolati();
          this.aggiornaVenditeTabella();
          this.isLoading = false;
          setTimeout(() => this.creaGrafici(), 100);
        },
        error: (error) => {
          console.error('Errore nel caricamento delle statistiche:', error);
          this.errorMessage = 'Errore nel caricamento delle statistiche';
          this.isLoading = false;
        }
      });
  }

  onButtonClick(action: string): void {
    switch (action) {
      case 'refresh':
        this.aggiornaStatistiche();
        break;
      case 'export':
        this.esportaDati();
        break;
    }
  }

  applicaFiltri(): void {
    // Validazione per filtro personalizzato
    if (this.filtri.periodo === 'personalizzato') {
      if (!this.filtri.dataInizio || !this.filtri.dataFine) {
        this.errorMessage = 'Per il filtro personalizzato sono obbligatorie la data di inizio e la data di fine';
        return;
      }
      
      if (new Date(this.filtri.dataInizio) > new Date(this.filtri.dataFine)) {
        this.errorMessage = 'La data di inizio non può essere successiva alla data di fine';
        return;
      }
    }
    
    this.errorMessage = null;
    this.caricaStatistiche();
  }

  aggiornaStatistiche(): void {
    this.caricaStatistiche();
  }

  esportaDati(): void {
    console.log('Export dati - funzionalità in fase di sviluppo');
  }

  private creaGrafici(): void {
    console.log('Inizio creazione grafici, statistiche:', this.statistiche);
    if (!this.statistiche) return;
    
    // Usa un piccolo delay per assicurarsi che entrambi i canvas siano renderizzati
    setTimeout(() => {
      this.creaGraficoAndamentoGuadagni();
      this.creaGraficoAndamentoPacchetti();
    }, 0);
  }

  private creaGraficoAndamentoGuadagni(): void {
    const canvas = this.andamentoGuadagniChartRef?.nativeElement;
    if (!canvas || !this.statistiche) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.distruggiGrafico(this.andamentoGuadagniChart);

    const labels = this.statistiche.andamentoMensile.map(item => this.formattaLabelGrafico(item.mese));
    const fatturatoData = this.statistiche.andamentoMensile.map(item => item.fatturato);
    
    console.log('Creazione grafico fatturato - Labels formattate:', labels);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.getLabelDataset('fatturato'),
            data: fatturatoData,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#28a745',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `Fatturato: ${this.formattaImporto(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: this.getTitoloAsseX()
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Fatturato (€)'
            },
            ticks: {
              callback: (value) => this.formattaImporto(Number(value))
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    this.andamentoGuadagniChart = new Chart(ctx, config);
  }

  private creaGraficoAndamentoPacchetti(): void {
    console.log('Creazione grafico pacchetti - andamentoPacchettiChartRef:', this.andamentoPacchettiChartRef);
    const canvas = this.andamentoPacchettiChartRef?.nativeElement;
    console.log('Canvas pacchetti trovato:', canvas);
    if (!canvas || !this.statistiche) {
      console.log('Canvas o statistiche non disponibili', { canvas, statistiche: this.statistiche });
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Contesto canvas non disponibile');
      return;
    }

    this.distruggiGrafico(this.andamentoPacchettiChart);

    const labels = this.statistiche.andamentoMensile.map(item => this.formattaLabelGrafico(item.mese));
    const venditeData = this.statistiche.andamentoMensile.map(item => item.vendite);
    
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.getLabelDataset('vendite'),
            data: venditeData,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `Pacchetti venduti: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: this.getTitoloAsseX()
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Numero Pacchetti'
            },
            ticks: {
              stepSize: 1
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    this.andamentoPacchettiChart = new Chart(ctx, config);
  }

  private distruggiGrafico(chart?: Chart): void {
    if (chart) {
      chart.destroy();
    }
  }

  private distruggiGrafici(): void {
    this.distruggiGrafico(this.andamentoGuadagniChart);
    this.distruggiGrafico(this.andamentoPacchettiChart);
  }

  formattaImporto(importo: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(importo);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PAID': 'Pagato',
      'CANCELLED': 'Annullato',
      'PENDING': 'In attesa'
    };
    return labels[status] || status;
  }

  formattaImportoBreve(importo: number): string {
    if (importo >= 1000000) {
      return (importo / 1000000).toFixed(1) + 'M';
    } else if (importo >= 1000) {
      return (importo / 1000).toFixed(1) + 'K';
    }
    return importo.toFixed(0);
  }

  getCardTitle(tipo: string): string {
    const labels: { [key: string]: string } = {
      'fatturato': this.getPeriodoLabel() + ' - Fatturato',
      'vendite': this.getPeriodoLabel() + ' - Vendite',
      'performance': this.getPeriodoLabel() + ' - Performance',
      'media': 'Media Giornaliera'
    };
    return labels[tipo] || tipo;
  }

  getCardSubtitle(tipo: string): string {
    const labels: { [key: string]: string } = {
      'fatturato': 'fatturato totale',
      'vendite': 'vendite totali', 
      'performance': 'vendite periodo',
      'media': 'ricavo medio/giorno'
    };
    return labels[tipo] || tipo;
  }

  getTrendLabel(tipo: string): string {
    switch (tipo) {
      case 'fatturato':
        return this.filtri.periodo === 'ultima_settimana' ? 'rispetto alla settimana precedente' : 
               this.filtri.periodo === 'ultimo_mese' ? 'rispetto al mese precedente' : 
               this.filtri.periodo === 'ultimi_3_mesi' ? 'rispetto ai 3 mesi precedenti' :
               this.filtri.periodo === 'ultimo_anno' ? 'rispetto all\'anno precedente' : 'rispetto al periodo precedente';
      case 'vendite':
        return this.filtri.periodo === 'ultima_settimana' ? 'vendite questa settimana' : 
               this.filtri.periodo === 'ultimo_mese' ? 'vendite questo mese' : 
               this.filtri.periodo === 'ultimi_3_mesi' ? 'vendite ultimi 3 mesi' :
               this.filtri.periodo === 'ultimo_anno' ? 'vendite quest\'anno' : 'vendite del periodo';
      case 'performance':
        return this.filtri.periodo === 'ultima_settimana' ? 'performance di questa settimana' : 
               this.filtri.periodo === 'ultimo_mese' ? 'performance di questo mese' : 
               this.filtri.periodo === 'ultimi_3_mesi' ? 'performance ultimi 3 mesi' :
               this.filtri.periodo === 'ultimo_anno' ? 'performance di quest\'anno' : 'performance del periodo';
      case 'media':
        return this.filtri.periodo === 'ultima_settimana' ? 'media giornaliera settimanale' : 
               this.filtri.periodo === 'ultimo_mese' ? 'media giornaliera mensile' : 
               this.filtri.periodo === 'ultimi_3_mesi' ? 'media giornaliera trimestrale' :
               this.filtri.periodo === 'ultimo_anno' ? 'media giornaliera annuale' : 'media giornaliera';
      default:
        return 'rispetto al periodo precedente';
    }
  }

  private getPeriodoLabel(): string {
    switch (this.filtri.periodo) {
      case 'ultima_settimana':
        return 'Settimana';
      case 'ultimo_mese':
        return 'Mese';
      case 'ultimi_3_mesi':
        return '3 Mesi';
      case 'ultimo_anno':
        return 'Anno';
      case 'personalizzato':
        return 'Periodo';
      default:
        return 'Periodo';
    }
  }

  getNumberClass(value: string): string {
    const length = value.length;
    if (length > 12) {
      return 'main-number extra-large-number';
    } else if (length > 8) {
      return 'main-number large-number';
    }
    return 'main-number';
  }

  /**
   * Formatta i label dei grafici in base al periodo selezionato
   */
  formattaLabelGrafico(label: string): string {
    // Determina se siamo in modalità giornaliera o mensile
    const isGiornaliero = this.isPerGraficoGiornaliero();
    
    if (isGiornaliero) {
      // Per dati giornalieri, formatta come data leggibile
      if (label.includes('-')) {
        try {
          const date = new Date(label);
          return date.toLocaleDateString('it-IT', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        } catch (e) {
          // Fallback manuale se la data non è valida
          const parts = label.split('-');
          if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}`;
          }
        }
      }
      return label;
    } else {
      // Per dati mensili, mostra solo mese/anno
      if (label.includes('-')) {
        try {
          const date = new Date(label + '-01'); // Aggiungi giorno per parsare il mese
          return date.toLocaleDateString('it-IT', { 
            month: 'short', 
            year: 'numeric' 
          });
        } catch (e) {
          return label;
        }
      }
      return label;
    }
  }

  /**
   * Determina se il grafico deve mostrare dati giornalieri o mensili
   */
  private isPerGraficoGiornaliero(): boolean {
    if (this.filtri.periodo === 'ultima_settimana' || this.filtri.periodo === 'ultimo_mese') {
      return true;
    }
    
    if (this.filtri.periodo === 'personalizzato' && this.filtri.dataInizio && this.filtri.dataFine) {
      // Calcola la differenza in giorni
      const inizio = new Date(this.filtri.dataInizio);
      const fine = new Date(this.filtri.dataFine);
      const diffGiorni = Math.ceil((fine.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
      
      // Se il range è <= 31 giorni, usa dati giornalieri
      return diffGiorni <= 31;
    }
    
    return false;
  }

  /**
   * Ottiene il label per i dataset dei grafici in base al periodo
   */
  getLabelDataset(tipo: 'fatturato' | 'vendite'): string {
    const isGiornaliero = this.isPerGraficoGiornaliero();
    const basePeriodo = isGiornaliero ? 'giornalieri' : 'mensili';
    
    if (tipo === 'fatturato') {
      return `Fatturato ${basePeriodo} (€)`;
    } else {
      return `Pacchetti ${basePeriodo} venduti`;
    }
  }

  /**
   * Ottiene il titolo per l'asse X dei grafici in base al periodo
   */
  getTitoloAsseX(): string {
    const isGiornaliero = this.isPerGraficoGiornaliero();
    
    if (isGiornaliero) {
      return 'Giorni';
    } else {
      return 'Mesi';
    }
  }

  /**
   * Ottiene il titolo dinamico per i grafici in base al periodo
   */
  getTitoloGrafico(tipo: 'fatturato' | 'vendite'): string {
    const baseTipo = tipo === 'fatturato' ? 'Andamento Guadagni' : 'Andamento Pacchetti Venduti';
    
    if (this.filtri.periodo === 'personalizzato') {
      if (this.filtri.dataInizio && this.filtri.dataFine) {
        // Formatta le date in modo più leggibile
        const dataInizio = new Date(this.filtri.dataInizio).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const dataFine = new Date(this.filtri.dataFine).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        return `${baseTipo} (${dataInizio} - ${dataFine})`;
      } else {
        return `${baseTipo} (Periodo personalizzato)`;
      }
    } else {
      const periodoLabel = this.getPeriodoLabel();
      return `${baseTipo} - ${periodoLabel}`;
    }
  }
  
  /**
   * Aggiorna i dati delle vendite per la tabella generica
   */
  private aggiornaVenditeTabella(): void {
    if (!this.statistiche?.venditePiuRecenti) {
      this.venditeTabella = [];
      return;
    }
    
    this.venditeTabella = this.statistiche.venditePiuRecenti.map(vendita => ({
      ...vendita,
      nome: vendita.utente?.nome || '-',
      cognome: vendita.utente?.cognome || '-',
      pacchettoNome: vendita.pacchetto?.nome || `Pacchetto ${vendita.pacchettoId}`,
      importo: this.formattaImporto(vendita.importo)
    }));
  }
  
  /**
   * Aggiorna tutti i valori calcolati per il template
   */
  private aggiornaValoriCalcolati(): void {
    if (!this.statistiche) return;
    
    // Aggiorna i titoli delle card
    this.cardTitles.fatturato = this.getCardTitle('fatturato');
    this.cardTitles.vendite = this.getCardTitle('vendite');
    this.cardTitles.performance = this.getCardTitle('performance');
    this.cardTitles.media = this.getCardTitle('media');
    
    // Aggiorna i trend labels
    this.trendLabels.fatturato = this.getTrendLabel('fatturato');
    this.trendLabels.vendite = this.getTrendLabel('vendite');
    this.trendLabels.performance = this.getTrendLabel('performance');
    this.trendLabels.media = this.getTrendLabel('media');
    
    // Aggiorna i titoli dei grafici
    this.titoliGrafici.fatturato = this.getTitoloGrafico('fatturato');
    this.titoliGrafici.vendite = this.getTitoloGrafico('vendite');
    
    // Aggiorna i valori formattati
    this.formattedValues.totaleFatturato = this.formattaImporto(this.statistiche.totaleFatturato);
    this.formattedValues.totaleFatturatoClass = this.getNumberClass(this.formattedValues.totaleFatturato);
    
    this.formattedValues.totaleVendite = this.statistiche.totaleVendite.toString();
    this.formattedValues.totaleVenditeClass = this.getNumberClass(this.formattedValues.totaleVendite);
    
    this.formattedValues.venditeMese = this.statistiche.venditeMese.toString();
    this.formattedValues.venditeMeseClass = this.getNumberClass(this.formattedValues.venditeMese);
    
    this.formattedValues.fatturateMese = this.formattaImportoBreve(this.statistiche.fatturateMese);
    
    this.formattedValues.mediaVenditaGiornaliera = this.formattaImportoBreve(this.statistiche.mediaVenditaGiornaliera);
    this.formattedValues.mediaVenditaGiornalieraClass = this.getNumberClass(this.formattedValues.mediaVenditaGiornaliera);
  }
  
  /**
   * Gestisce le azioni della tabella vendite
   */
  onVenditaAction(event: { tipo: string; item: any }): void {
    switch (event.tipo) {
      case AzioneType.View:
        console.log('Visualizza vendita:', event.item);
        // TODO: Implementare apertura modal o navigazione dettaglio vendita
        break;
    }
  }
}
