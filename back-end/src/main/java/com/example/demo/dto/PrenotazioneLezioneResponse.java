package com.example.demo.dto;

import com.example.demo.enums.TipoLezione;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO per la risposta con i dettagli di una prenotazione
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrenotazioneLezioneResponse {

    private Long id;
    private Long lezioneId;
    private String titolo;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private String istruttore;
    private TipoLezione tipoLezione;
    private String username;
    private String note;
    private String stato;
    private LocalDateTime dataPrenotazione;
}
