package com.example.demo.mapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.demo.dto.LezioneDto;
import com.example.demo.entity.Lezione;
import com.example.demo.entity.Pacchetto;
import com.example.demo.entity.Utenti;
import com.example.demo.enums.TipoLezione;
import com.example.demo.services.PacchettoService;

@Component
public class LezioneMapper {

    private final PacchettoService pacchettoService;

    public LezioneMapper(PacchettoService pacchettoService) {
        this.pacchettoService = pacchettoService;
    }

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
        dto.setTemplateId(lezione.getTemplateId());
        dto.setMaxPartecipanti(lezione.getMaxPartecipanti());
        dto.setCreatedAt(lezione.getCreatedAt());
        dto.setUpdatedAt(lezione.getUpdatedAt());
        
        // Mappa i partecipanti (solo username)
        if (lezione.getPartecipanti() != null && !lezione.getPartecipanti().isEmpty()) {
            dto.setPartecipanti(lezione.getPartecipanti().stream()
                    .map(Utenti::getUsername)
                    .collect(Collectors.toList()));
            
            // Calcola posti disponibili
            int prenotati = lezione.getPartecipanti().size();
            dto.setPostiDisponibili(lezione.getMaxPartecipanti() - prenotati);
        } else {
            dto.setPostiDisponibili(lezione.getMaxPartecipanti());
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

    private BigDecimal getPrezzoFromPacchetto(TipoLezione tipoLezione) {
        try {
            String categoria = mapTipoLezioneToCategoria(tipoLezione);
            List<Pacchetto> pacchetti = pacchettoService.SelAllPacchetti();

            return pacchetti.stream()
                    .filter(pacchetto -> pacchetto.getAttivo() && categoria.equals(pacchetto.getCategoria()))
                    .findFirst()
                    .map(Pacchetto::getPrezzo)
                    .orElse(BigDecimal.ZERO);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private Integer getDurataFromPacchetto(TipoLezione tipoLezione) {
        try {
            String categoria = mapTipoLezioneToCategoria(tipoLezione);
            List<Pacchetto> pacchetti = pacchettoService.SelAllPacchetti();

            return pacchetti.stream()
                    .filter(pacchetto -> pacchetto.getAttivo() && categoria.equals(pacchetto.getCategoria()))
                    .findFirst()
                    .map(Pacchetto::getDurataMinuti)
                    .orElse(60); // Default 60 minuti
        } catch (Exception e) {
            return 60;
        }
    }

    private Integer getMaxPartecipantiFromPacchetto(TipoLezione tipoLezione) {
        try {
            String categoria = mapTipoLezioneToCategoria(tipoLezione);
            List<Pacchetto> pacchetti = pacchettoService.SelAllPacchetti();

            return pacchetti.stream()
                    .filter(pacchetto -> pacchetto.getAttivo() && categoria.equals(pacchetto.getCategoria()))
                    .findFirst()
                    .map(Pacchetto::getMaxPartecipanti)
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
            case SEMI_PRIVATA:
                return "SEMI_PRIVATA";
            case PILATES_MATWORK:
                return "PILATES_MATWORK";
            case YOGA:
                return "YOGA";
            default:
                return "PRIVATA";
        }
    }
}
