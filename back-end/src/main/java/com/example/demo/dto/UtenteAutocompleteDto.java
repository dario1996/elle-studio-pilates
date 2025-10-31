package com.example.demo.dto;

public class UtenteAutocompleteDto {
    private String username;
    private String nome;
    private String cognome;
    private String email;

    public UtenteAutocompleteDto() {
    }

    public UtenteAutocompleteDto(String username, String nome, String cognome, String email) {
        this.username = username;
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
    
    // Campo calcolato per la visualizzazione
    public String getNominativo() {
        if (nome != null && cognome != null) {
            return nome + " " + cognome;
        } else if (nome != null) {
            return nome;
        } else if (cognome != null) {
            return cognome;
        } else {
            return username;
        }
    }
    
    // Campo calcolato per la ricerca
    public String getDisplayText() {
        String nominativo = getNominativo();
        if (!nominativo.equals(username)) {
            return nominativo + " (" + username + ")";
        }
        return nominativo;
    }
}
