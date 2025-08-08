package com.example.demo.controller;

import com.example.demo.services.UtentiService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.JwtTokenRequest;
import com.example.demo.entity.JwtTokenResponse;
import com.example.demo.entity.JwtTokensResponse;
import com.example.demo.entity.Utenti;
import com.example.demo.exceptions.AuthenticationException;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.security.JwtConfig;
import com.example.demo.security.JwtTokenUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.SneakyThrows;
import lombok.extern.java.Log;
 
@RestController
@Log
public class JwtAuthenticationRestController 
{

	@Value("${sicurezza.header}")
	private String tokenHeader;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;
	
	@Autowired
	private JwtConfig jwtConfig;


	@Autowired
	@Qualifier("CustomUserDetailsService")
	private UserDetailsService userDetailsService;
	
	@Autowired
	private UtenteRepository utentiRepository;
	
	@PostMapping(value = "${sicurezza.uri}")
	@SneakyThrows
	public ResponseEntity<JwtTokensResponse> createAuthenticationToken(@RequestBody JwtTokenRequest authenticationRequest) 
	{
		log.info("Autenticazione e Generazione Token");

		authenticate(authenticationRequest.getUsername(), authenticationRequest.getPassword());

		final UserDetails userDetails = userDetailsService
				.loadUserByUsername(authenticationRequest.getUsername());

		final String accessToken = jwtTokenUtil.generateToken(userDetails);
		final String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
		
		// Recuperare i dati utente dal database
		Utenti utente = utentiRepository.findByUsername(authenticationRequest.getUsername());
		String nome = utente != null ? utente.getNome() : "";
		String cognome = utente != null ? utente.getCognome() : "";
		String displayName = (nome + " " + cognome).trim();
		
		log.warning(String.format("Access Token %s", accessToken));
		log.warning(String.format("Refresh Token %s", refreshToken));

		JwtTokensResponse response = new JwtTokensResponse(
			accessToken, 
			refreshToken, 
			jwtConfig.getExpiration(), 
			"Bearer",
			nome,
			cognome,
			displayName.isEmpty() ? authenticationRequest.getUsername() : displayName
		);

		return ResponseEntity.ok(response);
	}

	@GetMapping("${sicurezza.refresh}")
	public ResponseEntity<JwtTokenResponse> refreshAndGetAuthenticationToken(HttpServletRequest request) {
	    final String authHeader = request.getHeader(jwtConfig.getHeader());

	    if (authHeader != null && authHeader.startsWith(jwtConfig.getPrefix() + " ")) {
	        String refreshToken = authHeader.substring(jwtConfig.getPrefix().length() + 1);

	        try {
	            String newAccessToken = jwtTokenUtil.refreshToken(refreshToken);
	            return ResponseEntity.ok(new JwtTokenResponse(newAccessToken));
	        } catch (Exception e) {
	            log.warning("Refresh token failed: " + e.getMessage());
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	        }
	    }

	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	}


	@ExceptionHandler({ AuthenticationException.class })
	public ResponseEntity<String> handleAuthenticationException(AuthenticationException e) 
	{
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
	}

	private void authenticate(String username, String password) 
	{
		Objects.requireNonNull(username);
		Objects.requireNonNull(password);

		try 
		{
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		} 
		catch (DisabledException e) 
		{
			log.warning("UTENTE DISABILITATO");
			throw new AuthenticationException("UTENTE DISABILITATO", e);
		} 
		catch (BadCredentialsException e) 
		{
			log.warning("CREDENZIALI NON VALIDE");
			throw new AuthenticationException("CREDENZIALI NON VALIDE", e);
		}
	}
	
	/**
	 * NUOVO ENDPOINT - Recupera nome e cognome dell'utente corrente
	 */
	@GetMapping("/api/user/name")
	public ResponseEntity<?> getCurrentUserName(HttpServletRequest request) {
		log.info("🔍 Chiamata ricevuta su /api/user/name");
		
		final String authHeader = request.getHeader("Authorization");
		log.info("📝 Header Authorization: " + (authHeader != null ? "presente" : "mancante"));
		
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			log.info("🎫 Token estratto (lunghezza: " + token.length() + ")");
			
			try {
				String username = jwtTokenUtil.getUsernameFromToken(token);
				log.info("👤 Username dal token: " + username);
				
				if (username != null) {
					// Recupera l'utente dal database
					Utenti user = utentiService.findByUsername(username);
					log.info("🔎 Utente trovato nel DB: " + (user != null ? "SÌ" : "NO"));
					
					if (user != null) {
						// Crea la risposta JSON
						UserNameResponse response = new UserNameResponse();
						response.setNome(user.getNome());
						response.setCognome(user.getCognome());
						
						log.info("✅ Risposta creata - Nome: " + user.getNome() + ", Cognome: " + user.getCognome());
						return ResponseEntity.ok(response);
					} else {
						log.warning("❌ Utente non trovato nel database per username: " + username);
						return ResponseEntity.status(HttpStatus.NOT_FOUND)
							.body(Map.of("error", "Utente non trovato", "username", username));
					}
				} else {
					log.warning("❌ Username non presente nel token");
					return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("error", "Token non valido - username mancante"));
				}
			} catch (Exception e) {
				log.severe("💥 Errore nell'elaborazione del token: " + e.getMessage());
				e.printStackTrace();
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error", "Errore nel token", "message", e.getMessage()));
			}
		} else {
			log.warning("❌ Header Authorization mancante o formato non valido");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(Map.of("error", "Header Authorization mancante o non valido"));
		}
	}
	
	// Classe interna per la risposta JSON
	public static class UserNameResponse {
		private String nome;
		private String cognome;
		
		public UserNameResponse() {}
		
		public String getNome() { return nome; }
		public void setNome(String nome) { this.nome = nome; }
		
		public String getCognome() { return cognome; }
		public void setCognome(String cognome) { this.cognome = cognome; }
	}
}
