package com.example.demo.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.converter.StringListConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "utenti")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Utenti
{
	@Id
	@Column(name = "username")
	private String username;
	
	@Column(name = "email")
	private String email;
	
	@Column(name = "password")
	private String password;
	
	@Column(name = "attivo")
	private String attivo = "Si";
	
	@Column(name = "ruoli")
    @Convert(converter = StringListConverter.class)
    private List<String> ruoli;
	
	// Nuovi campi per la registrazione
	@Column(name = "nome")
	private String nome;
	
	@Column(name = "cognome")
	private String cognome;
	
	@Column(name = "codice_fiscale")
	private String codiceFiscale;
	
	@Column(name = "certificato_medico")
	private String certificatoMedico; // Path del file uploadato
	
	@Column(name = "patologie")
	private Boolean patologie;
	
	@Column(name = "descrizione_patologie", columnDefinition = "TEXT")
	private String descrizionePatologie;
	
	@Column(name = "obiettivi", columnDefinition = "TEXT")
	private String obiettivi;
	
	// Campi di audit
	@Column(name = "data_creazione")
	private LocalDateTime dataCreazione;
	
	@Column(name = "data_modifica")
	private LocalDateTime dataModifica;
	
	@PrePersist
	protected void onCreate() {
		this.dataCreazione = LocalDateTime.now();
	}
	
	@PreUpdate
	protected void onUpdate() {
		this.dataModifica = LocalDateTime.now();
	}
	
}
