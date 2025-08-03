package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assegnazioni")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Assegnazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relazione molti-a-uno con Dipendente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dipendente_id", nullable = false)
    @JsonIgnoreProperties({ "assegnazioni", "logLogin" })
    private Dipendente dipendente;

    // Relazione molti-a-uno con Corso
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corso_id", nullable = false)
    @JsonIgnoreProperties({ "assegnazioni" })
    private Corso corso;

    @Column(name = "data_assegnazione", nullable = false)
    private LocalDate dataAssegnazione;

    @Column(name = "data_inizio")
    private LocalDate dataInizio;

    @Column(name = "data_termine_prevista")
    private LocalDate dataTerminePrevista;

    @Column(name = "data_completamento")
    private LocalDate dataCompletamento;

    @Column(name = "percentuale_completamento", precision = 5, scale = 2)
    private BigDecimal percentualeCompletamento = BigDecimal.ZERO;

    @Column(name = "ore_completate", precision = 5, scale = 2)
    private BigDecimal oreCompletate = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatoAssegnazione stato = StatoAssegnazione.DA_INIZIARE;

    @Column(name = "obbligatorio", nullable = false)
    private Boolean obbligatorio = false;

    @Column(name = "feedback_fornito")
    private Boolean feedbackFornito = false;

    @Column(name = "valutazione", precision = 3, scale = 1)
    private BigDecimal valutazione; // Da 1.0 a 5.0

    @Column(name = "note_feedback", length = 1000)
    private String noteFeedback;

    @Column(name = "competenze_acquisite", length = 500)
    private String competenzeAcquisite;

    @Column(name = "certificato_ottenuto")
    private Boolean certificatoOttenuto = false;

    @Column(name = "esito", length = 50)
    private String esito;

    @Column(name = "fonte_richiesta", length = 100)
    private String fonteRichiesta;

    @Column(name = "impatto_isms")
    private Boolean impattoIsms;

    @Column(name = "attestato")
    private Boolean attestato;

    @Column(name = "data_creazione", nullable = false)
    private LocalDateTime dataCreazione;

    @Column(name = "data_modifica")
    private LocalDateTime dataModifica;

    // Enum per stato assegnazione
    public enum StatoAssegnazione {
        DA_INIZIARE,
        IN_CORSO,
        TERMINATO,
        INTERROTTO
    }

    public Assegnazione() {
        this.dataCreazione = LocalDateTime.now();
        this.dataAssegnazione = LocalDate.now();
    }

    public Assegnazione(Dipendente dipendente, Corso corso) {
        this();
        this.dipendente = dipendente;
        this.corso = corso;
    }

    @PreUpdate
    public void preUpdate() {
        this.dataModifica = LocalDateTime.now();
    }

    public boolean isCompletato() {
        return stato == StatoAssegnazione.TERMINATO;
    }

    public boolean isInRitardo() {
        return corso.getDataScadenza() != null &&
                LocalDate.now().isAfter(corso.getDataScadenza()) &&
                !isCompletato();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Dipendente getDipendente() {
        return dipendente;
    }

    public void setDipendente(Dipendente dipendente) {
        this.dipendente = dipendente;
    }

    public Corso getCorso() {
        return corso;
    }

    public void setCorso(Corso corso) {
        this.corso = corso;
    }

    public LocalDate getDataAssegnazione() {
        return dataAssegnazione;
    }

    public void setDataAssegnazione(LocalDate dataAssegnazione) {
        this.dataAssegnazione = dataAssegnazione;
    }

    public LocalDate getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDate dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDate getDataTerminePrevista() {
        return dataTerminePrevista;
    }

    public void setDataTerminePrevista(LocalDate dataTerminePrevista) {
        this.dataTerminePrevista = dataTerminePrevista;
    }

    public LocalDate getDataCompletamento() {
        return dataCompletamento;
    }

    public void setDataCompletamento(LocalDate dataCompletamento) {
        this.dataCompletamento = dataCompletamento;
    }

    public BigDecimal getPercentualeCompletamento() {
        return percentualeCompletamento;
    }

    public void setPercentualeCompletamento(BigDecimal percentualeCompletamento) {
        this.percentualeCompletamento = percentualeCompletamento;
    }

    public BigDecimal getOreCompletate() {
        return oreCompletate;
    }

    public void setOreCompletate(BigDecimal oreCompletate) {
        this.oreCompletate = oreCompletate;
    }

    public StatoAssegnazione getStato() {
        return stato;
    }

    public void setStato(StatoAssegnazione stato) {
        this.stato = stato;
    }

    public Boolean getObbligatorio() {
        return obbligatorio;
    }

    public void setObbligatorio(Boolean obbligatorio) {
        this.obbligatorio = obbligatorio;
    }

    public Boolean getFeedbackFornito() {
        return feedbackFornito;
    }

    public void setFeedbackFornito(Boolean feedbackFornito) {
        this.feedbackFornito = feedbackFornito;
    }

    public BigDecimal getValutazione() {
        return valutazione;
    }

    public void setValutazione(BigDecimal valutazione) {
        this.valutazione = valutazione;
    }

    public String getNoteFeedback() {
        return noteFeedback;
    }

    public void setNoteFeedback(String noteFeedback) {
        this.noteFeedback = noteFeedback;
    }

    public String getCompetenzeAcquisite() {
        return competenzeAcquisite;
    }

    public void setCompetenzeAcquisite(String competenzeAcquisite) {
        this.competenzeAcquisite = competenzeAcquisite;
    }

    public Boolean getCertificatoOttenuto() {
        return certificatoOttenuto;
    }

    public void setCertificatoOttenuto(Boolean certificatoOttenuto) {
        this.certificatoOttenuto = certificatoOttenuto;
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

    public String getEsito() {
        return esito;
    }

    public void setEsito(String esito) {
        this.esito = esito;
    }

    public String getFonteRichiesta() {
        return fonteRichiesta;
    }

    public void setFonteRichiesta(String fonteRichiesta) {
        this.fonteRichiesta = fonteRichiesta;
    }

    public Boolean getImpattoIsms() {
        return impattoIsms;
    }

    public void setImpattoIsms(Boolean impattoIsms) {
        this.impattoIsms = impattoIsms;
    }

    public Boolean getAttestato() {
        return attestato;
    }

    public void setAttestato(Boolean attestato) {
        this.attestato = attestato;
    }
}