import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import itLocale from '@fullcalendar/core/locales/it';

import { ButtonConfig, PageTitleComponent } from "../../../../core/page-title/page-title.component";
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { ModaleService } from '../../../../core/services/modal.service';
import { LezioniService } from '../../../../core/services/lezioni.service';
import { ToastrService } from 'ngx-toastr';
import { ILezione, TipoLezione, TIPI_LEZIONE_CONFIG } from '../../../../shared/models/Lezione';
import { FormLezioneComponent } from '../../components/form-lezione/form-lezione.component';
import { DettaglioLezioneComponent } from '../../components/dettaglio-lezione/dettaglio-lezione.component';

@Component({
  selector: 'app-agenda',
  imports: [CommonModule, FullCalendarModule, PageTitleComponent, LoggedUserComponent, NotificationComponent],
  standalone: true,
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  title: string = 'Calendario Lezioni';
  icon: string = 'fas fa-calendar-alt';
  
  lezioni: ILezione[] = [];
  events: EventInput[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    locale: itLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    height: 'auto',
    editable: false, // disabilitiamo drag&drop per ora
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    nowIndicator: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunedì-Sabato
      startTime: '08:00',
      endTime: '20:00'
    },
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

  buttons: ButtonConfig[] = [
      {
        text: 'Nuova lezione',
        icon: 'fas fa-plus',
        class: 'btn-primary',
        action: 'add'
      }
    ];

  constructor(
    private lezioniService: LezioniService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLezioni();
  }

  private loadLezioni(): void {
    console.log('🔄 loadLezioni() chiamato - ricaricando tutte le lezioni dal backend');
    this.lezioniService.getLezioni().subscribe({
      next: (data) => {
        console.log('✅ Lezioni caricate dal backend:', data.length, 'lezioni');
        this.lezioni = data;
        this.convertLezioniToEvents();
        this.updateCalendarEvents();
        console.log('📅 Calendario aggiornato con nuovi dati');
      },
      error: (error) => {
        console.error('❌ Errore nel caricamento delle lezioni:', error);
        this.toastr.error('Errore nel caricamento delle lezioni');
      }
    });
  }

  private convertLezioniToEvents(): void {
    this.events = this.lezioni.map(lezione => ({
      id: lezione.id?.toString(),
      title: this.getEventTitle(lezione),
      start: lezione.dataInizio,
      end: lezione.dataFine,
      backgroundColor: this.getEventColor(lezione),
      borderColor: this.getEventColor(lezione),
      textColor: '#ffffff',
      extendedProps: {
        lezione: lezione,
        tipo: lezione.tipo,
        attiva: lezione.attiva,
        partecipanti: lezione.partecipantiIscritti,
        maxPartecipanti: lezione.maxPartecipanti
      }
    }));
  }

  private getEventTitle(lezione: ILezione): string {
    const config = TIPI_LEZIONE_CONFIG[lezione.tipo];
    const partecipantiInfo = lezione.maxPartecipanti 
      ? `(${lezione.partecipantiIscritti}/${lezione.maxPartecipanti})`
      : '';
    return `${config.label} ${partecipantiInfo}`;
  }

  private getEventColor(lezione: ILezione): string {
    if (!lezione.attiva) {
      return '#6b7280'; // grigio per disattivate
    }
    return TIPI_LEZIONE_CONFIG[lezione.tipo].colore;
  }

  private updateCalendarEvents(): void {
    console.log('📅 updateCalendarEvents() chiamato con', this.events.length, 'eventi');
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
    console.log('✅ calendarOptions aggiornato');
  }

  // Handler per la selezione di una data/ora (creazione nuova lezione)
  handleDateSelect(selectInfo: DateSelectArg): void {
    this.apriModalCreazione({
      dataInizio: selectInfo.start,
      dataFine: selectInfo.end
    });
  }

  // Handler per il click su un evento esistente
  handleEventClick(clickInfo: EventClickArg): void {
    const lezione = clickInfo.event.extendedProps['lezione'] as ILezione;
    if (lezione) {
      this.apriModalDettaglio(lezione);
    }
  }

  // Apertura modal per creazione nuova lezione
  apriModalCreazione(dateInfo?: { dataInizio: Date, dataFine: Date }): void {
      this.modaleService.apri({
        titolo: 'Nuova Lezione',
        componente: FormLezioneComponent,
        dati: {},
        onConferma: (formValue: ILezione) => this.creaLezione(formValue),
      });
  }

  private confermaCreazione(): void {
    // Il form component gestirà la conferma tramite il suo metodo onSubmit
    // Questo verrà chiamato tramite il modal component
  }

  // Apertura modal per visualizzazione/modifica lezione esistente
  apriModalDettaglio(lezione: ILezione): void {
    import('../../components/dettaglio-lezione/dettaglio-lezione.component').then(({ DettaglioLezioneComponent }) => {
      // Calcola se può essere cancellata (più di 24 ore prima)
      const now = new Date();
      const lezioneStart = new Date(lezione.dataInizio);
      const hoursUntilLesson = (lezioneStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      const canCancel = hoursUntilLesson > 24;

      const customButtons = [
        {
          text: 'Chiudi',
          cssClass: 'btn-secondary',
          action: () => this.modaleService.chiudi()
        },
        {
          text: lezione.attiva ? 'Disattiva' : 'Attiva',
          cssClass: 'btn-warning',
          action: () => this.toggleLezioneStatus(lezione)
        },
        {
          text: 'Modifica',
          cssClass: 'btn-primary',
          action: () => this.editLezione(lezione)
        },
        {
          text: 'Elimina',
          cssClass: 'btn-danger',
          action: () => this.deleteLezione(lezione),
          disabled: !canCancel
        }
      ];

      this.modaleService.apri({
        titolo: 'Dettagli Lezione',
        componente: DettaglioLezioneComponent,
        dati: lezione,
        customButtons: customButtons,
        showDefaultButtons: false
      });
    });
  }

  // CRUD Operations
  private creaLezione(lezioneData: ILezione): void {
    this.lezioniService.createLezione(lezioneData).subscribe({
      next: () => {
        this.loadLezioni();
        this.toastr.success('Lezione creata con successo');
        this.modaleService.chiudi();
      },
      error: (error) => {
        this.toastr.error('Errore durante la creazione della lezione');
        console.error('Errore creazione lezione:', error);
      },
    });
  }

  aggiornaLezione(id: number, lezioneData: ILezione): void {
    console.log('� METODO aggiornaLezione CHIAMATO! ID:', id, 'Dati:', lezioneData);
    console.log('�🔧 aggiornaLezione() chiamato per ID:', id);
    this.lezioniService.updateLezione(id, lezioneData).subscribe({
      next: (lezioneAggiornata) => {
        console.log('✅ Lezione aggiornata nel backend:', lezioneAggiornata);
        console.log('🔄 Ricaricando tutte le lezioni...');
        
        // Ricarica tutte le lezioni per essere sicuri che tutto sia sincronizzato
        this.loadLezioni();
        
        this.toastr.success('Lezione aggiornata con successo');
        
        // Chiudi il modale DOPO aver ricaricato i dati
        setTimeout(() => {
          this.modaleService.chiudi();
        }, 100);
      },
      error: (error) => {
        console.error('❌ Errore aggiornamento lezione:', error);
        this.toastr.error('Errore durante l\'aggiornamento della lezione');
        this.modaleService.chiudi();
      },
    });
  }

  eliminaLezione(id: number): void {
    this.lezioniService.deleteLezione(id).subscribe({
      next: () => {
        this.loadLezioni();
        this.toastr.success('Lezione eliminata con successo');
        this.modaleService.chiudi();
      },
      error: (error) => {
        this.toastr.error('Errore durante l\'eliminazione della lezione');
        console.error('Errore eliminazione lezione:', error);
      },
    });
  }

  // Gestione toolbar button
  handleAggiungiLezione(): void {
    this.apriModalCreazione();
  }

  // Metodi per i bottoni del modal dettaglio
  private toggleLezioneStatus(lezione: ILezione): void {
    console.log('🔄 toggleLezioneStatus() chiamato per lezione ID:', lezione.id);
    if (!lezione.id) {
      this.toastr.error('ID lezione non trovato');
      return;
    }
    
    this.lezioniService.toggleLezioneStatus(lezione.id).subscribe({
      next: () => {
        console.log('✅ Toggle status completato nel backend');
        // Chiudi il modale subito
        this.modaleService.chiudi();
        
        console.log('🔄 Ricaricando tutte le lezioni...');
        // Ricarica tutte le lezioni per essere sicuri che tutto sia sincronizzato
        this.loadLezioni();
        
        this.toastr.success('Status della lezione aggiornato con successo');
      },
      error: (error) => {
        console.error('❌ Errore nel toggle status:', error);
        this.toastr.error('Errore durante il cambio di stato della lezione');
      }
    });
  }

  private editLezione(lezione: ILezione): void {
    console.log('📝 editLezione chiamato per lezione:', lezione);
    import('../../components/form-lezione/form-lezione.component').then(({ FormLezioneComponent }) => {
      const callback = (formValue: ILezione) => {
        console.log('🎯 Callback onConferma chiamato con valori:', formValue);
        this.aggiornaLezione(lezione.id!, formValue);
      };
      
      console.log('🔧 Aprendo modale con callback:', callback);
      this.modaleService.apri({
        titolo: 'Modifica Lezione',
        componente: FormLezioneComponent,
        dati: lezione,
        onConferma: callback,
      });
    });
  }

  private confermaModifica(): void {
    // Il form component gestirà la conferma tramite il suo metodo onSubmit
  }

  private deleteLezione(lezione: ILezione): void {
    const confirmMessage = `Sei sicuro di voler eliminare la lezione "${lezione.titolo}"?`;
    if (confirm(confirmMessage)) {
      this.eliminaLezione(lezione.id!);
    }
  }
}

