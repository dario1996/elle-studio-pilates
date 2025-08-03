package com.example.demo.controller;

import com.example.demo.entity.Assegnazione;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Dipendente;
import com.example.demo.repository.AssegnazioneRepository;
import com.example.demo.repository.CorsoRepository;
import com.example.demo.repository.DipendenteRepository;
import com.example.demo.service.AssegnazioneBulkImportService;
import com.example.demo.dto.AssegnazioneBulkImportRequest;
import com.example.demo.dto.AssegnazioneBulkImportResponse;
import com.example.demo.dto.CreateMultipleAssegnazioniRequest;
import com.example.demo.dto.MultipleAssegnazionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Tag(name = "Assegnazioni", description = "Gestione delle assegnazioni corsi ai dipendenti")
@Slf4j
public class AssegnazioneController {

    @Autowired
    private AssegnazioneRepository assegnazioneRepository;

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Autowired
    private CorsoRepository corsoRepository;

    @Autowired
    private AssegnazioneBulkImportService assegnazioneBulkImportService;

    @Operation(summary = "Assegna un corso a un dipendente", description = "Crea una nuova assegnazione collegando un dipendente specifico a un corso specifico. "
            +
            "Lo stato iniziale sarà DA_INIZIARE e la data di assegnazione sarà quella corrente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Assegnazione creata con successo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Assegnazione.class))),
            @ApiResponse(responseCode = "404", description = "Dipendente o corso non trovato"),
            @ApiResponse(responseCode = "409", description = "Assegnazione già esistente per questo dipendente e corso")
    })
    @PostMapping("/dipendenti/{dipendenteId}/corsi/{corsoId}")
    public ResponseEntity<?> assignCorsoToDipendente(
            @Parameter(description = "ID del dipendente a cui assegnare il corso", required = true) @PathVariable Long dipendenteId,
            @Parameter(description = "ID del corso da assegnare", required = true) @PathVariable Long corsoId,
            @Parameter(description = "Se il corso è obbligatorio per il dipendente") @RequestParam(required = false, defaultValue = "false") boolean obbligatorio) {

        // Verifica esistenza dipendente
        Optional<Dipendente> dipendente = dipendenteRepository.findById(dipendenteId);
        if (!dipendente.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Dipendente non trovato con ID: " + dipendenteId);
        }

        // Verifica esistenza corso
        Optional<Corso> corso = corsoRepository.findById(corsoId);
        if (!corso.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Corso non trovato con ID: " + corsoId);
        }

        // Verifica se l'assegnazione esiste già
        if (assegnazioneRepository.existsByDipendenteIdAndCorsoId(dipendenteId, corsoId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Assegnazione già esistente per dipendente " + dipendenteId + " e corso " + corsoId);
        }

        // Crea nuova assegnazione
        Assegnazione assegnazione = new Assegnazione();
        assegnazione.setDipendente(dipendente.get());
        assegnazione.setCorso(corso.get());
        assegnazione.setStato(Assegnazione.StatoAssegnazione.DA_INIZIARE);
        assegnazione.setDataAssegnazione(LocalDate.now());
        assegnazione.setObbligatorio(obbligatorio);

        Assegnazione savedAssegnazione = assegnazioneRepository.save(assegnazione);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAssegnazione);
    }

    @Operation(summary = "Recupera tutte le assegnazioni di un dipendente", description = "Restituisce l'elenco completo dei corsi assegnati a un dipendente specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo", content = @Content(mediaType = "application/json", schema = @Schema(type = "array", implementation = Assegnazione.class))),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @GetMapping("/dipendenti/{dipendenteId}/assegnazioni")
    public ResponseEntity<?> getAssegnazionesByDipendente(
            @Parameter(description = "ID del dipendente", required = true) @PathVariable Long dipendenteId) {

        if (!dipendenteRepository.existsById(dipendenteId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Dipendente non trovato con ID: " + dipendenteId);
        }

        List<Assegnazione> assegnazioni = assegnazioneRepository.findByDipendenteId(dipendenteId);
        return ResponseEntity.ok(assegnazioni);
    }

    @Operation(summary = "Recupera tutte le assegnazioni di un corso", description = "Restituisce l'elenco completo dei dipendenti assegnati a un corso specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo"),
            @ApiResponse(responseCode = "404", description = "Corso non trovato")
    })
    @GetMapping("/corsi/{corsoId}/assegnazioni")
    public ResponseEntity<?> getAssegnazioniByCorso(
            @Parameter(description = "ID del corso", required = true) @PathVariable Long corsoId) {

        if (!corsoRepository.existsById(corsoId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Corso non trovato con ID: " + corsoId);
        }

        List<Assegnazione> assegnazioni = assegnazioneRepository.findByCorsoId(corsoId);
        return ResponseEntity.ok(assegnazioni);
    }

    @Operation(summary = "Recupera una specifica assegnazione", description = "Restituisce i dettagli di una specifica assegnazione tramite il suo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione trovata"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata")
    })
    @GetMapping("/assegnazioni/{assegnazioneId}")
    public ResponseEntity<Assegnazione> getAssegnazioneById(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId) {

        Optional<Assegnazione> assegnazione = assegnazioneRepository.findById(assegnazioneId);
        return assegnazione.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Aggiorna lo stato di un'assegnazione", description = "Modifica lo stato di progresso di un'assegnazione (es. da DA_INIZIARE a IN_CORSO a TERMINATO)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione aggiornata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata"),
            @ApiResponse(responseCode = "400", description = "Stato non valido")
    })
    @PutMapping("/assegnazioni/{assegnazioneId}/stato")
    public ResponseEntity<?> updateAssegnazioneStato(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId,
            @Parameter(description = "Nuovo stato dell'assegnazione", schema = @Schema(allowableValues = { "DA_INIZIARE",
                    "IN_CORSO", "TERMINATO", "INTERROTTO" })) @RequestParam String stato) {

        Optional<Assegnazione> optionalAssegnazione = assegnazioneRepository.findById(assegnazioneId);
        if (!optionalAssegnazione.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Assegnazione.StatoAssegnazione nuovoStato = Assegnazione.StatoAssegnazione.valueOf(stato.toUpperCase());
            Assegnazione assegnazione = optionalAssegnazione.get();
            assegnazione.setStato(nuovoStato);

            // Se terminato, imposta data completamento
            if (nuovoStato == Assegnazione.StatoAssegnazione.TERMINATO) {
                assegnazione.setDataCompletamento(LocalDate.now());
                assegnazione.setPercentualeCompletamento(new java.math.BigDecimal("100.00"));
            }

            // Se iniziato, imposta data inizio
            if (nuovoStato == Assegnazione.StatoAssegnazione.IN_CORSO && assegnazione.getDataInizio() == null) {
                assegnazione.setDataInizio(LocalDate.now());
            }

            Assegnazione updatedAssegnazione = assegnazioneRepository.save(assegnazione);
            return ResponseEntity.ok(updatedAssegnazione);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Stato non valido: " + stato
                            + ". Stati validi: DA_INIZIARE, IN_CORSO, TERMINATO, INTERROTTO");
        }
    }

    @Operation(summary = "Recupera tutte le assegnazioni", description = "Restituisce l'elenco completo delle assegnazioni con possibilità di filtro per stato")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista assegnazioni recuperata con successo")
    })
    @GetMapping("/assegnazioni")
    public ResponseEntity<List<Assegnazione>> getAllAssegnazioni(
            @Parameter(description = "Filtra per stato assegnazione", schema = @Schema(allowableValues = { "DA_INIZIARE",
                    "IN_CORSO", "TERMINATO", "INTERROTTO" })) @RequestParam(required = false) String stato,
            @Parameter(description = "Mostra solo assegnazioni obbligatorie") @RequestParam(required = false, defaultValue = "false") boolean soloObbligatorie,
            @Parameter(description = "Mostra solo assegnazioni che richiedono feedback") @RequestParam(required = false, defaultValue = "false") boolean richiedeFeedback) {

        List<Assegnazione> assegnazioni;

        if (stato != null) {
            try {
                Assegnazione.StatoAssegnazione statoEnum = Assegnazione.StatoAssegnazione.valueOf(stato.toUpperCase());
                assegnazioni = assegnazioneRepository.findByStato(statoEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (soloObbligatorie) {
            assegnazioni = assegnazioneRepository.findByObbligatorioTrue();
        } else if (richiedeFeedback) {
            assegnazioni = assegnazioneRepository.findCompletedAssignmentsRequiringFeedback();
        } else {
            assegnazioni = assegnazioneRepository.findAll();
        }

        return ResponseEntity.ok(assegnazioni);
    }

    @Operation(summary = "Aggiorna un'assegnazione completa", description = "Aggiorna tutti i dettagli di un'assegnazione inclusi stato, percentuale, ore, valutazione e feedback")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assegnazione aggiornata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata"),
            @ApiResponse(responseCode = "400", description = "Dati non validi")
    })
    @PutMapping("/assegnazioni/{assegnazioneId}")
    public ResponseEntity<?> updateAssegnazione(
            @Parameter(description = "ID dell'assegnazione", required = true) @PathVariable Long assegnazioneId,
            @Parameter(description = "Nuovo stato") @RequestParam(required = false) String stato,
            @Parameter(description = "Percentuale completamento (0-100)") @RequestParam(required = false) Integer percentualeCompletamento,
            @Parameter(description = "Ore completate") @RequestParam(required = false) Double oreCompletate,
            @Parameter(description = "Valutazione (1-5)") @RequestParam(required = false) Integer valutazione,
            @Parameter(description = "Note feedback") @RequestParam(required = false) String noteFeedback,
            @Parameter(description = "Competenze acquisite") @RequestParam(required = false) String competenzeAcquisite,
            @Parameter(description = "Certificato ottenuto") @RequestParam(required = false) Boolean certificatoOttenuto,
            @Parameter(description = "Feedback fornito") @RequestParam(required = false) Boolean feedbackFornito,
            @Parameter(description = "Esito") @RequestParam(required = false) String esito,
            @Parameter(description = "Fonte richiesta") @RequestParam(required = false) String fonteRichiesta,
            @Parameter(description = "Impatto ISMS") @RequestParam(required = false) Boolean impattoIsms,
            @Parameter(description = "Attestato") @RequestParam(required = false) Boolean attestato,
            @Parameter(description = "Data inizio") @RequestParam(required = false) String dataInizio,
            @Parameter(description = "Data completamento") @RequestParam(required = false) String dataCompletamento,
            @Parameter(description = "Data termine prevista") @RequestParam(required = false) String dataTerminePrevista,
            @Parameter(description = "Modalità") @RequestParam(required = false) String modalita) {
        Optional<Assegnazione> optionalAssegnazione = assegnazioneRepository.findById(assegnazioneId);
        if (!optionalAssegnazione.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Assegnazione assegnazione = optionalAssegnazione.get();

        try {
            // Aggiorna stato se fornito
            if (stato != null) {
                Assegnazione.StatoAssegnazione nuovoStato = Assegnazione.StatoAssegnazione.valueOf(stato.toUpperCase());
                assegnazione.setStato(nuovoStato);

                // Se terminato, imposta data completamento
                if (nuovoStato == Assegnazione.StatoAssegnazione.TERMINATO) {
                    assegnazione.setDataCompletamento(LocalDate.now());
                    // Se non è stata fornita una percentuale specifica, imposta 100%
                    if (percentualeCompletamento == null) {
                        assegnazione.setPercentualeCompletamento(new java.math.BigDecimal("100.00"));
                    }
                }

                // Se iniziato, imposta data inizio
                if (nuovoStato == Assegnazione.StatoAssegnazione.IN_CORSO && assegnazione.getDataInizio() == null) {
                    assegnazione.setDataInizio(LocalDate.now());
                }
            }

            // Aggiorna percentuale se fornita
            if (percentualeCompletamento != null) {
                if (percentualeCompletamento < 0 || percentualeCompletamento > 100) {
                    return ResponseEntity.badRequest().body("Percentuale completamento deve essere tra 0 e 100");
                }
                assegnazione.setPercentualeCompletamento(new java.math.BigDecimal(percentualeCompletamento));
            }

            // Aggiorna ore completate se fornite
            if (oreCompletate != null) {
                if (oreCompletate < 0) {
                    return ResponseEntity.badRequest().body("Ore completate non possono essere negative");
                }
                assegnazione.setOreCompletate(new java.math.BigDecimal(oreCompletate));
            }

            // Aggiorna valutazione se fornita
            if (valutazione != null) {
                if (valutazione < 1 || valutazione > 5) {
                    return ResponseEntity.badRequest().body("Valutazione deve essere tra 1 e 5");
                }
                assegnazione.setValutazione(new java.math.BigDecimal(valutazione));
            }

            // Aggiorna note feedback se fornite
            if (noteFeedback != null) {
                assegnazione.setNoteFeedback(noteFeedback);
            }

            // Aggiorna competenze acquisite se fornite
            if (competenzeAcquisite != null) {
                assegnazione.setCompetenzeAcquisite(competenzeAcquisite);
            }

            // Aggiorna certificato ottenuto se fornito
            if (certificatoOttenuto != null) {
                assegnazione.setCertificatoOttenuto(certificatoOttenuto);

                // Se ha ottenuto il certificato, segna che ha fornito feedback
                if (certificatoOttenuto) {
                    assegnazione.setFeedbackFornito(true);
                }
            }

            // Aggiorna feedback fornito se fornito
            if (feedbackFornito != null) {
                assegnazione.setFeedbackFornito(feedbackFornito);
            }

            // Aggiorna esito se fornito
            if (esito != null) {
                assegnazione.setEsito(esito);
            }

            // Aggiorna fonte richiesta se fornita
            if (fonteRichiesta != null) {
                assegnazione.setFonteRichiesta(fonteRichiesta);
            }

            // Aggiorna impatto ISMS se fornito
            if (impattoIsms != null) {
                assegnazione.setImpattoIsms(impattoIsms);
            }

            // Aggiorna attestato se fornito
            if (attestato != null) {
                assegnazione.setAttestato(attestato);
            }

            // Aggiorna data inizio se fornita
            if (dataInizio != null) {
                if (dataInizio.isEmpty() || dataInizio.equalsIgnoreCase("null")) {
                    // 🔥 AGGIUNTO: Gestione esplicita per resettare a NULL
                    assegnazione.setDataInizio(null);
                    log.debug("Data inizio resettata a NULL per assegnazione {}", assegnazioneId);
                } else {
                    try {
                        assegnazione.setDataInizio(LocalDate.parse(dataInizio));
                        log.debug("Data inizio aggiornata a {} per assegnazione {}", dataInizio, assegnazioneId);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body("Formato data inizio non valido: " + dataInizio);
                    }
                }
            }

            // Aggiorna data inizio se fornita
            if (dataTerminePrevista != null) {
                if (dataTerminePrevista.isEmpty() || dataTerminePrevista.equalsIgnoreCase("null")) {
                    // 🔥 AGGIUNTO: Gestione esplicita per resettare a NULL
                    assegnazione.setDataTerminePrevista(null);
                    log.debug("Data termine prevista resettata a NULL per assegnazione {}", assegnazioneId);
                } else {
                    try {
                        assegnazione.setDataTerminePrevista(LocalDate.parse(dataTerminePrevista));
                        log.debug("Data termine prevista aggiornata a {} per assegnazione {}", dataTerminePrevista, assegnazioneId);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body("Formato data termine prevista non valido: " + dataTerminePrevista);
                    }
                }
            }

            // Aggiorna data completamento se fornita
            if (dataCompletamento != null) {
                if (dataCompletamento.isEmpty() || dataCompletamento.equalsIgnoreCase("null")) {
                    // 🔥 AGGIUNTO: Gestione esplicita per resettare a NULL
                    assegnazione.setDataCompletamento(null);
                    log.debug("Data completamento resettata a NULL per assegnazione {}", assegnazioneId);
                } else {
                    try {
                        assegnazione.setDataCompletamento(LocalDate.parse(dataCompletamento));
                        log.debug("Data completamento aggiornata a {} per assegnazione {}", dataCompletamento, assegnazioneId);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body("Formato data completamento non valido: " + dataCompletamento);
                    }
                }
            }

            Assegnazione updatedAssegnazione = assegnazioneRepository.save(assegnazione);
            return ResponseEntity.ok(updatedAssegnazione);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Stato non valido: " + stato);
        }
    }

    @Operation(summary = "Elimina un'assegnazione", description = "Rimuove un'assegnazione corso-dipendente dal sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Assegnazione eliminata con successo"),
            @ApiResponse(responseCode = "404", description = "Assegnazione non trovata")
    })
    @DeleteMapping("/assegnazioni/{assegnazioneId}")
    public ResponseEntity<Void> deleteAssegnazione(
            @Parameter(description = "ID dell'assegnazione da eliminare", required = true) @PathVariable Long assegnazioneId) {

        if (!assegnazioneRepository.existsById(assegnazioneId)) {
            return ResponseEntity.notFound().build();
        }

        assegnazioneRepository.deleteById(assegnazioneId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Importazione massiva di assegnazioni",
            description = "Importa multiple assegnazioni da file Excel. Supporta validazione, gestione errori e aggiornamento di assegnazioni esistenti.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Importazione completata",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AssegnazioneBulkImportResponse.class))),
            @ApiResponse(responseCode = "400", description = "Richiesta non valida"),
            @ApiResponse(responseCode = "500", description = "Errore interno del server")
    })
    @PostMapping("/assegnazioni/bulk-import")
    public ResponseEntity<AssegnazioneBulkImportResponse> bulkImportAssegnazioni(
            @RequestBody AssegnazioneBulkImportRequest request) {

        try {
            // Debug logging per tracciare la richiesta ricevuta
            log.info("Bulk import request received with {} items", request.getAssegnazioni().size());
            log.debug("Bulk import options: {}", request.getOptions());
            
            // Log dei primi elementi per debug
            if (!request.getAssegnazioni().isEmpty()) {
                var firstItem = request.getAssegnazioni().get(0);
                log.debug("First item sample: nominativo={}, corso={}, argomento={}", 
                         firstItem.getNominativo(), firstItem.getCorso(), firstItem.getArgomento());
            }
            
            AssegnazioneBulkImportResponse response = assegnazioneBulkImportService.importAssegnazioni(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during bulk import", e);

            AssegnazioneBulkImportResponse errorResponse = new AssegnazioneBulkImportResponse();
            errorResponse.setTotalProcessed(0);
            errorResponse.setSuccessCount(0);
            errorResponse.setErrorCount(1);
            errorResponse.setUpdatedCount(0);

            List<AssegnazioneBulkImportResponse.BulkImportError> errors = new ArrayList<>();
            errors.add(new AssegnazioneBulkImportResponse.BulkImportError(
                    0, "Errore generale: " + e.getMessage()));
            errorResponse.setErrors(errors);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "Assegnazione multipla", description = "Crea multiple assegnazioni per più dipendenti verso un singolo corso")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Assegnazioni create con successo"),
            @ApiResponse(responseCode = "400", description = "Richiesta non valida"),
            @ApiResponse(responseCode = "404", description = "Dipendente o corso non trovato")
    })
    @PostMapping("/assegnazioni/assegnazioneMultipla")
    public ResponseEntity<?> createMultipleAssegnazioni(@RequestBody CreateMultipleAssegnazioniRequest request) {
        try {
            List<Assegnazione> assegnazioniCreate = new ArrayList<>();
            List<String> errori = new ArrayList<>();
            
            // Logica per gestire N:M assegnazioni
            for (Long dipendenteId : request.getDipendentiIds()) {
                for (Long corsoId : request.getCorsiIds()) {
                    try {
                        // Verifica esistenza dipendente e corso
                        Optional<Dipendente> dipendente = dipendenteRepository.findById(dipendenteId);
                        Optional<Corso> corso = corsoRepository.findById(corsoId);
                        
                        if (!dipendente.isPresent() || !corso.isPresent()) {
                            continue;
                        }
                        
                        // Verifica duplicati
                        if (assegnazioneRepository.existsByDipendenteIdAndCorsoId(dipendenteId, corsoId)) {
                            errori.add("Assegnazione già esistente per dipendente " + dipendenteId + " e corso " + corsoId);
                            continue;
                        }
                        
                        // Crea assegnazione
                        Assegnazione assegnazione = new Assegnazione();
                        assegnazione.setDipendente(dipendente.get());
                        assegnazione.setCorso(corso.get());
                        assegnazione.setStato(Assegnazione.StatoAssegnazione.DA_INIZIARE);
                        assegnazione.setDataAssegnazione(LocalDate.now());
                        assegnazione.setObbligatorio(request.isObbligatorio());
                        assegnazione.setImpattoIsms(request.isObbligatorio());
                        
                        if (request.getDataTerminePrevista() != null && !request.getDataTerminePrevista().isEmpty()) {
                            try {
                                assegnazione.setDataTerminePrevista(LocalDate.parse(request.getDataTerminePrevista()));
                            } catch (Exception e) {
                                log.warn("Formato data termine prevista non valido: {}", request.getDataTerminePrevista());
                            }
                        }
                        
                        Assegnazione savedAssegnazione = assegnazioneRepository.save(assegnazione);
                        assegnazioniCreate.add(savedAssegnazione);
                        
                    } catch (Exception e) {
                        errori.add("Errore durante la creazione dell'assegnazione per dipendente " + dipendenteId + " e corso " + corsoId + ": " + e.getMessage());
                    }
                }
            }
            
            // Prepara risposta
            MultipleAssegnazionResponse response = new MultipleAssegnazionResponse();
            response.setAssegnazioniCreate(assegnazioniCreate);
            response.setErrori(errori);
            response.setTotaleRichieste(request.getDipendentiIds().size() * request.getCorsiIds().size());
            response.setTotaleCreate(assegnazioniCreate.size());
            response.setTotaleErrori(errori.size());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Errore durante l'assegnazione multipla", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore interno del server: " + e.getMessage());
        }
    }
}