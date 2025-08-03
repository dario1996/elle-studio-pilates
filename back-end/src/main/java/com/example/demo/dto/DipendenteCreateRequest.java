package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dati richiesti per registrare un nuovo dipendente")
public class DipendenteCreateRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100, message = "Il nome non può superare 100 caratteri")
    @Schema(description = "Nome del dipendente", example = "Mario", required = true)
    private String nome;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(max = 100, message = "Il cognome non può superare 100 caratteri")
    @Schema(description = "Cognome del dipendente", example = "Rossi", required = true)
    private String cognome;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
    @Size(max = 150, message = "L'email non può superare 150 caratteri")
    @Schema(description = "Email aziendale del dipendente", example = "mario.rossi@azienda.com", required = true)
    private String email;

    @NotBlank(message = "Il codice dipendente è obbligatorio")
    @Size(max = 50, message = "Il codice dipendente non può superare 50 caratteri")
    @Schema(description = "Codice identificativo univoco del dipendente", example = "MR123", required = true)
    private String codiceDipendente;

    @Size(max = 100, message = "Il reparto non può superare 100 caratteri")
    @Schema(description = "Reparto di appartenenza", example = "IT")
    private String reparto;

    @Size(max = 100, message = "Il commerciale non può superare 100 caratteri")
    @Schema(description = "Area commerciale di riferimento", example = "Centro-Nord")
    private String commerciale;

    @Size(max = 100, message = "L'azienda non può superare 100 caratteri")
    @Schema(description = "Azienda di appartenenza", example = "Proxima S.r.l.")
    private String azienda;

    @Size(max = 100, message = "Il ruolo non può superare 100 caratteri")
    @Schema(description = "Ruolo lavorativo", example = "Developer")
    private String ruolo;

    @Size(max = 10, message = "Il campo ISMS non può superare 10 caratteri")
    @Schema(description = "Indicatore ISMS", example = "Si")
    private String isms;

    @Size(max = 100, message = "La sede non può superare 100 caratteri")
    @Schema(description = "Sede di lavoro", example = "Milano")
    private String sede;

    @Size(max = 100, message = "La community non può superare 100 caratteri")
    @Schema(description = "Community di appartenenza", example = "Backend")
    private String community;

    @Size(max = 200, message = "Il responsabile non può superare 200 caratteri")
    @Schema(description = "Responsabile diretto", example = "Mario Rossi")
    private String responsabile;

    public DipendenteCreateRequest() {
    }

    public DipendenteCreateRequest(String nome, String cognome, String email, String codiceDipendente, String reparto,
            String commerciale) {
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.codiceDipendente = codiceDipendente;
        this.reparto = reparto;
        this.commerciale = commerciale;
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

    public String getCodiceDipendente() {
        return codiceDipendente;
    }

    public void setCodiceDipendente(String codiceDipendente) {
        this.codiceDipendente = codiceDipendente;
    }

    public String getReparto() {
        return reparto;
    }

    public void setReparto(String reparto) {
        this.reparto = reparto;
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
}