package com.example.demo.dto;

import java.util.List;

public class CreateMultipleAssegnazioniRequest {
    private List<Long> dipendentiIds;
    private List<Long> corsiIds;  // AGGIUNGI
    private boolean obbligatorio;
    private String dataTerminePrevista;
    
    public CreateMultipleAssegnazioniRequest() {}
    
    public List<Long> getDipendentiIds() {
        return dipendentiIds;
    }
    
    public void setDipendentiIds(List<Long> dipendentiIds) {
        this.dipendentiIds = dipendentiIds;
    }
    
    public List<Long> getCorsiIds() {  // AGGIUNGI
        return corsiIds;
    }
    
    public void setCorsiIds(List<Long> corsiIds) {  // AGGIUNGI
        this.corsiIds = corsiIds;
    }
    
    public boolean isObbligatorio() {
        return obbligatorio;
    }
    
    public void setObbligatorio(boolean obbligatorio) {
        this.obbligatorio = obbligatorio;
    }
    
    public String getDataTerminePrevista() {
        return dataTerminePrevista;
    }

    public void setDataTerminePrevista(String dataTerminePrevista) {
        this.dataTerminePrevista = dataTerminePrevista;
    }
}