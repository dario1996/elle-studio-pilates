package com.example.demo.mapper;

import com.example.demo.dto.LezioneDto;
import com.example.demo.entity.Lezione;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class LezioneMapper {

    public LezioneDto toDto(Lezione lezione) {
        if (lezione == null) {
            return null;
        }

        LezioneDto dto = new LezioneDto();
        dto.setId(lezione.getId());
        dto.setTitolo(lezione.getTitolo());
        dto.setDataInizio(lezione.getDataInizio());
        dto.setDataFine(lezione.getDataFine());
        dto.setIstruttore(lezione.getIstruttore());
        dto.setTipoLezione(lezione.getTipoLezione());
        dto.setNote(lezione.getNote());
        dto.setAttiva(lezione.getAttiva());
        dto.setCreatedAt(lezione.getCreatedAt());
        dto.setUpdatedAt(lezione.getUpdatedAt());

        return dto;
    }

    public Lezione toEntity(LezioneDto dto) {
        if (dto == null) {
            return null;
        }

        Lezione lezione = new Lezione();
        lezione.setId(dto.getId());
        lezione.setTitolo(dto.getTitolo());
        lezione.setDataInizio(dto.getDataInizio());
        lezione.setDataFine(dto.getDataFine());
        lezione.setIstruttore(dto.getIstruttore());
        lezione.setTipoLezione(dto.getTipoLezione());
        lezione.setNote(dto.getNote());
        lezione.setAttiva(dto.getAttiva());
        lezione.setCreatedAt(dto.getCreatedAt());
        lezione.setUpdatedAt(dto.getUpdatedAt());

        return lezione;
    }

    public List<LezioneDto> toDtoList(List<Lezione> lezioni) {
        return lezioni.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<Lezione> toEntityList(List<LezioneDto> dtos) {
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
