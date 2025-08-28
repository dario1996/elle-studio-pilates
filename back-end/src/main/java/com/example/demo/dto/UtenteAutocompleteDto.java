package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtenteAutocompleteDto {
    private String username;
    private String nome;
    private String cognome;
    private String email;
    
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
