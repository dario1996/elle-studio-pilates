package com.example.demo.dto;

import com.example.demo.enums.TipoLezione;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LezioneDto {

    private Long id;

    @NotEmpty(message = "Il titolo è obbligatorio")
    private String titolo;

    @NotNull(message = "La data di inizio è obbligatoria")
    private LocalDateTime dataInizio;

    @NotNull(message = "La data di fine è obbligatoria")
    private LocalDateTime dataFine;

    @NotEmpty(message = "Il nome dell'istruttore è obbligatorio")
    private String istruttore;

    @NotNull(message = "Il tipo di lezione è obbligatorio")
    private TipoLezione tipoLezione;

    private String note;

    private Boolean attiva;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
