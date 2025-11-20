package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Entity per rappresentare una singola prenotazione di lezione
 */
@Entity
@Table(name = "prenotazioni_lezioni")
public class PrenotazioneLezione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendita_id", nullable = false)
    private Vendita vendita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utenti utente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private CalendarioSettimanale template;

    @Column(name = "data_lezione", nullable = false)
    private LocalDate dataLezione;

    @Column(name = "ora_inizio", nullable = false)
    private LocalTime oraInizio;

    @Column(name = "ora_fine", nullable = false)
    private LocalTime oraFine;

    @Column(name = "tipo_lezione", length = 50, nullable = false)
    private String tipoLezione;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", length = 20, nullable = false)
    private StatoPrenotazione stato = StatoPrenotazione.CONFERMATA;

    @Column(name = "numero_spostamenti", nullable = false)
    private Integer numeroSpostamenti = 0;

    @Column(name = "gruppo_prenotazione_id", length = 100)
    private String gruppoPrenotazioneId;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    // Enum per lo stato della prenotazione
    public enum StatoPrenotazione {
        CONFERMATA,
        CANCELLATA,
        IN_CODA,
        SPOSTAMENTO_RICHIESTO
    }

    // Costruttori
    public PrenotazioneLezione() {
        this.dataCreazione = LocalDateTime.now();
        this.numeroSpostamenti = 0;
        this.stato = StatoPrenotazione.CONFERMATA;
    }

    @PreUpdate
    public void preUpdate() {
        this.dataModifica = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vendita getVendita() {
        return vendita;
    }

    public void setVendita(Vendita vendita) {
        this.vendita = vendita;
    }

    public Utenti getUtente() {
        return utente;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public CalendarioSettimanale getTemplate() {
        return template;
    }

    public void setTemplate(CalendarioSettimanale template) {
        this.template = template;
    }

    public LocalDate getDataLezione() {
        return dataLezione;
    }

    public void setDataLezione(LocalDate dataLezione) {
        this.dataLezione = dataLezione;
    }

    public LocalTime getOraInizio() {
        return oraInizio;
    }

    public void setOraInizio(LocalTime oraInizio) {
        this.oraInizio = oraInizio;
    }

    public LocalTime getOraFine() {
        return oraFine;
    }

    public void setOraFine(LocalTime oraFine) {
        this.oraFine = oraFine;
    }

    public String getTipoLezione() {
        return tipoLezione;
    }

    public void setTipoLezione(String tipoLezione) {
        this.tipoLezione = tipoLezione;
    }

    public StatoPrenotazione getStato() {
        return stato;
    }

    public void setStato(StatoPrenotazione stato) {
        this.stato = stato;
    }

    public Integer getNumeroSpostamenti() {
        return numeroSpostamenti;
    }

    public void setNumeroSpostamenti(Integer numeroSpostamenti) {
        this.numeroSpostamenti = numeroSpostamenti;
    }

    public String getGruppoPrenotazioneId() {
        return gruppoPrenotazioneId;
    }

    public void setGruppoPrenotazioneId(String gruppoPrenotazioneId) {
        this.gruppoPrenotazioneId = gruppoPrenotazioneId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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

    // Metodi di utilità
    public boolean isConfermata() {
        return stato == StatoPrenotazione.CONFERMATA;
    }

    public boolean isCancellata() {
        return stato == StatoPrenotazione.CANCELLATA;
    }

    public boolean isInCoda() {
        return stato == StatoPrenotazione.IN_CODA;
    }

    public boolean haRichiestaSpostamento() {
        return stato == StatoPrenotazione.SPOSTAMENTO_RICHIESTO;
    }

    public boolean puoEssereSpostata() {
        // Può essere spostata solo se confermata e se la data è > 24h da ora
        if (!isConfermata()) {
            return false;
        }
        LocalDateTime dataOraLezione = LocalDateTime.of(dataLezione, oraInizio);
        LocalDateTime ora24PrimaDiLezione = dataOraLezione.minusHours(24);
        return LocalDateTime.now().isBefore(ora24PrimaDiLezione);
    }

    public boolean isPrimoSpostamento() {
        return numeroSpostamenti == 0;
    }

    public void incrementaSpostamenti() {
        this.numeroSpostamenti++;
    }

    @Override
    public String toString() {
        return "PrenotazioneLezione{" +
                "id=" + id +
                ", dataLezione=" + dataLezione +
                ", oraInizio=" + oraInizio +
                ", tipoLezione='" + tipoLezione + '\'' +
                ", stato=" + stato +
                ", numeroSpostamenti=" + numeroSpostamenti +
                '}';
    }
}
