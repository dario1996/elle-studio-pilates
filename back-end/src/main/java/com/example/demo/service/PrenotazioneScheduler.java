package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Prenotazione;
import com.example.demo.repository.PrenotazioneRepository;

@Component
public class PrenotazioneScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PrenotazioneScheduler.class);

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;
    
    @Autowired
    private com.example.demo.repository.VenditaRepository venditaRepository;

    // Ogni 10 minuti
    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void processaConsumi() {
        try {
            LocalDateTime nowPlus24 = LocalDateTime.now().plusHours(24);
            List<Prenotazione> daConsumare = prenotazioneRepository
                    .findByConsumataFalseAndAttivaTrueAndLezioneDataInizioBefore(nowPlus24);

            if (daConsumare.isEmpty()) return;

            logger.info("PrenotazioneScheduler: {} prenotazioni da marcare come consumate", daConsumare.size());

            for (Prenotazione p : daConsumare) {
                try {
                    p.setConsumata(true);
                    p.setDataConsumo(LocalDateTime.now());
                    prenotazioneRepository.save(p);

                    // Se la prenotazione è legata a una vendita, decrementa le lezioni residue (se presente)
                    try {
                        if (p.getVendita() != null) {
                            var vend = p.getVendita();
                            Integer residuo = vend.getLezioniResidue();
                            if (residuo != null) {
                                if (residuo > 0) {
                                    vend.setLezioniResidue(residuo - 1);
                                    venditaRepository.save(vend);
                                } else {
                                    logger.warn("Vendita id={} ha lezioni_residue=0, non è stato possibile decrementare", vend.getId());
                                }
                            } else {
                                logger.debug("Vendita id={} non ha lezioni_residue impostate, skipping decrement", vend.getId());
                            }
                        }
                    } catch (Exception ex2) {
                        logger.error("Errore nel decrementare lezioni_residue per prenotazione id={}", p.getId(), ex2);
                    }
                } catch (Exception ex) {
                    logger.error("Errore nel marcare prenotazione id={} come consumata", p.getId(), ex);
                }
            }

        } catch (Exception e) {
            logger.error("Errore nel PrenotazioneScheduler", e);
        }
    }
}
