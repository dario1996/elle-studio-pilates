package com.example.demo.service;

import com.example.demo.dto.LezioneDto;
import com.example.demo.entity.Lezione;
import com.example.demo.entity.Utenti;
import com.example.demo.enums.TipoLezione;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.BindingException;
import com.example.demo.mapper.LezioneMapper;
import com.example.demo.repository.LezioneRepository;
import com.example.demo.services.UtentiService;
import com.example.demo.services.CorsoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LezioneService {

    private final LezioneRepository lezioneRepository;
    private final LezioneMapper lezioneMapper;
    private final UtentiService utentiService;
    private final CorsoService corsoService;

    @Transactional(readOnly = true)
    public List<LezioneDto> getAllLezioni() {
        log.info("Recupero tutte le lezioni (attive e disattivate)");
        List<Lezione> lezioni = lezioneRepository.findAll();
        return lezioneMapper.toDtoList(lezioni);
    }

    @Transactional(readOnly = true)
    public LezioneDto getLezioneById(Long id) throws NotFoundException {
        log.info("Recupero lezione con ID: {}", id);
        Lezione lezione = lezioneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lezione non trovata con ID: " + id));
        return lezioneMapper.toDto(lezione);
    }

    @Transactional(readOnly = true)
    public List<LezioneDto> getLezioniByDateRange(LocalDateTime dataInizio, LocalDateTime dataFine) {
        log.info("Recupero lezioni nel range: {} - {}", dataInizio, dataFine);
        List<Lezione> lezioni = lezioneRepository.findByDataRange(dataInizio, dataFine);
        return lezioneMapper.toDtoList(lezioni);
    }

    @Transactional(readOnly = true)
    public List<LezioneDto> getLezioniByIstruttore(String istruttore) {
        log.info("Recupero lezioni per istruttore: {}", istruttore);
        List<Lezione> lezioni = lezioneRepository.findByIstruttoreContainingIgnoreCaseAndAttivaTrue(istruttore);
        return lezioneMapper.toDtoList(lezioni);
    }

    @Transactional(readOnly = true)
    public List<LezioneDto> getLezioniByTipo(TipoLezione tipoLezione) {
        log.info("Recupero lezioni per tipo: {}", tipoLezione);
        List<Lezione> lezioni = lezioneRepository.findByTipoLezioneAndAttivaTrue(tipoLezione);
        return lezioneMapper.toDtoList(lezioni);
    }

    @Transactional(readOnly = true)
    public List<LezioneDto> getLezioniOggiDaOraCorrente() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Recupero lezioni di oggi dalle ore {}", now);
        List<Lezione> lezioni = lezioneRepository.findLezioniOggiDaOra(now);
        log.info("Trovate {} lezioni per oggi", lezioni.size());
        return lezioneMapper.toDtoList(lezioni);
    }

    public LezioneDto createLezione(LezioneDto lezioneDto) throws BindingException {
        log.info("Creazione nuova lezione: {}", lezioneDto.getTitolo());
        
        // Validazioni
        validateLezione(lezioneDto, null);
        
        // Verifica conflitti orario
        checkConflittiOrario(lezioneDto.getIstruttore(), 
                           lezioneDto.getDataInizio(), 
                           lezioneDto.getDataFine(), 
                           null);

        Lezione lezione = lezioneMapper.toEntity(lezioneDto);
        lezione.setId(null); // Assicuriamo che sia una nuova entità
        lezione.setAttiva(true);
        
        // Gestione partecipanti
        if (lezioneDto.getPartecipanti() != null && !lezioneDto.getPartecipanti().isEmpty()) {
            List<Utenti> partecipanti = new ArrayList<>();
            for (String username : lezioneDto.getPartecipanti()) {
                Utenti utente = utentiService.SelUser(username);
                if (utente != null) {
                    partecipanti.add(utente);
                } else {
                    log.warn("Utente non trovato: " + username);
                }
            }
            lezione.setPartecipanti(partecipanti);
        }
        
        Lezione savedLezione = lezioneRepository.save(lezione);
        log.info("Lezione creata con ID: {} e {} partecipanti", 
                savedLezione.getId(), 
                savedLezione.getPartecipanti().size());
        
        return lezioneMapper.toDto(savedLezione);
    }

    public LezioneDto updateLezione(Long id, LezioneDto lezioneDto) throws NotFoundException, BindingException {
        log.info("Aggiornamento lezione con ID: {}", id);
        
        Lezione existingLezione = lezioneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lezione non trovata con ID: " + id));

        // Validazioni
        validateLezione(lezioneDto, id);
        
        // Verifica conflitti orario
        checkConflittiOrario(lezioneDto.getIstruttore(), 
                           lezioneDto.getDataInizio(), 
                           lezioneDto.getDataFine(), 
                           id);

        // Aggiorna i campi
        existingLezione.setTitolo(lezioneDto.getTitolo());
        existingLezione.setDataInizio(lezioneDto.getDataInizio());
        existingLezione.setDataFine(lezioneDto.getDataFine());
        existingLezione.setIstruttore(lezioneDto.getIstruttore());
        existingLezione.setTipoLezione(lezioneDto.getTipoLezione());
        existingLezione.setNote(lezioneDto.getNote());
        // Aggiorna anche il campo attiva se presente nel DTO
        if (lezioneDto.getAttiva() != null) {
            existingLezione.setAttiva(lezioneDto.getAttiva());
        }

        // Aggiorna partecipanti
        if (lezioneDto.getPartecipanti() != null) {
            List<Utenti> partecipanti = new ArrayList<>();
            for (String username : lezioneDto.getPartecipanti()) {
                Utenti utente = utentiService.SelUser(username);
                if (utente != null) {
                    partecipanti.add(utente);
                } else {
                    log.warn("Utente non trovato durante update: " + username);
                }
            }
            existingLezione.setPartecipanti(partecipanti);
        }

        Lezione updatedLezione = lezioneRepository.save(existingLezione);
        log.info("Lezione aggiornata con ID: {} e {} partecipanti", 
                updatedLezione.getId(), 
                updatedLezione.getPartecipanti().size());
        
        return lezioneMapper.toDto(updatedLezione);
    }

    public void toggleStatusLezione(Long id) throws NotFoundException, BindingException {
        log.info("Toggle status lezione con ID: {}", id);
        
        Lezione lezione = lezioneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lezione non trovata con ID: " + id));

        Boolean nuovoStatus = !lezione.getAttiva();
        
        int updated = lezioneRepository.updateAttivaStatus(id, nuovoStatus);
        if (updated == 0) {
            throw new BindingException("Impossibile aggiornare lo status della lezione");
        }
        
        log.info("Status lezione {} cambiato a: {}", id, nuovoStatus);
    }

    public void deleteLezione(Long id) throws NotFoundException {
        log.info("Eliminazione definitiva lezione con ID: {}", id);
        
        if (!lezioneRepository.existsById(id)) {
            throw new NotFoundException("Lezione non trovata con ID: " + id);
        }

        lezioneRepository.deleteById(id);
        log.info("Lezione eliminata definitivamente con ID: {}", id);
    }

    private void validateLezione(LezioneDto lezioneDto, Long lezioneId) throws BindingException {
        // Validazione date
        if (lezioneDto.getDataInizio().isAfter(lezioneDto.getDataFine())) {
            throw new BindingException("La data di inizio deve essere precedente alla data di fine");
        }

        // Validazione date nel passato (solo per nuove lezioni)
        if (lezioneId == null && lezioneDto.getDataInizio().isBefore(LocalDateTime.now())) {
            throw new BindingException("Non è possibile creare lezioni nel passato");
        }
        
        // Validazione numero partecipanti basata sul tipo lezione
        if (lezioneDto.getPartecipanti() != null) {
            int maxPartecipantiPerTipo = getMaxPartecipantiByTipoLezione(lezioneDto.getTipoLezione());
            if (lezioneDto.getPartecipanti().size() > maxPartecipantiPerTipo) {
                throw new BindingException(String.format(
                    "Il tipo lezione '%s' ammette massimo %d partecipanti, ma ne sono stati selezionati %d",
                    lezioneDto.getTipoLezione().name(),
                    maxPartecipantiPerTipo,
                    lezioneDto.getPartecipanti().size()
                ));
            }
        }
    }
    
    private int getMaxPartecipantiByTipoLezione(TipoLezione tipoLezione) {
        switch (tipoLezione) {
            case PRIVATA:
            case PRIMA_LEZIONE:
                return 1;
            case SEMI_PRIVATA_DUETTO:
                return 2;
            case SEMI_PRIVATA_GRUPPO:
                return 4;
            case MATWORK:
                return 6;
            case YOGA:
                return 8;
            default:
                return 1;
        }
    }

    private void checkConflittiOrario(String istruttore, LocalDateTime dataInizio, LocalDateTime dataFine, Long lezioneId) throws BindingException {
        int conflitti = lezioneRepository.countConflittiOrario(istruttore, dataInizio, dataFine, lezioneId);
        
        if (conflitti > 0) {
            throw new BindingException(
                String.format("Conflitto di orario: l'istruttore %s ha già una lezione programmata in questo orario", istruttore)
            );
        }
    }
}
