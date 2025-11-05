package com.example.demo.services;

import java.util.List;
import com.example.demo.entity.Utenti;

public interface UtentiService
{

	public Utenti SelUserByUsername(String username);

	public Utenti SelUserById(Long id);
	
	public void Save(Utenti utente);

	public boolean CheckExistUsername(String username);

	public UtentiService getUtentiService();
	
	public Utenti findByUsername(String username);

	public Utenti findByEmail(String email);

	public List<Utenti> SelPreloadUsers();

	public void deleteUtente(Long id);

}
