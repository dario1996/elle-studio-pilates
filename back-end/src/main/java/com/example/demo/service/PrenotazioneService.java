package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.PrenotazioneDto;
import com.example.demo.exceptions.BindingException;
import com.example.demo.exceptions.NotFoundException;

public interface PrenotazioneService {
    PrenotazioneDto creaPrenotazione(Long lezioneId, String username, String note, Long venditaId) throws BindingException, NotFoundException;

    void cancellaPrenotazione(Long lezioneId, String username) throws NotFoundException;

    List<PrenotazioneDto> getPrenotazioniUtente(String username);

    List<PrenotazioneDto> getPrenotazioniPerLezione(Long lezioneId);
}
