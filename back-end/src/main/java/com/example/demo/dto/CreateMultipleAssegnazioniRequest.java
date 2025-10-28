package com.example.demo.dto;

import java.util.List;

public class CreateMultipleAssegnazioniRequest {
    private List<Long> dipendentiIds;
    private List<Long> pacchettiIds;  // AGGIUNGI
    private boolean obbligatorio;
    private String dataTerminePrevista;
    
    public CreateMultipleAssegnazioniRequest() {}
    
    public List<Long> getDipendentiIds() {
        return dipendentiIds;
    }
    
    public void setDipendentiIds(List<Long> dipendentiIds) {
        this.dipendentiIds = dipendentiIds;
    }
    
    public List<Long> getPacchettiIds() {  // AGGIUNGI
        return pacchettiIds;
    }
    
    public void setPacchettiIds(List<Long> pacchettiIds) {  // AGGIUNGI
        this.pacchettiIds = pacchettiIds;
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