package com.example.demo.service;

import com.example.demo.dto.AssegnazioneBulkImportItem;
import com.example.demo.dto.AssegnazioneBulkImportRequest;
import com.example.demo.dto.AssegnazioneBulkImportResponse;
import com.example.demo.entity.Assegnazione;
import com.example.demo.entity.Dipendente;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Piattaforma;
import com.example.demo.repository.AssegnazioneRepository;
import com.example.demo.repository.DipendenteRepository;
import com.example.demo.repository.CorsoRepository;
import com.example.demo.repository.PiattaformaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@Transactional
@Slf4j
public class AssegnazioneBulkImportService {

    @Autowired
    private AssegnazioneRepository assegnazioneRepository;

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Autowired
    private CorsoRepository corsoRepository;

    @Autowired
    private PiattaformaRepository piattaformaRepository;

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("d-M-yyyy")
    };

    /**
     * Importa una lista di assegnazioni in modalità batch
     */
    public AssegnazioneBulkImportResponse importAssegnazioni(AssegnazioneBulkImportRequest request) {
        List<AssegnazioneBulkImportItem> items = request.getAssegnazioni();
        AssegnazioneBulkImportRequest.BulkImportOptions options = request.getOptions();
        
        AssegnazioneBulkImportResponse response = new AssegnazioneBulkImportResponse();
        response.setTotalProcessed(items.size());
        response.setErrors(new ArrayList<>());
        response.setImportedItems(new ArrayList<>());

        int successCount = 0;
        int errorCount = 0;
        int updatedCount = 0;

        // Pre-carica dipendenti e corsi per ottimizzare le query
        Map<String, Dipendente> dipendentiMap = loadDipendentiMap();
        Map<String, Corso> corsiMap = loadCorsiMap();
        Map<String, Piattaforma> piattaformeMap = loadPiattaformeMap();


        for (int i = 0; i < items.size(); i++) {
            AssegnazioneBulkImportItem item = items.get(i);
            int rowNumber = i + 2; // +2 perché Excel parte da 1 e la prima riga è l'header

            try {
                // Valida l'item
                List<String> validationErrors = validateItem(item, dipendentiMap, corsiMap, piattaformeMap, options);
                
                if (!validationErrors.isEmpty()) {
                    errorCount++;
                    for (String error : validationErrors) {
                        response.getErrors().add(new AssegnazioneBulkImportResponse.BulkImportError(
                                rowNumber, error, null, null));
                    }
                    
                    if (!options.isSkipErrors()) {
                        break;
                    }
                    continue;
                }

                // Processa l'item
                boolean wasUpdated = processItem(item, dipendentiMap, corsiMap, piattaformeMap, options);
                
                if (wasUpdated) {
                    updatedCount++;
                } else {
                    successCount++;
                }
                
                response.getImportedItems().add(item);

            } catch (Exception e) {
                errorCount++;
                response.getErrors().add(new AssegnazioneBulkImportResponse.BulkImportError(
                        rowNumber, "Errore durante l'elaborazione: " + e.getMessage()));
                
                if (!options.isSkipErrors()) {
                    break;
                }
            }
        }

        response.setSuccessCount(successCount);
        response.setErrorCount(errorCount);
        response.setUpdatedCount(updatedCount);

        return response;
    }

    /**
     * Processa un singolo item di assegnazione
     */
    private boolean processItem(AssegnazioneBulkImportItem item, 
                               Map<String, Dipendente> dipendentiMap, 
                               Map<String, Corso> corsiMap,
                               Map<String, Piattaforma> piattaformeMap,
                               AssegnazioneBulkImportRequest.BulkImportOptions options) {
        
        // Trova dipendente e corso
        Dipendente dipendente = findDipendente(item.getNominativo(), dipendentiMap);
        Corso corso = findCorso(item.getCorso(), corsiMap);

        if (corso == null && options.isCreaCorsiMancanti()) {
            corso = createMissingCorso(item.getCorso(), item.getArgomento(), item.getModalita(), piattaformeMap);
            corsiMap.put(corso.getNome().toLowerCase(), corso);
        }

        // Controlla se esiste già un'assegnazione per questo dipendente e corso
        Optional<Assegnazione> existingAssegnazione = assegnazioneRepository
                .findByDipendenteIdAndCorsoId(dipendente.getId(), corso.getId());

        if (existingAssegnazione.isPresent()) {
            if (options.isUpdateExisting()) {
                // Aggiorna l'assegnazione esistente
                Assegnazione assegnazione = existingAssegnazione.get();
                updateAssegnazioneFromItem(assegnazione, item);
                assegnazioneRepository.save(assegnazione);
                return true; // Indica che è stato un aggiornamento
            } else {
                // Salta se non si vogliono aggiornare i duplicati
                return false;
            }
        }

        // Crea nuova assegnazione
        Assegnazione assegnazione = createAssegnazioneFromItem(item, dipendente, corso);
        assegnazioneRepository.save(assegnazione);
        return false;
    }

    private Map<String, Piattaforma> loadPiattaformeMap() {
        List<Piattaforma> piattaforme = piattaformaRepository.findAll();
        Map<String, Piattaforma> piattaformeMap = new HashMap<>();

        for (Piattaforma piattaforma : piattaforme) {
            if (piattaforma.getNome() != null && !piattaforma.getNome().trim().isEmpty()) {
                String key = piattaforma.getNome().trim().toLowerCase();
                piattaformeMap.put(key, piattaforma);
                log.debug("Caricata piattaforma: {} -> ID {}", key, piattaforma.getId());
            }
        }

        log.info("Caricate {} piattaforme nella mappa", piattaformeMap.size());
        return piattaformeMap;
    }

    /**
     * Valida un item di assegnazione
     */
    private List<String> validateItem(AssegnazioneBulkImportItem item, 
                                     Map<String, Dipendente> dipendentiMap, 
                                     Map<String, Corso> corsiMap,
                                     Map<String, Piattaforma> piattaformeMap,
                                     AssegnazioneBulkImportRequest.BulkImportOptions options) {
        List<String> errors = new ArrayList<>();

        // Debug logging per tracciare i dati ricevuti
        log.debug("Validating item: nominativo={}, corso={}, argomento={}", 
                 item.getNominativo(), item.getCorso(), item.getArgomento(), item.getModalita());

        // Valida nominativo
        if (item.getNominativo() == null || item.getNominativo().trim().isEmpty()) {
            errors.add("Il nominativo è obbligatorio");
        } else if (findDipendente(item.getNominativo(), dipendentiMap) == null) {
            errors.add("Dipendente non trovato: " + item.getNominativo());
        }

        // Valida corso
        if (item.getCorso() == null || item.getCorso().trim().isEmpty()) {
            errors.add("Il corso è obbligatorio");
        } else {
            Corso corso = findCorso(item.getCorso(), corsiMap);
            if (corso == null) {
                if (options.isCreaCorsiMancanti()) {
                    // 🔥 AGGIORNATO: Valida anche la piattaforma quando si crea il corso
                    String modalita = item.getModalita();
                    if (modalita != null && !modalita.trim().isEmpty()) {
                        Piattaforma piattaforma = findPiattaforma(modalita, piattaformeMap);
                        if (piattaforma == null) {
                            errors.add("Piattaforma non trovata per modalità '" + modalita + "'. " +
                                     "Verifica che la piattaforma esista nella tabella piattaforme.");
                        } else {
                            log.info("Piattaforma trovata per modalità '{}': {} (ID: {})", 
                                   modalita, piattaforma.getNome(), piattaforma.getId());
                        }
                    } else {
                        errors.add("Modalità/Piattaforma è obbligatoria quando si creano corsi automaticamente");
                    }

                    // Se non ci sono errori di piattaforma, prova a creare il corso
                    if (errors.isEmpty()) {
                        try {
                            log.info("Creating missing course '{}' with argomento '{}' and modalita '{}'", 
                                   item.getCorso(), item.getArgomento(), modalita);
                            corso = createMissingCorso(item.getCorso(), item.getArgomento(), modalita, piattaformeMap);
                            corsiMap.put(corso.getNome().toLowerCase(), corso);
                            log.info("Corso creato automaticamente durante l'importazione: {} su piattaforma {} (ID: {})", 
                                   corso.getNome(), corso.getPiattaforma().getNome(), corso.getPiattaforma().getId());
                        } catch (Exception e) {
                            errors.add("Errore nella creazione automatica del corso '" + item.getCorso() + "': " + e.getMessage());
                        }
                    }
                } else {
                    errors.add("Corso non trovato: " + item.getCorso());
                }
            }
        }

        // Valida date
        if (item.getDataInizio() != null && !item.getDataInizio().trim().isEmpty()) {
            try {
                parseDate(item.getDataInizio());
            } catch (DateTimeParseException e) {
                errors.add("Formato data inizio non valido: " + item.getDataInizio());
            }
        }

        if (item.getDataCompletamento() != null && !item.getDataCompletamento().trim().isEmpty()) {
            try {
                parseDate(item.getDataCompletamento());
            } catch (DateTimeParseException e) {
                errors.add("Formato data completamento non valido: " + item.getDataCompletamento());
            }
        }

        // Valida stato
        if (item.getStato() != null && !item.getStato().trim().isEmpty()) {
            try {
                parseStato(item.getStato().trim());
            } catch (IllegalArgumentException e) {
                errors.add("Stato non valido: " + item.getStato() + 
                          ". Valori consentiti: 'Da iniziare', 'In corso', 'Terminato', 'Interrotto' o 'DA_INIZIARE', 'IN_CORSO', 'TERMINATO', 'INTERROTTO'");
            }
        }

        // Valida impatto ISMS
        if (item.getImpattoIsms() != null && !item.getImpattoIsms().trim().isEmpty()) {
            String impatto = item.getImpattoIsms().trim().toLowerCase();
            if (!impatto.equals("sì") && !impatto.equals("si") && !impatto.equals("no") && 
                !impatto.equals("true") && !impatto.equals("false")) {
                errors.add("Impatto ISMS deve essere 'Sì', 'Si', 'No', 'true' o 'false': " + item.getImpattoIsms());
            }
        }

        return errors;
    }

    /**
     * Crea una nuova assegnazione da un item
     */
    private Assegnazione createAssegnazioneFromItem(AssegnazioneBulkImportItem item, 
                                                   Dipendente dipendente, 
                                                   Corso corso) {
        Assegnazione assegnazione = new Assegnazione();
        assegnazione.setDipendente(dipendente);
        assegnazione.setCorso(corso);
        
        updateAssegnazioneFromItem(assegnazione, item);
        
        return assegnazione;
    }

    /**
     * Aggiorna un'assegnazione esistente da un item
     */
    private void updateAssegnazioneFromItem(Assegnazione assegnazione, AssegnazioneBulkImportItem item) {
        // Data inizio
        if (item.getDataInizio() != null && !item.getDataInizio().trim().isEmpty()) {
            assegnazione.setDataInizio(parseDate(item.getDataInizio()));
        }

        // Data completamento
        if (item.getDataCompletamento() != null && !item.getDataCompletamento().trim().isEmpty()) {
            assegnazione.setDataCompletamento(parseDate(item.getDataCompletamento()));
        }

        // Stato
        if (item.getStato() != null && !item.getStato().trim().isEmpty()) {
            try {
                Assegnazione.StatoAssegnazione statoEnum = parseStato(item.getStato().trim());
                assegnazione.setStato(statoEnum);
            } catch (IllegalArgumentException e) {
                // Log warning and set default value
                System.err.println("Stato non valido: " + item.getStato() + ", usando valore predefinito DA_INIZIARE");
                assegnazione.setStato(Assegnazione.StatoAssegnazione.DA_INIZIARE);
            }
        }

        // Esito
        if (item.getEsito() != null && !item.getEsito().trim().isEmpty()) {
            assegnazione.setEsito(item.getEsito().trim());
        }

        // Fonte richiesta
        if (item.getFonteRichiesta() != null && !item.getFonteRichiesta().trim().isEmpty()) {
            assegnazione.setFonteRichiesta(item.getFonteRichiesta().trim());
        }

        // Impatto ISMS
        if (item.getImpattoIsms() != null && !item.getImpattoIsms().trim().isEmpty()) {
            assegnazione.setImpattoIsms(parseBoolean(item.getImpattoIsms()));
        }
    }

    /**
     * Trova un dipendente per nome e cognome
     */
    private Dipendente findDipendente(String nominativo, Map<String, Dipendente> dipendentiMap) {
        if (nominativo == null || nominativo.trim().isEmpty()) {
            return null;
        }

        String key = nominativo.trim().toLowerCase();
        return dipendentiMap.get(key);
    }

    /**
     * Trova un corso per nome
     */
    private Corso findCorso(String nome, Map<String, Corso> corsiMap) {
        if (nome == null || nome.trim().isEmpty()) {
            return null;
        }

        String key = nome.trim().toLowerCase();
        return corsiMap.get(key);
    }

    /**
     * Carica tutti i dipendenti in una mappa per ottimizzare le ricerche
     */
    private Map<String, Dipendente> loadDipendentiMap() {
        List<Dipendente> dipendenti = dipendenteRepository.findAll();
        Map<String, Dipendente> dipendentiMap = new HashMap<>();

        for (Dipendente dipendente : dipendenti) {
            String nome = dipendente.getNome() != null ? dipendente.getNome().trim() : "";
            String cognome = dipendente.getCognome() != null ? dipendente.getCognome().trim() : "";
            
            if (!nome.isEmpty() && !cognome.isEmpty()) {
                String nomeCompleto = (nome + " " + cognome).toLowerCase();
                dipendentiMap.put(nomeCompleto, dipendente);
                
                // Aggiungi anche la variante cognome + nome
                String cognomeNome = (cognome + " " + nome).toLowerCase();
                dipendentiMap.put(cognomeNome, dipendente);
            }
        }

        return dipendentiMap;
    }

    /**
     * Carica tutti i corsi in una mappa per ottimizzare le ricerche
     */
    private Map<String, Corso> loadCorsiMap() {
        List<Corso> corsi = corsoRepository.findAll();
        Map<String, Corso> corsiMap = new HashMap<>();

        for (Corso corso : corsi) {
            if (corso.getNome() != null && !corso.getNome().trim().isEmpty()) {
                String key = corso.getNome().trim().toLowerCase();
                corsiMap.put(key, corso);
            }
        }

        return corsiMap;
    }

    /**
     * Parsing flessibile delle date
     */
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }

        String cleanDate = dateString.trim();
        
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(cleanDate, formatter);
            } catch (DateTimeParseException e) {
                // Continua con il prossimo formatter
            }
        }
        
        throw new DateTimeParseException("Formato data non riconosciuto: " + dateString, dateString, 0);
    }

    /**
     * Parsing dei valori booleani
     */
    private Boolean parseBoolean(String booleanString) {
        if (booleanString == null || booleanString.trim().isEmpty()) {
            return null;
        }

        String value = booleanString.trim().toLowerCase();
        return value.equals("sì") || value.equals("si") || value.equals("true");
    }

    /**
     * Parsing dello stato dell'assegnazione
     */
    private Assegnazione.StatoAssegnazione parseStato(String statoString) {
        if (statoString == null || statoString.trim().isEmpty()) {
            return null;
        }

        String stato = statoString.trim().toLowerCase();
        
        // Mappa i valori user-friendly ai valori enum
        switch (stato) {
            case "da iniziare":
            case "da_iniziare":
                return Assegnazione.StatoAssegnazione.DA_INIZIARE;
            case "in corso":
            case "in_corso":
                return Assegnazione.StatoAssegnazione.IN_CORSO;
            case "terminato":
            case "completato":
            case "finito":
                return Assegnazione.StatoAssegnazione.TERMINATO;
            case "interrotto":
            case "sospeso":
            case "annullato":
                return Assegnazione.StatoAssegnazione.INTERROTTO;
            default:
                // Try direct enum parsing as fallback
                try {
                    return Assegnazione.StatoAssegnazione.valueOf(statoString.trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Stato non riconosciuto: " + statoString);
                }
        }
    }

    /**
     * Crea un nuovo corso con i dati minimi necessari
     */
    private Corso createMissingCorso(String nomeCorso, String argomento, String modalita, 
                                     Map<String, Piattaforma> piattaformeMap) {
        log.info("Creazione automatica del corso: {} con argomento: {}", nomeCorso, argomento, modalita);
        

        // Trova la piattaforma dalla modalità
        Piattaforma piattaforma = null;
        if (modalita != null && !modalita.trim().isEmpty()) {
            piattaforma = findPiattaforma(modalita, piattaformeMap);
        }
        
        // Se non trova la piattaforma dalla modalità, usa quella di default
        if (piattaforma == null) {
            log.warn("Piattaforma non trovata per modalità '{}', uso piattaforma di default", modalita);
            piattaforma = piattaformaRepository.findByAttivaTrue()
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Nessuna piattaforma attiva disponibile per creare il corso"));
        }

        // Crea il nuovo corso con valori di default
        Corso corso = new Corso();
        corso.setNome(nomeCorso.trim());
        corso.setPiattaforma(piattaforma);
        corso.setStato(Corso.StatoCorso.PIANIFICATO);
        
        // Usa l'argomento se fornito, altrimenti un valore di default
        if (argomento != null && !argomento.trim().isEmpty()) {
            corso.setArgomento(argomento.trim());
        } else {
            corso.setArgomento("Corso creato automaticamente durante importazione");
        }
        
        corso.setCategoria("Generale");
        corso.setDurata(java.math.BigDecimal.ZERO); // Durata 0, da aggiornare manualmente
        corso.setCertificazioneRilasciata(false);
        corso.setFeedbackRichiesto(false);
        
        // Salva il corso
        corso = corsoRepository.save(corso);
        
        log.info("Corso creato con successo: {} (ID: {}, Piattaforma: {}, Argomento: {})", 
                corso.getNome(), corso.getId(), piattaforma.getNome(), corso.getArgomento());
        
        return corso;
    }

    private Piattaforma findPiattaforma(String modalita, Map<String, Piattaforma> piattaformeMap) {
        if (modalita == null || modalita.trim().isEmpty()) {
            return null;
        }

        String key = modalita.trim().toLowerCase();
        Piattaforma piattaforma = piattaformeMap.get(key);
        
        if (piattaforma != null) {
            log.debug("Piattaforma trovata per modalità '{}': {} (ID: {})", 
                     modalita, piattaforma.getNome(), piattaforma.getId());
        } else {
            log.warn("Piattaforma NON trovata per modalità '{}'. Piattaforme disponibili: {}", 
                    modalita, piattaformeMap.keySet());
        }
        
        return piattaforma;
    }
}
