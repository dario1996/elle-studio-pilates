package com.example.demo.controller;

import com.example.demo.dto.CalendarioSettimanaleDto;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.service.CalendarioSettimanaleService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendario-settimanale")
@CrossOrigin(origins = "http://localhost:4200")
public class CalendarioSettimanaleController {

    private static final Logger log = LoggerFactory.getLogger(CalendarioSettimanaleController.class);

    private final CalendarioSettimanaleService calendarioService;

    public CalendarioSettimanaleController(final CalendarioSettimanaleService calendarioService) {
        this.calendarioService = calendarioService;
    }

    @GetMapping
    public ResponseEntity<List<CalendarioSettimanaleDto>> getAllCalendario() {
        log.info("GET /api/calendario-settimanale - Recupero tutto il calendario");
        List<CalendarioSettimanaleDto> calendario = calendarioService.getAllCalendario();
        return ResponseEntity.ok(calendario);
    }

    @GetMapping("/attivo")
    public ResponseEntity<List<CalendarioSettimanaleDto>> getAllCalendarioAttivo() {
        log.info("GET /api/calendario-settimanale/attivo - Recupero calendario attivo");
        List<CalendarioSettimanaleDto> calendario = calendarioService.getAllCalendarioAttivo();
        return ResponseEntity.ok(calendario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarioSettimanaleDto> getCalendarioById(@PathVariable Long id) throws NotFoundException {
        log.info("GET /api/calendario-settimanale/{} - Recupero voce calendario", id);
        CalendarioSettimanaleDto calendario = calendarioService.getCalendarioById(id);
        return ResponseEntity.ok(calendario);
    }

    @GetMapping("/giorno/{giorno}")
    public ResponseEntity<List<CalendarioSettimanaleDto>> getCalendarioByGiorno(@PathVariable GiornoSettimana giorno) {
        log.info("GET /api/calendario-settimanale/giorno/{} - Recupero calendario per giorno", giorno);
        List<CalendarioSettimanaleDto> calendario = calendarioService.getCalendarioByGiorno(giorno);
        return ResponseEntity.ok(calendario);
    }

    @PostMapping
    public ResponseEntity<CalendarioSettimanaleDto> createCalendario(@Valid @RequestBody CalendarioSettimanaleDto dto) {
        log.info("POST /api/calendario-settimanale - Creazione voce calendario");
        CalendarioSettimanaleDto created = calendarioService.createCalendario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarioSettimanaleDto> updateCalendario(
            @PathVariable Long id,
            @Valid @RequestBody CalendarioSettimanaleDto dto) throws NotFoundException {
        log.info("PUT /api/calendario-settimanale/{} - Aggiornamento voce calendario", id);
        CalendarioSettimanaleDto updated = calendarioService.updateCalendario(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatusCalendario(@PathVariable Long id) throws NotFoundException {
        log.info("PATCH /api/calendario-settimanale/{}/toggle-status", id);
        calendarioService.toggleStatusCalendario(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCalendario(@PathVariable Long id) throws NotFoundException {
        log.info("DELETE /api/calendario-settimanale/{} - Eliminazione voce calendario", id);
        calendarioService.deleteCalendario(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Espande i template del calendario sulle settimane richieste (default 4)
     * Restituisce una lista semplificata di slot con dataInizio/dataFine ISO e riferimenti al templateId
     */
    @GetMapping("/slots")
    public ResponseEntity<List<Map<String, Object>>> getSlots(@RequestParam(value = "weeks", required = false, defaultValue = "4") int weeks) {
        // Calcola range a partire da oggi
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusWeeks(Math.max(1, weeks));

        List<Map<String, Object>> slots = new ArrayList<>();

        List<CalendarioSettimanaleDto> templates = calendarioService.getAllCalendarioAttivo();

        for (CalendarioSettimanaleDto t : templates) {
            // mappa giornoSettimana enum a 1..7 (LUNEDI..DOMENICA)
            int targetDow = t.getGiornoSettimana().ordinal() + 1; // assume enum ordinal in order LUNEDI..DOMENICA

            LocalDate d = start;
            while (!d.isAfter(end)) {
                if (d.getDayOfWeek().getValue() == targetDow) {
                    LocalDateTime dtStart = LocalDateTime.of(d, t.getOraInizio());
                    LocalDateTime dtEnd = LocalDateTime.of(d, t.getOraFine());
                    Map<String, Object> map = new HashMap<>();
                    map.put("templateId", t.getId());
                    map.put("titolo", t.getTitolo());
                    map.put("tipoLezione", t.getTipoLezione());
                    map.put("dataInizio", dtStart.toString());
                    map.put("dataFine", dtEnd.toString());
                    // Al momento non sappiamo quanti partecipanti siano prenotati per l'occorrenza (non materializziamo lezioni),
                    // quindi mostriamo 0 come prenotati e prendiamo il massimo dal template
                    int postiPrenotati = 0;
                    int postiTotali = t.getMaxPartecipanti() != null ? t.getMaxPartecipanti() : 1;
                    int postiDisponibili = Math.max(0, postiTotali - postiPrenotati);
                    map.put("postiPrenotati", postiPrenotati);
                    map.put("postiDisponibili", postiDisponibili);
                    map.put("posti", String.format("%d/%d", postiPrenotati, postiTotali));
                    map.put("maxPartecipanti", postiTotali);
                    map.put("colore", t.getColore());
                    map.put("materializzata", false);
                    slots.add(map);
                }
                d = d.plusDays(1);
            }
        }

        return ResponseEntity.ok(slots);
    }
}
