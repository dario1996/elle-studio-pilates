package com.example.demo.controller;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.RegistrazioneUtenteDTO;
import com.example.demo.entity.Utenti;
import com.example.demo.service.FileUploadService;
import com.example.demo.services.RegistrazioneService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/registrazione")
public class RegistrazioneController {

    private static final Logger log = LoggerFactory.getLogger(RegistrazioneController.class);

    private final RegistrazioneService registrazioneService;
    
    @Autowired
    private FileUploadService fileUploadService;

    public RegistrazioneController(final RegistrazioneService registrazioneService) {
        this.registrazioneService = registrazioneService;
    }

    @PostMapping(value = "/utente", produces = "application/json")
    public ResponseEntity<InfoMsg> registraUtente(
            @Valid @RequestBody RegistrazioneUtenteDTO registrazioneDTO,
            BindingResult bindingResult) {

        log.info("Inizio registrazione nuovo utente: " + registrazioneDTO.getUsername());

        try {
            // Validazione errori di binding
            if (bindingResult.hasErrors()) {
                String errorMsg = bindingResult.getFieldErrors().stream()
                        .map(error -> error.getDefaultMessage())
                        .reduce((msg1, msg2) -> msg1 + "; " + msg2)
                        .orElse("Errore di validazione");
                
                log.warn("Errori di validazione: {}", errorMsg);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new InfoMsg(LocalDate.now(), errorMsg));
            }

            // Validazione password matching
            if (!registrazioneDTO.isPasswordMatching()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new InfoMsg(LocalDate.now(), "Le password non coincidono"));
            }

            // Verifica username univoco
            if (registrazioneService.existsByUsername(registrazioneDTO.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new InfoMsg(LocalDate.now(), "Username già in uso"));
            }

            // Verifica email univoca
            if (registrazioneService.existsByEmail(registrazioneDTO.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new InfoMsg(LocalDate.now(), "Email già in uso"));
            }

            // Verifica codice fiscale univoco
            if (registrazioneService.existsByCodiceFiscale(registrazioneDTO.getCodiceFiscale())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new InfoMsg(LocalDate.now(), "Codice fiscale già in uso"));
            }

            // Registrazione utente
            Utenti savedUtente = registrazioneService.registraUtente(registrazioneDTO);
            
            // Invio email di conferma registrazione
            registrazioneService.invioMailRegistrazione(savedUtente.getEmail(), savedUtente.getUsername());

            log.info("Registrazione completata con successo per: " + registrazioneDTO.getUsername() + " con ID: " + savedUtente.getId());

            String successMessage = String.format("Registrazione utente %s completata con successo", savedUtente.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new InfoMsg(LocalDate.now(), successMessage, savedUtente.getId()));

        } catch (Exception e) {
            log.error("Errore durante la registrazione: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new InfoMsg(LocalDate.now(), "Errore interno durante la registrazione"));
        }
    }
    
    /**
     * Upload del certificato medico durante la registrazione (senza autenticazione richiesta)
     */
    @PostMapping("/certificato-medico")
    public ResponseEntity<InfoMsg> uploadCertificatoMedicoRegistrazione(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        
        log.info("Upload certificato medico per registrazione utente ID: " + userId);
        
        try {
            // Validazione preliminare
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new InfoMsg(LocalDate.now(), "File non valido o vuoto"));
            }

            // Validazione formato PDF
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            
            if (!"application/pdf".equals(contentType) || 
                originalFilename == null || 
                !originalFilename.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest()
                    .body(new InfoMsg(LocalDate.now(), "Sono accettati solo file in formato PDF"));
            }

            // Salva il certificato come BLOB usando il servizio
            String fileName = fileUploadService.saveCertificatoMedico(file, userId);
            
            log.info("Certificato medico caricato con successo per utente ID: " + userId);
            
            return ResponseEntity.ok(
                new InfoMsg(LocalDate.now(), "Certificato medico caricato con successo: " + fileName));
                
        } catch (IllegalArgumentException e) {
            log.error("Errore validazione upload certificato: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new InfoMsg(LocalDate.now(), e.getMessage()));
        } catch (Exception e) {
            log.error("Errore durante upload certificato: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(new InfoMsg(LocalDate.now(), "Errore durante il caricamento del certificato: " + e.getMessage()));
        }
    }
}
