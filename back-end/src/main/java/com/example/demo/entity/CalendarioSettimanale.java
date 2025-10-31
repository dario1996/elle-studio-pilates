package com.example.demo.entity;

import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "calendario_settimanale")
public class CalendarioSettimanale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "giorno_settimana", nullable = false, length = 20)
    private GiornoSettimana giornoSettimana;

    @Column(name = "ora_inizio", nullable = false)
    private LocalTime oraInizio;

    @Column(name = "ora_fine", nullable = false)
    private LocalTime oraFine;

    @Column(name = "titolo", nullable = false, length = 200)
    private String titolo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_lezione", nullable = false, length = 50)
    private TipoLezione tipoLezione;

    @Column(name = "istruttore", length = 100)
    private String istruttore;

    @Column(name = "max_partecipanti", nullable = false)
    private Integer maxPartecipanti = 1;

    @Column(name = "colore", length = 20)
    private String colore;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "attivo", nullable = false)
    private Boolean attivo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CalendarioSettimanale() {
    }

    public CalendarioSettimanale(Long id,
                                 GiornoSettimana giornoSettimana,
                                 LocalTime oraInizio,
                                 LocalTime oraFine,
                                 String titolo,
                                 TipoLezione tipoLezione,
                                 String istruttore,
                                 Integer maxPartecipanti,
                                 String colore,
                                 String note,
                                 Boolean attivo,
                                 LocalDateTime createdAt,
                                 LocalDateTime updatedAt) {
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
        private Integer maxPartecipanti = 1;
        private String colore;
        private String note;
        private Boolean attivo = Boolean.TRUE;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

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

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public CalendarioSettimanale build() {
            return new CalendarioSettimanale(
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
                    attivo,
                    createdAt,
                    updatedAt
            );
        }
    }
}
