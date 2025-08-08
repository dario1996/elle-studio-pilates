package com.example.demo.services;

import com.example.demo.entity.Utenti;

public interface UtentiService
{	
	public Utenti SelUser(String Username);
	
	public void Save(Utenti utente);
		
	public boolean CheckExistUsername(String Username);

	public UtentiService getUtentiService();
	
	public Utenti findByUsername(String username);

	public Utenti findByEmail(String email);
}
