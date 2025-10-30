# Sistema di Prenotazione Lezioni - Documentazione Implementazione

## Panoramica
Implementato un sistema completo di prenotazione lezioni per Elle Studio Pilates con flusso **Pacchetto → Tipo Lezione (filtrato) → Date/Orari Disponibili → Prenotazione**.

### 🎯 Flusso Utente
1. **Seleziona Pacchetto Acquistato**: L'utente sceglie uno dei pacchetti che ha acquistato e pagato
2. **Seleziona Tipo Lezione**: Vengono mostrati solo i tipi di lezione compatibili con la categoria del pacchetto
3. **Seleziona Data/Ora**: Vengono mostrate le date e orari disponibili per il tipo di lezione selezionato
4. **Conferma Prenotazione**: L'utente completa la prenotazione con eventuali note

## Architettura

### Backend (Spring Boot)

#### Entità
- **PrenotazioneLezione**: Gestisce le prenotazioni degli utenti
  - Campi: id, lezione, partecipanti, note, dataPrenotazione, attiva, dataCancellazione

#### Repository
- **PrenotazioneLezioneRepository**: Query JPA personalizzate
  - `findByLezioneId`: Trova prenotazioni per una lezione
  - `findByUtenteAndLezioneBetween`: Trova prenotazioni utente in un periodo
  - `countByLezioneIdAndAttivaTrue`: Conta prenotazioni attive
  - E altro...

#### Service
- **PrenotazioneLezioneService**: Business logic
  - `creaPrenotazione()`: Crea una nuova prenotazione con validazioni
  - `cancellaPrenotazione()`: Cancellazione soft (dataCancellazione)
  - `getTipiLezioneDisponibili()`: Recupera tipi di lezione da calendario_settimanale
  - `getPacchettiAcquistatiUtente(username)`: **NUOVO** - Recupera pacchetti acquistati e pagati dall'utente
  - `getTipiLezionePerPacchetto(pacchettoId)`: **NUOVO** - Filtra tipi di lezione per categoria del pacchetto
  - `getLezioniPerTemplate()`: Ottiene lezioni disponibili per un tipo specifico
  - `getPrenotazioniFutureUtente()`: Lista prenotazioni future utente
  - `modificaPrenotazione()`: Modifica prenotazione esistente

**Validazioni implementate**:
- Verifica capacità massima lezione
- Controllo prenotazioni duplicate
- Validazione stato lezione (non cancellata)
- Controllo disponibilità posti
- **Verifica acquisto pacchetto**: Solo pacchetti con vendita PAID

#### Controller
- **PrenotazioneLezioneController**: REST API
  - `POST /api/prenotazioni`: Crea prenotazione
  - `DELETE /api/prenotazioni/{id}`: Cancella prenotazione
  - `GET /api/prenotazioni/utente`: Lista prenotazioni utente
  - `GET /api/prenotazioni/tipi-lezione`: Ottiene tipi di lezione disponibili
  - `GET /api/prenotazioni/pacchetti-utente`: **NUOVO** - Pacchetti acquistati dall'utente autenticato
  - `GET /api/prenotazioni/tipi-lezione/pacchetto/{id}`: **NUOVO** - Tipi di lezione filtrati per pacchetto
  - `GET /api/prenotazioni/lezioni-per-template/{id}`: Lezioni per tipo specifico
  - `PUT /api/prenotazioni/{id}`: Modifica prenotazione
  - `GET /api/prenotazioni/future`: Prenotazioni future utente

### Frontend (Angular 19)

#### Models
```typescript
interface Pacchetto {
  id: number;
  nome: string;
  descrizione?: string;
  categoria: string;
  livello?: string;
  durataMinuti?: number;
  maxPartecipanti?: number;
  prezzo: number;
  attivo: boolean;
}

interface TipoLezione {
  id: number;
  giornoSettimana: string;
  oraInizio: string;
  oraFine: string;
  titolo: string;
  tipoLezione: string;
  istruttore: string;
  maxPartecipanti: number;
  colore: string;
  note?: string;
  attivo: boolean;
}

interface LezioneDisponibile {
  lezioneId: number;
  dataInizio: Date;
  dataFine: Date;
  titolo: string;
  tipoLezione: string;
  istruttore: string;
  maxPartecipanti: number;
  postiDisponibili: number;
  disponibile: boolean;
}

interface PrenotazioneRequest {
  lezioneId: number;
  note?: string;
}

interface PrenotazioneResponse {
  id: number;
  lezioneId: number;
  dataInizio: Date;
  dataFine: Date;
  titolo: string;
  tipoLezione: string;
  istruttore: string;
  note?: string;
}
```

#### Service
- **PrenotazioneService**: HTTP client per API
  - `creaPrenotazione()`
  - `cancellaPrenotazione()`
  - `getPrenotazioniUtente()`
  - `getTipiLezioneDisponibili()`
  - `getPacchettiUtente()`: **NUOVO** - Recupera pacchetti acquistati dall'utente
  - `getTipiLezionePerPacchetto(pacchettoId)`: **NUOVO** - Tipi di lezione filtrati per pacchetto
  - `getLezioniPerTemplate()`
  - `modificaPrenotazione()`

#### Component
- **GestionePrenotazioniComponent**: UI principale

**Funzionalità**:
1. Selezione pacchetto acquistato da dropdown
2. Visualizzazione dettagli pacchetto selezionato (categoria, livello, descrizione)
3. Caricamento automatico tipi di lezione filtrati per categoria del pacchetto
4. Selezione tipo lezione da dropdown (solo lezioni compatibili con il pacchetto)
5. Visualizzazione dettagli tipo lezione selezionato
6. Caricamento automatico date/orari disponibili
7. Selezione lezione specifica (date/ora)
8. Aggiunta note facoltative
9. Creazione prenotazione
10. Gestione prenotazioni esistenti (visualizza, modifica, cancella)

**Flusso utente**:
```
1. Utente seleziona pacchetto acquistato (es: "Pacchetto Pilates Base - PILATES")
   ↓
2. Sistema mostra dettagli pacchetto (categoria, livello, descrizione)
   ↓
3. Sistema carica SOLO i tipi di lezione con categoria compatibile con il pacchetto
   ↓
4. Utente seleziona tipo lezione (es: "Pilates Base - Lunedì 10:00")
   ↓
5. Sistema mostra dettagli tipo (giorno, orario, istruttore, max partecipanti)
   ↓
6. Sistema carica lezioni disponibili per quel tipo nelle prossime 4 settimane
   ↓
7. Utente vede lista date/orari con disponibilità posti
   - Disponibili: cliccabili, bordo colorato al hover
   - Non disponibili: grigio, non cliccabili, badge "Completo"
   ↓
8. Utente seleziona una lezione specifica
   ↓
9. (Opzionale) Utente aggiunge note
   ↓
10. Click "Prenota Lezione"
   ↓
11. Sistema crea prenotazione e mostra conferma
```

#### Styling
- Design coerente con Elle Studio Pilates theme (#c99e67)
- **Nuovo box dettagli pacchetto**: Sfondo grigio chiaro con bordo, mostra categoria/livello/descrizione
- **Box dettagli tipo lezione**: Sfondo grigio chiaro con bordo, mostra giorno/orario/istruttore/max partecipanti
- Stati visivi per lezioni:
  - **Disponibile**: Bordo grigio, hover con animazione e colore oro
  - **Selezionata**: Sfondo gradiente oro, testo bianco
  - **Non disponibile**: Grigio, opacità ridotta, cursor not-allowed
- Layout responsive (desktop: 2 colonne, mobile: 1 colonna)
- Toast notifications per feedback utente
- Modal per gestione prenotazioni esistenti
- **Disabilitazione dinamica**: Dropdown tipo lezione disabilitato fino a selezione pacchetto

## API Endpoints

### Pacchetti Utente
```
GET /api/prenotazioni/pacchetti-utente
Authentication: JWT Bearer Token
Response: List<Pacchetto> (solo pacchetti con vendita PAID)
```

### Tipi Lezione per Pacchetto
```
GET /api/prenotazioni/tipi-lezione/pacchetto/{pacchettoId}
Path param: pacchettoId (Long)
Response: List<CalendarioSettimanale> (filtrati per categoria del pacchetto)
```

### Creazione Prenotazione
```
POST /api/prenotazioni
Body: {
  "lezioneId": 123,
  "note": "Note opzionali"
}
Response: PrenotazioneResponse
```

### Cancellazione Prenotazione
```
DELETE /api/prenotazioni/{id}
Response: 204 No Content
```

### Lista Prenotazioni Utente
```
GET /api/prenotazioni/utente
Response: List<PrenotazioneResponse>
```

### Tipi Lezione Disponibili
```
GET /api/prenotazioni/tipi-lezione
Response: List<CalendarioSettimanale>
```

### Lezioni per Tipo
```
GET /api/prenotazioni/lezioni-per-template/{templateId}
Query params: 
  - dataInizio: ISO date
  - dataFine: ISO date
Response: List<LezioneDisponibile>
```

## Database

### Tabella: prenotazioni_lezioni
```sql
- id (BIGINT, PRIMARY KEY)
- lezione_id (BIGINT, FK → lezioni)
- partecipanti_username (VARCHAR, FK → utenti)
- note (TEXT, nullable)
- data_prenotazione (TIMESTAMP)
- attiva (BOOLEAN, default true)
- data_cancellazione (TIMESTAMP, nullable)
```

### Relazioni
- `prenotazioni_lezioni.lezione_id` → `lezioni.id`
- `prenotazioni_lezioni.partecipanti_username` → `utenti.username`
- `lezioni.template_id` → `calendario_settimanale.id`
- `vendite.utente_id` → `utenti.username`
- `vendite.pacchetto_id` → `pacchetti.id`

**Logica di filtro**: I tipi di lezione (calendario_settimanale.tipo_lezione) vengono filtrati per corrispondere alla categoria del pacchetto (pacchetti.categoria)

## Configurazione Locale Italiana

Aggiunto supporto per formato date/giorni in italiano:
```typescript
// app.config.ts
import localeIt from '@angular/common/locales/it';
registerLocaleData(localeIt);
{ provide: LOCALE_ID, useValue: 'it-IT' }
```

Uso nei template:
```html
{{ lezione.dataInizio | date:'EEEE, d MMMM yyyy':'':'it' }}
<!-- Output: Lunedì, 15 Gennaio 2024 -->
```

## Testing

### Test Backend
1. Creare una prenotazione per una lezione
2. Verificare validazione capacità massima
3. Testare cancellazione soft (attiva = false)
4. Controllare conteggio posti disponibili

### Test Frontend
1. Selezionare tipo lezione → verifica caricamento date
2. Selezionare lezione disponibile → verifica selezione visiva
3. Tentare click su lezione non disponibile → verifica blocco
4. Creare prenotazione → verifica toast di conferma
5. Aprire modal gestione → verifica lista prenotazioni
6. Cancellare prenotazione → verifica rimozione e aggiornamento

## Note Tecniche

### Range Date Lezioni
Il sistema carica lezioni per un periodo di 4 settimane dalla data attuale:
```java
LocalDate dataInizio = LocalDate.now();
LocalDate dataFine = dataInizio.plusWeeks(4);
```

### Calcolo Disponibilità
```java
int postiOccupati = prenotazioneLezioneRepository
    .countByLezioneIdAndAttivaTrue(lezione.getId());
int postiDisponibili = lezione.getMaxPartecipanti() - postiOccupati;
boolean disponibile = postiDisponibili > 0;
```

### Cancellazione Soft
Le prenotazioni non vengono eliminate fisicamente, ma vengono marcate come inattive:
```java
prenotazione.setAttiva(false);
prenotazione.setDataCancellazione(LocalDateTime.now());
```

## Prossimi Sviluppi Possibili

1. **Notifiche**: Email/SMS conferma prenotazione
2. **Calendario**: Vista calendario mensile
3. **Lista d'attesa**: Per lezioni piene
4. **Prenotazioni ricorrenti**: Prenota stesso slot settimanale
5. **Promemoria**: Notifica 24h prima della lezione
6. **Gestione abbonamenti**: Integrazione con pacchetti/abbonamenti
7. **Dashboard istruttore**: Vista lezioni con elenco iscritti
8. **Check-in**: Sistema presenza in palestra
9. **Statistiche**: Report partecipazione utente
10. **Filtri avanzati**: Per istruttore, livello, tipo lezione

## Crediti
- Framework: Spring Boot 3.x, Angular 19
- UI Design: Elle Studio Pilates theme
- Database: MySQL 8.x
- Autenticazione: JWT
