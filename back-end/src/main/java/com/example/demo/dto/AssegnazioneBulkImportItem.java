package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dati di un'assegnazione per l'importazione massiva")
public class AssegnazioneBulkImportItem {

    @NotBlank(message = "Il nominativo è obbligatorio")
    @Size(max = 200, message = "Il nominativo non può superare 200 caratteri")
    @Schema(description = "Nome e cognome del dipendente", example = "Mario Rossi", required = true)
    private String nominativo;

    @NotBlank(message = "Il corso è obbligatorio")
    @Size(max = 200, message = "Il corso non può superare 200 caratteri")
    @Schema(description = "Nome del corso", example = "Angular Fundamentals", required = true)
    private String corso;

    @Size(max = 200, message = "L'argomento non può superare 200 caratteri")
    @Schema(description = "Argomento del corso (dalla colonna Macro-argomenti)", example = "Sviluppo Software")
    private String argomento;

    @Schema(description = "Data di inizio (formato ISO: YYYY-MM-DD)", example = "2025-01-01")
    private String dataInizio;

    @Schema(description = "Data di completamento (formato ISO: YYYY-MM-DD)", example = "2025-01-15")
    private String dataCompletamento;

    @Size(max = 20, message = "Lo stato non può superare 20 caratteri")
    @Schema(description = "Stato dell'assegnazione", example = "TERMINATO")
    private String stato;

    @Size(max = 50, message = "L'esito non può superare 50 caratteri")
    @Schema(description = "Esito dell'assegnazione", example = "Superato")
    private String esito;

    @Size(max = 100, message = "La fonte richiesta non può superare 100 caratteri")
    @Schema(description = "Fonte della richiesta", example = "Manager")
    private String fonteRichiesta;

    @Size(max = 10, message = "Il campo Impatto ISMS non può superare 10 caratteri")
    @Schema(description = "Impatto ISMS", example = "Si")
    private String impattoIsms;

    @Size(max = 100, message = "Il campo non può superare 100 caratteri")
    @Schema(description = "Modalità", example = "Linkedin")
    private String modalita;

    public AssegnazioneBulkImportItem() {
    }

    public AssegnazioneBulkImportItem(String nominativo, String corso) {
        this.nominativo = nominativo;
        this.corso = corso;
    }

    public String getNominativo() {
        return nominativo;
    }

    public void setNominativo(String nominativo) {
        this.nominativo = nominativo;
    }

    public String getCorso() {
        return corso;
    }

    public void setCorso(String corso) {
        this.corso = corso;
    }

    public String getArgomento() {
        return argomento;
    }

    public void setArgomento(String argomento) {
        this.argomento = argomento;
    }

    public String getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(String dataInizio) {
        this.dataInizio = dataInizio;
    }

    public String getDataCompletamento() {
        return dataCompletamento;
    }

    public void setDataCompletamento(String dataCompletamento) {
        this.dataCompletamento = dataCompletamento;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public String getEsito() {
        return esito;
    }

    public void setEsito(String esito) {
        this.esito = esito;
    }

    public String getFonteRichiesta() {
        return fonteRichiesta;
    }

    public void setFonteRichiesta(String fonteRichiesta) {
        this.fonteRichiesta = fonteRichiesta;
    }

    public String getImpattoIsms() {
        return impattoIsms;
    }

    public void setImpattoIsms(String impattoIsms) {
        this.impattoIsms = impattoIsms;
    }

    public String getModalita() {
        return modalita;
    }

    public void setModalita(String modalita) {
        this.modalita = modalita;
    }

    @Override
    public String toString() {
        return "AssegnazioneBulkImportItem{" +
                "nominativo='" + nominativo + '\'' +
                ", corso='" + corso + '\'' +
                ", argomento='" + argomento + '\'' +
                ", dataInizio='" + dataInizio + '\'' +
                ", dataCompletamento='" + dataCompletamento + '\'' +
                ", stato='" + stato + '\'' +
                ", esito='" + esito + '\'' +
                ", fonteRichiesta='" + fonteRichiesta + '\'' +
                ", impattoIsms='" + impattoIsms + '\'' +
                ", modalita='" + modalita + '\'' +
                '}';
    }
}
