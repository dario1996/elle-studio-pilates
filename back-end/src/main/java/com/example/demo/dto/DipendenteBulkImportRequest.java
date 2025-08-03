package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Richiesta per l'importazione massiva di dipendenti")
public class DipendenteBulkImportRequest {

    @NotNull(message = "La lista dei dipendenti è obbligatoria")
    @Size(min = 1, max = 1000, message = "La lista deve contenere tra 1 e 1000 dipendenti")
    @Schema(description = "Lista dei dipendenti da importare", required = true)
    private List<DipendenteBulkImportItem> dipendenti;

    @Schema(description = "Opzioni di importazione")
    private BulkImportOptions options;

    public DipendenteBulkImportRequest() {
        this.options = new BulkImportOptions();
    }

    public DipendenteBulkImportRequest(List<DipendenteBulkImportItem> dipendenti) {
        this.dipendenti = dipendenti;
        this.options = new BulkImportOptions();
    }

    public List<DipendenteBulkImportItem> getDipendenti() {
        return dipendenti;
    }

    public void setDipendenti(List<DipendenteBulkImportItem> dipendenti) {
        this.dipendenti = dipendenti;
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

        @Schema(description = "Se aggiornare i dipendenti esistenti in caso di email duplicata", example = "false")
        private boolean updateExisting = false;

        @Schema(description = "Reparto di default da assegnare se non specificato", example = "IT")
        private String defaultReparto = "IT";

        @Schema(description = "Commerciale di default da assegnare se non specificato", example = "Generale")
        private String defaultCommerciale = "Generale";

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

        public String getDefaultReparto() {
            return defaultReparto;
        }

        public void setDefaultReparto(String defaultReparto) {
            this.defaultReparto = defaultReparto;
        }

        public String getDefaultCommerciale() {
            return defaultCommerciale;
        }

        public void setDefaultCommerciale(String defaultCommerciale) {
            this.defaultCommerciale = defaultCommerciale;
        }
    }

    @Override
    public String toString() {
        return "DipendenteBulkImportRequest{" +
                "dipendenti=" + (dipendenti != null ? dipendenti.size() : 0) + " items" +
                ", options=" + options +
                '}';
    }
}
