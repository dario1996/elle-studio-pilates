package com.example.demo.entity;

import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "calendario_settimanale")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
