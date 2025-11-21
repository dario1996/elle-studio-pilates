package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service per la gestione delle prenotazioni ricorrenti
 */
@Service
public class PrenotazioneRicorrenteService {

    @Autowired
    private PrenotazioneLezioneRepository prenotazioneRepository;

    @Autowired
    private VenditaRepository venditaRepository;

    @Autowired
    private CalendarioSettimanaleRepository calendarioRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    /**
     * Crea prenotazioni ricorrenti per un pacchetto
     * 
     * @param venditaId ID della vendita (pacchetto acquistato)
     * @param templateId ID del template calendario settimanale
     * @param username Username dell'utente
     * @param tipoLezione Tipo di lezione (per pacchetti COMBO)
     * @param numeroLezioniDaPrenotare Numero di lezioni da prenotare (null = tutte)
     * @return Lista delle prenotazioni create
     */
    @Transactional
    public List<PrenotazioneLezione> creaPrenotazioniRicorrenti(
            Long venditaId,
            Long templateId,
            String username,
            String tipoLezione,
            Integer numeroLezioniDaPrenotare) {

        // Recupera entità
        Vendita vendita = venditaRepository.findById(venditaId)
                .orElseThrow(() -> new RuntimeException("Vendita non trovata"));

        CalendarioSettimanale template = calendarioRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template non trovato"));

        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        // Validazioni
        if (!vendita.isPagata()) {
            throw new RuntimeException("La vendita non è stata ancora pagata");
        }

        if (!vendita.hasLezioniDisponibili()) {
            throw new RuntimeException("Non ci sono lezioni disponibili in questo pacchetto");
        }

        // Determina quante lezioni prenotare
        int lezioniDaCreare;
        if (numeroLezioniDaPrenotare != null) {
            lezioniDaCreare = Math.min(numeroLezioniDaPrenotare, vendita.getLezioniRimanenti());
        } else {
            lezioniDaCreare = vendita.getLezioniRimanenti();
        }

        // Genera ID gruppo per raggruppare le prenotazioni
        String gruppoId = UUID.randomUUID().toString();

        // Calcola la prima data disponibile
        LocalDate primaData = calcolaPrimaDataDisponibile(template.getGiornoSettimana());

        // Crea le prenotazioni
        List<PrenotazioneLezione> prenotazioni = new ArrayList<>();
        LocalDate dataCorrente = primaData;

        for (int i = 0; i < lezioniDaCreare; i++) {
            // Verifica disponibilità posti
            Long partecipantiAttuali = prenotazioneRepository.countPartecipantiByTemplateAndData(
                    templateId, dataCorrente);

            if (partecipantiAttuali >= template.getMaxPartecipanti()) {
                throw new RuntimeException("Posti esauriti per la data " + dataCorrente);
            }

            // Crea prenotazione
            PrenotazioneLezione prenotazione = new PrenotazioneLezione();
            prenotazione.setVendita(vendita);
            prenotazione.setUtente(utente);
            prenotazione.setTemplate(template);
            prenotazione.setDataLezione(dataCorrente);
            prenotazione.setOraInizio(template.getOraInizio());
            prenotazione.setOraFine(template.getOraFine());
            
            // Imposta tipo lezione
            if (tipoLezione != null) {
                prenotazione.setTipoLezione(tipoLezione);
            } else {
                prenotazione.setTipoLezione(template.getTipoLezione().name());
            }
            
            prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
            prenotazione.setGruppoPrenotazioneId(gruppoId);

            prenotazioni.add(prenotazione);

            // Passa alla settimana successiva
            dataCorrente = dataCorrente.plusWeeks(1);
        }

        // Salva tutte le prenotazioni
        prenotazioni = prenotazioneRepository.saveAll(prenotazioni);

        // Aggiorna la vendita
        vendita.setLezioniRimanenti(vendita.getLezioniRimanenti() - lezioniDaCreare);
        vendita.setDataPrimaPrenotazioneSeNecessario();
        venditaRepository.save(vendita);

        return prenotazioni;
    }

    /**
     * Calcola la prima data disponibile per un giorno della settimana
     */
    private LocalDate calcolaPrimaDataDisponibile(GiornoSettimana giornoSettimana) {
        LocalDate oggi = LocalDate.now();
        DayOfWeek targetDay = convertGiornoSettimana(giornoSettimana);
        LocalDate primaData = oggi.plusDays(7); // 7 giorni di anticipo minimo

        // Trova la prima occorrenza del giorno della settimana
        while (primaData.getDayOfWeek() != targetDay) {
            primaData = primaData.plusDays(1);
        }

        return primaData;
    }

    /**
     * Converte GiornoSettimana enum a DayOfWeek
     */
    private DayOfWeek convertGiornoSettimana(GiornoSettimana giorno) {
        return switch (giorno) {
            case LUNEDI -> DayOfWeek.MONDAY;
            case MARTEDI -> DayOfWeek.TUESDAY;
            case MERCOLEDI -> DayOfWeek.WEDNESDAY;
            case GIOVEDI -> DayOfWeek.THURSDAY;
            case VENERDI -> DayOfWeek.FRIDAY;
            case SABATO -> DayOfWeek.SATURDAY;
            case DOMENICA -> DayOfWeek.SUNDAY;
        };
    }

    /**
     * Cancella una prenotazione e restituisce la lezione al pacchetto
     */
    @Transactional
    public void cancellaPrenotazione(Long prenotazioneId, String username) {
        PrenotazioneLezione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));

        // Verifica che l'utente sia il proprietario
        if (!prenotazione.getUtente().getUsername().equals(username)) {
            throw new RuntimeException("Non hai i permessi per cancellare questa prenotazione");
        }

        // Verifica vincolo 24 ore
        if (!prenotazione.puoEssereSpostata()) {
            throw new RuntimeException("Impossibile cancellare la prenotazione a meno di 24 ore dall'inizio");
        }

        // Cancella la prenotazione
        prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.CANCELLATA);
        prenotazioneRepository.save(prenotazione);

        // Restituisci la lezione al pacchetto
        Vendita vendita = prenotazione.getVendita();
        vendita.incrementaLezioniRimanenti();
        venditaRepository.save(vendita);
    }

    /**
     * Ottiene le prenotazioni future dell'utente
     */
    public List<PrenotazioneLezione> getPrenotazioniFuture(String username) {
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        return prenotazioneRepository.findPrenotazioniFuture(
                utente, LocalDate.now(), PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
    }

    /**
     * Ottiene TUTTE le prenotazioni future (per admin)
     */
    public List<PrenotazioneLezione> getTuttePrenotazioniFuture() {
        return prenotazioneRepository.findByDataLezioneAfterAndStato(
                LocalDate.now(), PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
    }

    /**
     * Ottiene le prenotazioni di un gruppo
     */
    public List<PrenotazioneLezione> getPrenotazioniGruppo(String gruppoId) {
        return prenotazioneRepository.findByGruppoPrenotazioneId(gruppoId);
    }

    /**
     * Verifica la disponibilità di posti per un template in una data
     */
    public boolean verificaDisponibilita(Long templateId, LocalDate data) {
        CalendarioSettimanale template = calendarioRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template non trovato"));

        Long partecipanti = prenotazioneRepository.countPartecipantiByTemplateAndData(templateId, data);
        return partecipanti < template.getMaxPartecipanti();
    }
}
