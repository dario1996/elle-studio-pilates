package com.example.demo.dto;

import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * DTO per visualizzare le lezioni disponibili per la prenotazione
 */
public class LezioneDisponibileDto {

    private Long lezioneId;
    private String titolo;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private String istruttore;
    private TipoLezione tipoLezione;
    private Integer maxPartecipanti;
    private Integer postiOccupati;
    private Integer postiDisponibili;
    private Boolean disponibile;
    private GiornoSettimana giornoSettimana;
    private String note;
    
    // Informazioni dal template settimanale
    private Long templateId;
    private String colore;

    public LezioneDisponibileDto() {
    }

    public LezioneDisponibileDto(Long lezioneId,
                                 String titolo,
                                 LocalDateTime dataInizio,
                                 LocalDateTime dataFine,
                                 String istruttore,
                                 TipoLezione tipoLezione,
                                 Integer maxPartecipanti,
                                 Integer postiOccupati,
                                 Integer postiDisponibili,
                                 Boolean disponibile,
                                 GiornoSettimana giornoSettimana,
                                 String note,
                                 Long templateId,
                                 String colore) {
        this.lezioneId = lezioneId;
        this.titolo = titolo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.istruttore = istruttore;
        this.tipoLezione = tipoLezione;
        this.maxPartecipanti = maxPartecipanti;
        this.postiOccupati = postiOccupati;
        this.postiDisponibili = postiDisponibili;
        this.disponibile = disponibile;
        this.giornoSettimana = giornoSettimana;
        this.note = note;
        this.templateId = templateId;
        this.colore = colore;
    }

    public Long getLezioneId() {
        return lezioneId;
    }

    public void setLezioneId(Long lezioneId) {
        this.lezioneId = lezioneId;
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

    public Integer getMaxPartecipanti() {
        return maxPartecipanti;
    }

    public void setMaxPartecipanti(Integer maxPartecipanti) {
        this.maxPartecipanti = maxPartecipanti;
    }

    public Integer getPostiOccupati() {
        return postiOccupati;
    }

    public void setPostiOccupati(Integer postiOccupati) {
        this.postiOccupati = postiOccupati;
    }

    public Integer getPostiDisponibili() {
        return postiDisponibili;
    }

    public void setPostiDisponibili(Integer postiDisponibili) {
        this.postiDisponibili = postiDisponibili;
    }

    public Boolean getDisponibile() {
        return disponibile;
    }

    public void setDisponibile(Boolean disponibile) {
        this.disponibile = disponibile;
    }

    public GiornoSettimana getGiornoSettimana() {
        return giornoSettimana;
    }

    public void setGiornoSettimana(GiornoSettimana giornoSettimana) {
        this.giornoSettimana = giornoSettimana;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }

    public String getColore() {
        return colore;
    }

    public void setColore(String colore) {
        this.colore = colore;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private Long lezioneId;
        private String titolo;
        private LocalDateTime dataInizio;
        private LocalDateTime dataFine;
        private String istruttore;
        private TipoLezione tipoLezione;
        private Integer maxPartecipanti;
        private Integer postiOccupati;
        private Integer postiDisponibili;
        private Boolean disponibile;
        private GiornoSettimana giornoSettimana;
        private String note;
        private Long templateId;
        private String colore;

        private Builder() {
        }

        public Builder lezioneId(Long lezioneId) {
            this.lezioneId = lezioneId;
            return this;
        }

        public Builder titolo(String titolo) {
            this.titolo = titolo;
            return this;
        }

        public Builder dataInizio(LocalDateTime dataInizio) {
            this.dataInizio = dataInizio;
            return this;
        }

        public Builder dataFine(LocalDateTime dataFine) {
            this.dataFine = dataFine;
            return this;
        }

        public Builder istruttore(String istruttore) {
            this.istruttore = istruttore;
            return this;
        }

        public Builder tipoLezione(TipoLezione tipoLezione) {
            this.tipoLezione = tipoLezione;
            return this;
        }

        public Builder maxPartecipanti(Integer maxPartecipanti) {
            this.maxPartecipanti = maxPartecipanti;
            return this;
        }

        public Builder postiOccupati(Integer postiOccupati) {
            this.postiOccupati = postiOccupati;
            return this;
        }

        public Builder postiDisponibili(Integer postiDisponibili) {
            this.postiDisponibili = postiDisponibili;
            return this;
        }

        public Builder disponibile(Boolean disponibile) {
            this.disponibile = disponibile;
            return this;
        }

        public Builder giornoSettimana(GiornoSettimana giornoSettimana) {
            this.giornoSettimana = giornoSettimana;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public Builder templateId(Long templateId) {
            this.templateId = templateId;
            return this;
        }

        public Builder colore(String colore) {
            this.colore = colore;
            return this;
        }

        public LezioneDisponibileDto build() {
            return new LezioneDisponibileDto(
                    lezioneId,
                    titolo,
                    dataInizio,
                    dataFine,
                    istruttore,
                    tipoLezione,
                    maxPartecipanti,
                    postiOccupati,
                    postiDisponibili,
                    disponibile,
                    giornoSettimana,
                    note,
                    templateId,
                    colore
            );
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        LezioneDisponibileDto that = (LezioneDisponibileDto) o;
        return Objects.equals(lezioneId, that.lezioneId) &&
                Objects.equals(titolo, that.titolo) &&
                Objects.equals(dataInizio, that.dataInizio) &&
                Objects.equals(dataFine, that.dataFine) &&
                Objects.equals(istruttore, that.istruttore) &&
                tipoLezione == that.tipoLezione &&
                Objects.equals(maxPartecipanti, that.maxPartecipanti) &&
                Objects.equals(postiOccupati, that.postiOccupati) &&
                Objects.equals(postiDisponibili, that.postiDisponibili) &&
                Objects.equals(disponibile, that.disponibile) &&
                giornoSettimana == that.giornoSettimana &&
                Objects.equals(note, that.note) &&
                Objects.equals(templateId, that.templateId) &&
                Objects.equals(colore, that.colore);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lezioneId, titolo, dataInizio, dataFine, istruttore, tipoLezione, maxPartecipanti,
                postiOccupati, postiDisponibili, disponibile, giornoSettimana, note, templateId, colore);
    }

    @Override
    public String toString() {
        return "LezioneDisponibileDto{" +
                "lezioneId=" + lezioneId +
                ", titolo='" + titolo + '\'' +
                ", dataInizio=" + dataInizio +
                ", dataFine=" + dataFine +
                ", istruttore='" + istruttore + '\'' +
                ", tipoLezione=" + tipoLezione +
                ", maxPartecipanti=" + maxPartecipanti +
                ", postiOccupati=" + postiOccupati +
                ", postiDisponibili=" + postiDisponibili +
                ", disponibile=" + disponibile +
                ", giornoSettimana=" + giornoSettimana +
                ", note='" + note + '\'' +
                ", templateId=" + templateId +
                ", colore='" + colore + '\'' +
                '}';
    }
}
