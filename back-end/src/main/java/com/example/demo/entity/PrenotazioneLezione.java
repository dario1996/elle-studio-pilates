package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity per la tabella prenotazioni_lezioni.
 * Rappresenta la relazione Many-to-Many tra Lezione e Utenti.
 */
@Entity
@Table(name = "prenotazioni_lezioni")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrenotazioneLezione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lezione_id", nullable = false)
    private Lezione lezione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partecipanti_username", referencedColumnName = "username", nullable = false)
    private Utenti utente;

    @Column(name = "data_prenotazione", nullable = false, updatable = false)
    private LocalDateTime dataPrenotazione;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "stato", length = 50)
    private String stato = "CONFERMATA"; // CONFERMATA, CANCELLATA, IN_ATTESA

    @PrePersist
    protected void onCreate() {
        dataPrenotazione = LocalDateTime.now();
        if (stato == null) {
            stato = "CONFERMATA";
        }
    }
}
