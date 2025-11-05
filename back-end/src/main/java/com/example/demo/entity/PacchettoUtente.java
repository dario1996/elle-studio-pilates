package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacchetti_utenti")
public class PacchettoUtente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendita_id")
    private Vendita vendita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utenti utente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pacchetto_id", nullable = false)
    private Pacchetto pacchetto;

    @Column(name = "lezioni_residue")
    private Integer lezioniResidue;

    @Column(name = "attivo")
    private Boolean attivo = true;

    @Column(name = "data_acquisto")
    private LocalDateTime dataAcquisto;

    @Column(name = "data_pagamento")
    private LocalDateTime dataPagamento;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vendita getVendita() { return vendita; }
    public void setVendita(Vendita vendita) { this.vendita = vendita; }

    public Utenti getUtente() { return utente; }
    public void setUtente(Utenti utente) { this.utente = utente; }

    public Pacchetto getPacchetto() { return pacchetto; }
    public void setPacchetto(Pacchetto pacchetto) { this.pacchetto = pacchetto; }

    public Integer getLezioniResidue() { return lezioniResidue; }
    public void setLezioniResidue(Integer lezioniResidue) { this.lezioniResidue = lezioniResidue; }

    public Boolean getAttivo() { return attivo; }
    public void setAttivo(Boolean attivo) { this.attivo = attivo; }

    public LocalDateTime getDataAcquisto() { return dataAcquisto; }
    public void setDataAcquisto(LocalDateTime dataAcquisto) { this.dataAcquisto = dataAcquisto; }

    public LocalDateTime getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDateTime dataPagamento) { this.dataPagamento = dataPagamento; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
