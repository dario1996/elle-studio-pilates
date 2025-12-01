package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.example.demo.enums.TipoLezione;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class LezioneDto {

    private Long id;

    @NotEmpty(message = "Il titolo è obbligatorio")
    private String titolo;

    @NotNull(message = "La data di inizio è obbligatoria")
    private LocalDateTime dataInizio;

    @NotNull(message = "La data di fine è obbligatoria")
    private LocalDateTime dataFine;

    @NotEmpty(message = "Il nome dell'istruttore è obbligatorio")
    private String istruttore;

    @NotNull(message = "Il tipo di lezione è obbligatorio")
    private TipoLezione tipoLezione;

    // Label leggibile del tipo lezione
    private String tipoLezioneLabel;

    private String note;

    private Boolean attiva;

    private Long templateId;

    private Integer maxPartecipanti;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Lista di username dei partecipanti
    private List<String> partecipanti;

    // Numero di posti disponibili (calcolato)
    private Integer postiDisponibili;

    public LezioneDto() {
    }

    public LezioneDto(Long id,
                      String titolo,
                      LocalDateTime dataInizio,
                      LocalDateTime dataFine,
                      String istruttore,
                      TipoLezione tipoLezione,
                      String tipoLezioneLabel,
                      String note,
                      Boolean attiva,
                      Long templateId,
                      Integer maxPartecipanti,
                      LocalDateTime createdAt,
                      LocalDateTime updatedAt,
                      List<String> partecipanti,
                      Integer postiDisponibili) {
        this.id = id;
        this.titolo = titolo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.istruttore = istruttore;
        this.tipoLezione = tipoLezione;
        this.tipoLezioneLabel = tipoLezioneLabel;
        this.note = note;
        this.attiva = attiva;
        this.templateId = templateId;
        this.maxPartecipanti = maxPartecipanti;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.partecipanti = partecipanti;
        this.postiDisponibili = postiDisponibili;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitolo() {
        return titolo;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public LocalDateTime getDataInizio() {
        return dataInizio;
    }

    public void setDataInizio(LocalDateTime dataInizio) {
        this.dataInizio = dataInizio;
    }

    public LocalDateTime getDataFine() {
        return dataFine;
    }

    public void setDataFine(LocalDateTime dataFine) {
        this.dataFine = dataFine;
    }

    public String getIstruttore() {
        return istruttore;
    }

    public void setIstruttore(String istruttore) {
        this.istruttore = istruttore;
    }

    public TipoLezione getTipoLezione() {
        return tipoLezione;
    }

    public void setTipoLezione(TipoLezione tipoLezione) {
        this.tipoLezione = tipoLezione;
    }

    public String getTipoLezioneLabel() {
        return tipoLezioneLabel;
    }

    public void setTipoLezioneLabel(String tipoLezioneLabel) {
        this.tipoLezioneLabel = tipoLezioneLabel;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getAttiva() {
        return attiva;
    }

    public void setAttiva(Boolean attiva) {
        this.attiva = attiva;
    }

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }

    public Integer getMaxPartecipanti() {
        return maxPartecipanti;
    }

    public void setMaxPartecipanti(Integer maxPartecipanti) {
        this.maxPartecipanti = maxPartecipanti;
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

    public List<String> getPartecipanti() {
        return partecipanti;
    }

    public void setPartecipanti(List<String> partecipanti) {
        this.partecipanti = partecipanti;
    }

    public Integer getPostiDisponibili() {
        return postiDisponibili;
    }

    public void setPostiDisponibili(Integer postiDisponibili) {
        this.postiDisponibili = postiDisponibili;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        LezioneDto that = (LezioneDto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(titolo, that.titolo) &&
                Objects.equals(dataInizio, that.dataInizio) &&
                Objects.equals(dataFine, that.dataFine) &&
                Objects.equals(istruttore, that.istruttore) &&
                tipoLezione == that.tipoLezione &&
                Objects.equals(note, that.note) &&
                Objects.equals(attiva, that.attiva) &&
                Objects.equals(templateId, that.templateId) &&
                Objects.equals(maxPartecipanti, that.maxPartecipanti) &&
                Objects.equals(createdAt, that.createdAt) &&
                Objects.equals(updatedAt, that.updatedAt) &&
                Objects.equals(partecipanti, that.partecipanti) &&
                Objects.equals(postiDisponibili, that.postiDisponibili);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, titolo, dataInizio, dataFine, istruttore, tipoLezione, note, attiva,
                templateId, maxPartecipanti, createdAt, updatedAt, partecipanti, postiDisponibili);
    }

    @Override
    public String toString() {
        return "LezioneDto{" +
                "id=" + id +
                ", titolo='" + titolo + '\'' +
                ", dataInizio=" + dataInizio +
                ", dataFine=" + dataFine +
                ", istruttore='" + istruttore + '\'' +
                ", tipoLezione=" + tipoLezione +
                ", note='" + note + '\'' +
                ", attiva=" + attiva +
                ", templateId=" + templateId +
                ", maxPartecipanti=" + maxPartecipanti +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", partecipanti=" + partecipanti +
                ", postiDisponibili=" + postiDisponibili +
                '}';
    }
}
