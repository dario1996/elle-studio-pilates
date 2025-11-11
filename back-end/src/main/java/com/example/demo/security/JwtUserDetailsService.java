package com.example.demo.security;

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
import com.example.demo.repository.UtenteRepository;

@Service("CustomUserDetailsService")
public class JwtUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(JwtUserDetailsService.class);

    private final UtenteRepository utenteRepository;

    public JwtUserDetailsService(final UtenteRepository utenteRepository) {
        this.utenteRepository = utenteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    	Utenti utente = utenteRepository.findByUsername(username);
    	if (utente == null) {
	    	log.warn("Utente non trovato: {}", username);
	    	throw new UsernameNotFoundException("Utente non trovato: " + username);
    	}
    	
    	// Verifica se l'utente è attivo
    	boolean isEnabled = utente.getAttivo() != null && 
    	                    (utente.getAttivo().equalsIgnoreCase("Si") || utente.getAttivo().equals("1"));

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
