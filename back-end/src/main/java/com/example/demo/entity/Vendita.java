package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity per rappresentare una vendita nel database
 */
@Entity
@Table(name = "vendite")
public class Vendita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", referencedColumnName = "id", nullable = false)
    private Utenti utente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pacchetto_id", nullable = false)
    private Pacchetto pacchetto;

    @Column(name = "importo", precision = 10, scale = 2, nullable = false)
    private BigDecimal importo;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", length = 20, nullable = false)
    private StatoVendita stato = StatoVendita.PENDING;

    @Column(name = "data_acquisto", nullable = false)
    private LocalDateTime dataAcquisto;

    @Column(name = "data_pagamento")
    private LocalDateTime dataPagamento;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // Enum per lo stato della vendita
    public enum StatoVendita {
        PENDING,
        PAID,
        CANCELLED
    }

    // Costruttori
    public Vendita() {
        this.dataAcquisto = LocalDateTime.now();
    }

    public Vendita(Utenti utente, Pacchetto pacchetto, BigDecimal importo) {
        this();
        this.utente = utente;
        this.pacchetto = pacchetto;
        this.importo = importo;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Utenti getUtente() {
        return utente;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public Pacchetto getPacchetto() {
        return pacchetto;
    }

    public void setPacchetto(Pacchetto pacchetto) {
        this.pacchetto = pacchetto;
    }

    public BigDecimal getImporto() {
        return importo;
    }

    public void setImporto(BigDecimal importo) {
        this.importo = importo;
    }

    public StatoVendita getStato() {
        return stato;
    }

    public void setStato(StatoVendita stato) {
        this.stato = stato;
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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    // Metodi di utilità
    public boolean isPagata() {
        return stato == StatoVendita.PAID;
    }

    public boolean isPendente() {
        return stato == StatoVendita.PENDING;
    }

    public boolean isCancellata() {
        return stato == StatoVendita.CANCELLED;
    }

    /**
     * Marca la vendita come pagata impostando la data di pagamento
     */
    public void marcaComePagata() {
        this.stato = StatoVendita.PAID;
        this.dataPagamento = LocalDateTime.now();
    }

    /**
     * Cancella la vendita
     */
    public void cancella(String motivo) {
        this.stato = StatoVendita.CANCELLED;
        if (motivo != null && !motivo.trim().isEmpty()) {
            this.note = motivo;
        }
    }

    @Override
    public String toString() {
        return "Vendita{" +
                "id=" + id +
                ", importo=" + importo +
                ", stato=" + stato +
                ", dataAcquisto=" + dataAcquisto +
                ", dataPagamento=" + dataPagamento +
                '}';
    }
}
