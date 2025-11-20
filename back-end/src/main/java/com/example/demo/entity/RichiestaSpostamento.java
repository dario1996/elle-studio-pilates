package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity per gestire le richieste di spostamento delle prenotazioni
 */
@Entity
@Table(name = "richieste_spostamento")
public class RichiestaSpostamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prenotazione_id", nullable = false)
    private PrenotazioneLezione prenotazione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utenti utente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_richiesta", length = 30, nullable = false)
    private TipoRichiesta tipoRichiesta;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", length = 20, nullable = false)
    private StatoRichiesta stato = StatoRichiesta.PENDING;

    @Column(name = "data_originale", nullable = false)
    private LocalDate dataOriginale;

    @Column(name = "data_richiesta")
    private LocalDate dataRichiesta;

    @Column(name = "motivazione", columnDefinition = "TEXT")
    private String motivazione;

    @Column(name = "risposta_admin", columnDefinition = "TEXT")
    private String rispostaAdmin;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_risposta")
    private LocalDateTime dataRisposta;

    // Enum per il tipo di richiesta
    public enum TipoRichiesta {
        VA_IN_CODA,
        CAMBIO_GRUPPO
    }

    // Enum per lo stato della richiesta
    public enum StatoRichiesta {
        PENDING,
        APPROVED,
        REJECTED
    }

    // Costruttori
    public RichiestaSpostamento() {
        this.dataCreazione = LocalDateTime.now();
        this.stato = StatoRichiesta.PENDING;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PrenotazioneLezione getPrenotazione() {
        return prenotazione;
    }

    public void setPrenotazione(PrenotazioneLezione prenotazione) {
        this.prenotazione = prenotazione;
    }

    public Utenti getUtente() {
        return utente;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public TipoRichiesta getTipoRichiesta() {
        return tipoRichiesta;
    }

    public void setTipoRichiesta(TipoRichiesta tipoRichiesta) {
        this.tipoRichiesta = tipoRichiesta;
    }

    public StatoRichiesta getStato() {
        return stato;
    }

    public void setStato(StatoRichiesta stato) {
        this.stato = stato;
    }

    public LocalDate getDataOriginale() {
        return dataOriginale;
    }

    public void setDataOriginale(LocalDate dataOriginale) {
        this.dataOriginale = dataOriginale;
    }

    public LocalDate getDataRichiesta() {
        return dataRichiesta;
    }

    public void setDataRichiesta(LocalDate dataRichiesta) {
        this.dataRichiesta = dataRichiesta;
    }

    public String getMotivazione() {
        return motivazione;
    }

    public void setMotivazione(String motivazione) {
        this.motivazione = motivazione;
    }

    public String getRispostaAdmin() {
        return rispostaAdmin;
    }

    public void setRispostaAdmin(String rispostaAdmin) {
        this.rispostaAdmin = rispostaAdmin;
    }

    public LocalDateTime getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(LocalDateTime dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public LocalDateTime getDataRisposta() {
        return dataRisposta;
    }

    public void setDataRisposta(LocalDateTime dataRisposta) {
        this.dataRisposta = dataRisposta;
    }

    // Metodi di utilità
    public boolean isPending() {
        return stato == StatoRichiesta.PENDING;
    }

    public boolean isApprovata() {
        return stato == StatoRichiesta.APPROVED;
    }

    public boolean isRifiutata() {
        return stato == StatoRichiesta.REJECTED;
    }

    public boolean isVaiInCoda() {
        return tipoRichiesta == TipoRichiesta.VA_IN_CODA;
    }

    public boolean isCambioGruppo() {
        return tipoRichiesta == TipoRichiesta.CAMBIO_GRUPPO;
    }

    public void approva(String risposta) {
        this.stato = StatoRichiesta.APPROVED;
        this.rispostaAdmin = risposta;
        this.dataRisposta = LocalDateTime.now();
    }

    public void rifiuta(String risposta) {
        this.stato = StatoRichiesta.REJECTED;
        this.rispostaAdmin = risposta;
        this.dataRisposta = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "RichiestaSpostamento{" +
                "id=" + id +
                ", tipoRichiesta=" + tipoRichiesta +
                ", stato=" + stato +
                ", dataOriginale=" + dataOriginale +
                ", dataRichiesta=" + dataRichiesta +
                '}';
    }
}
