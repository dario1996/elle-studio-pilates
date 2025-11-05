package com.example.demo.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.example.demo.enums.TipoLezione;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "lezioni")
public class Lezione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty(message = "Il titolo è obbligatorio")
    @Column(nullable = false, length = 200)
    private String titolo;

    @NotNull(message = "La data di inizio è obbligatoria")
    @Column(name = "data_inizio", nullable = false)
    private LocalDateTime dataInizio;

    @NotNull(message = "La data di fine è obbligatoria")
    @Column(name = "data_fine", nullable = false)
    private LocalDateTime dataFine;

    @NotEmpty(message = "Il nome dell'istruttore è obbligatorio")
    @Column(name = "istruttore", nullable = false, length = 100)
    private String istruttore;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Il tipo di lezione è obbligatorio")
    @Column(name = "tipo_lezione", nullable = false)
    private TipoLezione tipoLezione;

    @Column(name = "note")
    private String note;

    @Column(name = "attiva", nullable = false)
    private Boolean attiva = true;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "pacchetto_id")
    private Long pacchettoId;

    @Column(name = "max_partecipanti", nullable = false)
    private Integer maxPartecipanti = 1;

    @ManyToMany
    @JoinTable(
        name = "lezione_partecipanti",
        joinColumns = @JoinColumn(name = "lezione_id"),
        inverseJoinColumns = @JoinColumn(name = "utente_id")
    )
    private List<Utenti> partecipanti = new ArrayList<>();

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

    public Lezione() {
    }

    public Lezione(Long id,
                   String titolo,
                   LocalDateTime dataInizio,
                   LocalDateTime dataFine,
                   String istruttore,
                   TipoLezione tipoLezione,
                   String note,
                   Boolean attiva,
                   Long templateId,
                   Integer maxPartecipanti,
                   List<Utenti> partecipanti,
                   LocalDateTime createdAt,
                   LocalDateTime updatedAt) {
        this.id = id;
        this.titolo = titolo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.istruttore = istruttore;
        this.tipoLezione = tipoLezione;
        this.note = note;
        this.attiva = attiva;
        this.templateId = templateId;
        this.maxPartecipanti = maxPartecipanti;
        this.partecipanti = partecipanti;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public List<Utenti> getPartecipanti() {
        return partecipanti;
    }

    public void setPartecipanti(List<Utenti> partecipanti) {
        this.partecipanti = partecipanti;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Lezione lezione = (Lezione) o;
        return Objects.equals(id, lezione.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Lezione{" +
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
                ", partecipanti='" + partecipanti + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
