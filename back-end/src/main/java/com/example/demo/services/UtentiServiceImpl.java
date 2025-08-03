package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

@Service
public class UtentiServiceImpl implements UtentiService {

    @Autowired
	UtenteRepository utentiRepository;

    @Override
	public Utenti SelUser(String username)
	{
		return utentiRepository.findByUsername(username);
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
    
}
