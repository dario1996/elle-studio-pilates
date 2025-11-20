package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service per la gestione delle richieste di spostamento prenotazioni
 */
@Service
public class RichiestaSpostamentoService {

    @Autowired
    private RichiestaSpostamentoRepository richiestaRepository;

    @Autowired
    private PrenotazioneLezioneRepository prenotazioneRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    /**
     * Crea una richiesta di spostamento
     * 
     * @param prenotazioneId ID della prenotazione da spostare
     * @param username Username dell'utente
     * @param tipoRichiesta Tipo di richiesta (VA_IN_CODA o CAMBIO_GRUPPO)
     * @param dataRichiesta Data richiesta (opzionale, per CAMBIO_GRUPPO)
     * @param motivazione Motivazione dello spostamento
     * @return La richiesta creata
     */
    @Transactional
    public RichiestaSpostamento creaRichiestaSpostamento(
            Long prenotazioneId,
            String username,
            RichiestaSpostamento.TipoRichiesta tipoRichiesta,
            LocalDate dataRichiesta,
            String motivazione) {

        // Recupera entità
        PrenotazioneLezione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));

        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        // Validazioni
        if (!prenotazione.getUtente().getUsername().equals(username)) {
            throw new RuntimeException("Non hai i permessi per modificare questa prenotazione");
        }

        if (!prenotazione.puoEssereSpostata()) {
            throw new RuntimeException("Impossibile spostare la prenotazione a meno di 24 ore dall'inizio");
        }

        // Verifica se esiste già una richiesta pending
        if (richiestaRepository.existsPendingRequest(prenotazione)) {
            throw new RuntimeException("Esiste già una richiesta di spostamento in attesa per questa prenotazione");
        }

        // Se è secondo spostamento, blocca "vai in coda"
        if (!prenotazione.isPrimoSpostamento() && tipoRichiesta == RichiestaSpostamento.TipoRichiesta.VA_IN_CODA) {
            throw new RuntimeException("Non è possibile andare in coda per un secondo spostamento");
        }

        // Crea la richiesta
        RichiestaSpostamento richiesta = new RichiestaSpostamento();
        richiesta.setPrenotazione(prenotazione);
        richiesta.setUtente(utente);
        richiesta.setTipoRichiesta(tipoRichiesta);
        richiesta.setDataOriginale(prenotazione.getDataLezione());
        richiesta.setDataRichiesta(dataRichiesta);
        richiesta.setMotivazione(motivazione);

        // Aggiorna stato prenotazione
        prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.SPOSTAMENTO_RICHIESTO);
        prenotazioneRepository.save(prenotazione);

        return richiestaRepository.save(richiesta);
    }

    /**
     * Approva una richiesta di spostamento
     * 
     * @param richiestaId ID della richiesta
     * @param nuovaData Nuova data assegnata (opzionale)
     * @param rispostaAdmin Risposta dell'admin
     */
    @Transactional
    public void approvaRichiesta(Long richiestaId, LocalDate nuovaData, String rispostaAdmin) {
        RichiestaSpostamento richiesta = richiestaRepository.findById(richiestaId)
                .orElseThrow(() -> new RuntimeException("Richiesta non trovata"));

        if (!richiesta.isPending()) {
            throw new RuntimeException("La richiesta è già stata processata");
        }

        PrenotazioneLezione prenotazione = richiesta.getPrenotazione();

        if (richiesta.isVaiInCoda()) {
            // Sposta in coda (quinta settimana)
            LocalDate dataInCoda = calcolaQuintaSettimana(prenotazione);
            prenotazione.setDataLezione(dataInCoda);
        } else if (richiesta.isCambioGruppo() && nuovaData != null) {
            // Cambia gruppo con nuova data
            prenotazione.setDataLezione(nuovaData);
        }

        // Aggiorna stati
        richiesta.approva(rispostaAdmin);
        prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
        prenotazione.incrementaSpostamenti();

        richiestaRepository.save(richiesta);
        prenotazioneRepository.save(prenotazione);
    }

    /**
     * Rifiuta una richiesta di spostamento
     */
    @Transactional
    public void rifiutaRichiesta(Long richiestaId, String rispostaAdmin) {
        RichiestaSpostamento richiesta = richiestaRepository.findById(richiestaId)
                .orElseThrow(() -> new RuntimeException("Richiesta non trovata"));

        if (!richiesta.isPending()) {
            throw new RuntimeException("La richiesta è già stata processata");
        }

        PrenotazioneLezione prenotazione = richiesta.getPrenotazione();

        // Ripristina stato prenotazione
        prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.CONFERMATA);

        richiesta.rifiuta(rispostaAdmin);

        richiestaRepository.save(richiesta);
        prenotazioneRepository.save(prenotazione);
    }

    /**
     * Calcola la quinta settimana (data in coda) rispetto alla data originale
     */
    private LocalDate calcolaQuintaSettimana(PrenotazioneLezione prenotazione) {
        // La quinta settimana è 4 settimane dopo la data originale
        return prenotazione.getDataLezione().plusWeeks(4);
    }

    /**
     * Ottiene tutte le richieste pending
     */
    public List<RichiestaSpostamento> getRichiestePending() {
        return richiestaRepository.findByStatoOrderByDataCreazioneAsc(
                RichiestaSpostamento.StatoRichiesta.PENDING);
    }

    /**
     * Ottiene le richieste di un utente
     */
    public List<RichiestaSpostamento> getRichiesteUtente(String username) {
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        return richiestaRepository.findByUtenteOrderByDataCreazioneDesc(utente);
    }
}
