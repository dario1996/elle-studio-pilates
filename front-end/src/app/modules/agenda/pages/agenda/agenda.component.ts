import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CalendarioService, CalendarioTemplate } from '../../../../shared/services/calendario.service';
import { PrenotazioneService } from '../../../../shared/services/prenotazione.service';
import { ToastrService } from 'ngx-toastr';
import { ILezione, TipoLezione, TIPI_LEZIONE_CONFIG } from '../../../../shared/models/Lezione';
import { PrenotazioneLezione } from '../../../../shared/models/prenotazione.model';
import { RichiestaSpostamento } from '../../../../shared/models/prenotazione.model';
import { FormLezioneComponent } from '../../components/form-lezione/form-lezione.component';
import { DettaglioLezioneComponent } from '../../components/dettaglio-lezione/dettaglio-lezione.component';
import { LeggendaColoriComponent } from '../../components/leggenda-colori/leggenda-colori.component';

@Component({
  selector: 'app-agenda',
  imports: [
    CommonModule, 
    FullCalendarModule, 
    PageTitleComponent, 
    LoggedUserComponent, 
    // NotificationComponent
  ],
  standalone: true,
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit {
  title: string = 'Calendario Lezioni';
  icon: string = 'fas fa-calendar-alt';
  
  lezioni: ILezione[] = [];
  prenotazioni: PrenotazioneLezione[] = [];
  events: EventInput[] = [];
  templateEvents: EventInput[] = [];
  lezioneEvents: EventInput[] = [];
  prenotazioneEvents: EventInput[] = [];

  // Richieste spostamento
  showRichiesteSpostamentoModal = false;
  richiesteSpostamento: RichiestaSpostamento[] = [];

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
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    dayHeaderFormat: {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric'
    },
    allDaySlot: false,
    nowIndicator: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunedì-Sabato
      startTime: '08:00',
      endTime: '20:00'
    },
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this),
    eventDidMount: this.styleEventElement.bind(this),
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
    private prenotazioneService: PrenotazioneService,
    private modaleService: ModaleService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private calendarioService: CalendarioService
  ) {}

  ngOnInit(): void {
    // this.loadLezioni(); // Commentato: ora usiamo solo prenotazioni_lezioni
    this.loadPrenotazioni();
    this.loadCalendarioTemplates();
    
    // Ascolta l'evento di refresh per ricaricare le lezioni
    this.modaleService.refreshList$.subscribe(() => {
      console.log('🔄 Ricevuto evento refresh, ricaricando prenotazioni...');
      // this.loadLezioni(); // Commentato
      this.loadPrenotazioni();
    });
    
    // Controlla se deve aprire il form di creazione o modifica
    this.route.queryParams.subscribe(params => {
      if (params['openForm'] === 'true') {
        // Rimuovi il query parameter dall'URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
        
        // Aspetta che il componente sia inizializzato prima di aprire il modale
        setTimeout(() => {
          this.apriModalCreazione();
        }, 100);
      } else if (params['edit']) {
        const lezioneId = parseInt(params['edit']);
        
        // Rimuovi il query parameter dall'URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
        
        // Aspetta che le lezioni siano caricate prima di aprire il modale di modifica
        setTimeout(() => {
          this.apriModalModificaDaId(lezioneId);
        }, 100);
      }
    });
  }

  private loadCalendarioTemplates(): void {
    console.log('🔄 Caricamento template calendario settimanale...');
    this.calendarioService.getCalendarioAttivo().subscribe({
      next: (templates: CalendarioTemplate[]) => {
        console.log('✅ Template calendario ricevuti:', templates.length);
        // Converti templates in eventi ricorrenti FullCalendar
        const recurringEvents: EventInput[] = templates.map(t => {
          // mappa giorno string (LUNEDI) in daysOfWeek index 0=Sunday..6=Saturday -> FullCalendar usa 0=Sunday
          const daysMap: any = {
            'LUNEDI': 1,
            'MARTEDI': 2,
            'MERCOLEDI': 3,
            'GIOVEDI': 4,
            'VENERDI': 5,
            'SABATO': 6,
            'DOMENICA': 0
          };

          const day = daysMap[(t.giornoSettimana || '').toUpperCase()] ?? 1;

          // oraInizio/oraFine sono in formato HH:mm:ss, manteniamo HH:mm
          const startTime = (t.oraInizio || '').toString().slice(0,5);
          const endTime = (t.oraFine || '').toString().slice(0,5);

          // Badge bianco con bordo colorato
          return {
            id: `tpl-${t.id}`,
            title: `${t.titolo}`,
            daysOfWeek: [day],
            startTime: startTime,
            endTime: endTime,
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            textColor: '#1f2937',
            extendedProps: {
              template: t,
              tipoLezione: t.tipoLezione,
              maxPartecipanti: t.maxPartecipanti ?? 1,
              templateId: t.id
            }
          } as EventInput;
        });

  // Salva separatamente gli eventi ricorrenti dei template e poi unisci
  this.templateEvents = [ ...recurringEvents ];
  this.updateCalendarEventsWithCounts();
      },
      error: (err) => {
        console.error('Errore caricamento calendario templates', err);
      }
    });
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

  private loadPrenotazioni(): void {
    console.log('🔄 loadPrenotazioni() chiamato - caricando TUTTE le prenotazioni dal backend');
    this.prenotazioneService.getTuttePrenotazioni().subscribe({
      next: (data) => {
        console.log('✅ Prenotazioni caricate dal backend:', data.length, 'prenotazioni');
        this.prenotazioni = data;
        this.updateCalendarEventsWithCounts();
        console.log('📅 Calendario aggiornato con prenotazioni');
      },
      error: (error) => {
        console.error('❌ Errore nel caricamento delle prenotazioni:', error);
        this.toastr.error('Errore nel caricamento delle prenotazioni');
      }
    });
  }

  private convertLezioniToEvents(): void {
    this.lezioneEvents = this.lezioni.map(lezione => ({
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
        partecipanti: lezione.partecipanti?.length || 0,
        maxPartecipanti: lezione.maxPartecipanti
      }
    }));
  }

  private convertPrenotazioniToEvents(): void {
    this.prenotazioneEvents = this.prenotazioni.map(pren => {
      // Determina il colore in base al tipo di lezione
      const tipoKey = pren.tipoLezione as TipoLezione;
      const tipoConfig = TIPI_LEZIONE_CONFIG[tipoKey] || TIPI_LEZIONE_CONFIG[TipoLezione.PRIVATA];
      
      return {
        id: `pren-${pren.id}`,
        title: `${pren.titolo} (1/1) - ${pren.utenteNome}`,
        start: `${pren.dataLezione}T${pren.oraInizio}`,
        end: `${pren.dataLezione}T${pren.oraFine}`,
        backgroundColor: tipoConfig.colore,
        borderColor: tipoConfig.colore,
        textColor: '#ffffff',
        extendedProps: {
          prenotazione: pren,
          tipo: 'prenotazione',
          stato: pren.stato,
          utenteNome: pren.utenteNome,
          gruppoId: pren.gruppoId,
          tipoLezione: pren.tipoLezione
        }
      };
    });
  }

  private getEventTitle(lezione: ILezione): string {
    const config = TIPI_LEZIONE_CONFIG[lezione.tipo];
    const partecipantiInfo = lezione.maxPartecipanti 
      ? `(${lezione.partecipanti?.length || 0}/${lezione.maxPartecipanti})`
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
    // Merge template events, lezione events and prenotazione events
    this.events = [ 
      ...(this.templateEvents || []), 
      ...(this.lezioneEvents || []),
      ...(this.prenotazioneEvents || [])
    ];
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
    console.log('✅ calendarOptions aggiornato');
  }

  private updateCalendarEventsWithCounts(): void {
    console.log('📅 updateCalendarEventsWithCounts() chiamato');
    
    // Mantieni gli eventi ricorrenti dei template e aggiorna solo i titoli con i conteggi dinamici
    // Nota: FullCalendar non supporta titoli diversi per ogni occorrenza di un evento ricorrente,
    // quindi mostreremo un conteggio totale o generico
    const updatedTemplateEvents = this.templateEvents.map(event => {
      const templateId = event.extendedProps?.['templateId'];
      const maxPartecipanti = event.extendedProps?.['maxPartecipanti'] || 1;
      
      // Estrai il titolo base (senza conteggio)
      const baseTitle = event.title?.replace(/\s*\(\d+\/\d+\).*$/, '') || '';
      
      // Mantieni l'evento ricorrente ma con il placeholder per il conteggio
      return {
        ...event,
        title: `${baseTitle} (0/${maxPartecipanti})` // FullCalendar mostrerà questo su tutte le ricorrenze
      };
    });
    
    this.events = [...updatedTemplateEvents];
    
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
    
    console.log('✅ Calendario aggiornato con template ricorrenti');
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
    const prenotazione = clickInfo.event.extendedProps['prenotazione'] as PrenotazioneLezione;
    if (prenotazione) {
      this.apriModalDettaglioPrenotazione(prenotazione);
      return;
    }
    
    const template = clickInfo.event.extendedProps['template'];
    if (template) {
      this.apriModalDettaglioTemplate(clickInfo.event);
      return;
    }
    
    const lezione = clickInfo.event.extendedProps['lezione'] as ILezione;
    if (lezione) {
      this.apriModalDettaglio(lezione);
    }
  }

  // Renderizza il contenuto degli eventi con conteggio dinamico e barra di progresso
  renderEventContent(eventInfo: any) {
    const template = eventInfo.event.extendedProps?.template;
    if (!template) {
      // Non è un template, usa il titolo di default
      return { html: `<div class="fc-event-title">${eventInfo.event.title}</div>` };
    }

    // È un template ricorrente, calcola il conteggio per questa specifica data
    const templateId = eventInfo.event.extendedProps?.templateId;
    const maxPartecipanti = eventInfo.event.extendedProps?.maxPartecipanti || 1;
    const eventDate = eventInfo.event.start;
    
    if (!eventDate) {
      return { html: `<div class="fc-event-title">${template.titolo || ''}</div>` };
    }
    
    const dataStr = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Conta prenotazioni confermate per questa data e template
    const prenotazioniCount = this.prenotazioni.filter(p => 
      p.templateId === templateId && 
      p.dataLezione === dataStr &&
      p.stato === 'CONFERMATA'
    ).length;
    
    const baseTitle = template.titolo || eventInfo.event.title;
    const isFull = prenotazioniCount >= maxPartecipanti;
    const percentage = Math.min(100, (prenotazioniCount / maxPartecipanti) * 100);
    
    const checkIcon = isFull ? '<i class="fas fa-check-circle" style="color: #10b981; font-size: 14px;"></i>' : '';
    
    return { 
      html: `<div style="position: relative; width: 100%; height: 100%; padding: 4px 6px; display: flex; flex-direction: column; justify-content: space-between;">
               <div style="display: flex; align-items: flex-start; justify-content: space-between; flex: 1;">
                 <span style="color: #1f2937; font-weight: 600; font-size: 10px; line-height: 1.3;">${baseTitle}</span>
                 ${checkIcon}
               </div>
               <div style="display: flex; align-items: center; justify-content: flex-end; margin-top: 2px;">
                 <strong style="font-weight: 600; font-size: 10px; color: #6b7280;">(${prenotazioniCount}/${maxPartecipanti})</strong>
               </div>
               <div class="event-progress-bar" style="width: ${percentage}%;"></div>
             </div>` 
    };
  }

  // Applica stili personalizzati all'elemento dell'evento
  styleEventElement(info: any) {
    const template = info.event.extendedProps?.template;
    const tipoLezione = info.event.extendedProps?.tipoLezione;
    
    // Applica sempre lo sfondo bianco e bordo neutro
    info.el.style.backgroundColor = '#ffffff';
    info.el.style.border = '1px solid #e5e7eb';
    info.el.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    
    // Aggiungi l'attributo data-tipo per il CSS
    if (tipoLezione) {
      info.el.setAttribute('data-tipo', tipoLezione);
    }
    
    if (!template) return;

    const templateId = info.event.extendedProps?.templateId;
    const maxPartecipanti = info.event.extendedProps?.maxPartecipanti || 1;
    const eventDate = info.event.start;
    
    if (!eventDate) return;
    
    const dataStr = eventDate.toISOString().split('T')[0];
    
    const prenotazioniCount = this.prenotazioni.filter(p => 
      p.templateId === templateId && 
      p.dataLezione === dataStr &&
      p.stato === 'CONFERMATA'
    ).length;
    
    const isFull = prenotazioniCount >= maxPartecipanti;
    
    if (isFull) {
      // Aggiungi un'ombra più accentuata per gli slot pieni
      info.el.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
      info.el.style.border = '1px solid #d1fae5';
    }
  }

  // Apertura modal per creazione nuova lezione
  apriModalCreazione(dateInfo?: { dataInizio: Date, dataFine: Date }): void {
      this.modaleService.apri({
        titolo: 'Prenota nuova prima lezione con posturale',
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
          action: () => this.deleteLezione(lezione)
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

  // Apertura modal per dettaglio prenotazione
  apriModalDettaglioPrenotazione(prenotazione: PrenotazioneLezione): void {
    import('../../components/dettaglio-lezione/dettaglio-lezione.component').then(({ DettaglioLezioneComponent }) => {
      // Crea un oggetto compatibile per visualizzare i dettagli della prenotazione
      const dettagliObj = {
        id: prenotazione.id,
        titolo: prenotazione.titolo,
        dataInizio: `${prenotazione.dataLezione}T${prenotazione.oraInizio}`,
        dataFine: `${prenotazione.dataLezione}T${prenotazione.oraFine}`,
        istruttore: prenotazione.istruttore,
        tipo: prenotazione.tipoLezione,
        maxPartecipanti: 1,
        partecipanti: [{ nome: prenotazione.utenteNome }],
        attiva: prenotazione.stato === 'CONFERMATA',
        note: prenotazione.note || `Stato: ${prenotazione.stato}${prenotazione.gruppoId ? ' - Gruppo: ' + prenotazione.gruppoId : ''}`
      };

      this.modaleService.apri({
        titolo: 'Dettagli Prenotazione',
        componente: DettaglioLezioneComponent,
        dati: dettagliObj,
        customButtons: [
          {
            text: 'Chiudi',
            cssClass: 'btn-secondary',
            action: () => this.modaleService.chiudi()
          }
        ],
        showDefaultButtons: false
      });
    });
  }

  // Apertura modal per dettaglio slot (template)
  apriModalDettaglioTemplate(event: any): void {
    import('../../components/dettaglio-lezione/dettaglio-lezione.component').then(({ DettaglioLezioneComponent }) => {
      const template = event.extendedProps?.template;
      const templateId = event.extendedProps?.templateId;
      const maxPartecipanti = event.extendedProps?.maxPartecipanti || 1;
      const eventDate = event.start;
      
      if (!eventDate || !template) return;
      
      const dataStr = eventDate.toISOString().split('T')[0];
      
      // Trova le prenotazioni per questo slot
      const prenotazioniSlot = this.prenotazioni.filter(p => 
        p.templateId === templateId && 
        p.dataLezione === dataStr &&
        p.stato === 'CONFERMATA'
      );
      
      const partecipanti = prenotazioniSlot.map(p => ({ nome: p.utenteNome }));
      
      const dettagliObj = {
        id: templateId,
        titolo: template.titolo,
        dataInizio: `${dataStr}T${template.oraInizio}`,
        dataFine: `${dataStr}T${template.oraFine}`,
        istruttore: template.istruttore,
        tipo: template.tipoLezione,
        maxPartecipanti: maxPartecipanti,
        partecipanti: partecipanti,
        attiva: true,
        note: template.note || `Slot calendario settimanale - ${prenotazioniSlot.length}/${maxPartecipanti} prenotazioni`
      };

      this.modaleService.apri({
        titolo: 'Dettagli Slot',
        componente: DettaglioLezioneComponent,
        dati: dettagliObj,
        customButtons: [
          {
            text: 'Chiudi',
            cssClass: 'btn-secondary',
            action: () => this.modaleService.chiudi()
          }
        ],
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

  apriLeggenda(): void {
    this.modaleService.apri({
      titolo: 'Leggenda Colori',
      componente: LeggendaColoriComponent,
      dati: null,
      showDefaultButtons: false,
      customButtons: [{
        text: 'Chiudi',
        cssClass: 'btn-cancel',
        action: () => this.modaleService.chiudi()
      }]
    });
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

      this.modaleService.apri({
        titolo: 'Modifica Lezione',
        componente: FormLezioneComponent,
        dati: lezione,
        onConferma: callback
      });
    });
  }

  private apriModalModificaDaId(lezioneId: number): void {
    console.log('🔍 Cercando lezione con ID:', lezioneId);
    const lezione = this.lezioni.find(l => l.id === lezioneId);
    
    if (lezione) {
      console.log('✅ Lezione trovata, aprendo modale di modifica:', lezione);
      this.editLezione(lezione);
    } else {
      console.warn('⚠️ Lezione non trovata con ID:', lezioneId);
      this.toastr.warning('Lezione non trovata');
    }
  }

  private deleteLezione(lezione: ILezione): void {
    const confirmMessage = `Sei sicuro di voler eliminare la lezione "${lezione.titolo}"?`;
    if (confirm(confirmMessage)) {
      this.eliminaLezione(lezione.id!);
    }
  }

  /**
   * Apre modale richieste spostamento
   */
  apriRichiesteSpostamento(): void {
    this.showRichiesteSpostamentoModal = true;
    this.loadRichiesteSpostamento();
  }

  /**
   * Chiude modale richieste spostamento
   */
  chiudiRichiesteSpostamento(): void {
    this.showRichiesteSpostamentoModal = false;
  }

  /**
   * Carica tutte le richieste di spostamento
   */
  loadRichiesteSpostamento(): void {
    this.prenotazioneService.getTutteRichiesteSpostamento().subscribe({
      next: (richieste) => {
        this.richiesteSpostamento = richieste;
      },
      error: (error) => {
        console.error('Errore caricamento richieste spostamento', error);
        this.toastr.error('Errore nel caricamento delle richieste');
      }
    });
  }

  /**
   * Gestisce eliminazione richiesta
   */
  gestisciRichiesta(richiestaId: number, nuovoStato: string): void {
    this.prenotazioneService.eliminaRichiestaSpostamento(richiestaId).subscribe({
      next: () => {
        this.toastr.success('Richiesta eliminata con successo');
        this.loadRichiesteSpostamento();
      },
      error: (error) => {
        console.error('Errore eliminazione richiesta', error);
        this.toastr.error('Errore durante l\'eliminazione della richiesta');
      }
    });
  }

  /**
   * Formatta data
   */
  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  /**
   * Formatta ora
   */
  formatTime(timeStr: string | undefined): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }

  /**
   * Badge classe stato richiesta
   */
  getStatoRichiestaBadge(stato: string): string {
    switch (stato) {
      case 'PENDING': return 'badge-attesa';
      case 'APPROVED': return 'badge-approvata';
      case 'REJECTED': return 'badge-rifiutata';
      default: return 'badge-default';
    }
  }

  /**
   * Label stato richiesta
   */
  getStatoRichiestaLabel(stato: string): string {
    switch (stato) {
      case 'PENDING': return 'In Attesa';
      case 'APPROVED': return 'Approvata';
      case 'REJECTED': return 'Rifiutata';
      default: return stato;
    }
  }
}

