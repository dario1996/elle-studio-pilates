package com.example.demo.controller;

import com.example.demo.dto.LezioneDto;
import com.example.demo.service.LezioneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class DashboardController {

    private final LezioneService lezioneService;

    @GetMapping("/appuntamenti-oggi")
    public ResponseEntity<List<LezioneDto>> getAppuntamentiOggi() {
        log.info("Richiesta appuntamenti di oggi dalla dashboard");
        try {
            List<LezioneDto> appuntamenti = lezioneService.getLezioniOggiDaOraCorrente();
            log.info("Restituiti {} appuntamenti per oggi", appuntamenti.size());
            return ResponseEntity.ok(appuntamenti);
        } catch (Exception e) {
            log.error("Errore nel recupero appuntamenti di oggi", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
