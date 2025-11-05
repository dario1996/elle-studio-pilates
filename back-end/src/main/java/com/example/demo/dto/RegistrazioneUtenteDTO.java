package com.example.demo.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegistrazioneUtenteDTO {
    
    // Step 1: Dettagli Profilo
    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100, message = "Il nome non può superare i 100 caratteri")
    private String nome;
    
    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(max = 100, message = "Il cognome non può superare i 100 caratteri")
    private String cognome;
    
    @NotBlank(message = "Il codice fiscale è obbligatorio")
    @Size(min = 16, max = 16, message = "Il codice fiscale deve essere di 16 caratteri")
    private String codiceFiscale;

    @NotBlank(message = "L'indirizzo è obbligatorio")
    @Size(min = 10, max = 100, message = "L'indirizzo deve essere tra 10 e 100 caratteri")
    private String indirizzo;

    @NotBlank(message = "La città è obbligatoria")
    @Size(max = 100, message = "La città non può superare i 100 caratteri")
    private String città;

    private String telefono;
    
    // Step 2: Certificato Medico
    private String certificatoMedico; // Path del file uploadato
    
    @NotNull(message = "Specificare se si hanno patologie è obbligatorio")
    private Boolean patologie;
    
    private String descrizionePatologie;
    
    private String obiettivi;
    
    // Step 3: Email e Password
    @NotBlank(message = "Lo username è obbligatorio")
    @Size(min = 3, max = 50, message = "Lo username deve essere tra 3 e 50 caratteri")
    private String username;
    
    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
    @Size(max = 150, message = "L'email non può superare i 150 caratteri")
    private String email;
    
    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, message = "La password deve avere almeno 8 caratteri")
    private String password;
    
    @NotBlank(message = "La conferma password è obbligatoria")
    private String confirmPassword;
    
    // Campi di sistema
    private String attivo = "No";
    private List<String> ruoli;
    
    public RegistrazioneUtenteDTO() {
    }

    public RegistrazioneUtenteDTO(String nome, String cognome, String codiceFiscale, String indirizzo, String città, String telefono,
                                  String certificatoMedico, Boolean patologie, String descrizionePatologie, String obiettivi,
                                  String username, String email, String password, String confirmPassword,
                                  String attivo, List<String> ruoli) {
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
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.attivo = attivo;
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

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
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

    // Metodo per validare che le password coincidano
    public boolean isPasswordMatching() {
        return password != null && password.equals(confirmPassword);
    }
}
