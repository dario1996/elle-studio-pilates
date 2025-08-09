package com.example.demo.controller;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Utenti;
import com.example.demo.exceptions.BindingException;
import com.example.demo.services.UtentiService;

import lombok.SneakyThrows;
import lombok.extern.java.Log;

@Log
@RestController
@RequestMapping(value = "/api/utenti")
public class UtentiController {
    @Autowired
	UtentiService utentiService;
	
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
	@Autowired
	private ResourceBundleMessageSource errMessage;

    // 🆕 ENDPOINT GET per ottenere la lista degli utenti
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Utenti>> getListaUtenti() {
        log.info("Richiesta lista utenti");
        try {
            List<Utenti> utenti = utentiService.SelPreloadUsers();
            return ResponseEntity.ok(utenti);
        } catch (Exception e) {
            log.severe("Errore nel recupero degli utenti: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🆕 ENDPOINT PUT per modificare un utente
    @PutMapping(value = "/{username}", produces = "application/json")
    @SneakyThrows
    public ResponseEntity<InfoMsg> updateUtente(@PathVariable String username, 
            @RequestBody Utenti utente, BindingResult bindingResult) {
        
        log.info("Richiesta modifica utente: " + username);
        
        if (bindingResult.hasErrors()) {
            String MsgErr = errMessage.getMessage(bindingResult.getFieldError(), LocaleContextHolder.getLocale());
            log.warning(MsgErr);
            throw new BindingException(MsgErr);
        }
        
        Utenti existingUtente = utentiService.SelUser(username);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        // Aggiorna i campi
        existingUtente.setNome(utente.getNome());
        existingUtente.setCognome(utente.getCognome());
        existingUtente.setEmail(utente.getEmail());
        existingUtente.setCodiceFiscale(utente.getCodiceFiscale());
        existingUtente.setAttivo(utente.getAttivo());
        existingUtente.setPatologie(utente.getPatologie());
        existingUtente.setDescrizionePatologie(utente.getDescrizionePatologie());
        existingUtente.setObiettivi(utente.getObiettivi());
        
        // Aggiorna password solo se fornita
        if (utente.getPassword() != null && !utente.getPassword().isBlank()) {
            existingUtente.setPassword(passwordEncoder.encode(utente.getPassword()));
        }
        
        // Aggiorna ruoli
        if (utente.getRuoli() != null) {
            existingUtente.setRuoli(Arrays.asList(utente.getRuoli().toArray(new String[0])));
        }
        
        utentiService.Save(existingUtente);
        
        return ResponseEntity.ok(new InfoMsg(LocalDate.now(), 
                String.format("Utente %s modificato con successo", username)));
    }

    // 🆕 ENDPOINT DELETE per eliminare un utente
    @DeleteMapping(value = "/{username}", produces = "application/json")
    public ResponseEntity<InfoMsg> deleteUtente(@PathVariable String username) {
        log.info("Richiesta eliminazione utente: " + username);
        
        Utenti existingUtente = utentiService.SelUser(username);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        try {
            utentiService.deleteUtente(username);
            return ResponseEntity.ok(new InfoMsg(LocalDate.now(), 
                    String.format("Utente %s eliminato con successo", username)));
        } catch (Exception e) {
            log.severe("Errore nell'eliminazione dell'utente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new InfoMsg(LocalDate.now(), "Errore nell'eliminazione dell'utente"));
        }
    }

    // 🆕 ENDPOINT PUT per cambiare stato utente (attivo/non attivo)
    @PutMapping(value = "/{username}/toggle-status", produces = "application/json")
    public ResponseEntity<InfoMsg> toggleUtenteStatus(@PathVariable String username) {
        log.info("Richiesta cambio stato utente: " + username);
        
        Utenti existingUtente = utentiService.SelUser(username);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        // Toggle dello stato
        String nuovoStato = "Si".equals(existingUtente.getAttivo()) ? "No" : "Si";
        existingUtente.setAttivo(nuovoStato);
        
        utentiService.Save(existingUtente);
        
        return ResponseEntity.ok(new InfoMsg(LocalDate.now(), 
                String.format("Stato utente %s cambiato in: %s", username, 
                        "Si".equals(nuovoStato) ? "Attivo" : "Non attivo")));
    }

    @PostMapping(value = "/inserisci", produces = "application/json")
	@SneakyThrows
	public ResponseEntity<InfoMsg> addNewUser(@RequestBody Utenti utente, 
	    BindingResult bindingResult) {

	    Utenti checkUtente = utentiService.SelUser(utente.getUsername());

	    if (bindingResult.hasErrors()) {
	        String MsgErr = errMessage.getMessage(bindingResult.getFieldError(), LocaleContextHolder.getLocale());
	        log.warning(MsgErr);
	        throw new BindingException(MsgErr);
	    }
	    
	    // Controlla se l'username esiste già
	    if (utentiService.CheckExistUsername(utente.getUsername())) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                .body(new InfoMsg(LocalDate.now(), "Username già in uso!"));
	    }

	    if (checkUtente != null) {
	        log.info("Modifica Utente");
	        utente.setUsername(checkUtente.getUsername());

	        if (utente.getPassword() == null || utente.getPassword().isBlank()) {
	            utente.setPassword(checkUtente.getPassword());
	        } else {
	            utente.setPassword(passwordEncoder.encode(utente.getPassword()));
	        }

	    } else {
	        log.info("Inserimento Nuovo Utente");
	        utente.setPassword(passwordEncoder.encode(utente.getPassword()));
	    }

	    if (utente.getRuoli() != null) {
	        utente.setRuoli(Arrays.asList(utente.getRuoli().toArray(new String[0])));
	    }

	    utentiService.Save(utente);

	    return new ResponseEntity<>(
	        new InfoMsg(LocalDate.now(), 
	        String.format("Inserimento Utente %s Eseguito Con Successo", utente.getUsername())),
	        HttpStatus.CREATED
	    );
	}
}
