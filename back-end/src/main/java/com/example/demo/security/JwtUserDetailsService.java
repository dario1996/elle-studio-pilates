package com.example.demo.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service("CustomUserDetailsService")
@RequiredArgsConstructor
@Log
public class JwtUserDetailsService implements UserDetailsService {

    private final UtenteRepository utenteRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    	Utenti utente = utenteRepository.findByUsername(username);
    	if (utente == null) {
    	    throw new UsernameNotFoundException("Utente non trovato: " + username);
    	}


        List<GrantedAuthority> authorities = utente.getRuoli().stream()
                .map(ruolo -> new SimpleGrantedAuthority("ROLE_" + ruolo))
                .collect(Collectors.toList());

        return new User(
                utente.getUsername(),
                utente.getPassword(),
                utente.getAttivo().equalsIgnoreCase("Si"),
                true, true, true,
                authorities
        );
    }
}
