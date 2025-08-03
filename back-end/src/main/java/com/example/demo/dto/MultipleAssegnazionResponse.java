package com.example.demo.dto;

import com.example.demo.entity.Assegnazione;
import java.util.List;

public class MultipleAssegnazionResponse {
    private List<Assegnazione> assegnazioniCreate;
    private List<String> errori;
    private int totaleRichieste;
    private int totaleCreate;
    private int totaleErrori;
    
    public MultipleAssegnazionResponse() {}
    
    public List<Assegnazione> getAssegnazioniCreate() {
        return assegnazioniCreate;
    }
    
    public void setAssegnazioniCreate(List<Assegnazione> assegnazioniCreate) {
        this.assegnazioniCreate = assegnazioniCreate;
    }
    
    public List<String> getErrori() {
        return errori;
    }
    
    public void setErrori(List<String> errori) {
        this.errori = errori;
    }
    
    public int getTotaleRichieste() {
        return totaleRichieste;
    }
    
    public void setTotaleRichieste(int totaleRichieste) {
        this.totaleRichieste = totaleRichieste;
    }
    
    public int getTotaleCreate() {
        return totaleCreate;
    }
    
    public void setTotaleCreate(int totaleCreate) {
        this.totaleCreate = totaleCreate;
    }
    
    public int getTotaleErrori() {
        return totaleErrori;
    }
    
    public void setTotaleErrori(int totaleErrori) {
        this.totaleErrori = totaleErrori;
    }
}