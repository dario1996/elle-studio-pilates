package com.example.demo.dto;

import com.example.demo.entity.Corso;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dati richiesti per creare un nuovo corso")
public class CorsoCreateRequest {

    @NotBlank(message = "Il nome del corso è obbligatorio")
    @Size(max = 200, message = "Il nome non può superare 200 caratteri")
    @Schema(description = "Nome del corso", example = "Project Management Base", required = true)
    private String nome;

    @NotNull(message = "L'ID della piattaforma è obbligatorio")
    @Positive(message = "L'ID della piattaforma deve essere positivo")
    @Schema(description = "ID della piattaforma di erogazione", example = "1", required = true)
    private Long piattaformaId;

    @Schema(description = "Stato del corso", example = "PIANIFICATO", allowableValues = { "PIANIFICATO", "IN_CORSO",
            "COMPLETATO", "SOSPESO", "ANNULLATO", "SCADUTO" })
    private String stato = "PIANIFICATO";

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Data di inizio del corso", example = "2025-06-01", type = "string", format = "date")
    private LocalDate dataInizio;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Data di fine del corso", example = "2025-06-15", type = "string", format = "date")
    private LocalDate dataFine;

    @Positive(message = "La durata deve essere positiva")
    @Schema(description = "Durata del corso in ore", example = "12.0")
    private BigDecimal durata;

    @Schema(description = "Indica se è richiesto il feedback al completamento", example = "true")
    private Boolean feedbackRichiesto = false;

    @Size(max = 100, message = "La categoria non può superare 100 caratteri")
    @Schema(description = "Categoria del corso", example = "Management")
    private String categoria;

    @Size(max = 100, message = "L'argomento non può superare 100 caratteri")
    @Schema(description = "Argomento principale", example = "Project Management")
    private String argomento;

    @Size(max = 50, message = "La priorità non può superare 50 caratteri")
    @Schema(description = "Priorità del corso", example = "ALTA", allowableValues = { "ALTA", "MEDIA", "BASSA" })
    private String priorita;

    @Size(max = 500, message = "L'URL non può superare 500 caratteri")
    @Schema(description = "URL del corso", example = "https://learning.example.com/course/123")
    private String urlCorso;

    @Schema(description = "Costo del corso", example = "150.00")
    private BigDecimal costo;

    @Schema(description = "Indica se viene rilasciata una certificazione", example = "false")
    private Boolean certificazioneRilasciata = false;

    public CorsoCreateRequest() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Long getPiattaformaId() {
        return piattaformaId;
    }

    public void setPiattaformaId(Long piattaformaId) {
        this.piattaformaId = piattaformaId;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public LocalDate getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDate dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDate getDataFine() {
        return dataFine;
    }

    public void setDataFine(LocalDate dataFine) {
        this.dataFine = dataFine;
    }

    public BigDecimal getDurata() {
        return durata;
    }

    public void setDurata(BigDecimal durata) {
        this.durata = durata;
    }

    public Boolean getFeedbackRichiesto() {
        return feedbackRichiesto;
    }

    public void setFeedbackRichiesto(Boolean feedbackRichiesto) {
        this.feedbackRichiesto = feedbackRichiesto;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getArgomento() {
        return argomento;
    }

    public void setArgomento(String argomento) {
        this.argomento = argomento;
    }

    public String getPriorita() {
        return priorita;
    }

    public void setPriorita(String priorita) {
        this.priorita = priorita;
    }

    public String getUrlCorso() {
        return urlCorso;
    }

    public void setUrlCorso(String urlCorso) {
        this.urlCorso = urlCorso;
    }

    public BigDecimal getCosto() {
        return costo;
    }

    public void setCosto(BigDecimal costo) {
        this.costo = costo;
    }

    public Boolean getCertificazioneRilasciata() {
        return certificazioneRilasciata;
    }

    public void setCertificazioneRilasciata(Boolean certificazioneRilasciata) {
        this.certificazioneRilasciata = certificazioneRilasciata;
    }

    public Corso.StatoCorso getStatoEnum() {
        try {
            return Corso.StatoCorso.valueOf(stato.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Corso.StatoCorso.PIANIFICATO;
        }
    }
}