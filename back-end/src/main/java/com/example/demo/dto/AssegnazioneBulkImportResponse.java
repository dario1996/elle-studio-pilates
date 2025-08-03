package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Risposta per l'importazione massiva di assegnazioni")
public class AssegnazioneBulkImportResponse {

    @Schema(description = "Numero totale di assegnazioni processate")
    private int totalProcessed;

    @Schema(description = "Numero di assegnazioni importate con successo")
    private int successCount;

    @Schema(description = "Numero di assegnazioni con errori")
    private int errorCount;

    @Schema(description = "Numero di assegnazioni aggiornate (in caso di duplicati)")
    private int updatedCount;

    @Schema(description = "Lista degli errori di validazione")
    private List<BulkImportError> errors;

    @Schema(description = "Lista delle assegnazioni importate con successo")
    private List<AssegnazioneBulkImportItem> importedItems;

    public AssegnazioneBulkImportResponse() {
    }

    public AssegnazioneBulkImportResponse(int totalProcessed, int successCount, int errorCount, int updatedCount) {
        this.totalProcessed = totalProcessed;
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.updatedCount = updatedCount;
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

    public List<BulkImportError> getErrors() {
        return errors;
    }

    public void setErrors(List<BulkImportError> errors) {
        this.errors = errors;
    }

    public List<AssegnazioneBulkImportItem> getImportedItems() {
        return importedItems;
    }

    public void setImportedItems(List<AssegnazioneBulkImportItem> importedItems) {
        this.importedItems = importedItems;
    }

    @Schema(description = "Errore di importazione con dettagli")
    public static class BulkImportError {
        
        @Schema(description = "Numero di riga nel file Excel")
        private int row;

        @Schema(description = "Messaggio di errore")
        private String message;

        @Schema(description = "Campo che ha causato l'errore")
        private String field;

        @Schema(description = "Valore che ha causato l'errore")
        private String value;

        @Schema(description = "Elemento che ha causato l'errore")
        private AssegnazioneBulkImportItem item;

            public BulkImportError() {
        }

        public BulkImportError(int row, String message) {
            this.row = row;
            this.message = message;
        }

        public BulkImportError(int row, String message, String field, String value) {
            this.row = row;
            this.message = message;
            this.field = field;
            this.value = value;
        }

            public int getRow() {
            return row;
        }

        public void setRow(int row) {
            this.row = row;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public AssegnazioneBulkImportItem getItem() {
            return item;
        }

        public void setItem(AssegnazioneBulkImportItem item) {
            this.item = item;
        }

        @Override
        public String toString() {
            return "BulkImportError{" +
                    "row=" + row +
                    ", message='" + message + '\'' +
                    ", field='" + field + '\'' +
                    ", value='" + value + '\'' +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "AssegnazioneBulkImportResponse{" +
                "totalProcessed=" + totalProcessed +
                ", successCount=" + successCount +
                ", errorCount=" + errorCount +
                ", updatedCount=" + updatedCount +
                ", errors=" + (errors != null ? errors.size() : 0) +
                ", importedItems=" + (importedItems != null ? importedItems.size() : 0) +
                '}';
    }
}
