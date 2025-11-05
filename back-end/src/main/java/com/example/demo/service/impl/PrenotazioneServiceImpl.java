package com.example.demo.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Lezione;
import com.example.demo.entity.PacchettoUtente;
import com.example.demo.entity.Prenotazione;
import com.example.demo.dto.PrenotazioneDto;
import com.example.demo.mapper.PrenotazioneMapper;
import com.example.demo.entity.Utenti;
import com.example.demo.entity.Vendita;
import com.example.demo.exceptions.BindingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.repository.LezioneRepository;
import com.example.demo.repository.PacchettoUtenteRepository;
import com.example.demo.repository.PrenotazioneRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.repository.VenditaRepository;
import com.example.demo.service.PrenotazioneService;

@Service
public class PrenotazioneServiceImpl implements PrenotazioneService {

    @Autowired
    private LezioneRepository lezioneRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;

    @Autowired
    private VenditaRepository venditaRepository;

    @Autowired
    private PacchettoUtenteRepository pacchettoUtenteRepository;

    @Override
    @Transactional
    public PrenotazioneDto creaPrenotazione(Long lezioneId, String username, String note, Long venditaId) throws BindingException, NotFoundException {
        Lezione lezione = lezioneRepository.findById(lezioneId).orElseThrow(() -> new NotFoundException("Lezione non trovata"));
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) throw new NotFoundException("Utente non trovato");

        // controllo duplicati
        if (prenotazioneRepository.existsByLezioneAndUtenteAndAttivaTrue(lezione, utente)) {
            throw new BindingException("Hai già una prenotazione attiva per questa lezione");
        }

        // controllo posti disponibili
        long prenotati = prenotazioneRepository.countByLezioneAndAttivaTrue(lezione);
        if (prenotati >= (lezione.getMaxPartecipanti() == null ? 1 : lezione.getMaxPartecipanti())) {
            throw new BindingException("Posti esauriti");
        }

        Prenotazione p = new Prenotazione();
        p.setLezione(lezione);
        p.setUtente(utente);
        p.setNote(note);
        p.setAttiva(true);
        p.setDataPrenotazione(LocalDateTime.now());

        if (venditaId != null) {
            Vendita vend = venditaRepository.findById(venditaId).orElse(null);
            if (vend != null) {
                p.setVendita(vend);
                pacchettoUtenteRepository.findByVendita(vend).ifPresent(pu -> p.setPacchettoUtente(pu));
            }
        }

        try {
            Prenotazione saved = prenotazioneRepository.save(p);
            return PrenotazioneMapper.toDto(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new BindingException("Conflitto nella creazione della prenotazione (probabile duplicato)");
        }
    }

    @Override
    @Transactional
    public void cancellaPrenotazione(Long lezioneId, String username) throws NotFoundException {
        Lezione lezione = lezioneRepository.findById(lezioneId).orElseThrow(() -> new NotFoundException("Lezione non trovata"));
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) throw new NotFoundException("Utente non trovato");

        Prenotazione p = prenotazioneRepository.findByLezioneAndUtenteAndAttivaTrue(lezione, utente).orElseThrow(() -> new NotFoundException("Prenotazione non trovata"));
        p.setAttiva(false);
        p.setDataCancellazione(LocalDateTime.now());
        prenotazioneRepository.save(p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrenotazioneDto> getPrenotazioniUtente(String username) {
        Utenti u = utenteRepository.findByUsername(username);
        if (u == null) return List.of();
        List<Prenotazione> list = prenotazioneRepository.findByUtenteAndAttivaTrue(u);
        return list.stream().map(PrenotazioneMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrenotazioneDto> getPrenotazioniPerLezione(Long lezioneId) {
        Lezione l = lezioneRepository.findById(lezioneId).orElse(null);
        if (l == null) return List.of();
        List<Prenotazione> list = prenotazioneRepository.findByLezioneAndAttivaTrue(l);
        return list.stream().map(PrenotazioneMapper::toDto).toList();
    }
}
