package com.example.demo.service;

import com.example.demo.entity.CalendarioSettimanale;
import com.example.demo.entity.Lezione;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.repository.CalendarioSettimanaleRepository;
import com.example.demo.repository.LezioneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LezioneGeneratorService {

    private final CalendarioSettimanaleRepository calendarioRepository;
    private final LezioneRepository lezioneRepository;

    /**
     * Genera le lezioni concrete per un determinato periodo basandosi sul calendario settimanale
     * 
     * @param dataInizio data di inizio del periodo
     * @param dataFine data di fine del periodo
     * @return numero di lezioni generate
     */
    @Transactional
    public int generaLezioniDaCalendario(LocalDate dataInizio, LocalDate dataFine) {
        log.info("Generazione lezioni dal {} al {}", dataInizio, dataFine);

        List<CalendarioSettimanale> templateAttivi = calendarioRepository.findByAttivoTrueOrderByGiornoSettimanaAscOraInizioAsc();
        
        if (templateAttivi.isEmpty()) {
            log.warn("Nessun template attivo trovato nel calendario settimanale");
            return 0;
        }

        int lezioniGenerate = 0;
        LocalDate currentDate = dataInizio;

        while (!currentDate.isAfter(dataFine)) {
            GiornoSettimana giornoSettimana = mapDayOfWeekToGiornoSettimana(currentDate.getDayOfWeek());
            
            // Trova tutti i template per questo giorno
            List<CalendarioSettimanale> templateDelGiorno = templateAttivi.stream()
                    .filter(t -> t.getGiornoSettimana() == giornoSettimana)
                    .toList();

            // Genera una lezione per ogni template del giorno
            for (CalendarioSettimanale template : templateDelGiorno) {
                // Verifica se esiste già una lezione per questo template in questa data
                LocalDateTime dataInizioLezione = LocalDateTime.of(currentDate, template.getOraInizio());
                LocalDateTime dataFineLezione = LocalDateTime.of(currentDate, template.getOraFine());

                boolean lezioneEsistente = lezioneRepository.existsByTemplateIdAndDataInizio(
                        template.getId(), dataInizioLezione);

                if (!lezioneEsistente) {
                    Lezione nuovaLezione = new Lezione();
                    nuovaLezione.setTitolo(template.getTitolo());
                    nuovaLezione.setDataInizio(dataInizioLezione);
                    nuovaLezione.setDataFine(dataFineLezione);
                    nuovaLezione.setIstruttore(template.getIstruttore() != null ? template.getIstruttore() : "Da assegnare");
                    nuovaLezione.setTipoLezione(template.getTipoLezione());
                    nuovaLezione.setMaxPartecipanti(template.getMaxPartecipanti());
                    nuovaLezione.setTemplateId(template.getId());
                    nuovaLezione.setAttiva(true);
                    nuovaLezione.setNote(template.getNote());

                    lezioneRepository.save(nuovaLezione);
                    lezioniGenerate++;
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        log.info("Generate {} nuove lezioni", lezioniGenerate);
        return lezioniGenerate;
    }

    /**
     * Genera lezioni per il mese corrente
     */
    @Transactional
    public int generaLezioniMeseCorrente() {
        LocalDate oggi = LocalDate.now();
        LocalDate primoGiornoMese = oggi.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate ultimoGiornoMese = oggi.with(TemporalAdjusters.lastDayOfMonth());
        
        return generaLezioniDaCalendario(primoGiornoMese, ultimoGiornoMese);
    }

    /**
     * Genera lezioni per i prossimi N giorni
     */
    @Transactional
    public int generaLezioniProssimiGiorni(int giorni) {
        LocalDate oggi = LocalDate.now();
        LocalDate dataFine = oggi.plusDays(giorni);
        
        return generaLezioniDaCalendario(oggi, dataFine);
    }

    /**
     * Genera lezioni per una settimana specifica
     */
    @Transactional
    public int generaLezioniSettimana(LocalDate dataInizioSettimana) {
        LocalDate lunedi = dataInizioSettimana.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate domenica = lunedi.plusDays(6);
        
        return generaLezioniDaCalendario(lunedi, domenica);
    }

    /**
     * Mappa DayOfWeek Java a GiornoSettimana custom
     */
    private GiornoSettimana mapDayOfWeekToGiornoSettimana(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> GiornoSettimana.LUNEDI;
            case TUESDAY -> GiornoSettimana.MARTEDI;
            case WEDNESDAY -> GiornoSettimana.MERCOLEDI;
            case THURSDAY -> GiornoSettimana.GIOVEDI;
            case FRIDAY -> GiornoSettimana.VENERDI;
            case SATURDAY -> GiornoSettimana.SABATO;
            case SUNDAY -> GiornoSettimana.DOMENICA;
        };
    }

    /**
     * Elimina tutte le lezioni future non prenotate
     */
    @Transactional
    public int eliminaLezioniFutureNonPrenotate() {
        LocalDateTime ora = LocalDateTime.now();
        List<Lezione> lezioniFuture = lezioneRepository.findByDataInizioAfterAndAttivaTrue(ora);
        
        int eliminati = 0;
        for (Lezione lezione : lezioniFuture) {
            if (lezione.getPartecipanti().isEmpty()) {
                lezioneRepository.delete(lezione);
                eliminati++;
            }
        }
        
        log.info("Eliminate {} lezioni future non prenotate", eliminati);
        return eliminati;
    }

    /**
     * Rigenera le lezioni per un periodo eliminando quelle esistenti non prenotate
     */
    @Transactional
    public int rigeneraLezioni(LocalDate dataInizio, LocalDate dataFine) {
        log.info("Rigenerazione lezioni dal {} al {}", dataInizio, dataFine);
        
        // Elimina lezioni non prenotate nel periodo
        LocalDateTime dataInizioTime = dataInizio.atStartOfDay();
        LocalDateTime dataFineTime = dataFine.atTime(23, 59, 59);
        
        List<Lezione> lezioniDaEliminare = lezioneRepository
                .findByDataInizioBetween(dataInizioTime, dataFineTime)
                .stream()
                .filter(l -> l.getPartecipanti().isEmpty())
                .toList();
        
        lezioneRepository.deleteAll(lezioniDaEliminare);
        log.info("Eliminate {} lezioni non prenotate", lezioniDaEliminare.size());
        
        // Genera nuove lezioni
        return generaLezioniDaCalendario(dataInizio, dataFine);
    }
}
