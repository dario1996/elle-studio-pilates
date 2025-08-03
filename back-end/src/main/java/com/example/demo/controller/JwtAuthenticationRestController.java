package com.example.demo.controller;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.JwtTokenRequest;
import com.example.demo.entity.JwtTokenResponse;
import com.example.demo.entity.JwtTokensResponse;
import com.example.demo.exceptions.AuthenticationException;
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
		
		log.warning(String.format("Access Token %s", accessToken));
		log.warning(String.format("Refresh Token %s", refreshToken));

		JwtTokensResponse response = new JwtTokensResponse(
			accessToken, 
			refreshToken, 
			jwtConfig.getExpiration(), 
			"Bearer"
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
}
