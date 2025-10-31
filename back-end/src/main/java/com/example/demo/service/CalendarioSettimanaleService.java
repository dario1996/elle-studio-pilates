package com.example.demo.service;

import com.example.demo.dto.CalendarioSettimanaleDto;
import com.example.demo.entity.CalendarioSettimanale;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.mapper.CalendarioSettimanaleMapper;
import com.example.demo.repository.CalendarioSettimanaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarioSettimanaleService {

    private static final Logger log = LoggerFactory.getLogger(CalendarioSettimanaleService.class);

    private final CalendarioSettimanaleRepository calendarioRepository;
    private final CalendarioSettimanaleMapper calendarioMapper;

    public CalendarioSettimanaleService(final CalendarioSettimanaleRepository calendarioRepository,
                                        final CalendarioSettimanaleMapper calendarioMapper) {
        this.calendarioRepository = calendarioRepository;
        this.calendarioMapper = calendarioMapper;
    }

    /**
     * Recupera tutte le voci del calendario settimanale attive
     */
    @Transactional(readOnly = true)
    public List<CalendarioSettimanaleDto> getAllCalendarioAttivo() {
        log.debug("Recupero tutte le voci del calendario attive");
        return calendarioRepository.findByAttivoTrueOrderByGiornoSettimanaAscOraInizioAsc()
                .stream()
                .map(calendarioMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Recupera tutte le voci del calendario settimanale
     */
    @Transactional(readOnly = true)
    public List<CalendarioSettimanaleDto> getAllCalendario() {
        log.debug("Recupero tutte le voci del calendario");
        return calendarioRepository.findAll()
                .stream()
                .map(calendarioMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Recupera le voci del calendario per un giorno specifico
     */
    @Transactional(readOnly = true)
    public List<CalendarioSettimanaleDto> getCalendarioByGiorno(GiornoSettimana giorno) {
        log.debug("Recupero calendario per giorno: {}", giorno);
        return calendarioRepository.findByGiornoSettimanaOrderByOraInizio(giorno)
                .stream()
                .map(calendarioMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Recupera una voce del calendario per ID
     */
    @Transactional(readOnly = true)
    public CalendarioSettimanaleDto getCalendarioById(Long id) throws NotFoundException {
        log.debug("Recupero voce calendario con ID: {}", id);
        CalendarioSettimanale calendario = calendarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voce calendario non trovata con ID: " + id));
        return calendarioMapper.toDto(calendario);
    }

    /**
     * Crea una nuova voce del calendario
     */
    @Transactional
    public CalendarioSettimanaleDto createCalendario(CalendarioSettimanaleDto dto) {
        log.info("Creazione nuova voce calendario: {} - {}", dto.getGiornoSettimana(), dto.getTitolo());
        CalendarioSettimanale calendario = calendarioMapper.toEntity(dto);
        CalendarioSettimanale saved = calendarioRepository.save(calendario);
        return calendarioMapper.toDto(saved);
    }

    /**
     * Aggiorna una voce del calendario esistente
     */
    @Transactional
    public CalendarioSettimanaleDto updateCalendario(Long id, CalendarioSettimanaleDto dto) throws NotFoundException {
        log.info("Aggiornamento voce calendario con ID: {}", id);
        
        CalendarioSettimanale existing = calendarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voce calendario non trovata con ID: " + id));

        existing.setGiornoSettimana(dto.getGiornoSettimana());
        existing.setOraInizio(dto.getOraInizio());
        existing.setOraFine(dto.getOraFine());
        existing.setTitolo(dto.getTitolo());
        existing.setTipoLezione(dto.getTipoLezione());
        existing.setIstruttore(dto.getIstruttore());
        existing.setMaxPartecipanti(dto.getMaxPartecipanti());
        existing.setColore(dto.getColore());
        existing.setNote(dto.getNote());
        existing.setAttivo(dto.getAttivo());

        CalendarioSettimanale updated = calendarioRepository.save(existing);
        return calendarioMapper.toDto(updated);
    }

    /**
     * Elimina una voce del calendario
     */
    @Transactional
    public void deleteCalendario(Long id) throws NotFoundException {
        log.info("Eliminazione voce calendario con ID: {}", id);
        
        if (!calendarioRepository.existsById(id)) {
            throw new NotFoundException("Voce calendario non trovata con ID: " + id);
        }
        
        calendarioRepository.deleteById(id);
    }

    /**
     * Attiva/disattiva una voce del calendario
     */
    @Transactional
    public void toggleStatusCalendario(Long id) throws NotFoundException {
        log.info("Toggle status voce calendario con ID: {}", id);
        
        CalendarioSettimanale calendario = calendarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voce calendario non trovata con ID: " + id));

        calendario.setAttivo(!calendario.getAttivo());
        calendarioRepository.save(calendario);
    }
}
