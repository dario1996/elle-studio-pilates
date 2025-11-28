package com.example.demo.controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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
import com.example.demo.entity.PrenotazioneLezione;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.LezioneRepository;
import com.example.demo.repository.PrenotazioneLezioneRepository;
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
    private final PrenotazioneLezioneRepository prenotazioneRepository;

    public DashboardController(final LezioneService lezioneService,
                              final UtenteRepository utenteRepository,
                              final LezioneRepository lezioneRepository,
                              final PrenotazioneLezioneRepository prenotazioneRepository) {
        this.lezioneService = lezioneService;
        this.utenteRepository = utenteRepository;
        this.lezioneRepository = lezioneRepository;
        this.prenotazioneRepository = prenotazioneRepository;
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
            
            // Recupera tutte le prenotazioni dell'utente (sia dalle lezioni che dalle prenotazioni)
            List<Lezione> lezioniPartecipante = lezioneRepository.findLezioniPrenotateByUsername(username);
            List<PrenotazioneLezione> prenotazioni = prenotazioneRepository.findByUtenteOrderByDataLezioneAsc(utente);
            
            // Combina le due liste per avere tutte le lezioni dell'utente
            List<LocalDateTime> tutteDataOreLezioni = new ArrayList<>();
            
            // Aggiungi le lezioni dove l'utente è partecipante
            for (Lezione l : lezioniPartecipante) {
                tutteDataOreLezioni.add(l.getDataInizio());
            }
            
            // Aggiungi le prenotazioni confermate
            for (PrenotazioneLezione p : prenotazioni) {
                if (p.getStato() == PrenotazioneLezione.StatoPrenotazione.CONFERMATA) {
                    tutteDataOreLezioni.add(LocalDateTime.of(p.getDataLezione(), p.getOraInizio()));
                }
            }
            
            // Filtra le lezioni future e ordina
            List<LocalDateTime> lezioniFuture = tutteDataOreLezioni.stream()
                .filter(dt -> dt.isAfter(oggi))
                .sorted()
                .toList();
            
            // Calcola lezioni completate (nel passato)
            int lezioniCompletate = (int) tutteDataOreLezioni.stream()
                .filter(dt -> dt.isBefore(oggi))
                .count();
            
            // Determina la prossima lezione
            DashboardStatisticheDto.ProssimaLezioneDto prossimaLezione = null;
            if (!lezioniFuture.isEmpty()) {
                LocalDateTime prossimaDataOra = lezioniFuture.get(0);
                
                // Cerca i dettagli della prossima lezione sia nelle lezioni che nelle prenotazioni
                String tipoLezione = "";
                LocalTime oraFine = prossimaDataOra.toLocalTime().plusHours(1); // default 1 ora
                
                // Cerca prima nelle prenotazioni
                for (PrenotazioneLezione p : prenotazioni) {
                    LocalDateTime dataOraPrenotazione = LocalDateTime.of(p.getDataLezione(), p.getOraInizio());
                    if (dataOraPrenotazione.equals(prossimaDataOra) && 
                        p.getStato() == PrenotazioneLezione.StatoPrenotazione.CONFERMATA) {
                        tipoLezione = p.getTipoLezione();
                        oraFine = p.getOraFine();
                        break;
                    }
                }
                
                // Se non trovata nelle prenotazioni, cerca nelle lezioni
                if (tipoLezione.isEmpty()) {
                    for (Lezione l : lezioniPartecipante) {
                        if (l.getDataInizio().equals(prossimaDataOra)) {
                            tipoLezione = l.getTipoLezione().name();
                            oraFine = l.getDataFine().toLocalTime();
                            break;
                        }
                    }
                }
                
                prossimaLezione = new DashboardStatisticheDto.ProssimaLezioneDto(
                    prossimaDataOra.toLocalDate(),
                    prossimaDataOra.toLocalTime(),
                    oraFine,
                    tipoLezione,
                    "CONFERMATA"
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
