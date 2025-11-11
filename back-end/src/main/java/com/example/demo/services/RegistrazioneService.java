package com.example.demo.services;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.RegistrazioneUtenteDTO;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

@Service
@Transactional
public class RegistrazioneService {

    private static final Logger log = LoggerFactory.getLogger(RegistrazioneService.class);

    private final UtenteRepository utenteRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    public RegistrazioneService(final UtenteRepository utenteRepository,
                                final BCryptPasswordEncoder passwordEncoder) {
        this.utenteRepository = utenteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registra un nuovo utente nel sistema
     */
    public Utenti registraUtente(RegistrazioneUtenteDTO dto) {
        log.info("Inizio registrazione utente: " + dto.getUsername());

        // Mapping DTO -> Entity
        Utenti nuovoUtente = mapDTOToEntity(dto);

        // Salvataggio nel database
        Utenti savedUtente = utenteRepository.save(nuovoUtente);

        log.info("Utente registrato con successo: " + dto.getUsername() + " con ID: " + savedUtente.getId());
        return savedUtente;
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
        utente.setIndirizzo(dto.getIndirizzo());
        utente.setCittà(dto.getCittà());
        utente.setTelefono(dto.getTelefono());
        
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
