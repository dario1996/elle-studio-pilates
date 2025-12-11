package com.example.demo.controller;

import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = {"http://localhost:4200", "https://d1g9w0fi1247xw.cloudfront.net", "http://frontendstack-angularsitebucket92ab5f40-0eshkezhkns1.s3-website-eu-west-1.amazonaws.com"})@RestController
public class JwtAuthenticationRestController 
{

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationRestController.class);

	@Value("${sicurezza.header}")
	private String tokenHeader;

	private final AuthenticationManager authenticationManager;

	private final JwtTokenUtil jwtTokenUtil;

	private final JwtConfig jwtConfig;

	private final UserDetailsService userDetailsService;

	private final UtenteRepository utentiRepository;

	public JwtAuthenticationRestController(final AuthenticationManager authenticationManager,
	                                      final JwtTokenUtil jwtTokenUtil,
	                                      final JwtConfig jwtConfig,
	                                      @Qualifier("CustomUserDetailsService") final UserDetailsService userDetailsService,
	                                      final UtenteRepository utentiRepository) {
		this.authenticationManager = authenticationManager;
		this.jwtTokenUtil = jwtTokenUtil;
		this.jwtConfig = jwtConfig;
		this.userDetailsService = userDetailsService;
		this.utentiRepository = utentiRepository;
	}
	
	@PostMapping(value = "${sicurezza.uri}")
	public ResponseEntity<JwtTokensResponse> createAuthenticationToken(@RequestBody JwtTokenRequest authenticationRequest) 
	{
		log.info("Autenticazione e Generazione Token");

		try {
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
			String email = utente != null ? utente.getEmail() : "";
			
			log.warn("Access Token {}", accessToken);
			log.warn("Refresh Token {}", refreshToken);

			JwtTokensResponse response = new JwtTokensResponse(
				accessToken, 
				refreshToken, 
				jwtConfig.getExpiration(), 
				"Bearer",
				nome,
				cognome,
				displayName.isEmpty() ? authenticationRequest.getUsername() : displayName,
				email
			);

			return ResponseEntity.ok(response);
			
		} catch (AuthenticationException e) {
			// Gestione errori di autenticazione con codici specifici
			if (e.getMessage().contains("UTENTE DISABILITATO")) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(new JwtTokensResponse("ACCOUNT_DISABLED", 
						"Il tuo account non è ancora stato attivato. Contatta l'amministratore."));
			} else if (e.getMessage().contains("CREDENZIALI NON VALIDE")) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(new JwtTokensResponse("INVALID_CREDENTIALS", 
						"Username o password errati. Riprova."));
			}
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(new JwtTokensResponse("AUTH_ERROR", 
					"Errore durante l'autenticazione."));
		} catch (Exception e) {
			log.error("Errore inatteso durante l'autenticazione", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new JwtTokensResponse("SERVER_ERROR", 
					"Errore del server. Riprova più tardi."));
		}
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
	            log.warn("Refresh token failed: {}", e.getMessage());
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
			log.warn("UTENTE DISABILITATO");
			throw new AuthenticationException("UTENTE DISABILITATO", e);
		} 
		catch (BadCredentialsException e) 
		{
			log.warn("CREDENZIALI NON VALIDE");
			throw new AuthenticationException("CREDENZIALI NON VALIDE", e);
		}
	}
}
