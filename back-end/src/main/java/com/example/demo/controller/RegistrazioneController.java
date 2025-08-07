package com.example.demo.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RegistrazioneUtenteDTO;
import com.example.demo.controller.InfoMsg;
import com.example.demo.services.RegistrazioneService;

import jakarta.validation.Valid;
import lombok.extern.java.Log;

@Log
@RestController
@RequestMapping(value = "/api/registrazione")
public class RegistrazioneController {

    @Autowired
    private RegistrazioneService registrazioneService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

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
                
                log.warning("Errori di validazione: " + errorMsg);
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
            String result = registrazioneService.registraUtente(registrazioneDTO);

            log.info("Registrazione completata con successo per: " + registrazioneDTO.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new InfoMsg(LocalDate.now(), result));

        } catch (Exception e) {
            log.severe("Errore durante la registrazione: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new InfoMsg(LocalDate.now(), "Errore interno durante la registrazione"));
        }
    }
}
