package com.example.demo.services;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.RegistrazioneUtenteDTO;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

@Service
@Transactional
public class RegistrazioneService {

    @Autowired
    private JavaMailSender mailSender;

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

    /**
     * Invia email di conferma registrazione
     */
    public void invioMailRegistrazione(String email, String username) {
        log.info("Invio email di conferma registrazione a: " + email);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vincenzo.cusaniello@gmail.com");
            message.setTo(email);
            message.setSubject("Benvenuto in BC Management!");
            
            String emailBody = String.format(
                "Ciao %s!\n\n" +
                "Benvenuto in BC Management!\n\n" +
                "La tua registrazione è stata completata con successo.\n" +
                "L'utenza verrà abilitata nel più breve tempo possibile e riceverai una mail quando questo avverrà.\n\n" +
                "Quando questo accadrà potrai accedere al sistema utilizzando le credenziali che hai scelto.\n\n" +
                "Se non hai richiesto questa registrazione, ti preghiamo di contattarci immediatamente.\n\n" +
                "Grazie per esserti registrato!\n" +
                "BC Management Team",
                username
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Email di conferma registrazione inviata con successo a: " + email);
            
        } catch (Exception e) {
            log.error("Errore durante l'invio dell'email di conferma registrazione: " + e.getMessage(), e);
            // Non blocchiamo la registrazione se l'email fallisce
        }
    }

    /**
     * Invia email di attivazione profilo
     */
    public void invioMailAttivazione(String email, String username) {
        log.info("Invio email di attivazione profilo a: " + email);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vincenzo.cusaniello@gmail.com");
            message.setTo(email);
            message.setSubject("Profilo Attivato - BC Management");
            
            String emailBody = String.format(
                "Ciao %s!\n\n" +
                "Siamo felici di informarti che il tuo profilo è stato attivato con successo!\n\n" +
                "Ora puoi accedere alla piattaforma di BC Management e procedere all'acquisto di uno o più pacchetti a te associati.\n\n" +
                "Puoi effettuare il login utilizzando le credenziali che hai scelto durante la registrazione.\n\n" +
                "Per qualsiasi informazione o assistenza, non esitare a contattarci.\n\n" +
                "Buona navigazione!\n" +
                "BC Management Team",
                username
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Email di attivazione profilo inviata con successo a: " + email);
            
        } catch (Exception e) {
            log.error("Errore durante l'invio dell'email di attivazione profilo: " + e.getMessage(), e);
            // Non blocchiamo l'attivazione se l'email fallisce
        }
    }
}
