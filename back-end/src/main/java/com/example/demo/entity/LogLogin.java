package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_login")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class LogLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relazione molti-a-uno con Dipendente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dipendente_id", nullable = false)
    @JsonIgnoreProperties({ "assegnazioni", "logLogin" })
    private Dipendente dipendente;

    // Relazione molti-a-uno con Corso (opzionale)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corso_id")
    @JsonIgnoreProperties({ "assegnazioni" })
    private Corso corso;

    @Column(name = "nome_contenuto", length = 300)
    private String nomeContenuto;

    @Column(name = "fornitore_contenuto", length = 100)
    private String fornitoreContenuto; // LinkedIn, Coursera, etc.

    @Column(name = "tipo_contenuto", length = 50)
    private String tipoContenuto; // Course, Video, Article, etc.

    @Column(name = "id_contenuto_esterno", length = 100)
    private String idContenutoEsterno; // ID del contenuto sulla piattaforma esterna

    @Column(name = "ore_visione", precision = 5, scale = 2)
    private BigDecimal oreVisione;

    @Column(name = "percentuale_completamento", precision = 5, scale = 2)
    private BigDecimal percentualeCompletamento;

    @Column(name = "data_inizio")
    private LocalDateTime dataInizio;

    @Column(name = "data_ultima_visualizzazione")
    private LocalDateTime dataUltimaVisualizzazione;

    @Column(name = "data_completamento")
    private LocalDateTime dataCompletamento;

    @Column(name = "valutazioni_totali")
    private Integer valutazioniTotali = 0;

    @Column(name = "numero_valutazioni_completate")
    private Integer numeroValutazioniCompletate = 0;

    @Column(name = "competenze", length = 500)
    private String competenze;

    @Column(name = "nome_corso_video", length = 300)
    private String nomeCorsoVideo; // Per video di LinkedIn

    @Column(name = "id_corso_video", length = 100)
    private String idCorsoVideo; // ID corso per video di LinkedIn

    @Column(name = "gruppi_interazione", length = 500)
    private String gruppiInterazione;

    @Column(name = "gruppi_iscrizioni_attuali", length = 500)
    private String gruppiIscrizioniAttuali;

    @Column(name = "fonte_import", length = 50)
    private String fonteImport = "LINKEDIN"; // LINKEDIN, MANUAL, API

    @Column(name = "data_import", nullable = false)
    private LocalDateTime dataImport;

    @Column(name = "processed", nullable = false)
    private Boolean processed = false; // Se il log è stato processato per aggiornare le assegnazioni

    public LogLogin() {
        this.dataImport = LocalDateTime.now();
    }

    public LogLogin(Dipendente dipendente, String nomeContenuto, String fornitoreContenuto) {
        this();
        this.dipendente = dipendente;
        this.nomeContenuto = nomeContenuto;
        this.fornitoreContenuto = fornitoreContenuto;
    }

    public boolean isCompletato() {
        return percentualeCompletamento != null &&
                percentualeCompletamento.compareTo(new BigDecimal("100")) >= 0;
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

    public String getNomeContenuto() {
        return nomeContenuto;
    }

    public void setNomeContenuto(String nomeContenuto) {
        this.nomeContenuto = nomeContenuto;
    }

    public String getFornitoreContenuto() {
        return fornitoreContenuto;
    }

    public void setFornitoreContenuto(String fornitoreContenuto) {
        this.fornitoreContenuto = fornitoreContenuto;
    }

    public String getTipoContenuto() {
        return tipoContenuto;
    }

    public void setTipoContenuto(String tipoContenuto) {
        this.tipoContenuto = tipoContenuto;
    }

    public String getIdContenutoEsterno() {
        return idContenutoEsterno;
    }

    public void setIdContenutoEsterno(String idContenutoEsterno) {
        this.idContenutoEsterno = idContenutoEsterno;
    }

    public BigDecimal getOreVisione() {
        return oreVisione;
    }

    public void setOreVisione(BigDecimal oreVisione) {
        this.oreVisione = oreVisione;
    }

    public BigDecimal getPercentualeCompletamento() {
        return percentualeCompletamento;
    }

    public void setPercentualeCompletamento(BigDecimal percentualeCompletamento) {
        this.percentualeCompletamento = percentualeCompletamento;
    }

    public LocalDateTime getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDateTime dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDateTime getDataUltimaVisualizzazione() {
        return dataUltimaVisualizzazione;
    }

    public void setDataUltimaVisualizzazione(LocalDateTime dataUltimaVisualizzazione) {
        this.dataUltimaVisualizzazione = dataUltimaVisualizzazione;
    }

    public LocalDateTime getDataCompletamento() {
        return dataCompletamento;
    }

    public void setDataCompletamento(LocalDateTime dataCompletamento) {
        this.dataCompletamento = dataCompletamento;
    }

    public Integer getValutazioniTotali() {
        return valutazioniTotali;
    }

    public void setValutazioniTotali(Integer valutazioniTotali) {
        this.valutazioniTotali = valutazioniTotali;
    }

    public Integer getNumeroValutazioniCompletate() {
        return numeroValutazioniCompletate;
    }

    public void setNumeroValutazioniCompletate(Integer numeroValutazioniCompletate) {
        this.numeroValutazioniCompletate = numeroValutazioniCompletate;
    }

    public String getCompetenze() {
        return competenze;
    }

    public void setCompetenze(String competenze) {
        this.competenze = competenze;
    }

    public String getNomeCorsoVideo() {
        return nomeCorsoVideo;
    }

    public void setNomeCorsoVideo(String nomeCorsoVideo) {
        this.nomeCorsoVideo = nomeCorsoVideo;
    }

    public String getIdCorsoVideo() {
        return idCorsoVideo;
    }

    public void setIdCorsoVideo(String idCorsoVideo) {
        this.idCorsoVideo = idCorsoVideo;
    }

    public String getGruppiInterazione() {
        return gruppiInterazione;
    }

    public void setGruppiInterazione(String gruppiInterazione) {
        this.gruppiInterazione = gruppiInterazione;
    }

    public String getGruppiIscrizioniAttuali() {
        return gruppiIscrizioniAttuali;
    }

    public void setGruppiIscrizioniAttuali(String gruppiIscrizioniAttuali) {
        this.gruppiIscrizioniAttuali = gruppiIscrizioniAttuali;
    }

    public String getFonteImport() {
        return fonteImport;
    }

    public void setFonteImport(String fonteImport) {
        this.fonteImport = fonteImport;
    }

    public LocalDateTime getDataImport() {
        return dataImport;
    }

    public void setDataImport(LocalDateTime dataImport) {
        this.dataImport = dataImport;
    }

    public Boolean getProcessed() {
        return processed;
    }

    public void setProcessed(Boolean processed) {
        this.processed = processed;
    }
}