package com.example.demo.dto;

import java.util.List;

public class ModificaUtenteDTO {
    private Long id;
    private String username;
    private String email;
    private String nome;
    private String cognome;
    private String codiceFiscale;
    private String indirizzo;
    private String città;
    private String telefono;
    private String attivo; // "Si" o "No"
    private List<String> ruoli;
    private List<Long> pacchettiDisponibiliIds; // Lista di ID dei pacchetti
    
    public ModificaUtenteDTO() {
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

    public List<Long> getPacchettiDisponibiliIds() {
        return pacchettiDisponibiliIds;
    }

    public void setPacchettiDisponibiliIds(List<Long> pacchettiDisponibiliIds) {
        this.pacchettiDisponibiliIds = pacchettiDisponibiliIds;
    }
}
