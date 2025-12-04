package com.example.demo.security;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Utenti;
import com.example.demo.entity.Vendita.StatoVendita;
import com.example.demo.repository.PrenotazioneLezioneRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.repository.VenditaRepository;

@Service("CustomUserDetailsService")
public class JwtUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(JwtUserDetailsService.class);

    private final UtenteRepository utenteRepository;
    private final VenditaRepository venditaRepository;
    private final PrenotazioneLezioneRepository prenotazioneRepository;

    public JwtUserDetailsService(final UtenteRepository utenteRepository,
                                 final VenditaRepository venditaRepository,
                                 final PrenotazioneLezioneRepository prenotazioneRepository) {
        this.utenteRepository = utenteRepository;
        this.venditaRepository = venditaRepository;
        this.prenotazioneRepository = prenotazioneRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    	Utenti utente = utenteRepository.findByUsername(username);
    	if (utente == null) {
	    	log.warn("Utente non trovato: {}", username);
	    	throw new UsernameNotFoundException("Utente non trovato: " + username);
    	}
    	
    	// Verifica se l'utente è attivo
    	// Condizioni per l'attivazione:
    	// 1. Campo attivo NON deve essere esplicitamente "No" o "0" (non disabilitato manualmente)
    	// 2. E DEVE avere almeno una delle seguenti condizioni:
    	//    a) Campo attivo = "Si" o "1" (attivazione manuale da admin)
    	//    b) OPPURE ha almeno un pacchetto associato (vendita pagata)
    	//    c) OPPURE ha almeno una lezione posturale prenotata
    	
    	boolean isDisabilitatoManualmente = utente.getAttivo() != null && 
    	                                     (utente.getAttivo().equalsIgnoreCase("No") || utente.getAttivo().equals("0"));
    	
    	// Se l'utente è disabilitato manualmente, non può accedere
    	if (isDisabilitatoManualmente) {
    	    log.info("Utente {} disabilitato manualmente dall'amministratore", username);
    	    boolean isEnabled = false;
    	    
    	    List<GrantedAuthority> authorities = utente.getRuoli().stream()
    	            .map(ruolo -> new SimpleGrantedAuthority("ROLE_" + ruolo))
    	            .collect(Collectors.toList());

    	    return new User(
    	            utente.getUsername(),
    	            utente.getPassword(),
    	            isEnabled, // enabled = false
    	            true,      // accountNonExpired
    	            true,      // credentialsNonExpired
    	            true,      // accountNonLocked
    	            authorities
    	    );
    	}
    	
    	// L'utente non è disabilitato manualmente, verifichiamo le altre condizioni
    	boolean attivoManuale = utente.getAttivo() != null && 
    	                        (utente.getAttivo().equalsIgnoreCase("Si") || utente.getAttivo().equals("1"));
    	
    	boolean haPacchettiAssociati = false;
    	boolean haLezionePosturalePrenotata = false;
    	
    	if (!attivoManuale) {
    	    // Verifica se ha pacchetti (vendite pagate)
    	    List<com.example.demo.entity.Vendita> vendite = venditaRepository.findByUtenteUsernameAndStatoOrderByDataAcquistoDesc(
    	        username, 
    	        StatoVendita.PAID
    	    );
    	    haPacchettiAssociati = vendite != null && !vendite.isEmpty();
    	    
    	    // Verifica se ha almeno una lezione posturale prenotata (futura)
    	    long countLezioniPosturali = prenotazioneRepository.findByUtente_UsernameAndStatoAndDataLezioneGreaterThanEqual(
    	        username,
    	        com.example.demo.entity.PrenotazioneLezione.StatoPrenotazione.CONFERMATA,
    	        LocalDate.now()
    	    ).stream()
    	    .filter(p -> "STUDIO_POSTURALE".equals(p.getTipoLezione()))
    	    .count();
    	    
    	    haLezionePosturalePrenotata = countLezioniPosturali > 0;
    	    
    	    log.info("Utente {}: attivo manuale={}, pacchetti={}, lezioni posturali={}", 
    	        username, attivoManuale, haPacchettiAssociati, haLezionePosturalePrenotata);
    	}
    	
    	boolean isEnabled = attivoManuale || haPacchettiAssociati || haLezionePosturalePrenotata;

        List<GrantedAuthority> authorities = utente.getRuoli().stream()
                .map(ruolo -> new SimpleGrantedAuthority("ROLE_" + ruolo))
                .collect(Collectors.toList());

        return new User(
                utente.getUsername(),
                utente.getPassword(),
                isEnabled, // enabled
                true,      // accountNonExpired
                true,      // credentialsNonExpired
                true,      // accountNonLocked
                authorities
        );
    }
}
