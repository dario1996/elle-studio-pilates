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

Chart.register(...registerables);

@Component({
  selector: 'app-statistiche',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PageTitleComponent,
    LoggedUserComponent,
    NotificationComponent,
    SpinnerComponent
  ],
  templateUrl: './statistiche.component.html',
  styleUrls: ['./statistiche.component.css']
})
export class StatisticheComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  @ViewChild('andamentoGuadagniChart', { static: false }) andamentoGuadagniChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('andamentoCorsiChart', { static: false }) andamentoCorsiChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  
  // Dati
  statistiche: StatisticheVendite | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  
  // Grafici
  private andamentoGuadagniChart?: Chart;
  private andamentoCorsiChart?: Chart;
  
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
    const filtri = {
      periodo: this.filtri.periodo,
      dataInizio: this.filtri.dataInizio,
      dataFine: this.filtri.dataFine
    };
    
    this.venditeService.getStatistiche(filtri)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.statistiche = data;
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
    this.caricaStatistiche();
  }

  aggiornaStatistiche(): void {
    this.caricaStatistiche();
  }

  esportaDati(): void {
    console.log('Export dati - funzionalità in fase di sviluppo');
  }

  private creaGrafici(): void {
    if (!this.statistiche) return;
    
    this.creaGraficoAndamentoGuadagni();
    this.creaGraficoAndamentoCorsi();
  }

  private creaGraficoAndamentoGuadagni(): void {
    const canvas = this.andamentoGuadagniChartRef?.nativeElement;
    if (!canvas || !this.statistiche) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.distruggiGrafico(this.andamentoGuadagniChart);

    const labels = this.statistiche.andamentoMensile.map(item => item.mese);
    const fatturatoData = this.statistiche.andamentoMensile.map(item => item.fatturato);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fatturato (€)',
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
              text: 'Periodo'
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

  private creaGraficoAndamentoCorsi(): void {
    const canvas = this.andamentoCorsiChartRef?.nativeElement;
    if (!canvas || !this.statistiche) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.distruggiGrafico(this.andamentoCorsiChart);

    const labels = this.statistiche.andamentoMensile.map(item => item.mese);
    const venditeData = this.statistiche.andamentoMensile.map(item => item.vendite);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Corsi Venduti',
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
                return `Corsi venduti: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Periodo'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Numero Corsi'
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

    this.andamentoCorsiChart = new Chart(ctx, config);
  }

  private distruggiGrafico(chart?: Chart): void {
    if (chart) {
      chart.destroy();
    }
  }

  private distruggiGrafici(): void {
    this.distruggiGrafico(this.andamentoGuadagniChart);
    this.distruggiGrafico(this.andamentoCorsiChart);
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
}
