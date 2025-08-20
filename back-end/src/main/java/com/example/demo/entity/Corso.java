package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "corsi")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Corso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(length = 500)
    private String descrizione;

    @Column(length = 100)
    private String categoria; // PILATES, YOGA, MATWORK, etc.

    @Column(length = 50)
    private String livello; // PRINCIPIANTE, INTERMEDIO, AVANZATO

    @Column(name = "durata_minuti")
    private Integer durataMinuti; // Durata in minuti invece che ore

    @Column(name = "max_partecipanti")
    private Integer maxPartecipanti;

    @Column(precision = 8, scale = 2)
    private BigDecimal prezzo;

    @Column(name = "attivo")
    private Boolean attivo = true;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    public Corso() {
        this.dataCreazione = LocalDateTime.now();
        this.attivo = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.dataModifica = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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

    public Boolean getAttivo() {
        return attivo;
    }

    public void setAttivo(Boolean attivo) {
        this.attivo = attivo;
    }

    public LocalDateTime getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(LocalDateTime dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public LocalDateTime getDataModifica() {
        return dataModifica;
    }

    public void setDataModifica(LocalDateTime dataModifica) {
        this.dataModifica = dataModifica;
    }
}