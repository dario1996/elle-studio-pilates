package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "corsi")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Corso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(length = 100)
    private String categoria;

    @Column(length = 100)
    private String argomento;

    @Column(length = 100)
    private String modulo;

    @Column(name = "formati_richiedenti", length = 255)
    private String formatiRichiedenti;

    @Column(precision = 5, scale = 2)
    private BigDecimal durata; // In ore

    @Column(name = "data_inizio")
    private LocalDate dataInizio;

    @Column(name = "data_fine")
    private LocalDate dataFine;

    @Column(name = "data_scadenza")
    private LocalDate dataScadenza;

    @Column(precision = 5, scale = 2)
    private BigDecimal ore;

    @Column(name = "ore_rimanenti", precision = 5, scale = 2)
    private BigDecimal oreRimanenti;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatoCorso stato = StatoCorso.PIANIFICATO;

    @Column(length = 50)
    private String priorita; // ALTA, MEDIA, BASSA

    @Column(name = "codice_corso", length = 100, unique = true)
    private String codiceCorso;

    @Column(name = "id_contenuto_linkedin", length = 50)
    private String idContenutoLinkedin; // Per import da LinkedIn Learning

    @Column(name = "url_corso", length = 500)
    private String urlCorso;

    @Column(name = "costo", precision = 10, scale = 2)
    private BigDecimal costo;

    @Column(name = "certificazione_rilasciata")
    private Boolean certificazioneRilasciata = false;

    @Column(name = "feedback_richiesto")
    private Boolean feedbackRichiesto = false;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    // Relazione molti-a-uno con Piattaforma
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piattaforma_id", nullable = false)
    private Piattaforma piattaforma;

    // Relazione molti-a-molti con Dipendente attraverso Assegnazione
    @OneToMany(mappedBy = "corso", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Assegnazione> assegnazioni;

    // Enum per stato corso
    public enum StatoCorso {
        PIANIFICATO,
        ATTIVO,
        IN_CORSO,
        COMPLETATO,
        SOSPESO,
        ANNULLATO,
        SCADUTO
    }

    public Corso() {
        this.dataCreazione = LocalDateTime.now();
    }

    public Corso(String nome, Piattaforma piattaforma) {
        this();
        this.nome = nome;
        this.piattaforma = piattaforma;
    }

    @PreUpdate
    public void preUpdate() {
        this.dataModifica = LocalDateTime.now();
    }

    public boolean isScaduto() {
        return dataScadenza != null && LocalDate.now().isAfter(dataScadenza);
    }

    public boolean isInScadenza(int giorni) {
        return dataScadenza != null &&
                LocalDate.now().plusDays(giorni).isAfter(dataScadenza) &&
                !isScaduto();
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

    public String getArgomento() {
        return argomento;
    }

    public void setArgomento(String argomento) {
        this.argomento = argomento;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public String getFormatiRichiedenti() {
        return formatiRichiedenti;
    }

    public void setFormatiRichiedenti(String formatiRichiedenti) {
        this.formatiRichiedenti = formatiRichiedenti;
    }

    public BigDecimal getDurata() {
        return durata;
    }

    public void setDurata(BigDecimal durata) {
        this.durata = durata;
    }

    public LocalDate getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDate dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDate getDataFine() {
        return dataFine;
    }

    public void setDataFine(LocalDate dataFine) {
        this.dataFine = dataFine;
    }

    public LocalDate getDataScadenza() {
        return dataScadenza;
    }

    public void setDataScadenza(LocalDate dataScadenza) {
        this.dataScadenza = dataScadenza;
    }

    public BigDecimal getOre() {
        return ore;
    }

    public void setOre(BigDecimal ore) {
        this.ore = ore;
    }

    public BigDecimal getOreRimanenti() {
        return oreRimanenti;
    }

    public void setOreRimanenti(BigDecimal oreRimanenti) {
        this.oreRimanenti = oreRimanenti;
    }

    public StatoCorso getStato() {
        return stato;
    }

    public void setStato(StatoCorso stato) {
        this.stato = stato;
    }

    public String getPriorita() {
        return priorita;
    }

    public void setPriorita(String priorita) {
        this.priorita = priorita;
    }

    public String getCodiceCorso() {
        return codiceCorso;
    }

    public void setCodiceCorso(String codiceCorso) {
        this.codiceCorso = codiceCorso;
    }

    public String getIdContenutoLinkedin() {
        return idContenutoLinkedin;
    }

    public void setIdContenutoLinkedin(String idContenutoLinkedin) {
        this.idContenutoLinkedin = idContenutoLinkedin;
    }

    public String getUrlCorso() {
        return urlCorso;
    }

    public void setUrlCorso(String urlCorso) {
        this.urlCorso = urlCorso;
    }

    public BigDecimal getCosto() {
        return costo;
    }

    public void setCosto(BigDecimal costo) {
        this.costo = costo;
    }

    public Boolean getCertificazioneRilasciata() {
        return certificazioneRilasciata;
    }

    public void setCertificazioneRilasciata(Boolean certificazioneRilasciata) {
        this.certificazioneRilasciata = certificazioneRilasciata;
    }

    public Boolean getFeedbackRichiesto() {
        return feedbackRichiesto;
    }

    public void setFeedbackRichiesto(Boolean feedbackRichiesto) {
        this.feedbackRichiesto = feedbackRichiesto;
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

    public Piattaforma getPiattaforma() {
        return piattaforma;
    }

    public void setPiattaforma(Piattaforma piattaforma) {
        this.piattaforma = piattaforma;
    }

    public List<Assegnazione> getAssegnazioni() {
        return assegnazioni;
    }

    public void setAssegnazioni(List<Assegnazione> assegnazioni) {
        this.assegnazioni = assegnazioni;
    }
}