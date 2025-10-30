package com.example.demo.dto;

import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO per visualizzare le lezioni disponibili per la prenotazione
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LezioneDisponibileDto {

    private Long lezioneId;
    private String titolo;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private String istruttore;
    private TipoLezione tipoLezione;
    private Integer maxPartecipanti;
    private Integer postiOccupati;
    private Integer postiDisponibili;
    private Boolean disponibile;
    private GiornoSettimana giornoSettimana;
    private String note;
    
    // Informazioni dal template settimanale
    private Long templateId;
    private String colore;
}
