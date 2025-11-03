package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

@Service
public class UtentiServiceImpl implements UtentiService {

    @Autowired
	UtenteRepository utentiRepository;

    @Override
	public Utenti SelUserByUsername(String username)
	{
		return utentiRepository.findByUsername(username);
	}

	@Override
	public Utenti SelUserById(Long id) {
		return utentiRepository.findById(id).orElse(null);
	}

    @Override
	public void Save(Utenti utente)
	{
		utentiRepository.save(utente);
	}

    @Override
	public boolean CheckExistUsername(String Username) 
	{
		return utentiRepository.existsByUsername(Username);
	}
    
	@Override
	public UtentiService getUtentiService() {
		return this;
	}
	
	@Override
	public Utenti findByUsername(String username) {
		return utentiRepository.findByUsername(username);
	}

	@Override
	public Utenti findByEmail(String email) {
		return utentiRepository.findByEmail(email);
	}
	
	// Implementazione per ottenere tutti gli utenti
	@Override
	public List<Utenti> SelPreloadUsers() {
		return utentiRepository.findAll();
	}
	
	// Implementazione per eliminare un utente
	@Override
	public void deleteUtente(Long id) {
		utentiRepository.deleteById(id);
	}
}
