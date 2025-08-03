package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.ArrayList;

@Schema(description = "Risposta dell'importazione massiva di dipendenti")
public class DipendenteBulkImportResponse {

    @Schema(description = "Numero totale di dipendenti processati", example = "100")
    private int totalProcessed;

    @Schema(description = "Numero di dipendenti importati con successo", example = "85")
    private int successCount;

    @Schema(description = "Numero di dipendenti con errori", example = "10")
    private int errorCount;

    @Schema(description = "Numero di dipendenti aggiornati (se updateExisting=true)", example = "5")
    private int updatedCount;

    @Schema(description = "Lista degli errori riscontrati durante l'importazione")
    private List<ImportError> errors;

    @Schema(description = "Lista dei dipendenti importati con successo")
    private List<Long> importedIds;

    @Schema(description = "Lista dei dipendenti aggiornati")
    private List<Long> updatedIds;

    @Schema(description = "Tempo di esecuzione in millisecondi", example = "1500")
    private long executionTimeMs;

    public DipendenteBulkImportResponse() {
        this.errors = new ArrayList<>();
        this.importedIds = new ArrayList<>();
        this.updatedIds = new ArrayList<>();
    }

    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(int errorCount) {
        this.errorCount = errorCount;
    }

    public int getUpdatedCount() {
        return updatedCount;
    }

    public void setUpdatedCount(int updatedCount) {
        this.updatedCount = updatedCount;
    }

    public List<ImportError> getErrors() {
        return errors;
    }

    public void setErrors(List<ImportError> errors) {
        this.errors = errors;
    }

    public List<Long> getImportedIds() {
        return importedIds;
    }

    public void setImportedIds(List<Long> importedIds) {
        this.importedIds = importedIds;
    }

    public List<Long> getUpdatedIds() {
        return updatedIds;
    }

    public void setUpdatedIds(List<Long> updatedIds) {
        this.updatedIds = updatedIds;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public void addError(int rowIndex, String field, String message, String value) {
        this.errors.add(new ImportError(rowIndex, field, message, value));
        this.errorCount++;
    }

    public void addImportedId(Long id) {
        this.importedIds.add(id);
        this.successCount++;
    }

    public void addUpdatedId(Long id) {
        this.updatedIds.add(id);
        this.updatedCount++;
    }

    @Schema(description = "Dettagli di un errore di importazione")
    public static class ImportError {
        
        @Schema(description = "Indice della riga che ha causato l'errore (0-based)", example = "5")
        private int rowIndex;

        @Schema(description = "Campo che ha causato l'errore", example = "email")
        private String field;

        @Schema(description = "Messaggio di errore", example = "Email già esistente")
        private String message;

        @Schema(description = "Valore che ha causato l'errore", example = "mario.rossi@azienda.com")
        private String value;

        @Schema(description = "Nominativo del dipendente (se disponibile)", example = "Mario Rossi")
        private String nominativo;

            public ImportError() {
        }

        public ImportError(int rowIndex, String field, String message, String value) {
            this.rowIndex = rowIndex;
            this.field = field;
            this.message = message;
            this.value = value;
        }

        public ImportError(int rowIndex, String field, String message, String value, String nominativo) {
            this(rowIndex, field, message, value);
            this.nominativo = nominativo;
        }

            public int getRowIndex() {
            return rowIndex;
        }

        public void setRowIndex(int rowIndex) {
            this.rowIndex = rowIndex;
        }

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getNominativo() {
            return nominativo;
        }

        public void setNominativo(String nominativo) {
            this.nominativo = nominativo;
        }

        @Override
        public String toString() {
            return "ImportError{" +
                    "rowIndex=" + rowIndex +
                    ", field='" + field + '\'' +
                    ", message='" + message + '\'' +
                    ", value='" + value + '\'' +
                    ", nominativo='" + nominativo + '\'' +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "DipendenteBulkImportResponse{" +
                "totalProcessed=" + totalProcessed +
                ", successCount=" + successCount +
                ", errorCount=" + errorCount +
                ", updatedCount=" + updatedCount +
                ", executionTimeMs=" + executionTimeMs +
                '}';
    }
}
