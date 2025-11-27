package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.DashboardStatisticheDto;
import com.example.demo.dto.LezioneDto;
import com.example.demo.entity.Lezione;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.LezioneRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.service.LezioneService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);

    private final LezioneService lezioneService;
    private final UtenteRepository utenteRepository;
    private final LezioneRepository lezioneRepository;

    public DashboardController(final LezioneService lezioneService,
                              final UtenteRepository utenteRepository,
                              final LezioneRepository lezioneRepository) {
        this.lezioneService = lezioneService;
        this.utenteRepository = utenteRepository;
        this.lezioneRepository = lezioneRepository;
    }

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

    @GetMapping("/statistiche-utente")
    public ResponseEntity<DashboardStatisticheDto> getStatisticheUtente() {
        log.info("Richiesta statistiche dashboard utente");
        try {
            // Recupera l'utente autenticato
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Utenti utente = utenteRepository.findByUsername(username);
            if (utente == null) {
                log.error("Utente non trovato: {}", username);
                return ResponseEntity.notFound().build();
            }
            
            LocalDateTime oggi = LocalDateTime.now();
            
            // Recupera tutte le lezioni prenotate dall'utente
            List<Lezione> tutteLezioni = lezioneRepository.findLezioniPrenotateByUsername(username);
            
            // Filtra le lezioni future
            List<Lezione> lezioniFuture = tutteLezioni.stream()
                .filter(l -> l.getDataInizio().isAfter(oggi))
                .sorted((a, b) -> a.getDataInizio().compareTo(b.getDataInizio()))
                .toList();
            
            // Calcola lezioni completate (nel passato)
            int lezioniCompletate = (int) tutteLezioni.stream()
                .filter(l -> l.getDataInizio().isBefore(oggi))
                .count();
            
            // Determina la prossima lezione
            DashboardStatisticheDto.ProssimaLezioneDto prossimaLezione = null;
            if (!lezioniFuture.isEmpty()) {
                Lezione prima = lezioniFuture.get(0);
                prossimaLezione = new DashboardStatisticheDto.ProssimaLezioneDto(
                    prima.getDataInizio().toLocalDate(),
                    prima.getDataInizio().toLocalTime(),
                    prima.getDataFine().toLocalTime(),
                    prima.getTipoLezione().name(),
                    prima.getAttiva() ? "CONFERMATA" : "CANCELLATA"
                );
            }
            
            // Crea il DTO di risposta usando il totale dalla tabella utenti
            DashboardStatisticheDto statistiche = new DashboardStatisticheDto(
                prossimaLezione,
                utente.getTotaleLezioniPrenotate(), // Usa il totale dalla colonna della tabella utenti
                lezioniCompletate
            );
            
            log.info("Statistiche utente {}: {} prenotate (totale), {} completate", 
                username, utente.getTotaleLezioniPrenotate(), lezioniCompletate);
            
            return ResponseEntity.ok(statistiche);
        } catch (Exception e) {
            log.error("Errore nel recupero statistiche utente", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
