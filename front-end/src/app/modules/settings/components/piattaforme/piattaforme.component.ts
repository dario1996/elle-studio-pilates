import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  OnInit,
  OnChanges,
} from '@angular/core';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { CommonModule } from '@angular/common';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import {
  IAzioneDef,
  AzioneType,
  AzioneColor,
} from '../../../../shared/models/ui/azione-def';

@Component({
  selector: 'app-piattaforme',
  standalone: true,
  imports: [
    CommonModule,
    TabellaGenericaComponent,
    PaginationFooterComponent,
  ],
  templateUrl: './piattaforme.component.html',
  styleUrl: './piattaforme.component.css',
})
export class PiattaformeComponent implements OnInit, OnChanges {
  @Input() piattaforme: IPiattaforma[] = [];
  @Input() pageSize = 10;
  @Output() action = new EventEmitter<{
    tab: string;
    type: string;
    payload?: any;
  }>();

  @ViewChild(TabellaGenericaComponent) tabellaComponent!: TabellaGenericaComponent;

  // Pagination info following the working pattern from dipendenti/corsi
  paginationInfo = {
    currentPage: 1,
    totalPages: 1,
    pages: [] as number[],
    displayedItems: 0,
    totalItems: 0,
    pageSize: 10,
    entityName: 'piattaforme'
  };

  columns: IColumnDef[] = [
    { key: 'nome', label: 'Nome', sortable: true, type: 'text' },
    {
      key: 'descrizione',
      label: 'Descrizione',
      sortable: true,
      type: 'text',
    },
    {
      key: 'urlSito',
      label: 'URL Sito',
      sortable: true,
      type: 'text',
    },
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

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    // Initialize pagination with current pageSize
    this.paginationInfo.pageSize = this.pageSize;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['piattaforme'] && changes['piattaforme'].currentValue) {
      console.log('🔄 Piattaforme data updated:', changes['piattaforme'].currentValue.length, 'items');
      this.cd.detectChanges();
    }
    
    if (changes['pageSize'] && changes['pageSize'].currentValue) {
      this.paginationInfo.pageSize = changes['pageSize'].currentValue;
      this.cd.detectChanges();
    }
  }

  // Action handling from table
  onTabellaAzione(event: { tipo: string; item: IPiattaforma }) {
    if (event.tipo === AzioneType.Edit) {
      this.action.emit({
        tab: 'piattaforme',
        type: 'edit',
        payload: event.item,
      });
    } else if (event.tipo === AzioneType.Delete) {
      this.action.emit({
        tab: 'piattaforme',
        type: 'delete',
        payload: event.item,
      });
    }
  }

  // Pagination methods following the working pattern
  aggiornaPaginazione(paginationData: any) {
    console.log('🔄 Pagination data received:', paginationData);
    this.paginationInfo = { ...paginationData };
    console.log('📄 Updated pagination info:', this.paginationInfo);
  }

  cambiaPagina(page: number) {
    console.log('📄 Changing to page:', page);
    if (this.tabellaComponent) {
      this.tabellaComponent.goToPage(page);
    }
  }
}
