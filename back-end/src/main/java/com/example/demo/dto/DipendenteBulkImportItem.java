package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dati di un dipendente per l'importazione massiva")
public class DipendenteBulkImportItem {

    @NotBlank(message = "Il nominativo è obbligatorio")
    @Size(max = 200, message = "Il nominativo non può superare 200 caratteri")
    @Schema(description = "Nome e cognome del dipendente", example = "Mario Rossi", required = true)
    private String nominativo;

    @Schema(description = "Data di cessazione (formato ISO: YYYY-MM-DD)", example = "2025-12-31")
    private String dataCessazione;

    @Size(max = 10, message = "Il campo ISMS non può superare 10 caratteri")
    @Schema(description = "Indicatore ISMS", example = "Si")
    private String isms;

    @NotBlank(message = "Il ruolo è obbligatorio")
    @Size(max = 100, message = "Il ruolo non può superare 100 caratteri")
    @Schema(description = "Ruolo lavorativo", example = "Developer", required = true)
    private String ruolo;

    @NotBlank(message = "L'azienda è obbligatoria")
    @Size(max = 100, message = "L'azienda non può superare 100 caratteri")
    @Schema(description = "Azienda di appartenenza", example = "Proxima S.r.l.", required = true)
    private String azienda;

    @Size(max = 100, message = "La sede non può superare 100 caratteri")
    @Schema(description = "Sede di lavoro", example = "Milano")
    private String sede;

    @Size(max = 100, message = "La community non può superare 100 caratteri")
    @Schema(description = "Community di appartenenza", example = "Backend")
    private String community;

    @Size(max = 200, message = "Il responsabile non può superare 200 caratteri")
    @Schema(description = "Responsabile diretto", example = "Mario Rossi")
    private String responsabile;

    public DipendenteBulkImportItem() {
    }

    public DipendenteBulkImportItem(String nominativo, String ruolo, String azienda) {
        this.nominativo = nominativo;
        this.ruolo = ruolo;
        this.azienda = azienda;
    }

    public String getNominativo() {
        return nominativo;
    }

    public void setNominativo(String nominativo) {
        this.nominativo = nominativo;
    }

    public String getDataCessazione() {
        return dataCessazione;
    }

    public void setDataCessazione(String dataCessazione) {
        this.dataCessazione = dataCessazione;
    }

    public String getIsms() {
        return isms;
    }

    public void setIsms(String isms) {
        this.isms = isms;
    }

    public String getRuolo() {
        return ruolo;
    }

    public void setRuolo(String ruolo) {
        this.ruolo = ruolo;
    }

    public String getAzienda() {
        return azienda;
    }

    public void setAzienda(String azienda) {
        this.azienda = azienda;
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

    @Override
    public String toString() {
        return "DipendenteBulkImportItem{" +
                "nominativo='" + nominativo + '\'' +
                ", dataCessazione='" + dataCessazione + '\'' +
                ", isms='" + isms + '\'' +
                ", ruolo='" + ruolo + '\'' +
                ", azienda='" + azienda + '\'' +
                ", sede='" + sede + '\'' +
                ", community='" + community + '\'' +
                ", responsabile='" + responsabile + '\'' +
                '}';
    }
}
