package com.example.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.math.BigDecimal;

@Schema(description = "Dati richiesti per creare un nuovo pacchetto di pilates")
public class PacchettoCreateRequest {

    @NotBlank(message = "Il nome del pacchetto è obbligatorio")
    @Size(max = 100, message = "Il nome non può superare 100 caratteri")
    @Schema(description = "Nome del pacchetto", example = "Pacchetto Base", required = true)
    private String nome;

    @Size(max = 500, message = "La descrizione non può superare 500 caratteri")
    @Schema(description = "Descrizione del pacchetto", example = "Pacchetto base di pilates per principianti")
    private String descrizione;

    @NotBlank(message = "La categoria è obbligatoria")
    @Schema(description = "Categoria del pacchetto", example = "PILATES", allowableValues = { "PILATES", "YOGA", "MATWORK", "REFORMER", "CARDIOLATES" }, required = true)
    private String categoria;

    @NotBlank(message = "Il livello è obbligatorio")
    @Schema(description = "Livello del pacchetto", example = "PRINCIPIANTE", allowableValues = { "PRINCIPIANTE", "INTERMEDIO", "AVANZATO" }, required = true)
    private String livello;

    @NotNull(message = "La durata in minuti è obbligatoria")
    @Min(value = 15, message = "La durata minima è 15 minuti")
    @Max(value = 180, message = "La durata massima è 180 minuti")
    @Schema(description = "Durata del pacchetto in minuti", example = "60", required = true)
    private Integer durataMinuti;

    @NotNull(message = "Il numero massimo di partecipanti è obbligatorio")
    @Min(value = 1, message = "Deve esserci almeno 1 partecipante")
    @Max(value = 50, message = "Il massimo numero di partecipanti è 50")
    @Schema(description = "Numero massimo di partecipanti", example = "10", required = true)
    private Integer maxPartecipanti;

    @NotNull(message = "Il prezzo è obbligatorio")
    @Positive(message = "Il prezzo deve essere positivo")
    @Schema(description = "Prezzo del pacchetto", example = "25.00", required = true)
    private BigDecimal prezzo;

    @Schema(description = "Indica se il pacchetto è attivo", example = "true")
    private boolean attivo = true;

    public PacchettoCreateRequest() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getLivello() {
        return livello;
    }

    public void setLivello(String livello) {
        this.livello = livello;
    }

    public Integer getDurataMinuti() {
        return durataMinuti;
    }

    public void setDurataMinuti(Integer durataMinuti) {
        this.durataMinuti = durataMinuti;
    }

    public Integer getMaxPartecipanti() {
        return maxPartecipanti;
    }

    public void setMaxPartecipanti(Integer maxPartecipanti) {
        this.maxPartecipanti = maxPartecipanti;
    }

    public BigDecimal getPrezzo() {
        return prezzo;
    }

    public void setPrezzo(BigDecimal prezzo) {
        this.prezzo = prezzo;
    }

    public boolean isAttivo() {
        return attivo;
    }

    public void setAttivo(boolean attivo) {
        this.attivo = attivo;
    }
}