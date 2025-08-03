package com.example.demo.controller;

import java.time.LocalDate;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
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
