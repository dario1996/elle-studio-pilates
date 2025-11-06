package com.example.demo.services;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Pacchetto;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.PacchettoRepository;
import com.example.demo.repository.UtenteRepository;

@Service
public class UtentiServiceImpl implements UtentiService {

    @Autowired
	UtenteRepository utentiRepository;

	@Autowired
	PacchettoRepository pacchettoRepository;

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

	// Implementazione per aggiornare i pacchetti disponibili per un utente
	@Override
	@Transactional
	public void aggiornaPacchettiDisponibili(Long utenteId, List<Long> pacchettiIds) {
		Utenti utente = utentiRepository.findById(utenteId)
			.orElseThrow(() -> new RuntimeException("Utente non trovato con id: " + utenteId));
		
		Set<Pacchetto> pacchetti = new HashSet<>();
		if (pacchettiIds != null && !pacchettiIds.isEmpty()) {
			pacchetti = new HashSet<>(pacchettoRepository.findAllById(pacchettiIds));
		}
		
		utente.setPacchettiDisponibili(pacchetti);
		utentiRepository.save(utente);
	}

	// Implementazione per recuperare i pacchetti disponibili per un utente
	@Override
	@Transactional(readOnly = true)
	public List<Pacchetto> getPacchettiDisponibiliPerUtente(Long utenteId) {
		Utenti utente = utentiRepository.findById(utenteId)
			.orElseThrow(() -> new RuntimeException("Utente non trovato con id: " + utenteId));
		
		return new java.util.ArrayList<>(utente.getPacchettiDisponibili());
	}
}
