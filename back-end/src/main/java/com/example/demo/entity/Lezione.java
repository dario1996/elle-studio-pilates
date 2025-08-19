package com.example.demo.entity;

import com.example.demo.enums.TipoLezione;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lezioni")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
