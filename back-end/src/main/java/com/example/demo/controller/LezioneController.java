package com.example.demo.controller;

import com.example.demo.dto.LezioneDto;
import com.example.demo.enums.TipoLezione;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.BindingException;
import com.example.demo.service.LezioneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/lezioni")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class LezioneController {

    private final LezioneService lezioneService;

    @GetMapping
    public ResponseEntity<List<LezioneDto>> getAllLezioni() {
        log.info("GET /api/lezioni - Recupero tutte le lezioni");
        List<LezioneDto> lezioni = lezioneService.getAllLezioni();
        return ResponseEntity.ok(lezioni);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LezioneDto> getLezioneById(@PathVariable Long id) throws NotFoundException {
        log.info("GET /api/lezioni/{} - Recupero lezione per ID", id);
        LezioneDto lezione = lezioneService.getLezioneById(id);
        return ResponseEntity.ok(lezione);
    }

    @GetMapping("/range")
    public ResponseEntity<List<LezioneDto>> getLezioniByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInizio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFine) {
        log.info("GET /api/lezioni/range - Range: {} to {}", dataInizio, dataFine);
        List<LezioneDto> lezioni = lezioneService.getLezioniByDateRange(dataInizio, dataFine);
        return ResponseEntity.ok(lezioni);
    }

    @GetMapping("/istruttore")
    public ResponseEntity<List<LezioneDto>> getLezioniByIstruttore(@RequestParam String istruttore) {
        log.info("GET /api/lezioni/istruttore - Istruttore: {}", istruttore);
        List<LezioneDto> lezioni = lezioneService.getLezioniByIstruttore(istruttore);
        return ResponseEntity.ok(lezioni);
    }

    @GetMapping("/tipo")
    public ResponseEntity<List<LezioneDto>> getLezioniByTipo(@RequestParam TipoLezione tipoLezione) {
        log.info("GET /api/lezioni/tipo - Tipo: {}", tipoLezione);
        List<LezioneDto> lezioni = lezioneService.getLezioniByTipo(tipoLezione);
        return ResponseEntity.ok(lezioni);
    }

    @PostMapping
    public ResponseEntity<LezioneDto> createLezione(@Valid @RequestBody LezioneDto lezioneDto) throws BindingException {
        log.info("POST /api/lezioni - Creazione lezione: {}", lezioneDto.getTitolo());
        LezioneDto createdLezione = lezioneService.createLezione(lezioneDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLezione);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LezioneDto> updateLezione(
            @PathVariable Long id, 
            @Valid @RequestBody LezioneDto lezioneDto) throws NotFoundException, BindingException {
        log.info("PUT /api/lezioni/{} - Aggiornamento lezione", id);
        LezioneDto updatedLezione = lezioneService.updateLezione(id, lezioneDto);
        return ResponseEntity.ok(updatedLezione);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatusLezione(@PathVariable Long id) throws NotFoundException, BindingException {
        log.info("PATCH /api/lezioni/{}/toggle-status - Toggle status lezione", id);
        lezioneService.toggleStatusLezione(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLezione(@PathVariable Long id) throws NotFoundException {
        log.info("DELETE /api/lezioni/{} - Eliminazione definitiva lezione", id);
        lezioneService.deleteLezione(id);
        return ResponseEntity.noContent().build();
    }
}
