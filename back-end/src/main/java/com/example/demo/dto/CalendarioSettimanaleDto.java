package com.example.demo.dto;

import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarioSettimanaleDto {

    private Long id;

    @NotNull(message = "Il giorno della settimana è obbligatorio")
    private GiornoSettimana giornoSettimana;

    @NotNull(message = "L'ora di inizio è obbligatoria")
    private LocalTime oraInizio;

    @NotNull(message = "L'ora di fine è obbligatoria")
    private LocalTime oraFine;

    @NotNull(message = "Il titolo è obbligatorio")
    private String titolo;

    @NotNull(message = "Il tipo di lezione è obbligatorio")
    private TipoLezione tipoLezione;

    private String istruttore;

    @NotNull(message = "Il numero massimo di partecipanti è obbligatorio")
    private Integer maxPartecipanti;

    private String colore;

    private String note;

    private Boolean attivo;
}
