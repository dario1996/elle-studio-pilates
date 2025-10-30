package com.example.demo.mapper;

import com.example.demo.dto.CalendarioSettimanaleDto;
import com.example.demo.entity.CalendarioSettimanale;
import org.springframework.stereotype.Component;

@Component
public class CalendarioSettimanaleMapper {

    public CalendarioSettimanaleDto toDto(CalendarioSettimanale entity) {
        if (entity == null) {
            return null;
        }

        return CalendarioSettimanaleDto.builder()
                .id(entity.getId())
                .giornoSettimana(entity.getGiornoSettimana())
                .oraInizio(entity.getOraInizio())
                .oraFine(entity.getOraFine())
                .titolo(entity.getTitolo())
                .tipoLezione(entity.getTipoLezione())
                .istruttore(entity.getIstruttore())
                .maxPartecipanti(entity.getMaxPartecipanti())
                .colore(entity.getColore())
                .note(entity.getNote())
                .attivo(entity.getAttivo())
                .build();
    }

    public CalendarioSettimanale toEntity(CalendarioSettimanaleDto dto) {
        if (dto == null) {
            return null;
        }

        return CalendarioSettimanale.builder()
                .id(dto.getId())
                .giornoSettimana(dto.getGiornoSettimana())
                .oraInizio(dto.getOraInizio())
                .oraFine(dto.getOraFine())
                .titolo(dto.getTitolo())
                .tipoLezione(dto.getTipoLezione())
                .istruttore(dto.getIstruttore())
                .maxPartecipanti(dto.getMaxPartecipanti())
                .colore(dto.getColore())
                .note(dto.getNote())
                .attivo(dto.getAttivo() != null ? dto.getAttivo() : true)
                .build();
    }
}
