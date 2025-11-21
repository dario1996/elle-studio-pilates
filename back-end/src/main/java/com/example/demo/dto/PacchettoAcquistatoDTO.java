package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO per rappresentare un pacchetto acquistato dall'utente con dettagli completi
 */
public class PacchettoAcquistatoDTO {
    private Long venditaId;
    private Long pacchettoId;
    private String pacchettoNome;
    private String categoria;
    private String descrizione;
    private String livello;
    private Integer durataMinuti;
    private Integer maxPartecipanti;
    private BigDecimal prezzo;
    private Integer numLezioni;
    private LocalDateTime dataAcquisto;
    private LocalDateTime dataPagamento;
    private String stato; // "ATTIVO" o "COMPLETATO"
    private Integer lezioniTotali;
    private Integer lezioniPrenotate;
    private Integer lezioniRimaste;
    private String note;

    // Costruttori
    public PacchettoAcquistatoDTO() {}

    // Getters e Setters
    public Long getVenditaId() {
        return venditaId;
    }

    public void setVenditaId(Long venditaId) {
        this.venditaId = venditaId;
    }

    public Long getPacchettoId() {
        return pacchettoId;
    }

    public void setPacchettoId(Long pacchettoId) {
        this.pacchettoId = pacchettoId;
    }

    public String getPacchettoNome() {
        return pacchettoNome;
    }

    public void setPacchettoNome(String pacchettoNome) {
        this.pacchettoNome = pacchettoNome;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDescrizione() {
        return descrizione;
    }

    public void setDescrizione(String descrizione) {
        this.descrizione = descrizione;
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

    public Integer getNumLezioni() {
        return numLezioni;
    }

    public void setNumLezioni(Integer numLezioni) {
        this.numLezioni = numLezioni;
    }

    public LocalDateTime getDataAcquisto() {
        return dataAcquisto;
    }

    public void setDataAcquisto(LocalDateTime dataAcquisto) {
        this.dataAcquisto = dataAcquisto;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDateTime dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public Integer getLezioniTotali() {
        return lezioniTotali;
    }

    public void setLezioniTotali(Integer lezioniTotali) {
        this.lezioniTotali = lezioniTotali;
    }

    public Integer getLezioniPrenotate() {
        return lezioniPrenotate;
    }

    public void setLezioniPrenotate(Integer lezioniPrenotate) {
        this.lezioniPrenotate = lezioniPrenotate;
    }

    public Integer getLezioniRimaste() {
        return lezioniRimaste;
    }

    public void setLezioniRimaste(Integer lezioniRimaste) {
        this.lezioniRimaste = lezioniRimaste;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    /**
     * Calcola la percentuale di utilizzo del pacchetto
     */
    public int getPercentualeUtilizzo() {
        if (lezioniTotali == null || lezioniTotali == 0) {
            return 0;
        }
        if (lezioniPrenotate == null) {
            return 0;
        }
        return Math.round((lezioniPrenotate.floatValue() / lezioniTotali.floatValue()) * 100);
    }

    /**
     * Verifica se il pacchetto è completato (tutte le lezioni prenotate)
     */
    public boolean isCompletato() {
        return lezioniRimaste != null && lezioniRimaste == 0;
    }

    @Override
    public String toString() {
        return "PacchettoAcquistatoDTO{" +
                "venditaId=" + venditaId +
                ", pacchettoId=" + pacchettoId +
                ", pacchettoNome='" + pacchettoNome + '\'' +
                ", categoria='" + categoria + '\'' +
                ", lezioniTotali=" + lezioniTotali +
                ", lezioniPrenotate=" + lezioniPrenotate +
                ", lezioniRimaste=" + lezioniRimaste +
                ", stato='" + stato + '\'' +
                '}';
    }
}
