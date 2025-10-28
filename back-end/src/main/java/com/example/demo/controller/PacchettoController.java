package com.example.demo.controller;

import com.example.demo.entity.Pacchetto;
import com.example.demo.repository.PacchettoRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.SneakyThrows;
import lombok.extern.java.Log;
import com.example.demo.services.PacchettoService;
import com.example.demo.exceptions.NotFoundException;

@RestController
@RequestMapping("/api/pacchetti")
@CrossOrigin(origins = "*")
@Log
@Tag(name = "Pacchetti", description = "Gestione dei pacchetti di formazione")
public class PacchettoController {

    @Autowired
    private PacchettoService pacchettoService;

    @Autowired
    private PacchettoRepository pacchettoRepository;

    @Operation(summary = "Crea un nuovo pacchetto", description = "Inserisce un nuovo pacchetto associato a una piattaforma di formazione esistente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pacchetto creato con successo", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Pacchetto.class))),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi"),
            @ApiResponse(responseCode = "404", description = "Piattaforma non trovata"),
            @ApiResponse(responseCode = "409", description = "Pacchetto già esistente (codice pacchetto duplicato)")
    })


    @PostMapping(value = "/inserisci", produces = "application/json")
    public ResponseEntity<InfoMsg> createPacchetto(@RequestBody Pacchetto pacchetto) {
        log.info("Salviamo il pacchetto: " + pacchetto.getNome());

        pacchettoService.InsPacchetto(pacchetto);

        return new ResponseEntity<InfoMsg>(new InfoMsg(LocalDate.now(),
                "Inserimento Pacchetto eseguito con successo!"), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Elimina un pacchetto", description = "Rimuove un pacchetto dal sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Pacchetto eliminato con successo"),
            @ApiResponse(responseCode = "404", description = "Pacchetto non trovato"),
            @ApiResponse(responseCode = "409", description = "Impossibile eliminare pacchetto con assegnazioni attive")
    })
    public ResponseEntity<?> deletePacchetto(
            @Parameter(description = "ID del pacchetto da eliminare", required = true)
            @PathVariable Long id) {

        pacchettoService.deletePacchetto(id);
        return ResponseEntity.noContent().build();
    }

    @SneakyThrows
    @GetMapping(value = "/lista", produces = "application/json")
    public ResponseEntity<List<Pacchetto>> getAllPacchetti() {
        log.info("****** Otteniamo i Pacchetti *******");

        List<Pacchetto> pacchetti = pacchettoService.SelAllPacchetti();

        if(pacchetti.isEmpty()) {
            String ErrMsg = String.format("Nessun pacchetto disponibile a sistema.");

            log.warning(ErrMsg);
            
            throw new NotFoundException(ErrMsg);
        }

        return new ResponseEntity<List<Pacchetto>>(pacchetti, HttpStatus.OK);
    }

    @Operation(summary = "Recupera un pacchetto per ID", description = "Restituisce i dettagli completi di un pacchetto specifico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pacchetto trovato", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Pacchetto.class))),
            @ApiResponse(responseCode = "404", description = "Pacchetto non trovato")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Pacchetto> getPacchettoById(
            @Parameter(description = "ID del pacchetto da recuperare", required = true) @PathVariable Long id) {

        Optional<Pacchetto> pacchetto = pacchettoRepository.findById(id);
        return pacchetto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Aggiorna un pacchetto esistente", description = "Modifica i dati di un pacchetto esistente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pacchetto aggiornato con successo"),
            @ApiResponse(responseCode = "404", description = "Pacchetto non trovato"),
            @ApiResponse(responseCode = "400", description = "Dati richiesta non validi")
    })
    //PUT update platform
    @PutMapping("/modifica/{id}")
    public ResponseEntity<InfoMsg> updatePacchetto(@PathVariable Long id,
            @RequestBody Pacchetto pacchettoDetails) {
        Optional<Pacchetto> optionalPacchetto = pacchettoRepository.findById(id);

        if (optionalPacchetto.isPresent()) {
            Pacchetto pacchetto = optionalPacchetto.get();
            pacchetto.setNome(pacchettoDetails.getNome());
            pacchetto.setDescrizione(pacchettoDetails.getDescrizione());
            pacchetto.setCategoria(pacchettoDetails.getCategoria());
            pacchetto.setLivello(pacchettoDetails.getLivello());
            pacchetto.setDurataMinuti(pacchettoDetails.getDurataMinuti());
            pacchetto.setMaxPartecipanti(pacchettoDetails.getMaxPartecipanti());
            pacchetto.setPrezzo(pacchettoDetails.getPrezzo());
            pacchetto.setAttivo(pacchettoDetails.getAttivo());

            pacchettoRepository.save(pacchetto);
            return new ResponseEntity<InfoMsg>(new InfoMsg(LocalDate.now(),
                "Modifica Pacchetto eseguita con successo!"), HttpStatus.CREATED);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}