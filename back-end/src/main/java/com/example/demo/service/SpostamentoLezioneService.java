package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * Service per gestire lo spostamento automatico delle lezioni
 */
@Service
public class SpostamentoLezioneService {

    @Autowired
    private PrenotazioneLezioneRepository prenotazioneRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private RichiestaSpostamentoRepository richiestaRepository;

    @Autowired
    private VenditaRepository venditaRepository;

    private static final int DURABILITA_PACCHETTO_GIORNI = 37;

    /**
     * Tenta lo spostamento automatico alla prima settimana utile disponibile.
     * Se possibile, sposta la lezione. Altrimenti crea una richiesta all'admin.
     * 
     * @param prenotazioneId ID della prenotazione da spostare
     * @param username Username dell'utente
     * @param motivazione Motivazione dello spostamento
     * @return true se spostamento automatico riuscito, false se creata richiesta admin
     */
    @Transactional
    public boolean richiediSpostamento(Long prenotazioneId, String username, String motivazione) {
        
        // Recupera prenotazione
        PrenotazioneLezione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));

        // Verifica permessi
        if (!prenotazione.getUtente().getUsername().equals(username)) {
            throw new RuntimeException("Non hai i permessi per modificare questa prenotazione");
        }

        // Verifica se può essere spostata (>24h dalla lezione)
        if (!prenotazione.puoEssereSpostata()) {
            throw new RuntimeException("Impossibile spostare la prenotazione a meno di 24 ore dall'inizio");
        }

        // Verifica limite spostamenti
        if (prenotazione.getNumeroSpostamenti() >= 1) {
            throw new RuntimeException("Hai già effettuato il massimo numero di spostamenti consentiti per questa prenotazione");
        }

        // Verifica se esiste già richiesta pending
        if (richiestaRepository.existsPendingRequest(prenotazione)) {
            throw new RuntimeException("Esiste già una richiesta di spostamento in attesa per questa prenotazione");
        }

        // Se è presente motivazione, crea direttamente richiesta admin
        if (motivazione != null && !motivazione.trim().isEmpty()) {
            creaRichiestaAdmin(prenotazione, motivazione);
            return false;
        }

        // Calcola data limite (37 giorni dalla prima prenotazione del pacchetto)
        LocalDate dataLimite = calcolaDataLimite(prenotazione.getVendita());

        // Cerca prima settimana utile disponibile
        LocalDate prossimaDataDisponibile = trovaProssimaSettimanaDisponibile(prenotazione, dataLimite);

        if (prossimaDataDisponibile != null) {
            // Spostamento automatico possibile
            eseguiSpostamentoAutomatico(prenotazione, prossimaDataDisponibile, motivazione);
            return true;
        } else {
            // Spostamento automatico non possibile
            // Se c'è motivazione fornita, crea richiesta admin
            // Altrimenti ritorna false per far chiedere motivazione al frontend
            if (motivazione != null && !motivazione.trim().isEmpty()) {
                creaRichiestaAdmin(prenotazione, motivazione);
            }
            return false;
        }
    }

    /**
     * Calcola la data limite (37 giorni dalla prima prenotazione del pacchetto)
     */
    private LocalDate calcolaDataLimite(Vendita vendita) {
        // Trova la prima prenotazione confermata di questa vendita
        List<PrenotazioneLezione> prenotazioni = prenotazioneRepository.findByVenditaOrderByDataLezioneAsc(vendita);
        
        if (prenotazioni.isEmpty()) {
            // Se non ci sono prenotazioni, usa data acquisto vendita
            return vendita.getDataAcquisto().toLocalDate().plusDays(DURABILITA_PACCHETTO_GIORNI);
        }
        
        LocalDate primaPrenotazione = prenotazioni.get(0).getDataLezione();
        return primaPrenotazione.plusDays(DURABILITA_PACCHETTO_GIORNI);
    }

    /**
     * Trova la prossima settimana disponibile per lo stesso giorno/orario
     */
    private LocalDate trovaProssimaSettimanaDisponibile(PrenotazioneLezione prenotazione, LocalDate dataLimite) {
        CalendarioSettimanale template = prenotazione.getTemplate();
        LocalDate dataCorrente = prenotazione.getDataLezione().plusWeeks(1); // Inizia dalla settimana successiva
        DayOfWeek giornoTarget = convertGiornoSettimana(template.getGiornoSettimana());
        Utenti utente = prenotazione.getUtente();

        // Cerca fino alla data limite (rispettando i 37 giorni)
        while (dataCorrente.isBefore(dataLimite) || dataCorrente.isEqual(dataLimite)) {
            // Verifica che sia il giorno giusto
            if (dataCorrente.getDayOfWeek() == giornoTarget) {
                // Verifica che l'utente non abbia già una prenotazione nello stesso slot
                boolean utenteGiaPrenotato = prenotazioneRepository.existsByUtenteAndDataAndOra(
                        utente, dataCorrente, prenotazione.getOraInizio());
                
                if (!utenteGiaPrenotato) {
                    // Conta i partecipanti già prenotati per quella data
                    Long partecipantiAttuali = prenotazioneRepository.countPartecipantiByTemplateAndData(
                            template.getId(), dataCorrente);
                    
                    // Verifica se c'è spazio
                    if (partecipantiAttuali < template.getMaxPartecipanti()) {
                        return dataCorrente;
                    }
                }
            }
            dataCorrente = dataCorrente.plusDays(1);
        }

        return null; // Nessuna data disponibile trovata entro i 37 giorni
    }

    /**
     * Esegue lo spostamento automatico
     */
    private void eseguiSpostamentoAutomatico(PrenotazioneLezione prenotazione, LocalDate nuovaData, String motivazione) {
        prenotazione.setDataLezione(nuovaData);
        prenotazione.incrementaSpostamenti();
        
        // Aggiorna note con motivazione
        String noteSpostamento = String.format("[SPOSTAMENTO AUTOMATICO - %s] %s", 
                LocalDate.now(), motivazione != null ? motivazione : "Nessuna motivazione");
        
        if (prenotazione.getNote() != null && !prenotazione.getNote().isEmpty()) {
            prenotazione.setNote(prenotazione.getNote() + "\n" + noteSpostamento);
        } else {
            prenotazione.setNote(noteSpostamento);
        }

        prenotazioneRepository.save(prenotazione);
    }

    /**
     * Crea una richiesta all'admin quando lo spostamento automatico non è possibile
     */
    private void creaRichiestaAdmin(PrenotazioneLezione prenotazione, String motivazione) {
        Utenti utente = prenotazione.getUtente();
        
        RichiestaSpostamento richiesta = new RichiestaSpostamento();
        richiesta.setPrenotazione(prenotazione);
        richiesta.setUtente(utente);
        richiesta.setTipoRichiesta(RichiestaSpostamento.TipoRichiesta.CAMBIO_GRUPPO);
        richiesta.setDataOriginale(prenotazione.getDataLezione());
        richiesta.setMotivazione(motivazione != null ? motivazione : "Nessuna data disponibile entro il termine");
        
        // Cambia stato prenotazione
        prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.SPOSTAMENTO_RICHIESTO);
        
        prenotazioneRepository.save(prenotazione);
        richiestaRepository.save(richiesta);
    }

    /**
     * Converte GiornoSettimana enum a DayOfWeek
     */
    private DayOfWeek convertGiornoSettimana(com.example.demo.enums.GiornoSettimana giorno) {
        switch (giorno) {
            case LUNEDI: return DayOfWeek.MONDAY;
            case MARTEDI: return DayOfWeek.TUESDAY;
            case MERCOLEDI: return DayOfWeek.WEDNESDAY;
            case GIOVEDI: return DayOfWeek.THURSDAY;
            case VENERDI: return DayOfWeek.FRIDAY;
            case SABATO: return DayOfWeek.SATURDAY;
            case DOMENICA: return DayOfWeek.SUNDAY;
            default: throw new IllegalArgumentException("Giorno non valido: " + giorno);
        }
    }
}
