package com.example.demo.controller;

import com.example.demo.service.LezioneGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/lezioni/genera")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class LezioneGeneratorController {

    private final LezioneGeneratorService generatorService;

    @PostMapping("/periodo")
    public ResponseEntity<Map<String, Object>> generaLezioniPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInizio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFine) {
        
        log.info("POST /api/lezioni/genera/periodo - Dal {} al {}", dataInizio, dataFine);
        int lezioniGenerate = generatorService.generaLezioniDaCalendario(dataInizio, dataFine);
        
        return ResponseEntity.ok(Map.of(
            "message", "Lezioni generate con successo",
            "lezioniGenerate", lezioniGenerate,
            "dataInizio", dataInizio,
            "dataFine", dataFine
        ));
    }

    @PostMapping("/mese-corrente")
    public ResponseEntity<Map<String, Object>> generaLezioniMeseCorrente() {
        log.info("POST /api/lezioni/genera/mese-corrente");
        int lezioniGenerate = generatorService.generaLezioniMeseCorrente();
        
        return ResponseEntity.ok(Map.of(
            "message", "Lezioni del mese corrente generate con successo",
            "lezioniGenerate", lezioniGenerate
        ));
    }

    @PostMapping("/prossimi-giorni")
    public ResponseEntity<Map<String, Object>> generaLezioniProssimiGiorni(
            @RequestParam(defaultValue = "30") int giorni) {
        
        log.info("POST /api/lezioni/genera/prossimi-giorni - Giorni: {}", giorni);
        int lezioniGenerate = generatorService.generaLezioniProssimiGiorni(giorni);
        
        return ResponseEntity.ok(Map.of(
            "message", "Lezioni generate con successo",
            "lezioniGenerate", lezioniGenerate,
            "giorni", giorni
        ));
    }

    @PostMapping("/settimana")
    public ResponseEntity<Map<String, Object>> generaLezioniSettimana(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInizioSettimana) {
        
        log.info("POST /api/lezioni/genera/settimana - Data inizio: {}", dataInizioSettimana);
        int lezioniGenerate = generatorService.generaLezioniSettimana(dataInizioSettimana);
        
        return ResponseEntity.ok(Map.of(
            "message", "Lezioni della settimana generate con successo",
            "lezioniGenerate", lezioniGenerate,
            "dataInizioSettimana", dataInizioSettimana
        ));
    }

    @DeleteMapping("/future-non-prenotate")
    public ResponseEntity<Map<String, Object>> eliminaLezioniFutureNonPrenotate() {
        log.info("DELETE /api/lezioni/genera/future-non-prenotate");
        int lezioniEliminate = generatorService.eliminaLezioniFutureNonPrenotate();
        
        return ResponseEntity.ok(Map.of(
            "message", "Lezioni future non prenotate eliminate con successo",
            "lezioniEliminate", lezioniEliminate
        ));
    }

    @PostMapping("/rigenera")
    public ResponseEntity<Map<String, Object>> rigeneraLezioni(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInizio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFine) {
        
        log.info("POST /api/lezioni/genera/rigenera - Dal {} al {}", dataInizio, dataFine);
        int lezioniGenerate = generatorService.rigeneraLezioni(dataInizio, dataFine);
        
        return ResponseEntity.ok(Map.of(
            "message", "Lezioni rigenerate con successo",
            "lezioniGenerate", lezioniGenerate,
            "dataInizio", dataInizio,
            "dataFine", dataFine
        ));
    }
}
