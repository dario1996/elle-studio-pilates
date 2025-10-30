package com.example.demo.controller;

import com.example.demo.dto.LezioneDisponibileDto;
import com.example.demo.dto.PrenotazioneLezioneRequest;
import com.example.demo.dto.PrenotazioneLezioneResponse;
import com.example.demo.entity.CalendarioSettimanale;
import com.example.demo.entity.Pacchetto;
import com.example.demo.service.PrenotazioneLezioneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/prenotazioni")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Prenotazioni Lezioni", description = "API per la gestione delle prenotazioni delle lezioni")
public class PrenotazioneLezioneController {

    private final PrenotazioneLezioneService prenotazioneService;

    @GetMapping("/tipi-lezione")
    @Operation(summary = "Recupera tipi di lezione disponibili", 
               description = "Restituisce l'elenco dei tipi di lezione dal calendario settimanale")
    public ResponseEntity<List<CalendarioSettimanale>> getTipiLezioneDisponibili() {
        log.info("GET /api/prenotazioni/tipi-lezione");
        
        List<CalendarioSettimanale> tipi = prenotazioneService.getTipiLezioneDisponibili();
        return ResponseEntity.ok(tipi);
    }

    @GetMapping("/pacchetti-utente")
    @Operation(summary = "Recupera pacchetti acquistati dall'utente", 
               description = "Restituisce l'elenco dei pacchetti acquistati e pagati dall'utente autenticato")
    public ResponseEntity<List<Pacchetto>> getPacchettiUtente(Authentication authentication) {
        log.info("GET /api/prenotazioni/pacchetti-utente");
        
        String username = authentication.getName();
        log.info("Username autenticato: {}", username);
        
        List<Pacchetto> pacchetti = prenotazioneService.getPacchettiAcquistatiUtente(username);
        log.info("Numero pacchetti trovati: {}", pacchetti.size());
        
        return ResponseEntity.ok(pacchetti);
    }

    @GetMapping("/tipi-lezione/pacchetto/{pacchettoId}")
    @Operation(summary = "Recupera tipi di lezione per pacchetto", 
               description = "Restituisce l'elenco dei tipi di lezione filtrati per categoria del pacchetto")
    public ResponseEntity<List<CalendarioSettimanale>> getTipiLezionePerPacchetto(
            @PathVariable @Parameter(description = "ID del pacchetto") Long pacchettoId) {
        
        log.info("GET /api/prenotazioni/tipi-lezione/pacchetto/{}", pacchettoId);
        
        List<CalendarioSettimanale> tipi = prenotazioneService.getTipiLezionePerPacchetto(pacchettoId);
        return ResponseEntity.ok(tipi);
    }

    @GetMapping("/lezioni-per-template/{templateId}")
    @Operation(summary = "Recupera lezioni per tipo", 
               description = "Restituisce l'elenco delle lezioni disponibili per un tipo specifico in un range di date")
    public ResponseEntity<List<LezioneDisponibileDto>> getLezioniPerTemplate(
            @PathVariable @Parameter(description = "ID del template dal calendario settimanale") Long templateId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
            @Parameter(description = "Data inizio nel formato yyyy-MM-dd") LocalDate dataInizio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
            @Parameter(description = "Data fine nel formato yyyy-MM-dd") LocalDate dataFine) {
        
        log.info("GET /api/prenotazioni/lezioni-per-template/{} - Range: {} - {}", templateId, dataInizio, dataFine);
        
        List<LezioneDisponibileDto> lezioni = prenotazioneService.getLezioniPerTemplate(templateId, dataInizio, dataFine);
        return ResponseEntity.ok(lezioni);
    }

    @GetMapping("/lezioni-disponibili")
    @Operation(summary = "Recupera lezioni disponibili", 
               description = "Restituisce l'elenco delle lezioni disponibili per un range di date")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lezioni recuperate con successo"),
        @ApiResponse(responseCode = "400", description = "Parametri non validi")
    })
    public ResponseEntity<List<LezioneDisponibileDto>> getLezioniDisponibili(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
            @Parameter(description = "Data inizio nel formato yyyy-MM-dd") LocalDate dataInizio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
            @Parameter(description = "Data fine nel formato yyyy-MM-dd") LocalDate dataFine) {
        
        log.info("GET /api/prenotazioni/lezioni-disponibili - Range: {} - {}", dataInizio, dataFine);
        
        List<LezioneDisponibileDto> lezioni = prenotazioneService.getLezioniDisponibili(dataInizio, dataFine);
        return ResponseEntity.ok(lezioni);
    }

    @GetMapping("/lezioni-disponibili/{data}")
    @Operation(summary = "Recupera lezioni disponibili per una data specifica", 
               description = "Restituisce l'elenco delle lezioni disponibili per una singola data")
    public ResponseEntity<List<LezioneDisponibileDto>> getLezioniDisponibiliPerData(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) 
            @Parameter(description = "Data nel formato yyyy-MM-dd") LocalDate data) {
        
        log.info("GET /api/prenotazioni/lezioni-disponibili/{}", data);
        
        List<LezioneDisponibileDto> lezioni = prenotazioneService.getLezioniDisponibiliPerData(data);
        return ResponseEntity.ok(lezioni);
    }

    @GetMapping("/lezione/{lezioneId}/disponibilita")
    @Operation(summary = "Verifica disponibilità di una lezione", 
               description = "Restituisce i dettagli di disponibilità per una specifica lezione")
    public ResponseEntity<LezioneDisponibileDto> verificaDisponibilitaLezione(
            @PathVariable @Parameter(description = "ID della lezione") Long lezioneId) {
        
        log.info("GET /api/prenotazioni/lezione/{}/disponibilita", lezioneId);
        
        LezioneDisponibileDto lezione = prenotazioneService.verificaDisponibilitaLezione(lezioneId);
        return ResponseEntity.ok(lezione);
    }

    @PostMapping
    @Operation(summary = "Crea una prenotazione", 
               description = "Crea una nuova prenotazione per l'utente autenticato")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Prenotazione creata con successo"),
        @ApiResponse(responseCode = "400", description = "Dati della richiesta non validi"),
        @ApiResponse(responseCode = "409", description = "Prenotazione già esistente o posti esauriti")
    })
    public ResponseEntity<?> creaPrenotazione(
            @Valid @RequestBody PrenotazioneLezioneRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("POST /api/prenotazioni - Utente: {}, Lezione: {}", username, request.getLezioneId());
        
        try {
            PrenotazioneLezioneResponse response = prenotazioneService.creaPrenotazione(username, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Errore durante la creazione della prenotazione: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/mie-prenotazioni")
    @Operation(summary = "Recupera le prenotazioni dell'utente", 
               description = "Restituisce tutte le prenotazioni attive dell'utente autenticato")
    public ResponseEntity<List<PrenotazioneLezioneResponse>> getMiePrenotazioni(
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("GET /api/prenotazioni/mie-prenotazioni - Utente: {}", username);
        
        List<PrenotazioneLezioneResponse> prenotazioni = prenotazioneService.getPrenotazioniUtente(username);
        return ResponseEntity.ok(prenotazioni);
    }

    @GetMapping("/mie-prenotazioni/future")
    @Operation(summary = "Recupera le prenotazioni future dell'utente", 
               description = "Restituisce le prenotazioni future dell'utente autenticato")
    public ResponseEntity<List<PrenotazioneLezioneResponse>> getMiePrenotazioniFuture(
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("GET /api/prenotazioni/mie-prenotazioni/future - Utente: {}", username);
        
        List<PrenotazioneLezioneResponse> prenotazioni = prenotazioneService.getPrenotazioniFutureUtente(username);
        return ResponseEntity.ok(prenotazioni);
    }

    @DeleteMapping("/{prenotazioneId}")
    @Operation(summary = "Cancella una prenotazione", 
               description = "Cancella una prenotazione dell'utente autenticato")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Prenotazione cancellata con successo"),
        @ApiResponse(responseCode = "404", description = "Prenotazione non trovata"),
        @ApiResponse(responseCode = "403", description = "Non autorizzato a cancellare questa prenotazione")
    })
    public ResponseEntity<?> cancellaPrenotazione(
            @PathVariable @Parameter(description = "ID della prenotazione") Long prenotazioneId,
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("DELETE /api/prenotazioni/{} - Utente: {}", prenotazioneId, username);
        
        try {
            prenotazioneService.cancellaPrenotazione(username, prenotazioneId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Errore durante la cancellazione della prenotazione: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Classe di supporto per le risposte di errore
     */
    private record ErrorResponse(String message) {}
}
