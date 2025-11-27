package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "pacchetti")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Pacchetto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(length = 500)
    private String descrizione;

    @Column(length = 100)
    private String categoria; // PILATES, YOGA, MATWORK, etc.

    @Column(name = "categorie_lezioni", columnDefinition = "JSON")
    private String categorieLezioni; // Array JSON per pacchetti COMBO

    @Column(name = "distribuzione_lezioni", columnDefinition = "JSON")
    private String distribuzioneLezioni; // Oggetto JSON {categoria: numeroLezioni} per COMBO

    @Column(name = "numero_lezioni")
    private Integer numeroLezioni; // Numero totale di lezioni nel pacchetto

    @Column(length = 50)
    private String livello; // PRINCIPIANTE, INTERMEDIO, AVANZATO

    @Column(name = "durata_minuti")
    private Integer durataMinuti; // Durata in minuti invece che ore

    @Column(name = "max_partecipanti")
    private Integer maxPartecipanti;

    @Column(precision = 8, scale = 2)
    private BigDecimal prezzo;

    @Column(name = "num_lezioni")
    private Integer numLezioni;

    @Column(name = "attivo")
    private Boolean attivo = true;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    public Pacchetto() {
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

    public String getCategorieLezioni() {
        return categorieLezioni;
    }

    public void setCategorieLezioni(String categorieLezioni) {
        this.categorieLezioni = categorieLezioni;
    }

    public String getDistribuzioneLezioni() {
        return distribuzioneLezioni;
    }

    public void setDistribuzioneLezioni(String distribuzioneLezioni) {
        this.distribuzioneLezioni = distribuzioneLezioni;
    }

    public Integer getNumeroLezioni() {
        return numeroLezioni;
    }

    public void setNumeroLezioni(Integer numeroLezioni) {
        this.numeroLezioni = numeroLezioni;
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