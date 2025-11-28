package com.example.demo.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.CalendarioSettimanale;
import com.example.demo.entity.PrenotazioneLezione;
import com.example.demo.entity.Utenti;
import com.example.demo.entity.Vendita;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.repository.CalendarioSettimanaleRepository;
import com.example.demo.repository.PrenotazioneLezioneRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.repository.VenditaRepository;

/**
 * Service per la gestione delle prenotazioni ricorrenti
 */
@Service
public class PrenotazioneRicorrenteService {

    @Autowired
    private PrenotazioneLezioneRepository prenotazioneRepository;

    @Autowired
    private VenditaRepository venditaRepository;

    @Autowired
    private CalendarioSettimanaleRepository calendarioRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    /**
     * Crea prenotazioni ricorrenti per un pacchetto
     * 
     * @param venditaId ID della vendita (pacchetto acquistato)
     * @param templateId ID del template calendario settimanale
     * @param username Username dell'utente
     * @param tipoLezione Tipo di lezione (per pacchetti COMBO)
     * @param numeroLezioniDaPrenotare Numero di lezioni da prenotare (null = tutte)
     * @return Lista delle prenotazioni create
     */
    @Transactional
    public List<PrenotazioneLezione> creaPrenotazioniRicorrenti(
            Long venditaId,
            Long templateId,
            String username,
            String tipoLezione,
            Integer numeroLezioniDaPrenotare) {

        // Recupera entità
        Vendita vendita = venditaRepository.findById(venditaId)
                .orElseThrow(() -> new RuntimeException("Vendita non trovata"));

        CalendarioSettimanale template = calendarioRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template non trovato"));

        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        // Validazioni
        if (!vendita.isPagata()) {
            throw new RuntimeException("La vendita non è stata ancora pagata");
        }

        if (!vendita.hasLezioniDisponibili()) {
            throw new RuntimeException("Non ci sono lezioni disponibili in questo pacchetto");
        }

        // Determina quante lezioni prenotare
        int lezioniDaCreare;
        if (numeroLezioniDaPrenotare != null) {
            lezioniDaCreare = Math.min(numeroLezioniDaPrenotare, vendita.getLezioniRimanenti());
        } else {
            lezioniDaCreare = vendita.getLezioniRimanenti();
        }

        // Genera ID gruppo per raggruppare le prenotazioni
        String gruppoId = UUID.randomUUID().toString();

        // Calcola la prima data disponibile
        LocalDate primaData = calcolaPrimaDataDisponibile(template.getGiornoSettimana());

        // Crea le prenotazioni
        List<PrenotazioneLezione> prenotazioni = new ArrayList<>();
        LocalDate dataCorrente = primaData;

        for (int i = 0; i < lezioniDaCreare; i++) {
            // Verifica disponibilità posti
            Long partecipantiAttuali = prenotazioneRepository.countPartecipantiByTemplateAndData(
                    templateId, dataCorrente);

            if (partecipantiAttuali >= template.getMaxPartecipanti()) {
                throw new RuntimeException("Posti esauriti per la data " + dataCorrente);
            }

            // Crea prenotazione
            PrenotazioneLezione prenotazione = new PrenotazioneLezione();
            prenotazione.setVendita(vendita);
            prenotazione.setUtente(utente);
            prenotazione.setTemplate(template);
            prenotazione.setDataLezione(dataCorrente);
            prenotazione.setOraInizio(template.getOraInizio());
            prenotazione.setOraFine(template.getOraFine());
            
            // Imposta tipo lezione
            if (tipoLezione != null) {
                prenotazione.setTipoLezione(tipoLezione);
            } else {
                prenotazione.setTipoLezione(template.getTipoLezione().name());
            }
            
            prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
            prenotazione.setGruppoPrenotazioneId(gruppoId);

            prenotazioni.add(prenotazione);

            // Passa alla settimana successiva
            dataCorrente = dataCorrente.plusWeeks(1);
        }

        // Salva tutte le prenotazioni
        prenotazioni = prenotazioneRepository.saveAll(prenotazioni);

        // Aggiorna il contatore totale_lezioni_prenotate dell'utente
        utente.setTotaleLezioniPrenotate(utente.getTotaleLezioniPrenotate() + lezioniDaCreare);
        utenteRepository.save(utente);

        // Aggiorna la vendita
        vendita.setLezioniRimanenti(vendita.getLezioniRimanenti() - lezioniDaCreare);
        vendita.setDataPrimaPrenotazioneSeNecessario();
        venditaRepository.save(vendita);

        return prenotazioni;
    }

    /**
     * Calcola la prima data disponibile per un giorno della settimana
     */
    private LocalDate calcolaPrimaDataDisponibile(GiornoSettimana giornoSettimana) {
        LocalDate oggi = LocalDate.now();
        DayOfWeek targetDay = convertGiornoSettimana(giornoSettimana);
        LocalDate primaData = oggi;

        // Trova la prima occorrenza del giorno della settimana
        while (primaData.getDayOfWeek() != targetDay) {
            primaData = primaData.plusDays(1);
        }
        
        // Se la prima occorrenza è oggi, passa alla settimana successiva
        if (primaData.equals(oggi)) {
            primaData = primaData.plusWeeks(1);
        }

        return primaData;
    }

    /**
     * Converte GiornoSettimana enum a DayOfWeek
     */
    private DayOfWeek convertGiornoSettimana(GiornoSettimana giorno) {
        return switch (giorno) {
            case LUNEDI -> DayOfWeek.MONDAY;
            case MARTEDI -> DayOfWeek.TUESDAY;
            case MERCOLEDI -> DayOfWeek.WEDNESDAY;
            case GIOVEDI -> DayOfWeek.THURSDAY;
            case VENERDI -> DayOfWeek.FRIDAY;
            case SABATO -> DayOfWeek.SATURDAY;
            case DOMENICA -> DayOfWeek.SUNDAY;
        };
    }

    /**
     * Cancella una prenotazione e restituisce la lezione al pacchetto
     */
    @Transactional
    public void cancellaPrenotazione(Long prenotazioneId, String username) {
        PrenotazioneLezione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));

        // Verifica che l'utente sia il proprietario
        if (!prenotazione.getUtente().getUsername().equals(username)) {
            throw new RuntimeException("Non hai i permessi per cancellare questa prenotazione");
        }

        // Verifica vincolo 24 ore
        if (!prenotazione.puoEssereSpostata()) {
            throw new RuntimeException("Impossibile cancellare la prenotazione a meno di 24 ore dall'inizio");
        }

        // Cancella la prenotazione
        prenotazione.setStato(PrenotazioneLezione.StatoPrenotazione.CANCELLATA);
        prenotazioneRepository.save(prenotazione);

        // Decrementa il contatore totale_lezioni_prenotate dell'utente
        Utenti utente = prenotazione.getUtente();
        if (utente.getTotaleLezioniPrenotate() > 0) {
            utente.setTotaleLezioniPrenotate(utente.getTotaleLezioniPrenotate() - 1);
            utenteRepository.save(utente);
        }

        // Restituisci la lezione al pacchetto
        Vendita vendita = prenotazione.getVendita();
        vendita.incrementaLezioniRimanenti();
        venditaRepository.save(vendita);
    }

    /**
     * Ottiene le prenotazioni future dell'utente
     */
    public List<PrenotazioneLezione> getPrenotazioniFuture(String username) {
        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        // Recupera prenotazioni CONFERMATA e SPOSTAMENTO_RICHIESTO
        List<PrenotazioneLezione> confermate = prenotazioneRepository.findPrenotazioniFuture(
                utente, LocalDate.now(), PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
        
        List<PrenotazioneLezione> spostamentoRichiesto = prenotazioneRepository.findPrenotazioniFuture(
                utente, LocalDate.now(), PrenotazioneLezione.StatoPrenotazione.SPOSTAMENTO_RICHIESTO);
        
        // Unisci le due liste e ordina per data
        List<PrenotazioneLezione> tutte = new java.util.ArrayList<>(confermate);
        tutte.addAll(spostamentoRichiesto);
        tutte.sort((a, b) -> a.getDataLezione().compareTo(b.getDataLezione()));
        
        return tutte;
    }

    /**
     * Ottiene TUTTE le prenotazioni future (per admin)
     */
    public List<PrenotazioneLezione> getTuttePrenotazioniFuture() {
        return prenotazioneRepository.findByDataLezioneAfterAndStato(
                LocalDate.now(), PrenotazioneLezione.StatoPrenotazione.CONFERMATA);
    }

    /**
     * Ottiene le prenotazioni di un gruppo
     */
    public List<PrenotazioneLezione> getPrenotazioniGruppo(String gruppoId) {
        return prenotazioneRepository.findByGruppoPrenotazioneId(gruppoId);
    }

    /**
     * Verifica la disponibilità di posti per un template in una data
     */
    public boolean verificaDisponibilita(Long templateId, LocalDate data) {
        CalendarioSettimanale template = calendarioRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template non trovato"));

        Long partecipanti = prenotazioneRepository.countPartecipantiByTemplateAndData(templateId, data);
        return partecipanti < template.getMaxPartecipanti();
    }

    /**
     * Crea prenotazioni COMBO per multiple categorie
     * Transazione atomica: se fallisce una categoria, rollback completo
     * 
     * @param venditaId ID della vendita (pacchetto COMBO acquistato)
     * @param selezioni Lista di selezioni per categoria
     * @param username Username dell'utente
     * @return Lista aggregata di tutte le prenotazioni create
     */
    @Transactional
    public List<PrenotazioneLezione> creaPrenotazioniCombo(
            Long venditaId,
            List<com.example.demo.dto.PrenotazioneComboRequest.CategoriaSelection> selezioni,
            String username) {

        System.out.println("=== DEBUG creaPrenotazioniCombo ===");
        System.out.println("venditaId ricevuto: " + venditaId);
        System.out.println("username: " + username);
        System.out.println("numero selezioni: " + selezioni.size());

        // Verifica che la vendita esista
        Vendita vendita = venditaRepository.findById(venditaId)
                .orElseThrow(() -> new RuntimeException("Vendita non trovata"));

        Utenti utente = utenteRepository.findByUsername(username);
        if (utente == null) {
            throw new RuntimeException("Utente non trovato");
        }

        // Verifica che sia un pacchetto COMBO
        if (!"COMBO".equals(vendita.getPacchetto().getCategoria())) {
            throw new RuntimeException("Il pacchetto selezionato non è di tipo COMBO");
        }

        // Calcola totale lezioni richieste
        int totaleLezioniRichieste = selezioni.stream()
                .mapToInt(com.example.demo.dto.PrenotazioneComboRequest.CategoriaSelection::getNumeroLezioni)
                .sum();

        // Verifica che non superi le lezioni disponibili
        if (totaleLezioniRichieste > vendita.getLezioniRimanenti()) {
            throw new RuntimeException(String.format(
                    "Totale lezioni richieste (%d) supera quelle disponibili (%d)",
                    totaleLezioniRichieste,
                    vendita.getLezioniRimanenti()
            ));
        }

        List<PrenotazioneLezione> tuttePrenotazioni = new ArrayList<>();

        // Processa ogni selezione di categoria
        for (com.example.demo.dto.PrenotazioneComboRequest.CategoriaSelection selezione : selezioni) {
            CalendarioSettimanale template = calendarioRepository.findById(selezione.getTemplateId())
                    .orElseThrow(() -> new RuntimeException(
                            "Template non trovato per categoria " + selezione.getCategoria()
                    ));

            // Verifica che il template corrisponda alla categoria
            if (!selezione.getCategoria().equals(template.getTipoLezione().name())) {
                throw new RuntimeException(String.format(
                        "Il template selezionato non corrisponde alla categoria %s",
                        selezione.getCategoria()
                ));
            }

            // Crea prenotazioni per questa categoria
            List<PrenotazioneLezione> prenotazioniCategoria = creaPrenotazioniRicorrenti(
                    venditaId,
                    selezione.getTemplateId(),
                    username,
                    selezione.getCategoria(),
                    selezione.getNumeroLezioni()
            );

            tuttePrenotazioni.addAll(prenotazioniCategoria);
        }

        return tuttePrenotazioni;
    }
}
