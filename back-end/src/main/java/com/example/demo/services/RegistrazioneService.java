package com.example.demo.services;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.RegistrazioneUtenteDTO;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

import lombok.extern.java.Log;

@Log
@Service
@Transactional
public class RegistrazioneService {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * Registra un nuovo utente nel sistema
     */
    public String registraUtente(RegistrazioneUtenteDTO dto) {
        log.info("Inizio registrazione utente: " + dto.getUsername());

        // Mapping DTO -> Entity
        Utenti nuovoUtente = mapDTOToEntity(dto);

        // Salvataggio nel database
        utenteRepository.save(nuovoUtente);

        log.info("Utente registrato con successo: " + dto.getUsername());
        return String.format("Registrazione utente %s completata con successo", dto.getUsername());
    }

    /**
     * Verifica se username esiste già
     */
    public boolean existsByUsername(String username) {
        return utenteRepository.existsByUsername(username);
    }

    /**
     * Verifica se email esiste già
     */
    public boolean existsByEmail(String email) {
        return utenteRepository.existsByEmail(email);
    }

    /**
     * Verifica se codice fiscale esiste già
     */
    public boolean existsByCodiceFiscale(String codiceFiscale) {
        return utenteRepository.existsByCodiceFiscale(codiceFiscale);
    }

    /**
     * Mapping da DTO a Entity
     */
    private Utenti mapDTOToEntity(RegistrazioneUtenteDTO dto) {
        Utenti utente = new Utenti();

        // Campi base
        utente.setUsername(dto.getUsername());
        utente.setEmail(dto.getEmail());
        utente.setPassword(passwordEncoder.encode(dto.getPassword()));
        utente.setAttivo(dto.getAttivo());

        // Campi registrazione
        utente.setNome(dto.getNome());
        utente.setCognome(dto.getCognome());
        utente.setCodiceFiscale(dto.getCodiceFiscale());
        utente.setCertificatoMedico(dto.getCertificatoMedico());
        utente.setPatologie(dto.getPatologie());
        utente.setDescrizionePatologie(dto.getDescrizionePatologie());
        utente.setObiettivi(dto.getObiettivi());

        // Ruoli default per nuovi utenti registrati
        if (dto.getRuoli() != null && !dto.getRuoli().isEmpty()) {
            utente.setRuoli(dto.getRuoli());
        } else {
            // Assegna ruolo default "USER" ai nuovi registrati
            utente.setRuoli(Arrays.asList("USER"));
        }

        return utente;
    }
}
