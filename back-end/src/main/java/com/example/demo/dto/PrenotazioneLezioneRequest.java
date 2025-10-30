package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO per la richiesta di prenotazione di una lezione
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrenotazioneLezioneRequest {

    @NotNull(message = "L'ID della lezione è obbligatorio")
    private Long lezioneId;

    private String note;
}
