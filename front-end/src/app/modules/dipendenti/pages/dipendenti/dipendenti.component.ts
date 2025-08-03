import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PageTitleComponent, ButtonConfig } from '../../../../core/page-title/page-title.component'; // AGGIUNTO
import {
  IDipendenti,
} from '../../../../shared/models/Dipendenti';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import {
  AzioneColor,
  AzioneType,
  IAzioneDef,
} from '../../../../shared/models/ui/azione-def';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { DisableConfirmComponent } from '../../../../core/disable-confirm/disable-confirm.component';
import { FormDipendentiComponent } from '../../components/form-dipendenti/form-dipendenti.component';
import { DettaglioDipendentiComponent } from '../../components/dettaglio-dipendenti/dettaglio-dipendenti.component';
import { ImportDipendentiComponent } from '../../components/import-dipendenti/import-dipendenti.component';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-dipendenti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
    FilterPanelComponent,
    PaginationFooterComponent,
    PageTitleComponent,
  ],
  templateUrl: './dipendenti.component.html',
  styleUrls: ['./dipendenti.component.css'],
})
export class DipendentiComponent implements OnInit, AfterViewInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;


  @ViewChild(TabellaGenericaComponent) 
  set tabella(component: TabellaGenericaComponent) {
    this.tabellaComponent = component;
  }
  
  private tabellaComponent!: TabellaGenericaComponent;

  searchFields = [
    { key: 'nominativo', placeholder: 'Cerca Dipendente' }
  ];

  isFilterPanelOpen = false;

  filtri: IFiltroDef[] = [
    {
      key: 'nominativo',
      label: 'Nominativo',
      type: 'text',
      placeholder: 'Cerca nominativo...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Cerca email...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'reparto',
      label: 'Reparto',
      type: 'text',
      placeholder: 'Cerca reparto...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'isms',
      label: 'ISMS',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'Si', label: 'Si' },
        { value: 'No', label: 'No' },
      ],
      colClass: 'col-6 col-md-3 col-lg-2 mb-2',
    },
    {
      key: 'ruolo',
      label: 'Ruolo',
      type: 'text',
      placeholder: 'Cerca ruolo...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'azienda',
      label: 'Azienda',
      type: 'text',
      placeholder: 'Cerca azienda...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'attivo',
      label: 'Stato',
      type: 'select',
      options: [
        { value: '', label: 'Tutti' },
        { value: 'Attivo', label: 'Attivo' },
        { value: 'Non attivo', label: 'Non attivo' },
      ],
      colClass: 'col-6 col-md-3 col-lg-2 mb-2',
    },
    {
      key: 'sede',
      label: 'Sede',
      type: 'text',
      placeholder: 'Cerca sede...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'community',
      label: 'Community',
      type: 'text',
      placeholder: 'Cerca community...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
    {
      key: 'responsabile',
      label: 'Responsabile',
      type: 'text',
      placeholder: 'Cerca responsabile...',
      colClass: 'col-12 col-md-4 col-lg-3 mb-2',
    },
  ];
  valoriFiltri: { [key: string]: any } = {};

  dipendenti: IDipendenti[] = [];
  dipendentiFiltrati: IDipendenti[] = [];

  buttons: ButtonConfig[] = [
    {
      text: 'Filtri',
      icon: 'fas fa-filter',
      class: 'btn-secondary',
      action: 'filter',
    },
    {
      text: 'Nuovo dipendente',
      icon: 'fas fa-plus',
      class: 'btn-primary',
      action: 'add'
    },
    {
      text: 'Import massivo',
      icon: 'fas fa-upload',
      class: 'btn-import',
      action: 'bulk-import'
    }
  ];

  columns: IColumnDef[] = [
    { key: 'nominativo', label: 'Nominativo', sortable: true, type: 'text' },
    {
      key: 'reparto',
      label: 'Reparto',
      sortable: true,
      type: 'text',
    },
    { key: 'isms', label: 'ISMS', sortable: true, type: 'text' },
    {
      key: 'ruolo',
      label: 'Ruolo',
      sortable: true,
      type: 'text',
    },
    {
      key: 'azienda',
      label: 'Azienda',
      sortable: true,
      type: 'text',
    },
    {
      key: 'attivo',
      label: 'Stato',
      sortable: true,
      type: 'badge',
      statusType: 'dipendente'
    },
    {
      key: 'sede',
      label: 'Sede',
      sortable: true,
      type: 'text',
    },
    {
      key: 'community',
      label: 'Community',
      sortable: true,
      type: 'text',
    },
    {
      key: 'responsabile',
      label: 'Responsabile',
      sortable: true,
      type: 'text',
    },
  ];

  azioni: IAzioneDef[] = [
    {
      label: 'Modifica',
      icon: 'fa fa-pen',
      action: AzioneType.Edit,
      color: AzioneColor.Secondary,
    },
    {
      label: 'Elimina',
      icon: 'fa fa-trash',
      action: AzioneType.Delete,
      color: AzioneColor.Danger,
    },
    {
      label: 'Disattiva',
      icon: 'fa fa-user-slash',
      action: AzioneType.Disable,
      color: AzioneColor.Warning,
    },
  ];

  paginationInfo = {
    currentPage: 1,
    totalPages: 1,
    pages: [] as number[],
    displayedItems: 0,
    totalItems: 0,
    pageSize: 20,
    entityName: 'dipendenti'
  };

  constructor(
    private dipendentiService: DipendentiService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loadDipendenti();
  }

  private loadDipendenti() {
    this.dipendentiService.getListaDipendenti().subscribe({
      next: data => {
        this.dipendenti = data.map((d: any) => ({
          ...d,
          nominativo: `${d.nome} ${d.cognome}`.trim(),
          attivo: d.attivo ? 'Attivo' : 'Non attivo',
        }));
        this.applicaFiltri();
        this.cd.detectChanges();
        this.paginationInfo.totalItems = this.dipendenti.length;
      },
      error: error => {
        this.toastr.error('Errore nel caricamento dei dipendenti');
      },
    });
  }

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
  }

  onFiltersApplied(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.dipendentiFiltrati = this.dipendenti.filter(d => {
      const nominativo = `${d.nome} ${d.cognome}`.trim().toLowerCase();

      if (
        this.valoriFiltri['nominativo'] &&
        !nominativo.includes(this.valoriFiltri['nominativo'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by email
      if (
        this.valoriFiltri['email'] &&
        !d.email.toLowerCase().includes(this.valoriFiltri['email'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by reparto
      if (
        this.valoriFiltri['reparto'] &&
        d.reparto &&
        !d.reparto.toLowerCase().includes(this.valoriFiltri['reparto'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by ISMS
      if (this.valoriFiltri['isms']) {
        const ismsValue = d.isms ? d.isms.trim() : null;
        const filterValue = this.valoriFiltri['isms'];
        
        if (filterValue === 'Si' && ismsValue !== 'Si') {
          return false;
        }
        if (filterValue === 'No' && ismsValue !== 'No') {
          return false;
        }
      }
      
      // Filter by ruolo
      if (
        this.valoriFiltri['ruolo'] &&
        d.ruolo &&
        !d.ruolo.toLowerCase().includes(this.valoriFiltri['ruolo'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by azienda
      if (
        this.valoriFiltri['azienda'] &&
        d.azienda &&
        !d.azienda.toLowerCase().includes(this.valoriFiltri['azienda'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by active status
      if (this.valoriFiltri['attivo'] && d.attivo !== this.valoriFiltri['attivo']) {
        return false;
      }
      
      // Filter by sede
      if (
        this.valoriFiltri['sede'] &&
        d.sede &&
        !d.sede.toLowerCase().includes(this.valoriFiltri['sede'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by community
      if (
        this.valoriFiltri['community'] &&
        d.community &&
        !d.community.toLowerCase().includes(this.valoriFiltri['community'].toLowerCase())
      ) {
        return false;
      }
      
      // Filter by responsabile
      if (
        this.valoriFiltri['responsabile'] &&
        d.responsabile &&
        !d.responsabile.toLowerCase().includes(this.valoriFiltri['responsabile'].toLowerCase())
      ) {
        return false;
      }
      
      return true;
    });
  }

  deleteDipendente(id: number) {
    this.dipendentiService.permanentDeleteDipendente(id).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Dipendente eliminato con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'eliminazione del dipendente");
      },
    });
  }

  toggleDipendenteStatus(id: number) {
    this.dipendentiService.toggleDipendenteStatus(id).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Stato del dipendente aggiornato con successo');
      },
      error: error => {
        this.toastr.error(
          "Errore durante l'aggiornamento dello stato del dipendente",
        );
      },
    });
  }

  updateDipendente(id: number, dipendenteData: any) {
    this.dipendentiService.updDipendente(id, dipendenteData).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Dipendente modificato con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error('Errore durante la modifica del dipendente');
      },
    });
  }

  addDipendente(dipendenteData: any) {
    this.dipendentiService.insDipendente(dipendenteData).subscribe({
      next: () => {
        this.loadDipendenti();
        this.toastr.success('Dipendente aggiunto con successo');
        this.modaleService.chiudi();
      },
      error: () => {
        this.toastr.error("Errore durante l'aggiunta del dipendente");
      },
    });
  }

  handleButtonClick(action: string) {
    switch (action) {
      case 'filter':
        this.openFilterPanel();
        break;
      case 'add':
        this.gestioneAzione({ tipo: 'add', item: null });
        break;
      case 'bulk-import':
        this.modaleService.apri({
          titolo: 'Import Massivo Dipendenti',
          componente: ImportDipendentiComponent,
          dati: {},
          onConferma: () => {
            this.loadDipendenti();
          }
        });
        break;
      default:
        console.warn('Azione non riconosciuta:', action);
    }
  }

  gestioneAzione(e: { tipo: string; item: any }) {
    switch (e.tipo) {
      case 'add':
        this.modaleService.apri({
          titolo: 'Aggiungi dipendente',
          componente: FormDipendentiComponent,
          dati: {},
          onConferma: (formValue: any) => this.addDipendente(formValue),
        });
        break;
      case 'edit':
        this.modaleService.apri({
          titolo: 'Modifica dipendente',
          componente: FormDipendentiComponent,
          dati: e.item,
          onConferma: (formValue: any) =>
            this.updateDipendente(e.item.id, formValue),
        });
        break;
      case 'delete':
        this.modaleService.apri({
          titolo: 'Conferma eliminazione',
          componente: DeleteConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero eliminare il dipendente "' +
              e.item.nome +
              ' ' +
              e.item.cognome +
              '"?',
          },
          onConferma: () => this.deleteDipendente(e.item.id),
        });
        break;
      case 'disable':
        this.modaleService.apri({
          titolo: 'Conferma disattivazione',
          componente: DisableConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero disattivare il dipendente "' +
              e.item.nome +
              ' ' +
              e.item.cognome +
              '"?',
          },
          onConferma: () => this.toggleDipendenteStatus(e.item.id),
        });
        break;
      case 'view':
        this.modaleService.apri({
          titolo: 'Dettagli dipendente',
          componente: DettaglioDipendentiComponent,
          dati: e.item,
          showCloseButton: false,
        });
        break;
      default:
        console.error('Azione non supportata:', e.tipo);
    }
  }

  aggiornaPaginazione(paginationData: any) {
    this.paginationInfo = { ...paginationData };
  }

  cambiaPagina(page: number) {
    if (this.tabellaComponent) {
      this.tabellaComponent.goToPage(page);
    }
  }

  // Filter panel methods
  openFilterPanel() {
    this.isFilterPanelOpen = true;
  }

  closeFilterPanel() {
    this.isFilterPanelOpen = false;
  }

  applyFilters(filtri: { [key: string]: any }) {
    this.valoriFiltri = filtri;
    this.applicaFiltri();
  }

  clearFilters() {
    this.valoriFiltri = {};
    this.applicaFiltri();
  }

    // Get count of active filters
  getActiveFiltersCount(): number {
    return Object.values(this.valoriFiltri).filter(
      value => value !== null && value !== undefined && value !== '',
    ).length;
  }

  filtraTabella(event: { [key: string]: string }) {
  const nominativo = event['nominativo'] || '';
  this.dipendentiFiltrati = this.dipendenti.filter(row =>
    (`${row.nome} ${row.cognome}`.toLowerCase()).includes(nominativo.toLowerCase())
  );
}
}
