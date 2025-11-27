package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO per le statistiche della dashboard utente
 */
public class DashboardStatisticheDto {
    
    private ProssimaLezioneDto prossimaLezione;
    private Integer totaleLezioniPrenotate;
    private Integer lezioniCompletate;
    
    public DashboardStatisticheDto() {
    }
    
    public DashboardStatisticheDto(ProssimaLezioneDto prossimaLezione, 
                                    Integer totaleLezioniPrenotate, 
                                    Integer lezioniCompletate) {
        this.prossimaLezione = prossimaLezione;
        this.totaleLezioniPrenotate = totaleLezioniPrenotate;
        this.lezioniCompletate = lezioniCompletate;
    }
    
    // Getters e Setters
    public ProssimaLezioneDto getProssimaLezione() {
        return prossimaLezione;
    }
    
    public void setProssimaLezione(ProssimaLezioneDto prossimaLezione) {
        this.prossimaLezione = prossimaLezione;
    }
    
    public Integer getTotaleLezioniPrenotate() {
        return totaleLezioniPrenotate;
    }
    
    public void setTotaleLezioniPrenotate(Integer totaleLezioniPrenotate) {
        this.totaleLezioniPrenotate = totaleLezioniPrenotate;
    }
    
    public Integer getLezioniCompletate() {
        return lezioniCompletate;
    }
    
    public void setLezioniCompletate(Integer lezioniCompletate) {
        this.lezioniCompletate = lezioniCompletate;
    }
    
    /**
     * DTO per la prossima lezione
     */
    public static class ProssimaLezioneDto {
        private LocalDate dataLezione;
        private LocalTime oraInizio;
        private LocalTime oraFine;
        private String tipoLezione;
        private String stato;
        
        public ProssimaLezioneDto() {
        }
        
        public ProssimaLezioneDto(LocalDate dataLezione, LocalTime oraInizio, 
                                   LocalTime oraFine, String tipoLezione, String stato) {
            this.dataLezione = dataLezione;
            this.oraInizio = oraInizio;
            this.oraFine = oraFine;
            this.tipoLezione = tipoLezione;
            this.stato = stato;
        }
        
        public LocalDate getDataLezione() {
            return dataLezione;
        }
        
        public void setDataLezione(LocalDate dataLezione) {
            this.dataLezione = dataLezione;
        }
        
        public LocalTime getOraInizio() {
            return oraInizio;
        }
        
        public void setOraInizio(LocalTime oraInizio) {
            this.oraInizio = oraInizio;
        }
        
        public LocalTime getOraFine() {
            return oraFine;
        }
        
        public void setOraFine(LocalTime oraFine) {
            this.oraFine = oraFine;
        }
        
        public String getTipoLezione() {
            return tipoLezione;
        }
        
        public void setTipoLezione(String tipoLezione) {
            this.tipoLezione = tipoLezione;
        }
        
        public String getStato() {
            return stato;
        }
        
        public void setStato(String stato) {
            this.stato = stato;
        }
    }
}
