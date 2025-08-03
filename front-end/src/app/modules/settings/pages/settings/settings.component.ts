import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { ApiMsg } from '../../../../shared/models/ApiMsg';
import { ToastrService } from 'ngx-toastr';
import { ModaleService } from '../../../../core/services/modal.service';
import { FormPiattaformeComponent } from '../../components/form-piattaforme/form-piattaforme.component';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import {
  IAzioneDef,
  AzioneType,
  AzioneColor,
} from '../../../../shared/models/ui/azione-def';

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, 
    PageTitleComponent, 
    TabellaGenericaComponent,
    PaginationFooterComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;
  @ViewChild(TabellaGenericaComponent) tabellaComponent!: TabellaGenericaComponent;

  // Tab management
  activeTab = 'piattaforme';
  tabs: TabItem[] = [
    { id: 'piattaforme', label: 'Piattaforme', icon: 'fa fa-desktop' },
    // Ready for future tabs
    // { id: 'corsi', label: 'Stati Corsi', icon: 'fa fa-flag' },
    // { id: 'sedi', label: 'Sedi', icon: 'fa fa-building' },
    // { id: 'ruoli', label: 'Ruoli', icon: 'fa fa-users-cog' }
  ];

  // Platforms data
  piattaforme: IPiattaforma[] = [];

  // Pagination info
  paginationInfo = {
    currentPage: 1,
    totalPages: 1,
    pages: [] as number[],
    displayedItems: 0,
    totalItems: 0,
    pageSize: 20, // Will be updated by TabellaGenericaComponent
    entityName: 'piattaforme'
  };

  // Table configuration
  columns: IColumnDef[] = [
    { key: 'nome', label: 'Nome', sortable: true, type: 'text' },
    { key: 'descrizione', label: 'Descrizione', sortable: true, type: 'text' },
    { key: 'urlSito', label: 'URL Sito', sortable: true, type: 'text' },
    { key: 'attiva', label: 'Stato', sortable: true, type: 'badge' },
  ];

  actions: IAzioneDef[] = [
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
  ];

  constructor(
    private piattaformeService: PiattaformeService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadPiattaforme();
  }

  ngAfterViewInit() {
    // Removed dynamic page size calculation for consistent UX
  }

  // Tab management
  setActiveTab(tabId: string) {
    this.activeTab = tabId;
    if (tabId === 'piattaforme') {
      this.loadPiattaforme();
    }
  }

  // Data loading
  private loadPiattaforme() {
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => {
        console.log('📊 Loading piattaforme:', data.length, 'items');
        this.piattaforme = data.map((p: any) => ({
          ...p,
          attiva: p.attiva ? 'Attivo' : 'Non attivo',
        }));
        this.cd.detectChanges();
      },
      error: err => {
        console.error('❌ Error loading piattaforme:', err);
        this.piattaforme = [];
      },
    });
  }

  // Platform CRUD operations
  addPiattaforma() {
    this.modaleService.apri({
      titolo: 'Aggiungi Piattaforma',
      componente: FormPiattaformeComponent,
      dati: {},
      onConferma: (formValue: any) => {
        const piattaformaToSave = {
          ...formValue,
          attiva: formValue.attiva === 'true' || formValue.attiva === true
        };
        
        this.piattaformeService.addPiattaforma(piattaformaToSave).subscribe({
          next: this.onSuccess,
          error: this.handleError,
        });
      },
    });
  }

  editPiattaforma(piattaforma: IPiattaforma) {
    this.modaleService.apri({
      titolo: 'Modifica Piattaforma',
      componente: FormPiattaformeComponent,
      dati: piattaforma,
      onConferma: (formValue: any) => {
        const piattaformaToSave = {
          ...formValue,
          attiva: formValue.attiva === 'true' || formValue.attiva === true
        };
        
        this.piattaformeService.editPiattaforma(piattaforma.id, piattaformaToSave).subscribe({
          next: this.onSuccess,
          error: this.handleError,
        });
      },
    });
  }

  deletePiattaforma(piattaforma: IPiattaforma) {
    this.modaleService.apri({
      titolo: 'Conferma eliminazione',
      componente: DeleteConfirmComponent,
      dati: {
        messaggio: `Vuoi davvero eliminare la piattaforma "${piattaforma.nome}"?`,
      },
      onConferma: () => {
        this.piattaformeService.deletePiattaforma(piattaforma.id).subscribe({
          next: this.onSuccess,
          error: this.handleError,
        });
      },
    });
  }

  // Table action handling
  onTabellaAzione(event: { tipo: string; item: IPiattaforma }) {
    switch (event.tipo) {
      case AzioneType.Edit:
        this.editPiattaforma(event.item);
        break;
      case AzioneType.Delete:
        this.deletePiattaforma(event.item);
        break;
      default:
        console.warn('Azione non gestita:', event.tipo);
    }
  }

  // Pagination methods
  aggiornaPaginazione(paginationData: any) {
    console.log('🔄 Pagination data received:', paginationData);
    this.paginationInfo = { ...paginationData };
  }

  cambiaPagina(page: number) {
    console.log('📄 Changing to page:', page);
    if (this.tabellaComponent) {
      this.tabellaComponent.goToPage(page);
    }
  }

  // Success/Error handlers
  onSuccess = (response: ApiMsg) => {
    console.log('✅ Operation successful:', response);
    this.toastr.success(
      response.message || 'Operazione completata con successo!',
      'Successo',
    );
    this.loadPiattaforme();
    this.modaleService.chiudi();
  };

  handleError = (error: any) => {
    this.toastr.error(
      error?.error?.message || 'Si è verificato un errore!',
      'Errore',
    );
    console.error('❌ Operation error:', error);
  };
}
