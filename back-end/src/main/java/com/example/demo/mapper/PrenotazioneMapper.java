package com.example.demo.mapper;

import com.example.demo.dto.PrenotazioneDto;
import com.example.demo.entity.Prenotazione;

public class PrenotazioneMapper {

    public static PrenotazioneDto toDto(Prenotazione p) {
        if (p == null) return null;
        PrenotazioneDto dto = new PrenotazioneDto();
        dto.setId(p.getId());
        if (p.getLezione() != null) {
            dto.setLezioneId(p.getLezione().getId());
            dto.setTitolo(p.getLezione().getTitolo());
            dto.setDataInizio(p.getLezione().getDataInizio());
            dto.setDataFine(p.getLezione().getDataFine());
            if (p.getLezione().getIstruttore() != null) dto.setIstruttore(p.getLezione().getIstruttore());
            if (p.getLezione().getTipoLezione() != null) dto.setTipoLezione(p.getLezione().getTipoLezione().name());
        }
        if (p.getUtente() != null) dto.setUsername(p.getUtente().getUsername());
        dto.setNote(p.getNote());
        dto.setDataPrenotazione(p.getDataPrenotazione());
        dto.setStato(p.getAttiva() != null && p.getAttiva() ? "ATTIVA" : "INATTIVA");
        if (p.getVendita() != null) dto.setVenditaId(p.getVendita().getId());
        if (p.getPacchettoUtente() != null) {
            dto.setPacchettoUtenteId(p.getPacchettoUtente().getId());
            dto.setLezioniResidue(p.getPacchettoUtente().getLezioniResidue());
        }
        return dto;
    }
}
