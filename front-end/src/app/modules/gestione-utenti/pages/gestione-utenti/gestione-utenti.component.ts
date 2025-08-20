import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PageTitleComponent, ButtonConfig } from '../../../../core/page-title/page-title.component';
import { IUsers } from '../../../../shared/models/Users';
import { UserService } from '../../../../core/services/data/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { PaginationFooterComponent } from '../../../../shared/components/pagination-footer/pagination-footer.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import { IAzioneDef } from '../../../../shared/models/ui/azione-def';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { DeleteConfirmComponent } from '../../../../core/delete-confirm/delete-confirm.component';
import { DisableConfirmComponent } from '../../../../core/disable-confirm/disable-confirm.component';
// import { FormUtentiComponent } from '../../components/form-utenti/form-utenti.component';
// import { DettaglioUtentiComponent } from '../../components/dettaglio-utenti/dettaglio-utenti.component';
// import { ImportUtentiComponent } from '../../components/import-utenti/import-utenti.component';
import { IFiltroDef } from '../../../../shared/models/ui/filtro-def';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { 
  UTENTI_COLUMNS, 
  UTENTI_AZIONI, 
  UTENTI_FILTRI
} from '../../../../shared/config/utenti.config';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';

@Component({
  selector: 'app-gestione-utenti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabellaGenericaComponent,
    FilterPanelComponent,
    PaginationFooterComponent,
    PageTitleComponent,
    NotificationComponent,
    LoggedUserComponent
  ],
  templateUrl: './gestione-utenti.component.html',
  styleUrls: ['./gestione-utenti.component.css'],
})
export class GestioneUtentiComponent implements OnInit, AfterViewInit {
  @ViewChild('pageContentInner') pageContentInner!: ElementRef<HTMLDivElement>;

  @ViewChild(TabellaGenericaComponent) 
  set tabella(component: TabellaGenericaComponent) {
    this.tabellaComponent = component;
  }
  
  private tabellaComponent!: TabellaGenericaComponent;

  isFilterPanelOpen = false;
  filtri: IFiltroDef[] = UTENTI_FILTRI;
  valoriFiltri: { [key: string]: any } = {};

  utenti: IUsers[] = [];
  utentiFiltrati: IUsers[] = [];

  buttons: ButtonConfig[] = [
    {
      text: 'Filtri',
      icon: 'fas fa-filter',
      class: 'btn-secondary',
      action: 'filter',
    },
    {
      text: 'Nuovo utente',
      icon: 'fas fa-plus',
      class: 'btn-primary',
      action: 'add'
    },
    /* IMPORT MASSIVO COMMENTATO
    {
      text: 'Import massivo',
      icon: 'fas fa-upload',
      class: 'btn-import',
      action: 'bulk-import'
    }
    */
  ];

  columns: IColumnDef[] = UTENTI_COLUMNS;
  azioni: IAzioneDef[] = UTENTI_AZIONI;

  paginationInfo = {
    currentPage: 1,
    totalPages: 1,
    pages: [] as number[],
    displayedItems: 0,
    totalItems: 0,
    pageSize: 20,
    entityName: 'utenti'
  };

  constructor(
    private userService: UserService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loadUtenti();
  }

  private loadUtenti() {
    this.userService.getListaUtenti().subscribe({
      next: data => {
        this.utenti = data.map((u: any) => ({
          ...u,
          nominativo: `${u.nome || ''} ${u.cognome || ''}`.trim() || u.username,
          attivo: u.attivo === 'Si' ? 'Attivo' : 'Non attivo',
          ruoli: Array.isArray(u.ruoli) ? u.ruoli.join(', ') : (u.ruoli || ''),
          dataCreazione: u.dataCreazione ? new Date(u.dataCreazione).toLocaleDateString('it-IT') : ''
        }));
        this.applicaFiltri();
        this.cd.detectChanges();
        this.paginationInfo.totalItems = this.utenti.length;
      },
      error: error => {
        this.toastr.error('Errore nel caricamento degli utenti');
        console.error('Errore caricamento utenti:', error);
      },
    });
  }

  onFiltriChange(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
  }

  onFiltersApplied(valori: { [key: string]: any }) {
    this.valoriFiltri = valori;
    this.applicaFiltri();
    this.closeFilterPanel();
  }

  applicaFiltri() {
    this.utentiFiltrati = this.utenti.filter(u => {
      const nominativo = `${u.nome || ''} ${u.cognome || ''}`.trim().toLowerCase() || u.username.toLowerCase();

      if (
        this.valoriFiltri['nominativo'] &&
        !nominativo.includes(this.valoriFiltri['nominativo'].toLowerCase())
      ) {
        return false;
      }
      
      if (
        this.valoriFiltri['username'] &&
        !u.username.toLowerCase().includes(this.valoriFiltri['username'].toLowerCase())
      ) {
        return false;
      }
      
      if (
        this.valoriFiltri['email'] &&
        !u.email.toLowerCase().includes(this.valoriFiltri['email'].toLowerCase())
      ) {
        return false;
      }
      
      if (this.valoriFiltri['ruoli']) {
        const userRoles = Array.isArray(u.ruoli) ? u.ruoli : [u.ruoli];
        if (!userRoles.some(role => role && role.toLowerCase().includes(this.valoriFiltri['ruoli'].toLowerCase()))) {
          return false;
        }
      }
      
      if (this.valoriFiltri['attivo'] && u.attivo !== this.valoriFiltri['attivo']) {
        return false;
      }
      
      return true;
    });
  }

  deleteUtente(username: string) {
    this.userService.permanentDeleteUtente(username).subscribe({
      next: () => {
        this.loadUtenti();
        this.toastr.success('Utente eliminato con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'eliminazione dell'utente");
        console.error('Errore eliminazione utente:', error);
      },
    });
  }

  toggleUtenteStatus(username: string) {
    this.userService.toggleUtenteStatus(username).subscribe({
      next: () => {
        this.loadUtenti();
        this.toastr.success('Stato dell\'utente aggiornato con successo');
      },
      error: error => {
        this.toastr.error("Errore durante l'aggiornamento dello stato dell'utente");
        console.error('Errore toggle status utente:', error);
      },
    });
  }

  updateUtente(username: string, utenteData: any) {
    this.userService.updUtente(username, utenteData).subscribe({
      next: () => {
        this.loadUtenti();
        this.toastr.success('Utente modificato con successo');
        this.modaleService.chiudi();
      },
      error: (error) => {
        this.toastr.error('Errore durante la modifica dell\'utente');
        console.error('Errore modifica utente:', error);
      },
    });
  }

  addUtente(utenteData: any) {
    this.userService.insUtente(utenteData).subscribe({
      next: () => {
        this.loadUtenti();
        this.toastr.success('Utente aggiunto con successo');
        this.modaleService.chiudi();
      },
      error: (error) => {
        this.toastr.error("Errore durante l'aggiunta dell'utente");
        console.error('Errore aggiunta utente:', error);
      },
    });
  }

  handleButtonClick(action: string): void {
    switch (action) {
      case 'filter':
        this.openFilterPanel();
        break;
      case 'add':
        this.gestioneAzione({ tipo: 'add', item: null });
        break;
      /* IMPORT MASSIVO COMMENTATO
      case 'bulk-import':
        import('../../components/import-utenti/import-utenti.component').then(({ ImportUtentiComponent }) => {
          this.modaleService.apri({
            titolo: 'Import Massivo Utenti',
            componente: ImportUtentiComponent,
            dati: {},
            onConferma: () => {
              this.loadUtenti();
            }
          });
        });
        break;
      */
      default:
        console.warn('Azione non riconosciuta:', action);
    }
  }

  gestioneAzione(e: { tipo: string; item: any }) {
    switch (e.tipo) {
      case 'add':
        import('../../components/form-utenti/form-utenti.component').then(({ FormUtentiComponent }) => {
          this.modaleService.apri({
            titolo: 'Aggiungi utente',
            componente: FormUtentiComponent,
            dati: {},
            onConferma: (formValue: any) => this.addUtente(formValue),
          });
        });
        break;
      case 'edit':
        import('../../components/form-utenti/form-utenti.component').then(({ FormUtentiComponent }) => {
          this.modaleService.apri({
            titolo: 'Modifica utente',
            componente: FormUtentiComponent,
            dati: e.item,
            onConferma: (formValue: any) =>
              this.updateUtente(e.item.username, formValue),
          });
        });
        break;
      case 'delete':
        this.modaleService.apri({
          titolo: 'Conferma eliminazione',
          componente: DeleteConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero eliminare l\'utente "' +
              (e.item.nome && e.item.cognome 
                ? e.item.nome + ' ' + e.item.cognome
                : e.item.username) +
              '"?',
          },
          onConferma: () => this.deleteUtente(e.item.username),
        });
        break;
      case 'disable':
        this.modaleService.apri({
          titolo: 'Conferma disattivazione',
          componente: DisableConfirmComponent,
          dati: {
            messaggio:
              'Vuoi davvero disattivare l\'utente "' +
              (e.item.nome && e.item.cognome 
                ? e.item.nome + ' ' + e.item.cognome
                : e.item.username) +
              '"?',
          },
          onConferma: () => this.toggleUtenteStatus(e.item.username),
        });
        break;
      case 'view':
        import('../../components/dettaglio-utenti/dettaglio-utenti.component').then(({ DettaglioUtentiComponent }) => {
          this.modaleService.apri({
            titolo: 'Dettagli utente',
            componente: DettaglioUtentiComponent,
            dati: e.item,
            showCloseButton: false,
          });
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

  getActiveFiltersCount(): number {
    return Object.values(this.valoriFiltri).filter(
      value => value !== null && value !== undefined && value !== '',
    ).length;
  }
}
