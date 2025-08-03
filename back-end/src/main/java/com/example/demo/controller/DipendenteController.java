package com.example.demo.controller;

import com.example.demo.dto.DipendenteCreateRequest;
import com.example.demo.dto.DipendenteBulkImportRequest;
import com.example.demo.dto.DipendenteBulkImportResponse;
import com.example.demo.entity.Dipendente;
import com.example.demo.repository.DipendenteRepository;
import com.example.demo.service.DipendenteBulkImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dipendenti")
@CrossOrigin(origins = "*")
@Tag(name = "Dipendenti", description = "Gestione dei dipendenti aziendali")
public class DipendenteController {

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Autowired
    private DipendenteBulkImportService bulkImportService;

    @Operation(summary = "Registra un nuovo dipendente", description = "Crea un nuovo dipendente nel sistema con tutti i dati anagrafici e organizzativi necessari")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Dipendente creato con successo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Dipendente.class))),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi"),
            @ApiResponse(responseCode = "409", description = "Dipendente già esistente (email o codice dipendente duplicati)")
    })
    @PostMapping
    public ResponseEntity<?> createDipendente(
            @Valid @RequestBody @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Dati del dipendente da registrare", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DipendenteCreateRequest.class), examples = @ExampleObject(name = "Esempio dipendente", value = """
                    {
                      "nome": "Mario",
                      "cognome": "Rossi",
                      "email": "mario.rossi@azienda.com",
                      "codiceDipendente": "MR123",
                      "reparto": "IT",
                      "commerciale": "Centro-Nord"
                    }
                    """))) DipendenteCreateRequest request) {

        // Verifica duplicati
        if (dipendenteRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email già esistente: " + request.getEmail());
        }

        if (dipendenteRepository.existsByCodiceDipendente(request.getCodiceDipendente())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Codice dipendente già esistente: " + request.getCodiceDipendente());
        }

        // Crea nuovo dipendente
        Dipendente dipendente = new Dipendente();
        dipendente.setNome(request.getNome());
        dipendente.setCognome(request.getCognome());
        dipendente.setEmail(request.getEmail());
        dipendente.setCodiceDipendente(request.getCodiceDipendente());
        dipendente.setReparto(request.getReparto());
        dipendente.setCommerciale(request.getCommerciale());
        dipendente.setAzienda(request.getAzienda());
        dipendente.setRuolo(request.getRuolo());
        dipendente.setIsms(request.getIsms());
        dipendente.setSede(request.getSede());
        dipendente.setCommunity(request.getCommunity());
        dipendente.setResponsabile(request.getResponsabile());

        Dipendente savedDipendente = dipendenteRepository.save(dipendente);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDipendente);
    }

    @Operation(summary = "Recupera l'elenco completo dei dipendenti", description = "Restituisce tutti i dipendenti registrati con possibilità di filtro per nome, cognome o email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista dipendenti recuperata con successo", content = @Content(mediaType = "application/json", schema = @Schema(type = "array", implementation = Dipendente.class)))
    })
    @GetMapping
    public ResponseEntity<List<Dipendente>> getAllDipendenti(
            @Parameter(description = "Termine di ricerca per filtrare per nome, cognome o email") @RequestParam(required = false) String search,
            @Parameter(description = "Filtro per reparto") @RequestParam(required = false) String reparto,
            @Parameter(description = "Filtro per area commerciale") @RequestParam(required = false) String commerciale,
            @Parameter(description = "Mostra solo dipendenti attivi") @RequestParam(required = false, defaultValue = "true") boolean soloAttivi) {

        List<Dipendente> dipendenti;

        if (search != null && !search.trim().isEmpty()) {
            dipendenti = dipendenteRepository.searchByNameSurnameOrEmail(search.trim());
        } else if (reparto != null && !reparto.trim().isEmpty()) {
            dipendenti = dipendenteRepository.findByRepartoIgnoreCase(reparto.trim());
        } else if (commerciale != null && !commerciale.trim().isEmpty()) {
            dipendenti = dipendenteRepository.findByCommercialeIgnoreCase(commerciale.trim());
        } else if (soloAttivi) {
            dipendenti = dipendenteRepository.findByAttivoTrue();
        } else {
            dipendenti = dipendenteRepository.findAll();
        }

        return ResponseEntity.ok(dipendenti);
    }

    @Operation(summary = "Recupera un dipendente per ID", description = "Restituisce i dettagli completi di un dipendente specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dipendente trovato", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Dipendente.class))),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Dipendente> getDipendenteById(
            @Parameter(description = "ID del dipendente da recuperare", required = true) @PathVariable Long id) {

        Optional<Dipendente> dipendente = dipendenteRepository.findById(id);
        return dipendente.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Recupera un dipendente per codice dipendente", description = "Restituisce i dettagli di un dipendente tramite il suo codice identificativo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dipendente trovato"),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @GetMapping("/codice/{codiceDipendente}")
    public ResponseEntity<Dipendente> getDipendenteByCodice(
            @Parameter(description = "Codice identificativo del dipendente", required = true) @PathVariable String codiceDipendente) {

        Optional<Dipendente> dipendente = dipendenteRepository.findByCodiceDipendente(codiceDipendente);
        return dipendente.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Aggiorna i dati di un dipendente", description = "Modifica i dati anagrafici e organizzativi di un dipendente esistente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dipendente aggiornato con successo"),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato"),
            @ApiResponse(responseCode = "409", description = "Conflitto con dati esistenti")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDipendente(
            @Parameter(description = "ID del dipendente da aggiornare", required = true) @PathVariable Long id,
            @Valid @RequestBody DipendenteCreateRequest request) {

        Optional<Dipendente> optionalDipendente = dipendenteRepository.findById(id);
        if (!optionalDipendente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Dipendente dipendente = optionalDipendente.get();

        // Verifica duplicati (escludendo il dipendente corrente)
        Optional<Dipendente> existingByEmail = dipendenteRepository.findByEmail(request.getEmail());
        if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email già esistente: " + request.getEmail());
        }

        Optional<Dipendente> existingByCodice = dipendenteRepository
                .findByCodiceDipendente(request.getCodiceDipendente());
        if (existingByCodice.isPresent() && !existingByCodice.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Codice dipendente già esistente: " + request.getCodiceDipendente());
        }

        // Aggiorna i campi
        dipendente.setNome(request.getNome());
        dipendente.setCognome(request.getCognome());
        dipendente.setEmail(request.getEmail());
        dipendente.setCodiceDipendente(request.getCodiceDipendente());
        dipendente.setReparto(request.getReparto());
        dipendente.setCommerciale(request.getCommerciale());
        dipendente.setAzienda(request.getAzienda());
        dipendente.setRuolo(request.getRuolo());
        dipendente.setIsms(request.getIsms());
        dipendente.setSede(request.getSede());
        dipendente.setCommunity(request.getCommunity());
        dipendente.setResponsabile(request.getResponsabile());

        Dipendente updatedDipendente = dipendenteRepository.save(dipendente);
        return ResponseEntity.ok(updatedDipendente);
    }

    @Operation(summary = "Disabilita un dipendente", description = "Imposta un dipendente come non attivo (soft delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dipendente disabilitato con successo"),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDipendente(
            @Parameter(description = "ID del dipendente da disabilitare", required = true) @PathVariable Long id) {

        Optional<Dipendente> optionalDipendente = dipendenteRepository.findById(id);
        if (!optionalDipendente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Dipendente dipendente = optionalDipendente.get();
        dipendente.setAttivo(false);
        dipendenteRepository.save(dipendente);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Attiva o disattiva un dipendente", description = "Cambia lo stato attivo/inattivo di un dipendente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stato dipendente cambiato con successo"),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Dipendente> toggleDipendenteStatus(
            @Parameter(description = "ID del dipendente", required = true) @PathVariable Long id) {

        Optional<Dipendente> optionalDipendente = dipendenteRepository.findById(id);
        if (!optionalDipendente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Dipendente dipendente = optionalDipendente.get();
        dipendente.setAttivo(!dipendente.getAttivo());
        Dipendente savedDipendente = dipendenteRepository.save(dipendente);

        return ResponseEntity.ok(savedDipendente);
    }

    @Operation(summary = "Rimuove permanentemente un dipendente", description = "Elimina completamente un dipendente dal sistema (hard delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Dipendente rimosso con successo"),
            @ApiResponse(responseCode = "404", description = "Dipendente non trovato")
    })
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentDeleteDipendente(
            @Parameter(description = "ID del dipendente da rimuovere permanentemente", required = true) @PathVariable Long id) {

        Optional<Dipendente> optionalDipendente = dipendenteRepository.findById(id);
        if (!optionalDipendente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        dipendenteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Importazione massiva di dipendenti", description = "Importa una lista di dipendenti in una singola operazione con validazione e gestione errori")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Importazione completata", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DipendenteBulkImportResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi"),
            @ApiResponse(responseCode = "500", description = "Errore interno del server")
    })
    @PostMapping("/bulk-import")
    public ResponseEntity<DipendenteBulkImportResponse> bulkImport(
            @Valid @RequestBody @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Dati per l'importazione massiva", content = @Content(mediaType = "application/json", schema = @Schema(implementation = DipendenteBulkImportRequest.class), examples = @ExampleObject(name = "Esempio importazione", value = """
                    {
                      "dipendenti": [
                        {
                          "nominativo": "Mario Rossi",
                          "ruolo": "Developer",
                          "azienda": "Proxima S.r.l.",
                          "sede": "Milano",
                          "isms": "Si",
                          "community": "Backend",
                          "responsabile": "Luigi Bianchi"
                        },
                        {
                          "nominativo": "Anna Verdi",
                          "ruolo": "Designer",
                          "azienda": "Proxima S.r.l.",
                          "sede": "Roma",
                          "isms": "No",
                          "community": "Frontend",
                          "responsabile": "Luigi Bianchi"
                        }
                      ],
                      "options": {
                        "skipErrors": true,
                        "updateExisting": false,
                        "defaultReparto": "IT",
                        "defaultCommerciale": "Generale"
                      }
                    }
                    """))) DipendenteBulkImportRequest request) {

        try {
            DipendenteBulkImportResponse response = bulkImportService.bulkImport(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // In caso di errore grave, restituisci una risposta di errore
            DipendenteBulkImportResponse errorResponse = new DipendenteBulkImportResponse();
            errorResponse.setTotalProcessed(request.getDipendenti().size());
            errorResponse.addError(-1, "general", "Errore durante l'importazione: " + e.getMessage(), "");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "Controlla duplicati", description = "Verifica se ci sono duplicati nella lista di dipendenti da importare")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Controllo completato", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi"),
            @ApiResponse(responseCode = "500", description = "Errore interno del server")
    })
    @PostMapping("/check-duplicates")
    public ResponseEntity<?> checkDuplicates(
            @RequestBody @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Lista dipendenti da verificare") 
            java.util.Map<String, Object> request) {

        try {
            @SuppressWarnings("unchecked")
            List<Object> dipendenti = (List<Object>) request.get("dipendenti");
            
            List<java.util.Map<String, Object>> duplicateInfo = bulkImportService.checkDuplicates(dipendenti);
            
            return ResponseEntity.ok(java.util.Map.of(
                "duplicates", duplicateInfo,
                "totalChecked", dipendenti.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Errore durante il controllo duplicati: " + e.getMessage()));
        }
    }
}