package com.example.demo.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
// service annotation removed to avoid duplicate bean registration; this implementation is kept for reference
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Lezione;
import com.example.demo.entity.Prenotazione;
import com.example.demo.entity.Utenti;
import com.example.demo.entity.Vendita;
import com.example.demo.dto.PrenotazioneDto;
import com.example.demo.mapper.PrenotazioneMapper;
import com.example.demo.exceptions.BindingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.repository.LezioneRepository;
import com.example.demo.repository.PrenotazioneRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.repository.VenditaRepository;
import com.example.demo.service.PrenotazioneService;

public class PrenotazioneServiceImpl implements PrenotazioneService {

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;

    @Autowired
    private LezioneRepository lezioneRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private VenditaRepository venditaRepository;

    @Override
    @Transactional
    public PrenotazioneDto creaPrenotazione(Long lezioneId, String username, String note, Long venditaId)
            throws BindingException, NotFoundException {
        Lezione lezione = lezioneRepository.findById(lezioneId)
                .orElseThrow(() -> new NotFoundException("Lezione non trovata"));

        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) throw new NotFoundException("Utente non trovato");

        Vendita vendita = null;
        if (venditaId != null) {
            vendita = venditaRepository.findById(venditaId).orElse(null);
            if (vendita == null) throw new BindingException("Vendita non valida");
            if (!vendita.getUtente().getId().equals(utente.getId())) {
                throw new BindingException("La vendita non appartiene all'utente autenticato");
            }
            if (vendita.getStato() != Vendita.StatoVendita.PAID) {
                throw new BindingException("La vendita non è pagata");
            }
        }

        // Controlla duplicati
        if (prenotazioneRepository.existsByLezioneAndUtenteAndAttivaTrue(lezione, utente)) {
            throw new BindingException("Hai già una prenotazione per questa lezione");
        }

        // Controlla posti disponibili
        Integer max = lezione.getMaxPartecipanti();
        long count = prenotazioneRepository.countByLezioneAndAttivaTrue(lezione);
        if (max != null && count >= max) {
            throw new BindingException("La lezione è già piena");
        }

        Prenotazione p = new Prenotazione();
        p.setLezione(lezione);
        p.setUtente(utente);
        p.setVendita(vendita);
        p.setNote(note);
        // calcola data consumo come 24h prima della lezione
        try {
            if (lezione.getDataInizio() != null) {
                p.setDataConsumo(lezione.getDataInizio().minusHours(24));
            }
        } catch (Exception ex) {
            // ignore
        }

        try {
            Prenotazione saved = prenotazioneRepository.save(p);
            return PrenotazioneMapper.toDto(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new BindingException("Impossibile creare la prenotazione (conflitto)");
        }
    }

    @Override
    @Transactional
    public void cancellaPrenotazione(Long lezioneId, String username) throws NotFoundException {
        Lezione lezione = lezioneRepository.findById(lezioneId)
                .orElseThrow(() -> new NotFoundException("Lezione non trovata"));
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) throw new NotFoundException("Utente non trovato");

        Prenotazione p = prenotazioneRepository.findByLezioneAndUtenteAndAttivaTrue(lezione, utente)
                .orElseThrow(() -> new NotFoundException("Prenotazione non trovata"));

        p.setAttiva(false);
        p.setDataCancellazione(LocalDateTime.now());
        prenotazioneRepository.save(p);
    }

    @Override
    public List<PrenotazioneDto> getPrenotazioniUtente(String username) {
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) return java.util.Collections.emptyList();
        return prenotazioneRepository.findByUtenteAndAttivaTrue(utente).stream().map(PrenotazioneMapper::toDto).toList();
    }

    @Override
    public List<PrenotazioneDto> getPrenotazioniPerLezione(Long lezioneId) {
        Lezione lezione = lezioneRepository.findById(lezioneId).orElse(null);
        if (lezione == null) return java.util.Collections.emptyList();
        return prenotazioneRepository.findByLezioneAndAttivaTrue(lezione).stream().map(PrenotazioneMapper::toDto).toList();
    }
}
