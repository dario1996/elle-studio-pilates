package com.example.demo.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "utente_pacchetti_disponibili")
public class UtentePacchettiDisponibili {
    
    @EmbeddedId
    private UtentePacchettoId id;
    
    @Column(name = "data_assegnazione")
    private LocalDateTime dataAssegnazione;
    
    @ManyToOne
    @MapsId("utenteId")
    @JoinColumn(name = "utente_id")
    private Utenti utente;
    
    @ManyToOne
    @MapsId("pacchettoId")
    @JoinColumn(name = "pacchetto_id")
    private Pacchetto pacchetto;
    
    public UtentePacchettiDisponibili() {
        this.dataAssegnazione = LocalDateTime.now();
    }

    public UtentePacchettoId getId() {
        return id;
    }

    public void setId(UtentePacchettoId id) {
        this.id = id;
    }

    public LocalDateTime getDataAssegnazione() {
        return dataAssegnazione;
    }

    public void setDataAssegnazione(LocalDateTime dataAssegnazione) {
        this.dataAssegnazione = dataAssegnazione;
    }

    public Utenti getUtente() {
        return utente;
    }

    public void setUtente(Utenti utente) {
        this.utente = utente;
    }

    public Pacchetto getPacchetto() {
        return pacchetto;
    }

    public void setPacchetto(Pacchetto pacchetto) {
        this.pacchetto = pacchetto;
    }
}

@Embeddable
class UtentePacchettoId implements Serializable {
    
    @Column(name = "utente_id")
    private Long utenteId;
    
    @Column(name = "pacchetto_id")
    private Long pacchettoId;

    public UtentePacchettoId() {
    }

    public UtentePacchettoId(Long utenteId, Long pacchettoId) {
        this.utenteId = utenteId;
        this.pacchettoId = pacchettoId;
    }

    public Long getUtenteId() {
        return utenteId;
    }

    public void setUtenteId(Long utenteId) {
        this.utenteId = utenteId;
    }

    public Long getPacchettoId() {
        return pacchettoId;
    }

    public void setPacchettoId(Long pacchettoId) {
        this.pacchettoId = pacchettoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UtentePacchettoId that = (UtentePacchettoId) o;
        return Objects.equals(utenteId, that.utenteId) && 
               Objects.equals(pacchettoId, that.pacchettoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(utenteId, pacchettoId);
    }
}
