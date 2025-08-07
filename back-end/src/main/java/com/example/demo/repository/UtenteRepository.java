package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Utenti;
 
public interface UtenteRepository extends JpaRepository<Utenti, String> 
{
	boolean existsByUsername(String Username);
	
	public Utenti findByUsername(String Username);
	
	// Metodi per la registrazione
	boolean existsByEmail(String email);
	
	boolean existsByCodiceFiscale(String codiceFiscale);
	
	public Utenti findByEmail(String email);
}
