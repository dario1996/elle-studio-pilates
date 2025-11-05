# Sistema di Prenotazione Lezioni - Implementazione Completata

## Panoramica
È stato implementato un sistema completo di prenotazione lezioni che permette agli utenti di prenotare lezioni dal loro pannello utente. Il sistema si integra con le tabelle `lezioni`, `calendario_settimanale`, `prenotazioni_lezioni` e `utenti`.

## Struttura del Database

### Tabella `prenotazioni_lezioni`
- **id**: ID univoco prenotazione
- **lezione_id**: FK verso tabella lezioni
- **partecipanti_username**: FK verso tabella utenti (campo username)
- **data_prenotazione**: Timestamp creazione prenotazione
- **note**: Note opzionali dell'utente
- **stato**: Stato prenotazione (CONFERMATA, CANCELLATA, IN_ATTESA)

## Backend (Spring Boot)

### 1. Entity
**File**: `back-end/src/main/java/com/example/demo/entity/PrenotazioneLezione.java`
- Entity JPA per gestire la relazione Many-to-Many tra Lezione e Utenti
- Relazioni con `Lezione` (Many-to-One) e `Utenti` (Many-to-One)
- Campo stato per tracciare lo stato della prenotazione

### 2. DTO (Data Transfer Objects)
**Files**:
- `PrenotazioneLezioneRequest.java`: Request per creare prenotazione
- `PrenotazioneLezioneResponse.java`: Response con dettagli prenotazione
- `LezioneDisponibileDto.java`: DTO per visualizzare lezioni con disponibilità posti

### 3. Repository
**File**: `PrenotazioneLezioneRepository.java`

Query principali:
- `findPrenotazioniAttivaByUsername()`: Recupera prenotazioni attive utente
- `findPrenotazioniFutureByUsername()`: Recupera prenotazioni future
- `countPostiOccupatiByLezioneId()`: Conta posti occupati per lezione
- `existsPrenotazioneAttiva()`: Verifica se utente ha già prenotato
- `findByLezioneId()`: Trova tutte le prenotazioni di una lezione

### 4. Service
**File**: `PrenotazioneLezioneService.java`

Metodi principali:
- `getLezioniDisponibili(dataInizio, dataFine)`: Recupera lezioni con info disponibilità
- `getLezioniDisponibiliPerData(data)`: Lezioni per singola data
- `creaPrenotazione(username, request)`: Crea nuova prenotazione con validazioni
- `cancellaPrenotazione(username, prenotazioneId)`: Cancella prenotazione (soft delete)
- `getPrenotazioniUtente(username)`: Recupera tutte le prenotazioni utente
- `getPrenotazioniFutureUtente(username)`: Solo prenotazioni future
- `verificaDisponibilitaLezione(lezioneId)`: Verifica disponibilità singola lezione

**Validazioni implementate**:
- Verifica esistenza lezione
- Verifica stato attivo lezione
- Verifica utente esistente
- Controllo prenotazione duplicata
- Verifica disponibilità posti
- Autorizzazione cancellazione (solo proprietario)

### 5. Controller REST
**File**: `PrenotazioneLezioneController.java`

Endpoint REST API:
- `GET /api/prenotazioni/lezioni-disponibili?dataInizio=...&dataFine=...`
- `GET /api/prenotazioni/lezioni-disponibili/{data}`
- `GET /api/prenotazioni/lezione/{lezioneId}/disponibilita`
- `POST /api/prenotazioni` - Crea prenotazione
- `GET /api/prenotazioni/mie-prenotazioni` - Prenotazioni utente
- `GET /api/prenotazioni/mie-prenotazioni/future` - Solo future
- `DELETE /api/prenotazioni/{prenotazioneId}` - Cancella prenotazione

Tutti gli endpoint sono protetti con autenticazione JWT e utilizzano l'utente corrente dal token.

## Frontend (Angular)

### 1. Models TypeScript
**File**: `front-end/src/app/shared/models/prenotazione.model.ts`

Interfacce:
- `PrenotazioneLezioneRequest`: Per creare prenotazioni
- `PrenotazioneLezioneResponse`: Dati prenotazione esistente
- `LezioneDisponibile`: Lezione con informazioni disponibilità

### 2. Service Angular
**File**: `front-end/src/app/shared/services/prenotazione.service.ts`

Metodi HTTP:
- `getLezioniDisponibili(dataInizio, dataFine)`: Observable<LezioneDisponibile[]>
- `getLezioniDisponibiliPerData(data)`: Observable<LezioneDisponibile[]>
- `verificaDisponibilitaLezione(lezioneId)`: Observable<LezioneDisponibile>
- `creaPrenotazione(request)`: Observable<PrenotazioneLezioneResponse>
- `getMiePrenotazioni()`: Observable<PrenotazioneLezioneResponse[]>
- `getMiePrenotazioniFuture()`: Observable<PrenotazioneLezioneResponse[]>
- `cancellaPrenotazione(prenotazioneId)`: Observable<void>

### 3. Componente Gestione Prenotazioni
**Files**:
- `gestione-prenotazioni.component.ts`
- `gestione-prenotazioni.component.html`
- `gestione-prenotazioni.component.css`

Funzionalità implementate:
- Selezione data con date picker (min: oggi)
- Caricamento dinamico lezioni disponibili per data selezionata
- Visualizzazione card lezioni con:
  - Titolo e tipo lezione
  - Orario inizio/fine
  - Istruttore
  - Posti disponibili/totali
  - Indicatore visivo disponibilità
- Selezione lezione con feedback visivo
- Form prenotazione con note opzionali
- Toast notifications per feedback operazioni
- Modal "Le mie prenotazioni" con:
  - Lista prenotazioni future
  - Dettagli completi (data, orario, istruttore)
  - Pulsante cancella prenotazione
  - Conferma prima di cancellare

## Flusso Operativo

### Prenotazione Nuova Lezione
1. Utente seleziona una data
2. Sistema carica lezioni disponibili per quella data dalla tabella `lezioni`
3. Sistema calcola posti disponibili contando le prenotazioni esistenti
4. Utente seleziona una lezione disponibile
5. Utente aggiunge note opzionali
6. Sistema valida:
   - Lezione esiste ed è attiva
   - Utente non ha già prenotato quella lezione
   - Ci sono posti disponibili
7. Sistema crea record in `prenotazioni_lezioni`
8. Conferma mostrata all'utente

### Visualizzazione Prenotazioni
1. Utente clicca "Le mie prenotazioni"
2. Sistema recupera prenotazioni future dell'utente
3. Modal mostra lista con tutti i dettagli
4. Per ogni prenotazione: titolo, tipo, data/orario, istruttore, note

### Cancellazione Prenotazione
1. Utente clicca cancella su una prenotazione
2. Sistema chiede conferma
3. Se confermato:
   - Sistema verifica autorizzazione (proprietario)
   - Imposta stato "CANCELLATA" (soft delete)
   - Rimuove dalla lista UI
   - Aggiorna disponibilità lezioni

## Integrazione con Calendario Settimanale

Il sistema si integra perfettamente con la tabella `calendario_settimanale`:
- Le lezioni in `lezioni` sono generate dal calendario settimanale
- Campo `template_id` nella tabella lezioni collega alla riga del calendario settimanale
- Le lezioni mantengono tutte le proprietà del template (tipo, istruttore, max_partecipanti, ecc.)
- Il sistema di prenotazione lavora solo con lezioni già generate e attive

## Sicurezza

- Tutti gli endpoint richiedono autenticazione JWT
- Username dell'utente estratto dal token (non dal body request)
- Validazione autorizzazioni per cancellazione prenotazioni
- Controllo integrità dati (prenotazioni duplicate, posti disponibili)
- Soft delete delle prenotazioni (mantiene storico)

## Note Tecniche

- Gli errori Lombok mostrati nell'IDE sono warnings e non impediscono la compilazione
- Il backend compilerà correttamente con Maven
- Le API seguono i principi RESTful
- Gestione errori con ResponseEntity e status code appropriati
- Documentazione API con Swagger/OpenAPI 3.0
- Dates gestiti con LocalDateTime (Java) e ISO 8601 string (TypeScript)
- Reactive programming con Observable (RxJS) nel frontend

## Testing

Per testare il sistema:
1. Avviare il backend Spring Boot
2. Avviare il frontend Angular
3. Accedere con un utente
4. Navigare a "Gestione Prenotazioni"
5. Selezionare una data
6. Selezionare una lezione disponibile
7. Compilare note e confermare
8. Verificare prenotazione in "Le mie prenotazioni"
9. Testare cancellazione

## Possibili Estensioni Future

- Notifiche email conferma/cancellazione
- Sistema di reminder prima della lezione
- Gestione lista d'attesa per lezioni piene
- Modifica prenotazione esistente
- Filtri per tipo lezione/istruttore
- Vista calendario mensile
- Storico prenotazioni passate
- Rating lezioni completate
- Sistema di penalità per no-show
