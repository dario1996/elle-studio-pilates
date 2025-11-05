package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prenotazioni_lezioni")
public class Prenotazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lezione_id", nullable = false)
    private Lezione lezione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendita_id")
    private Vendita vendita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pacchetto_utente_id")
    private com.example.demo.entity.PacchettoUtente pacchettoUtente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utenti utente;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "consumata")
    private Boolean consumata = false;

    @Column(name = "data_consumo")
    private LocalDateTime dataConsumo;

    @Column(name = "attiva")
    private Boolean attiva = true;

    @Column(name = "data_prenotazione")
    private LocalDateTime dataPrenotazione = LocalDateTime.now();

    @Column(name = "data_cancellazione")
    private LocalDateTime dataCancellazione;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.attiva = this.attiva == null ? true : this.attiva;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Lezione getLezione() {
        return lezione;
    }

    public void setLezione(Lezione lezione) {
        this.lezione = lezione;
    }

    public Vendita getVendita() {
        return vendita;
    }

    public void setVendita(Vendita vendita) {
        this.vendita = vendita;
    }

    public com.example.demo.entity.PacchettoUtente getPacchettoUtente() {
        return pacchettoUtente;
    }

    public void setPacchettoUtente(com.example.demo.entity.PacchettoUtente pacchettoUtente) {
        this.pacchettoUtente = pacchettoUtente;
    }

    public Utenti getUtente() {
        return utente;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getConsumata() {
        return consumata;
    }

    public void setConsumata(Boolean consumata) {
        this.consumata = consumata;
    }

    public LocalDateTime getDataConsumo() {
        return dataConsumo;
    }

    public void setDataConsumo(LocalDateTime dataConsumo) {
        this.dataConsumo = dataConsumo;
    }

    public Boolean getAttiva() {
        return attiva;
    }

    public void setAttiva(Boolean attiva) {
        this.attiva = attiva;
    }

    public LocalDateTime getDataPrenotazione() {
        return dataPrenotazione;
    }

    public void setDataPrenotazione(LocalDateTime dataPrenotazione) {
        this.dataPrenotazione = dataPrenotazione;
    }

    public LocalDateTime getDataCancellazione() {
        return dataCancellazione;
    }

    public void setDataCancellazione(LocalDateTime dataCancellazione) {
        this.dataCancellazione = dataCancellazione;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
