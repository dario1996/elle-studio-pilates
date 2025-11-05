package com.example.demo.dto;

import java.time.LocalDateTime;

public class PrenotazioneDto {
    private Long id;
    private Long lezioneId;
    private String titolo;
    private LocalDateTime dataInizio;
    private LocalDateTime dataFine;
    private String istruttore;
    private String tipoLezione;
    private String username;
    private String note;
    private String stato;
    private LocalDateTime dataPrenotazione;
    private Long venditaId;
    private Long pacchettoUtenteId;
    private Integer lezioniResidue;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLezioneId() { return lezioneId; }
    public void setLezioneId(Long lezioneId) { this.lezioneId = lezioneId; }

    public String getTitolo() { return titolo; }
    public void setTitolo(String titolo) { this.titolo = titolo; }

    public LocalDateTime getDataInizio() { return dataInizio; }
    public void setDataInizio(LocalDateTime dataInizio) { this.dataInizio = dataInizio; }

    public LocalDateTime getDataFine() { return dataFine; }
    public void setDataFine(LocalDateTime dataFine) { this.dataFine = dataFine; }

    public String getIstruttore() { return istruttore; }
    public void setIstruttore(String istruttore) { this.istruttore = istruttore; }

    public String getTipoLezione() { return tipoLezione; }
    public void setTipoLezione(String tipoLezione) { this.tipoLezione = tipoLezione; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getStato() { return stato; }
    public void setStato(String stato) { this.stato = stato; }

    public LocalDateTime getDataPrenotazione() { return dataPrenotazione; }
    public void setDataPrenotazione(LocalDateTime dataPrenotazione) { this.dataPrenotazione = dataPrenotazione; }

    public Long getVenditaId() { return venditaId; }
    public void setVenditaId(Long venditaId) { this.venditaId = venditaId; }

    public Long getPacchettoUtenteId() { return pacchettoUtenteId; }
    public void setPacchettoUtenteId(Long pacchettoUtenteId) { this.pacchettoUtenteId = pacchettoUtenteId; }

    public Integer getLezioniResidue() { return lezioniResidue; }
    public void setLezioniResidue(Integer lezioniResidue) { this.lezioniResidue = lezioniResidue; }
}
