package com.example.demo.mapper;

import com.example.demo.dto.LezioneDto;
import com.example.demo.entity.Lezione;
import com.example.demo.entity.Utenti;
import com.example.demo.entity.Corso;
import com.example.demo.services.CorsoService;
import com.example.demo.enums.TipoLezione;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LezioneMapper {

    private final CorsoService corsoService;

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
        
    // Rimosse chiamate a setPrezzo, setDurata e setMaxPartecipanti (non più presenti su LezioneDto)
        
        // Mappa i partecipanti (solo username)
        if (lezione.getPartecipanti() != null) {
            dto.setPartecipanti(lezione.getPartecipanti().stream()
                    .map(Utenti::getUsername)
                    .collect(Collectors.toList()));
        }

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

    private BigDecimal getPrezzoFromCorso(TipoLezione tipoLezione) {
        try {
            String categoria = mapTipoLezioneToCategoria(tipoLezione);
            List<Corso> corsi = corsoService.SelAllCorsi();
            
            return corsi.stream()
                    .filter(corso -> corso.getAttivo() && categoria.equals(corso.getCategoria()))
                    .findFirst()
                    .map(Corso::getPrezzo)
                    .orElse(BigDecimal.ZERO);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private Integer getDurataFromCorso(TipoLezione tipoLezione) {
        try {
            String categoria = mapTipoLezioneToCategoria(tipoLezione);
            List<Corso> corsi = corsoService.SelAllCorsi();
            
            return corsi.stream()
                    .filter(corso -> corso.getAttivo() && categoria.equals(corso.getCategoria()))
                    .findFirst()
                    .map(Corso::getDurataMinuti)
                    .orElse(60); // Default 60 minuti
        } catch (Exception e) {
            return 60;
        }
    }

    private Integer getMaxPartecipantiFromCorso(TipoLezione tipoLezione) {
        try {
            String categoria = mapTipoLezioneToCategoria(tipoLezione);
            List<Corso> corsi = corsoService.SelAllCorsi();
            
            return corsi.stream()
                    .filter(corso -> corso.getAttivo() && categoria.equals(corso.getCategoria()))
                    .findFirst()
                    .map(Corso::getMaxPartecipanti)
                    .orElse(1); // Default 1 partecipante
        } catch (Exception e) {
            return 1;
        }
    }

    private String mapTipoLezioneToCategoria(TipoLezione tipoLezione) {
        switch (tipoLezione) {
            case PRIVATA:
                return "PRIVATA";
            case PRIMA_LEZIONE:
                return "PRIMA_LEZIONE";
            case SEMI_PRIVATA_DUETTO:
                return "SEMI_PRIVATA_DUETTO";
            case SEMI_PRIVATA_GRUPPO:
                return "SEMI_PRIVATA_GRUPPO";
            case MATWORK:
                return "MATWORK";
            case YOGA:
                return "YOGA";
            default:
                return "PRIVATA";
        }
    }
}
