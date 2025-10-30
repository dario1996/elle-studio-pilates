package com.example.demo.service;

import com.example.demo.dto.LezioneDisponibileDto;
import com.example.demo.dto.PrenotazioneLezioneRequest;
import com.example.demo.dto.PrenotazioneLezioneResponse;
import com.example.demo.entity.CalendarioSettimanale;
import com.example.demo.entity.Lezione;
import com.example.demo.entity.PrenotazioneLezione;
import com.example.demo.entity.Utenti;
import com.example.demo.entity.Vendita;
import com.example.demo.entity.Pacchetto;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.repository.CalendarioSettimanaleRepository;
import com.example.demo.repository.LezioneRepository;
import com.example.demo.repository.PrenotazioneLezioneRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.repository.VenditaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrenotazioneLezioneService {

    private final PrenotazioneLezioneRepository prenotazioneRepository;
    private final LezioneRepository lezioneRepository;
    private final UtenteRepository utenteRepository;
    private final CalendarioSettimanaleRepository calendarioRepository;
    private final VenditaRepository venditaRepository;

    /**
     * Recupera tutti i tipi di lezione disponibili dal calendario settimanale
     */
    public List<CalendarioSettimanale> getTipiLezioneDisponibili() {
        log.info("Recupero tipi di lezione disponibili dal calendario settimanale");
        return calendarioRepository.findByAttivoTrue();
    }

    /**
     * Recupera i pacchetti acquistati dall'utente (vendite PAID)
     */
    public List<Pacchetto> getPacchettiAcquistatiUtente(String username) {
        log.info("Recupero pacchetti acquistati per utente: {}", username);
        List<Vendita> vendite = venditaRepository.findByUtenteUsernameAndStato(username, Vendita.StatoVendita.PAID);
        log.info("Numero vendite PAID trovate: {}", vendite.size());
        
        List<Pacchetto> pacchetti = vendite.stream()
                .map(Vendita::getPacchetto)
                .distinct()
                .collect(Collectors.toList());
        
        log.info("Numero pacchetti distinti: {}", pacchetti.size());
        return pacchetti;
    }

    /**
     * Recupera i tipi di lezione disponibili filtrati per categoria del pacchetto
     */
    public List<CalendarioSettimanale> getTipiLezionePerPacchetto(Long pacchettoId) {
        log.info("Recupero tipi di lezione per pacchetto ID: {}", pacchettoId);
        
        // Recupera il pacchetto per ottenere la categoria
        // Nota: dovresti avere un PacchettoRepository, altrimenti usa VenditaRepository
        List<Vendita> vendite = venditaRepository.findByPacchettoIdAndStato(pacchettoId, Vendita.StatoVendita.PAID);
        
        if (vendite.isEmpty()) {
            log.warn("Nessuna vendita trovata per pacchetto ID: {}", pacchettoId);
            return List.of();
        }
        
        Pacchetto pacchetto = vendite.get(0).getPacchetto();
        String categoria = pacchetto.getCategoria();
        
        log.info("Filtraggio lezioni per categoria: {}", categoria);
        
        // Filtra i tipi di lezione per categoria
        return calendarioRepository.findByAttivoTrue().stream()
                .filter(cal -> cal.getTipoLezione().name().equalsIgnoreCase(categoria))
                .collect(Collectors.toList());
    }

    /**
     * Recupera le lezioni future per un template specifico (tipo di lezione dal calendario)
     * Mostra solo lezioni future con disponibilità posti
     */
    public List<LezioneDisponibileDto> getLezioniPerTemplate(Long templateId, LocalDate dataInizio, LocalDate dataFine) {
        log.info("Recupero lezioni per template {} da {} a {}", templateId, dataInizio, dataFine);
        
        LocalDateTime dataInizioTime = dataInizio.atStartOfDay();
        LocalDateTime dataFineTime = dataFine.atTime(23, 59, 59);
        
        // Recupera tutte le lezioni per questo template nel range di date
        List<Lezione> lezioni = lezioneRepository.findByDataInizioBetween(dataInizioTime, dataFineTime)
                .stream()
                .filter(l -> templateId.equals(l.getTemplateId()) && l.getAttiva())
                .collect(Collectors.toList());
        
        List<LezioneDisponibileDto> lezioniDisponibili = new ArrayList<>();
        
        for (Lezione lezione : lezioni) {
            Long postiOccupati = prenotazioneRepository.countPostiOccupatiByLezioneId(lezione.getId());
            Integer postiDisponibili = lezione.getMaxPartecipanti() - postiOccupati.intValue();
            
            GiornoSettimana giornoSettimana = getGiornoSettimanaFromLocalDateTime(lezione.getDataInizio());
            
            LezioneDisponibileDto dto = LezioneDisponibileDto.builder()
                    .lezioneId(lezione.getId())
                    .titolo(lezione.getTitolo())
                    .dataInizio(lezione.getDataInizio())
                    .dataFine(lezione.getDataFine())
                    .istruttore(lezione.getIstruttore())
                    .tipoLezione(lezione.getTipoLezione())
                    .maxPartecipanti(lezione.getMaxPartecipanti())
                    .postiOccupati(postiOccupati.intValue())
                    .postiDisponibili(postiDisponibili)
                    .disponibile(postiDisponibili > 0)
                    .giornoSettimana(giornoSettimana)
                    .note(lezione.getNote())
                    .templateId(lezione.getTemplateId())
                    .build();
            
            lezioniDisponibili.add(dto);
        }
        
        log.info("Trovate {} lezioni per template {}", lezioniDisponibili.size(), templateId);
        return lezioniDisponibili;
    }

    /**
     * Recupera tutte le lezioni disponibili per un range di date
     * considerando il calendario settimanale e le lezioni già create
     */
    public List<LezioneDisponibileDto> getLezioniDisponibili(LocalDate dataInizio, LocalDate dataFine) {
        log.info("Recupero lezioni disponibili da {} a {}", dataInizio, dataFine);
        
        LocalDateTime dataInizioTime = dataInizio.atStartOfDay();
        LocalDateTime dataFineTime = dataFine.atTime(23, 59, 59);
        
        // Recupera tutte le lezioni nel range di date
        List<Lezione> lezioni = lezioneRepository.findByDataInizioBetween(dataInizioTime, dataFineTime);
        
        List<LezioneDisponibileDto> lezioniDisponibili = new ArrayList<>();
        
        for (Lezione lezione : lezioni) {
            if (!lezione.getAttiva()) {
                continue; // Salta le lezioni non attive
            }
            
            // Conta i posti occupati
            Long postiOccupati = prenotazioneRepository.countPostiOccupatiByLezioneId(lezione.getId());
            Integer postiDisponibili = lezione.getMaxPartecipanti() - postiOccupati.intValue();
            
            // Recupera giorno della settimana
            GiornoSettimana giornoSettimana = getGiornoSettimanaFromLocalDateTime(lezione.getDataInizio());
            
            LezioneDisponibileDto dto = LezioneDisponibileDto.builder()
                    .lezioneId(lezione.getId())
                    .titolo(lezione.getTitolo())
                    .dataInizio(lezione.getDataInizio())
                    .dataFine(lezione.getDataFine())
                    .istruttore(lezione.getIstruttore())
                    .tipoLezione(lezione.getTipoLezione())
                    .maxPartecipanti(lezione.getMaxPartecipanti())
                    .postiOccupati(postiOccupati.intValue())
                    .postiDisponibili(postiDisponibili)
                    .disponibile(postiDisponibili > 0)
                    .giornoSettimana(giornoSettimana)
                    .note(lezione.getNote())
                    .templateId(lezione.getTemplateId())
                    .build();
            
            lezioniDisponibili.add(dto);
        }
        
        log.info("Trovate {} lezioni disponibili", lezioniDisponibili.size());
        return lezioniDisponibili;
    }

    /**
     * Recupera le lezioni disponibili per una specifica data
     */
    public List<LezioneDisponibileDto> getLezioniDisponibiliPerData(LocalDate data) {
        return getLezioniDisponibili(data, data);
    }

    /**
     * Crea una prenotazione per un utente
     */
    @Transactional
    public PrenotazioneLezioneResponse creaPrenotazione(String username, PrenotazioneLezioneRequest request) {
        log.info("Creazione prenotazione per utente {} lezione {}", username, request.getLezioneId());
        
        // Verifica che la lezione esista
        Lezione lezione = lezioneRepository.findById(request.getLezioneId())
                .orElseThrow(() -> new RuntimeException("Lezione non trovata"));
        
        if (!lezione.getAttiva()) {
            throw new RuntimeException("La lezione non è attiva");
        }
        
        // Verifica che l'utente esista
        Utenti utente = utenteRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        
        // Verifica se l'utente ha già prenotato questa lezione
        if (prenotazioneRepository.existsPrenotazioneAttiva(lezione.getId(), username)) {
            throw new RuntimeException("Hai già prenotato questa lezione");
        }
        
        // Verifica disponibilità posti
        Long postiOccupati = prenotazioneRepository.countPostiOccupatiByLezioneId(lezione.getId());
        if (postiOccupati >= lezione.getMaxPartecipanti()) {
            throw new RuntimeException("Non ci sono posti disponibili per questa lezione");
        }
        
        // Crea la prenotazione
        PrenotazioneLezione prenotazione = new PrenotazioneLezione();
        prenotazione.setLezione(lezione);
        prenotazione.setUtente(utente);
        prenotazione.setNote(request.getNote());
        prenotazione.setStato("CONFERMATA");
        
        prenotazione = prenotazioneRepository.save(prenotazione);
        
        log.info("Prenotazione creata con successo ID: {}", prenotazione.getId());
        
        return mapToResponse(prenotazione);
    }

    /**
     * Cancella una prenotazione
     */
    @Transactional
    public void cancellaPrenotazione(String username, Long prenotazioneId) {
        log.info("Cancellazione prenotazione ID: {} per utente {}", prenotazioneId, username);
        
        PrenotazioneLezione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));
        
        // Verifica che la prenotazione appartenga all'utente
        if (!prenotazione.getUtente().getUsername().equals(username)) {
            throw new RuntimeException("Non sei autorizzato a cancellare questa prenotazione");
        }
        
        // Imposta stato CANCELLATA invece di eliminare fisicamente
        prenotazione.setStato("CANCELLATA");
        prenotazioneRepository.save(prenotazione);
        
        log.info("Prenotazione cancellata con successo");
    }

    /**
     * Recupera tutte le prenotazioni attive di un utente
     */
    public List<PrenotazioneLezioneResponse> getPrenotazioniUtente(String username) {
        log.info("Recupero prenotazioni per utente {}", username);
        
        List<PrenotazioneLezione> prenotazioni = prenotazioneRepository.findPrenotazioniAttivaByUsername(username);
        
        return prenotazioni.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera le prenotazioni future di un utente
     */
    public List<PrenotazioneLezioneResponse> getPrenotazioniFutureUtente(String username) {
        log.info("Recupero prenotazioni future per utente {}", username);
        
        LocalDateTime now = LocalDateTime.now();
        List<PrenotazioneLezione> prenotazioni = prenotazioneRepository.findPrenotazioniFutureByUsername(username, now);
        
        return prenotazioni.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Verifica disponibilità di una lezione specifica
     */
    public LezioneDisponibileDto verificaDisponibilitaLezione(Long lezioneId) {
        log.info("Verifica disponibilità lezione ID: {}", lezioneId);
        
        Lezione lezione = lezioneRepository.findById(lezioneId)
                .orElseThrow(() -> new RuntimeException("Lezione non trovata"));
        
        Long postiOccupati = prenotazioneRepository.countPostiOccupatiByLezioneId(lezioneId);
        Integer postiDisponibili = lezione.getMaxPartecipanti() - postiOccupati.intValue();
        
        GiornoSettimana giornoSettimana = getGiornoSettimanaFromLocalDateTime(lezione.getDataInizio());
        
        return LezioneDisponibileDto.builder()
                .lezioneId(lezione.getId())
                .titolo(lezione.getTitolo())
                .dataInizio(lezione.getDataInizio())
                .dataFine(lezione.getDataFine())
                .istruttore(lezione.getIstruttore())
                .tipoLezione(lezione.getTipoLezione())
                .maxPartecipanti(lezione.getMaxPartecipanti())
                .postiOccupati(postiOccupati.intValue())
                .postiDisponibili(postiDisponibili)
                .disponibile(postiDisponibili > 0 && lezione.getAttiva())
                .giornoSettimana(giornoSettimana)
                .note(lezione.getNote())
                .templateId(lezione.getTemplateId())
                .build();
    }

    /**
     * Helper method per mappare PrenotazioneLezione a Response DTO
     */
    private PrenotazioneLezioneResponse mapToResponse(PrenotazioneLezione prenotazione) {
        Lezione lezione = prenotazione.getLezione();
        
        PrenotazioneLezioneResponse response = new PrenotazioneLezioneResponse();
        response.setId(prenotazione.getId());
        response.setLezioneId(lezione.getId());
        response.setTitolo(lezione.getTitolo());
        response.setDataInizio(lezione.getDataInizio());
        response.setDataFine(lezione.getDataFine());
        response.setIstruttore(lezione.getIstruttore());
        response.setTipoLezione(lezione.getTipoLezione());
        response.setUsername(prenotazione.getUtente().getUsername());
        response.setNote(prenotazione.getNote());
        response.setStato(prenotazione.getStato());
        response.setDataPrenotazione(prenotazione.getDataPrenotazione());
        
        return response;
    }

    /**
     * Helper method per convertire LocalDateTime in GiornoSettimana enum
     */
    private GiornoSettimana getGiornoSettimanaFromLocalDateTime(LocalDateTime dateTime) {
        DayOfWeek dayOfWeek = dateTime.getDayOfWeek();
        String dayName = dayOfWeek.getDisplayName(TextStyle.FULL, Locale.ITALIAN).toUpperCase();
        
        return switch (dayName) {
            case "LUNEDÌ" -> GiornoSettimana.LUNEDI;
            case "MARTEDÌ" -> GiornoSettimana.MARTEDI;
            case "MERCOLEDÌ" -> GiornoSettimana.MERCOLEDI;
            case "GIOVEDÌ" -> GiornoSettimana.GIOVEDI;
            case "VENERDÌ" -> GiornoSettimana.VENERDI;
            case "SABATO" -> GiornoSettimana.SABATO;
            case "DOMENICA" -> GiornoSettimana.DOMENICA;
            default -> GiornoSettimana.LUNEDI;
        };
    }
}
