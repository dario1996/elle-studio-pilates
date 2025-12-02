package com.example.demo.controller;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ModificaUtenteDTO;
import com.example.demo.dto.UtenteAutocompleteDto;
import com.example.demo.entity.Pacchetto;
import com.example.demo.entity.Utenti;
import com.example.demo.exceptions.BindingException;
import com.example.demo.services.RegistrazioneService;
import com.example.demo.services.UtentiService;

@RestController
@RequestMapping(value = "/api/utenti")
public class UtentiController {
    private static final Logger log = LoggerFactory.getLogger(UtentiController.class);

    private final UtentiService utentiService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ResourceBundleMessageSource errMessage;
    private final RegistrazioneService registrazioneService;

    public UtentiController(final UtentiService utentiService,
                            final BCryptPasswordEncoder passwordEncoder,
                            final ResourceBundleMessageSource errMessage,
                            final RegistrazioneService registrazioneService) {
        this.utentiService = utentiService;
        this.passwordEncoder = passwordEncoder;
        this.errMessage = errMessage;
        this.registrazioneService = registrazioneService;
    }

    // 🆕 ENDPOINT GET per ottenere la lista degli utenti
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Utenti>> getListaUtenti() {
        log.info("Richiesta lista utenti");
        try {
            List<Utenti> utenti = utentiService.SelPreloadUsers();
            return ResponseEntity.ok(utenti);
        } catch (Exception e) {
            log.error("Errore nel recupero degli utenti: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🆕 ENDPOINT GET per ottenere un utente tramite username
    @GetMapping(value = "/username/{username}", produces = "application/json")
    public ResponseEntity<Utenti> getUtenteByUsername(@PathVariable String username) {
        log.info("Richiesta utente by username: " + username);
        try {
            Utenti utente = utentiService.SelUserByUsername(username);
            if (utente == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok(utente);
        } catch (Exception e) {
            log.error("Errore nel recupero utente: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🆕 ENDPOINT PUT per modificare un utente
    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<InfoMsg> updateUtente(@PathVariable Long id, 
            @RequestBody ModificaUtenteDTO dto, BindingResult bindingResult) throws BindingException {
        
        log.info("Richiesta modifica utente: " + id);
        
        if (bindingResult.hasErrors()) {
            String MsgErr = errMessage.getMessage(bindingResult.getFieldError(), LocaleContextHolder.getLocale());
            log.warn(MsgErr);
            throw new BindingException(MsgErr);
        }
        
        Utenti existingUtente = utentiService.SelUserById(id);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        // Verifica se l'utente sta per essere attivato (era inattivo e diventa attivo)
        boolean staPerEssereAttivato = "No".equals(existingUtente.getAttivo()) && "Si".equals(dto.getAttivo());
        
        // Aggiorna i campi base
        existingUtente.setNome(dto.getNome());
        existingUtente.setCognome(dto.getCognome());
        existingUtente.setEmail(dto.getEmail());
        
        // Aggiorna codice fiscale solo se non è null e non è vuoto
        if (dto.getCodiceFiscale() != null && !dto.getCodiceFiscale().trim().isEmpty()) {
            existingUtente.setCodiceFiscale(dto.getCodiceFiscale());
        } else {
            existingUtente.setCodiceFiscale(null);
        }
        
        // Aggiorna indirizzo, città, telefono
        existingUtente.setIndirizzo(dto.getIndirizzo());
        existingUtente.setCittà(dto.getCittà());
        existingUtente.setTelefono(dto.getTelefono());
        
        existingUtente.setAttivo(dto.getAttivo());
        
        // Aggiorna ruoli
        if (dto.getRuoli() != null) {
            existingUtente.setRuoli(dto.getRuoli());
        }
        
        // Aggiorna patologie, descrizione patologie e obiettivi
        if (dto.getPatologie() != null) {
            existingUtente.setPatologie(dto.getPatologie());
        }
        if (dto.getDescrizionePatologie() != null) {
            existingUtente.setDescrizionePatologie(dto.getDescrizionePatologie());
        }
        if (dto.getObiettivi() != null) {
            existingUtente.setObiettivi(dto.getObiettivi());
        }
        
        // Salva l'utente con i campi base aggiornati
        utentiService.Save(existingUtente);
        
        // Invia email di attivazione se l'utente è stato attivato
        if (staPerEssereAttivato) {
            log.info("Utente attivato, invio email di notifica a: " + existingUtente.getEmail());
            registrazioneService.invioMailAttivazione(existingUtente.getEmail(), existingUtente.getUsername());
        }
        
        // Aggiorna i pacchetti disponibili per l'utente
        if (dto.getPacchettiDisponibiliIds() != null) {
            utentiService.aggiornaPacchettiDisponibili(id, dto.getPacchettiDisponibiliIds());
        }
        
        return ResponseEntity.ok(new InfoMsg(LocalDate.now(), 
                String.format("Utente %s modificato con successo", existingUtente.getUsername())));
    }

    // 🆕 ENDPOINT DELETE per eliminare un utente
    @DeleteMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<InfoMsg> deleteUtente(@PathVariable Long id) {
        log.info("Richiesta eliminazione utente: " + id);

        Utenti existingUtente = utentiService.SelUserById(id);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        try {
            utentiService.deleteUtente(id);
            return ResponseEntity.ok(new InfoMsg(LocalDate.now(),
                    String.format("Utente %s eliminato con successo", id)));
        } catch (Exception e) {
            log.error("Errore nell'eliminazione dell'utente: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new InfoMsg(LocalDate.now(), "Errore nell'eliminazione dell'utente"));
        }
    }

    // 🆕 ENDPOINT GET per autocomplete utenti
    @GetMapping(value = "/autocomplete", produces = "application/json")
    public ResponseEntity<List<UtenteAutocompleteDto>> getUtentiAutocomplete(
            @RequestParam(required = false) String search) {
        log.info("Richiesta autocomplete utenti con search: " + search);
        try {
            List<Utenti> utenti = utentiService.SelPreloadUsers();
            
            // Filtra per utenti attivi e opzionalmente per termine di ricerca
            List<UtenteAutocompleteDto> risultati = utenti.stream()
                    .filter(u -> "Si".equals(u.getAttivo())) // Solo utenti attivi
                    .filter(u -> search == null || search.isEmpty() || 
                            matchesSearch(u, search.toLowerCase()))
                    .map(u -> new UtenteAutocompleteDto(
                            u.getUsername(),
                            u.getNome(),
                            u.getCognome(),
                            u.getEmail()
                    ))
                    .limit(10) // Limita risultati per performance
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(risultati);
        } catch (Exception e) {
            log.error("Errore nell'autocomplete utenti: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🆕 ENDPOINT POST per ottenere utenti per username multipli
    @PostMapping(value = "/by-usernames", produces = "application/json")
    public ResponseEntity<List<Utenti>> getUtentiByUsernames(@RequestBody java.util.Map<String, java.util.List<String>> payload) {
        log.info("Richiesta utenti per usernames multipli");
        try {
            java.util.List<String> usernames = payload.get("usernames");
            if (usernames == null || usernames.isEmpty()) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }
            
            List<Utenti> tuttiUtenti = utentiService.SelPreloadUsers();
            List<Utenti> utentiFiltrati = tuttiUtenti.stream()
                    .filter(u -> usernames.contains(u.getUsername()))
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(utentiFiltrati);
        } catch (Exception e) {
            log.error("Errore nel recupero utenti per usernames: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    private boolean matchesSearch(Utenti utente, String search) {
        if (utente.getUsername() != null && utente.getUsername().toLowerCase().contains(search)) {
            return true;
        }
        if (utente.getNome() != null && utente.getNome().toLowerCase().contains(search)) {
            return true;
        }
        if (utente.getCognome() != null && utente.getCognome().toLowerCase().contains(search)) {
            return true;
        }
        if (utente.getEmail() != null && utente.getEmail().toLowerCase().contains(search)) {
            return true;
        }
        return false;
    }

    // 🆕 ENDPOINT PUT per cambiare stato utente (attivo/non attivo)
    @PutMapping(value = "/{id}/toggle-status", produces = "application/json")
    public ResponseEntity<InfoMsg> toggleUtenteStatus(@PathVariable Long id) {
        log.info("Richiesta cambio stato utente: " + id);

        Utenti existingUtente = utentiService.SelUserById(id);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        // Toggle dello stato
        String nuovoStato = "Si".equals(existingUtente.getAttivo()) ? "No" : "Si";
        existingUtente.setAttivo(nuovoStato);
        
        utentiService.Save(existingUtente);
        
        return ResponseEntity.ok(new InfoMsg(LocalDate.now(), 
                String.format("Stato utente %s cambiato in: %s", existingUtente.getUsername(), 
                        "Si".equals(nuovoStato) ? "Attivo" : "Non attivo")));
    }

    // 🆕 ENDPOINT GET per ottenere i pacchetti disponibili per un utente
    @GetMapping(value = "/{id}/pacchetti-disponibili", produces = "application/json")
    public ResponseEntity<List<Pacchetto>> getPacchettiDisponibili(@PathVariable Long id) {
        log.info("Richiesta pacchetti disponibili per utente: " + id);
        try {
            Utenti utente = utentiService.SelUserById(id);
            if (utente == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<Pacchetto> pacchettiDisponibili = utentiService.getPacchettiDisponibiliPerUtente(id);
            return ResponseEntity.ok(pacchettiDisponibili);
        } catch (Exception e) {
            log.error("Errore nel recupero pacchetti disponibili per utente " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 🆕 ENDPOINT PUT per cambiare la password
    @PutMapping(value = "/{id}/change-password", produces = "application/json")
    public ResponseEntity<InfoMsg> changePassword(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> passwords) {
        log.info("Richiesta cambio password per utente: " + id);
        
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");
        
        // Validazione parametri
        if (oldPassword == null || oldPassword.isEmpty() || 
            newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new InfoMsg(LocalDate.now(), "Password corrente e nuova password sono obbligatorie"));
        }
        
        // Verifica esistenza utente
        Utenti existingUtente = utentiService.SelUserById(id);
        if (existingUtente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InfoMsg(LocalDate.now(), "Utente non trovato"));
        }
        
        // Verifica password corrente
        if (!passwordEncoder.matches(oldPassword, existingUtente.getPassword())) {
            log.warn("Password corrente non valida per utente: {}", existingUtente.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new InfoMsg(LocalDate.now(), "Password corrente non valida"));
        }
        
        // Validazione robustezza nuova password
        if (!isPasswordStrong(newPassword)) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(new InfoMsg(LocalDate.now(), 
                            "La nuova password deve contenere almeno 8 caratteri, " +
                            "una lettera maiuscola, una minuscola, un numero e un carattere speciale"));
        }
        
        // Verifica che la nuova password sia diversa dalla vecchia
        if (passwordEncoder.matches(newPassword, existingUtente.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new InfoMsg(LocalDate.now(), 
                            "La nuova password deve essere diversa da quella corrente"));
        }
        
        // Aggiorna la password
        existingUtente.setPassword(passwordEncoder.encode(newPassword));
        utentiService.Save(existingUtente);
        
        log.info("Password cambiata con successo per utente: " + existingUtente.getUsername());
        return ResponseEntity.ok(new InfoMsg(LocalDate.now(), "Password cambiata con successo"));
    }
    
    /**
     * Valida la robustezza della password
     * - Minimo 8 caratteri
     * - Almeno una lettera maiuscola
     * - Almeno una lettera minuscola
     * - Almeno un numero
     * - Almeno un carattere speciale
     */
    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpperCase = password.matches(".*[A-Z].*");
        boolean hasLowerCase = password.matches(".*[a-z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecialChar = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");
        
        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }

    @PostMapping(value = "/inserisci", produces = "application/json")
	public ResponseEntity<InfoMsg> addNewUser(@RequestBody Utenti utente, 
        BindingResult bindingResult) throws BindingException {

	    Utenti checkUtente = utentiService.SelUserByUsername(utente.getUsername());

        if (bindingResult.hasErrors()) {
            String MsgErr = errMessage.getMessage(bindingResult.getFieldError(), LocaleContextHolder.getLocale());
            log.warn(MsgErr);
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
