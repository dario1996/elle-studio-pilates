package com.example.demo.dto;

import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.Objects;

public class CalendarioSettimanaleDto {

    private Long id;

    @NotNull(message = "Il giorno della settimana è obbligatorio")
    private GiornoSettimana giornoSettimana;

    @NotNull(message = "L'ora di inizio è obbligatoria")
    private LocalTime oraInizio;

    @NotNull(message = "L'ora di fine è obbligatoria")
    private LocalTime oraFine;

    @NotNull(message = "Il titolo è obbligatorio")
    private String titolo;

    @NotNull(message = "Il tipo di lezione è obbligatorio")
    private TipoLezione tipoLezione;

    private String istruttore;

    @NotNull(message = "Il numero massimo di partecipanti è obbligatorio")
    private Integer maxPartecipanti;

    private String colore;

    private String note;

    private Boolean attivo;

    private Integer postiPrenotati;

    public CalendarioSettimanaleDto() {
    }

    public CalendarioSettimanaleDto(Long id,
                                    GiornoSettimana giornoSettimana,
                                    LocalTime oraInizio,
                                    LocalTime oraFine,
                                    String titolo,
                                    TipoLezione tipoLezione,
                                    String istruttore,
                                    Integer maxPartecipanti,
                                    String colore,
                                    String note,
                                    Boolean attivo) {
        this.id = id;
        this.giornoSettimana = giornoSettimana;
        this.oraInizio = oraInizio;
        this.oraFine = oraFine;
        this.titolo = titolo;
        this.tipoLezione = tipoLezione;
        this.istruttore = istruttore;
        this.maxPartecipanti = maxPartecipanti;
        this.colore = colore;
        this.note = note;
        this.attivo = attivo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GiornoSettimana getGiornoSettimana() {
        return giornoSettimana;
    }

    public void setGiornoSettimana(GiornoSettimana giornoSettimana) {
        this.giornoSettimana = giornoSettimana;
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

    public String getTitolo() {
        return titolo;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public TipoLezione getTipoLezione() {
        return tipoLezione;
    }

    public void setTipoLezione(TipoLezione tipoLezione) {
        this.tipoLezione = tipoLezione;
    }

    public String getIstruttore() {
        return istruttore;
    }

    public void setIstruttore(String istruttore) {
        this.istruttore = istruttore;
    }

    public Integer getMaxPartecipanti() {
        return maxPartecipanti;
    }

    public void setMaxPartecipanti(Integer maxPartecipanti) {
        this.maxPartecipanti = maxPartecipanti;
    }

    public String getColore() {
        return colore;
    }

    public void setColore(String colore) {
        this.colore = colore;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getAttivo() {
        return attivo;
    }

    public void setAttivo(Boolean attivo) {
        this.attivo = attivo;
    }

    public Integer getPostiPrenotati() {
        return postiPrenotati;
    }

    public void setPostiPrenotati(Integer postiPrenotati) {
        this.postiPrenotati = postiPrenotati;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private Long id;
        private GiornoSettimana giornoSettimana;
        private LocalTime oraInizio;
        private LocalTime oraFine;
        private String titolo;
        private TipoLezione tipoLezione;
        private String istruttore;
        private Integer maxPartecipanti;
        private String colore;
        private String note;
        private Boolean attivo;
        private Integer postiPrenotati;

        private Builder() {
        }

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder giornoSettimana(GiornoSettimana giornoSettimana) {
            this.giornoSettimana = giornoSettimana;
            return this;
        }

        public Builder oraInizio(LocalTime oraInizio) {
            this.oraInizio = oraInizio;
            return this;
        }

        public Builder oraFine(LocalTime oraFine) {
            this.oraFine = oraFine;
            return this;
        }

        public Builder titolo(String titolo) {
            this.titolo = titolo;
            return this;
        }

        public Builder tipoLezione(TipoLezione tipoLezione) {
            this.tipoLezione = tipoLezione;
            return this;
        }

        public Builder istruttore(String istruttore) {
            this.istruttore = istruttore;
            return this;
        }

        public Builder maxPartecipanti(Integer maxPartecipanti) {
            this.maxPartecipanti = maxPartecipanti;
            return this;
        }

        public Builder colore(String colore) {
            this.colore = colore;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public Builder attivo(Boolean attivo) {
            this.attivo = attivo;
            return this;
        }

        public Builder postiPrenotati(Integer postiPrenotati) {
            this.postiPrenotati = postiPrenotati;
            return this;
        }

        public CalendarioSettimanaleDto build() {
            return new CalendarioSettimanaleDto(
                    id,
                    giornoSettimana,
                    oraInizio,
                    oraFine,
                    titolo,
                    tipoLezione,
                    istruttore,
                    maxPartecipanti,
                    colore,
                    note,
                    attivo
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
        CalendarioSettimanaleDto that = (CalendarioSettimanaleDto) o;
        return Objects.equals(id, that.id) &&
                giornoSettimana == that.giornoSettimana &&
                Objects.equals(oraInizio, that.oraInizio) &&
                Objects.equals(oraFine, that.oraFine) &&
                Objects.equals(titolo, that.titolo) &&
                tipoLezione == that.tipoLezione &&
                Objects.equals(istruttore, that.istruttore) &&
                Objects.equals(maxPartecipanti, that.maxPartecipanti) &&
                Objects.equals(colore, that.colore) &&
                Objects.equals(note, that.note) &&
                Objects.equals(attivo, that.attivo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, giornoSettimana, oraInizio, oraFine, titolo, tipoLezione, istruttore,
                maxPartecipanti, colore, note, attivo);
    }

    @Override
    public String toString() {
        return "CalendarioSettimanaleDto{" +
                "id=" + id +
                ", giornoSettimana=" + giornoSettimana +
                ", oraInizio=" + oraInizio +
                ", oraFine=" + oraFine +
                ", titolo='" + titolo + '\'' +
                ", tipoLezione=" + tipoLezione +
                ", istruttore='" + istruttore + '\'' +
                ", maxPartecipanti=" + maxPartecipanti +
                ", colore='" + colore + '\'' +
                ", note='" + note + '\'' +
                ", attivo=" + attivo +
                '}';
    }
}
