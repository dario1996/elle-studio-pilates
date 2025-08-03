package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Richiesta per l'importazione massiva di assegnazioni")
public class AssegnazioneBulkImportRequest {

    @NotNull(message = "La lista delle assegnazioni è obbligatoria")
    @Size(min = 1, max = 1000, message = "La lista deve contenere tra 1 e 1000 assegnazioni")
    @Schema(description = "Lista delle assegnazioni da importare", required = true)
    private List<AssegnazioneBulkImportItem> assegnazioni;

    @Schema(description = "Opzioni di importazione")
    private BulkImportOptions options;

    public AssegnazioneBulkImportRequest() {
        this.options = new BulkImportOptions();
    }

    public AssegnazioneBulkImportRequest(List<AssegnazioneBulkImportItem> assegnazioni) {
        this.assegnazioni = assegnazioni;
        this.options = new BulkImportOptions();
    }

    public List<AssegnazioneBulkImportItem> getAssegnazioni() {
        return assegnazioni;
    }

    public void setAssegnazioni(List<AssegnazioneBulkImportItem> assegnazioni) {
        this.assegnazioni = assegnazioni;
    }

    public BulkImportOptions getOptions() {
        return options;
    }

    public void setOptions(BulkImportOptions options) {
        this.options = options;
    }

    @Schema(description = "Opzioni per l'importazione massiva")
    public static class BulkImportOptions {
        
        @Schema(description = "Se saltare gli elementi con errori e continuare l'importazione", example = "true")
        private boolean skipErrors = true;

        @Schema(description = "Se aggiornare le assegnazioni esistenti in caso di duplicati", example = "false")
        private boolean updateExisting = false;

        @Schema(description = "Se creare automaticamente i corsi mancanti durante l'importazione", example = "false")
        private boolean creaCorsiMancanti = false;

            public BulkImportOptions() {
        }

            public boolean isSkipErrors() {
            return skipErrors;
        }

        public void setSkipErrors(boolean skipErrors) {
            this.skipErrors = skipErrors;
        }

        public boolean isUpdateExisting() {
            return updateExisting;
        }

        public void setUpdateExisting(boolean updateExisting) {
            this.updateExisting = updateExisting;
        }

        public boolean isCreaCorsiMancanti() {
            return creaCorsiMancanti;
        }

        public void setCreaCorsiMancanti(boolean creaCorsiMancanti) {
            this.creaCorsiMancanti = creaCorsiMancanti;
        }
    }

    @Override
    public String toString() {
        return "AssegnazioneBulkImportRequest{" +
                "assegnazioni=" + (assegnazioni != null ? assegnazioni.size() : 0) + " items" +
                ", options=" + options +
                '}';
    }
}
