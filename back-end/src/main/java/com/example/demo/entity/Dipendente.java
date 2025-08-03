package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dipendenti")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Dipendente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100)
    private String cognome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "commerciale", length = 100)
    private String commerciale;

    @Column(length = 100)
    private String azienda;

    @Column(name = "ruolo", length = 100)
    private String ruolo;

    @Column(name = "reparto", length = 100)
    private String reparto;

    @Column(name = "data_assunzione")
    private LocalDateTime dataAssunzione;

    @Column(name = "data_cessazione")
    private LocalDateTime dataCessazione;

    @Column(name = "codice_dipendente", length = 50, unique = true)
    private String codiceDipendente;

    @Column(name = "isms", length = 10)
    private String isms;

    @Column(name = "sede", length = 100)
    private String sede;

    @Column(name = "community", length = 100)
    private String community;

    @Column(name = "responsabile", length = 200)
    private String responsabile;

    @Column(name = "attivo", nullable = false)
    private Boolean attivo = true;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    // Relazione molti-a-molti con Corso attraverso Assegnazione
    @OneToMany(mappedBy = "dipendente", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Assegnazione> assegnazioni;

    // Relazione uno-a-molti con LogLogin
    @OneToMany(mappedBy = "dipendente", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<LogLogin> logLogin;

    public Dipendente() {
        this.dataCreazione = LocalDateTime.now();
    }

    public Dipendente(String nome, String cognome, String email) {
        this();
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
    }

    @PreUpdate
    public void preUpdate() {
        this.dataModifica = LocalDateTime.now();
    }

    public String getNomeCompleto() {
        return nome + " " + cognome;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCommerciale() {
        return commerciale;
    }

    public void setCommerciale(String commerciale) {
        this.commerciale = commerciale;
    }

    public String getAzienda() {
        return azienda;
    }

    public void setAzienda(String azienda) {
        this.azienda = azienda;
    }

    public String getRuolo() {
        return ruolo;
    }

    public void setRuolo(String ruolo) {
        this.ruolo = ruolo;
    }

    public String getReparto() {
        return reparto;
    }

    public void setReparto(String reparto) {
        this.reparto = reparto;
    }

    public LocalDateTime getDataAssunzione() {
        return dataAssunzione;
    }

    public void setDataAssunzione(LocalDateTime dataAssunzione) {
        this.dataAssunzione = dataAssunzione;
    }

    public LocalDateTime getDataCessazione() {
        return dataCessazione;
    }

    public void setDataCessazione(LocalDateTime dataCessazione) {
        this.dataCessazione = dataCessazione;
    }

    public String getCodiceDipendente() {
        return codiceDipendente;
    }

    public void setCodiceDipendente(String codiceDipendente) {
        this.codiceDipendente = codiceDipendente;
    }

    public String getIsms() {
        return isms;
    }

    public void setIsms(String isms) {
        this.isms = isms;
    }

    public String getSede() {
        return sede;
    }

    public void setSede(String sede) {
        this.sede = sede;
    }

    public String getCommunity() {
        return community;
    }

    public void setCommunity(String community) {
        this.community = community;
    }

    public String getResponsabile() {
        return responsabile;
    }

    public void setResponsabile(String responsabile) {
        this.responsabile = responsabile;
    }

    public Boolean getAttivo() {
        return attivo;
    }

    public void setAttivo(Boolean attivo) {
        this.attivo = attivo;
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

    public List<Assegnazione> getAssegnazioni() {
        return assegnazioni;
    }

    public void setAssegnazioni(List<Assegnazione> assegnazioni) {
        this.assegnazioni = assegnazioni;
    }

    public List<LogLogin> getLogLogin() {
        return logLogin;
    }

    public void setLogLogin(List<LogLogin> logLogin) {
        this.logLogin = logLogin;
    }
}