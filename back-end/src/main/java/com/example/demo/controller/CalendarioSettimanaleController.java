package com.example.demo.controller;

import com.example.demo.dto.CalendarioSettimanaleDto;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.service.CalendarioSettimanaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendario-settimanale")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class CalendarioSettimanaleController {

    private final CalendarioSettimanaleService calendarioService;

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
}
