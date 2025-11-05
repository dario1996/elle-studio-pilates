package com.example.demo.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.converter.StringListConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "utenti")
public class Utenti
{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;
	
	@Column(name = "username", unique = true, nullable = false)
	private String username;
	
	@Column(name = "email")
	private String email;
	
	@Column(name = "password")
	private String password;
	
	@Column(name = "attivo")
	private String attivo = "No";
	
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
	private String certificatoMedico;

	@Column(name = "indirizzo")
	private String indirizzo;

	@Column(name = "città")
	private String città;	

	@Column(name = "telefono")
	private String telefono;
	
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
	
	@ManyToMany
	@JoinTable(
	    name = "utente_pacchetti_disponibili",
	    joinColumns = @JoinColumn(name = "utente_id"),
	    inverseJoinColumns = @JoinColumn(name = "pacchetto_id")
	)
	@JsonIgnore
	private Set<Pacchetto> pacchettiDisponibili = new HashSet<>();

	@PrePersist
	protected void onCreate() {
		this.dataCreazione = LocalDateTime.now();
	}
	
	@PreUpdate
	protected void onUpdate() {
		this.dataModifica = LocalDateTime.now();
	}
	
	// Metodo per esporre solo gli ID dei pacchetti al frontend
	@JsonProperty("pacchettiDisponibiliIds")
	public List<Long> getPacchettiDisponibiliIds() {
		if (pacchettiDisponibili == null) {
			return List.of();
		}
		return pacchettiDisponibili.stream()
				.map(Pacchetto::getId)
				.collect(Collectors.toList());
	}

	public Utenti() {
	}

	public Utenti(Long id,
				String username,
				String email,
				String password,
				String attivo,
				List<String> ruoli,
				String nome,
				String cognome,
				String codiceFiscale,
				String indirizzo,
				String città,
				String telefono,
				String certificatoMedico,
				Boolean patologie,
				String descrizionePatologie,
				String obiettivi,
				LocalDateTime dataCreazione,
				LocalDateTime dataModifica) {
		this.id = id;
		this.username = username;
		this.email = email;
		this.password = password;
		this.attivo = attivo;
		this.ruoli = ruoli;
		this.nome = nome;
		this.cognome = cognome;
		this.codiceFiscale = codiceFiscale;
		this.indirizzo = indirizzo;
		this.città = città;
		this.telefono = telefono;
		this.certificatoMedico = certificatoMedico;
		this.patologie = patologie;
		this.descrizionePatologie = descrizionePatologie;
		this.obiettivi = obiettivi;
		this.dataCreazione = dataCreazione;
		this.dataModifica = dataModifica;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getAttivo() {
		return attivo;
	}

	public void setAttivo(String attivo) {
		this.attivo = attivo;
	}

	public List<String> getRuoli() {
		return ruoli;
	}

	public void setRuoli(List<String> ruoli) {
		this.ruoli = ruoli;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCognome() {
		return cognome;
	}

	public void setCognome(String cognome) {
		this.cognome = cognome;
	}

	public String getCodiceFiscale() {
		return codiceFiscale;
	}

	public void setCodiceFiscale(String codiceFiscale) {
		this.codiceFiscale = codiceFiscale;
	}

	public String getIndirizzo() {
		return indirizzo;
	}
	
	public void setIndirizzo(String indirizzo) {
		this.indirizzo = indirizzo;
	}

	public String getCittà() {
		return città;
	}

	public void setCittà(String città) {
		this.città = città;
	}

	public String getTelefono() {
		return telefono;
	}

	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}

	public String getCertificatoMedico() {
		return certificatoMedico;
	}

	public void setCertificatoMedico(String certificatoMedico) {
		this.certificatoMedico = certificatoMedico;
	}

	public Boolean getPatologie() {
		return patologie;
	}

	public void setPatologie(Boolean patologie) {
		this.patologie = patologie;
	}

	public String getDescrizionePatologie() {
		return descrizionePatologie;
	}

	public void setDescrizionePatologie(String descrizionePatologie) {
		this.descrizionePatologie = descrizionePatologie;
	}

	public String getObiettivi() {
		return obiettivi;
	}

	public void setObiettivi(String obiettivi) {
		this.obiettivi = obiettivi;
	}

	public LocalDateTime getDataCreazione() {
		return dataCreazione;
	}

	public void setDataCreazione(LocalDateTime dataCreazione) {
		this.dataCreazione = dataCreazione;
	}

	public LocalDateTime getDataModifica() {
		return dataModifica;
	}

	public void setDataModifica(LocalDateTime dataModifica) {
		this.dataModifica = dataModifica;
	}

	public Set<Pacchetto> getPacchettiDisponibili() {
		return pacchettiDisponibili;
	}

	public void setPacchettiDisponibili(Set<Pacchetto> pacchettiDisponibili) {
		this.pacchettiDisponibili = pacchettiDisponibili;
	}
	
}
