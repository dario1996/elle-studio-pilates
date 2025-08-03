package com.example.demo.service;

import com.example.demo.dto.DipendenteBulkImportItem;
import com.example.demo.dto.DipendenteBulkImportRequest;
import com.example.demo.dto.DipendenteBulkImportResponse;
import com.example.demo.entity.Dipendente;
import com.example.demo.repository.DipendenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class DipendenteBulkImportService {

    private static final Logger logger = LoggerFactory.getLogger(DipendenteBulkImportService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd")
    };

    private static final DateTimeFormatter[] DATETIME_FORMATTERS = {
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")
    };

    @Autowired
    private DipendenteRepository dipendenteRepository;

    @Transactional
    public DipendenteBulkImportResponse bulkImport(DipendenteBulkImportRequest request) {
        long startTime = System.currentTimeMillis();
        
        DipendenteBulkImportResponse response = new DipendenteBulkImportResponse();
        response.setTotalProcessed(request.getDipendenti().size());

        logger.info("Avvio importazione massiva di {} dipendenti", request.getDipendenti().size());

        for (int i = 0; i < request.getDipendenti().size(); i++) {
            DipendenteBulkImportItem item = request.getDipendenti().get(i);
            
            try {
                processItem(item, i, request.getOptions(), response);
            } catch (Exception e) {
                logger.error("Errore durante l'elaborazione della riga {}: {}", i, e.getMessage(), e);
                response.addError(i, "general", "Errore durante l'elaborazione: " + e.getMessage(), item.getNominativo());
                
                if (!request.getOptions().isSkipErrors()) {
                    break;
                }
            }
        }

        response.setExecutionTimeMs(System.currentTimeMillis() - startTime);
        
        logger.info("Importazione completata. Successi: {}, Errori: {}, Aggiornamenti: {}, Tempo: {}ms",
                response.getSuccessCount(), response.getErrorCount(), response.getUpdatedCount(), response.getExecutionTimeMs());

        return response;
    }

    private void processItem(DipendenteBulkImportItem item, int rowIndex, 
                           DipendenteBulkImportRequest.BulkImportOptions options, 
                           DipendenteBulkImportResponse response) {
        
        // Validazione dati
        if (!validateItem(item, rowIndex, response)) {
            return;
        }

        // Estrazione nome e cognome dal nominativo
        String[] nameParts = extractNameAndSurname(item.getNominativo());
        if (nameParts == null) {
            response.addError(rowIndex, "nominativo", "Formato nominativo non valido. Deve contenere nome e cognome separati da spazio", item.getNominativo());
            return;
        }

        String nome = nameParts[0];
        String cognome = nameParts[1];

        // Controllo duplicati per nome e cognome
        List<Dipendente> existingByName = dipendenteRepository.findByNomeAndCognomeIgnoreCase(nome, cognome);
        if (!existingByName.isEmpty()) {
            if (options.isUpdateExisting()) {
                // Se ci sono più dipendenti con lo stesso nome, prendi il primo
                Dipendente existingDipendente = existingByName.get(0);
                updateExistingDipendente(existingDipendente, item, rowIndex, options, response);
                
                // Log se ci sono più dipendenti con lo stesso nome
                if (existingByName.size() > 1) {
                    logger.warn("Trovati {} dipendenti con nome '{}' e cognome '{}'. Aggiornato il primo (ID: {})", 
                              existingByName.size(), nome, cognome, existingDipendente.getId());
                }
            } else {
                response.addError(rowIndex, "nominativo", "Dipendente già esistente con nome e cognome identici", item.getNominativo());
            }
            return;
        }

        // Generazione email automatica se non presente
        String email = generateEmail(nome, cognome);

        // Controllo duplicati per email (come ulteriore sicurezza)
        Optional<Dipendente> existingByEmail = dipendenteRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            if (options.isUpdateExisting()) {
                updateExistingDipendente(existingByEmail.get(), item, rowIndex, options, response);
            } else {
                response.addError(rowIndex, "email", "Email già esistente", email);
            }
            return;
        }

        // Creazione nuovo dipendente
        try {
            Dipendente dipendente = createDipendenteFromItem(item, nome, cognome, email, options);
            Dipendente savedDipendente = dipendenteRepository.save(dipendente);
            response.addImportedId(savedDipendente.getId());
            
            logger.debug("Dipendente creato con successo: {} (ID: {})", dipendente.getNomeCompleto(), savedDipendente.getId());
        } catch (Exception e) {
            logger.error("Errore durante la creazione del dipendente {}: {}", item.getNominativo(), e.getMessage());
            response.addError(rowIndex, "general", "Errore durante la creazione: " + e.getMessage(), item.getNominativo());
        }
    }

    private boolean validateItem(DipendenteBulkImportItem item, int rowIndex, DipendenteBulkImportResponse response) {
        boolean valid = true;

        // Validazione nominativo
        if (item.getNominativo() == null || item.getNominativo().trim().isEmpty()) {
            response.addError(rowIndex, "nominativo", "Nominativo obbligatorio", "");
            valid = false;
        }

        // Validazione ruolo
        if (item.getRuolo() == null || item.getRuolo().trim().isEmpty()) {
            response.addError(rowIndex, "ruolo", "Ruolo obbligatorio", "");
            valid = false;
        }

        // Validazione azienda
        if (item.getAzienda() == null || item.getAzienda().trim().isEmpty()) {
            response.addError(rowIndex, "azienda", "Azienda obbligatoria", "");
            valid = false;
        }

        // Validazione ISMS
        if (item.getIsms() != null && !item.getIsms().trim().isEmpty()) {
            if (!item.getIsms().equals("SI") && !item.getIsms().equals("NO")) {
                response.addError(rowIndex, "isms", "ISMS deve essere 'SI' o 'NO'", item.getIsms());
                valid = false;
            }
        }

        // Validazione data cessazione
        if (item.getDataCessazione() != null && !item.getDataCessazione().trim().isEmpty()) {
            if (parseDate(item.getDataCessazione()) == null) {
                response.addError(rowIndex, "dataCessazione", "Formato data non valido", item.getDataCessazione());
                valid = false;
            }
        }   

        return valid;
    }

    private String[] extractNameAndSurname(String nominativo) {
        if (nominativo == null || nominativo.trim().isEmpty()) {
            return null;
        }

        String[] parts = nominativo.trim().split("\\s+");
        if (parts.length < 2) {
            return null;
        }

        // Nome è la prima parte, cognome è tutto il resto
        String nome = parts[0];
        String cognome = String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));

        return new String[]{nome, cognome};
    }

    private String generateEmail(String nome, String cognome) {
        // Genera email nel formato nome.cognome@azienda.com
        String baseEmail = nome.toLowerCase() + "." + cognome.toLowerCase().replace(" ", "");
        // Rimuovi caratteri speciali
        baseEmail = baseEmail.replaceAll("[^a-z0-9.]", "");
        
        // Dominio di default (può essere configurato)
        String domain = "proxima.it";
        
        String email = baseEmail + "@" + domain;
        
        // Se l'email esiste già, aggiungi un numero
        int counter = 1;
        String originalEmail = email;
        while (dipendenteRepository.findByEmail(email).isPresent()) {
            email = originalEmail.replace("@", counter + "@");
            counter++;
        }
        
        return email;
    }

    private void updateExistingDipendente(Dipendente existing, DipendenteBulkImportItem item, 
                                        int rowIndex, DipendenteBulkImportRequest.BulkImportOptions options, 
                                        DipendenteBulkImportResponse response) {
        
        try {
            // Aggiorna solo i campi non nulli
            if (item.getRuolo() != null && !item.getRuolo().trim().isEmpty()) {
                existing.setRuolo(item.getRuolo().trim());
            }
            if (item.getAzienda() != null && !item.getAzienda().trim().isEmpty()) {
                existing.setAzienda(item.getAzienda().trim());
            }
            if (item.getSede() != null && !item.getSede().trim().isEmpty()) {
                existing.setSede(item.getSede().trim());
            }
            if (item.getCommunity() != null && !item.getCommunity().trim().isEmpty()) {
                existing.setCommunity(item.getCommunity().trim());
            }
            if (item.getResponsabile() != null && !item.getResponsabile().trim().isEmpty()) {
                existing.setResponsabile(item.getResponsabile().trim());
            }
            if (item.getIsms() != null && !item.getIsms().trim().isEmpty()) {
                existing.setIsms(item.getIsms().trim());
            }
            if (item.getDataCessazione() != null && !item.getDataCessazione().trim().isEmpty()) {
                LocalDateTime dataCessazione = parseDate(item.getDataCessazione());
                if (dataCessazione != null) {
                    existing.setDataCessazione(dataCessazione);
                    // Aggiorna lo status basato sulla data di cessazione
                    boolean isActive = isEmployeeActive(dataCessazione);
                    existing.setAttivo(isActive);
                    logger.info("DIPENDENTE AGGIORNATO - Nome: {}, Data Cessazione: {}, Status Attivo: {} (boolean: {})", 
                               item.getNominativo(), dataCessazione, isActive ? "SI" : "NO", isActive);
                } else {
                    logger.warn("Impossibile parsare la data cessazione '{}' per dipendente esistente: {}", 
                               item.getDataCessazione(), item.getNominativo());
                }
            } else {
                // Se la data di cessazione viene rimossa, il dipendente dovrebbe essere attivo
                existing.setDataCessazione(null);
                existing.setAttivo(true);
                logger.debug("Data cessazione rimossa per dipendente esistente {}, impostato come attivo", item.getNominativo());
            }

            Dipendente updatedDipendente = dipendenteRepository.save(existing);
            response.addUpdatedId(updatedDipendente.getId());
            
            logger.debug("Dipendente aggiornato con successo: {} (ID: {})", existing.getNomeCompleto(), existing.getId());
        } catch (Exception e) {
            logger.error("Errore durante l'aggiornamento del dipendente {}: {}", item.getNominativo(), e.getMessage());
            response.addError(rowIndex, "general", "Errore durante l'aggiornamento: " + e.getMessage(), item.getNominativo());
        }
    }

    private Dipendente createDipendenteFromItem(DipendenteBulkImportItem item, String nome, String cognome, 
                                              String email, DipendenteBulkImportRequest.BulkImportOptions options) {
        
        Dipendente dipendente = new Dipendente();
        dipendente.setNome(nome);
        dipendente.setCognome(cognome);
        dipendente.setEmail(email);
        dipendente.setRuolo(item.getRuolo().trim());
        dipendente.setAzienda(item.getAzienda().trim());
        
        // Campi opzionali
        if (item.getSede() != null && !item.getSede().trim().isEmpty()) {
            dipendente.setSede(item.getSede().trim());
        }
        if (item.getCommunity() != null && !item.getCommunity().trim().isEmpty()) {
            dipendente.setCommunity(item.getCommunity().trim());
        }
        if (item.getResponsabile() != null && !item.getResponsabile().trim().isEmpty()) {
            dipendente.setResponsabile(item.getResponsabile().trim());
        }
        if (item.getIsms() != null && !item.getIsms().trim().isEmpty()) {
            dipendente.setIsms(item.getIsms().trim());
        }
        
        // Data cessazione
        LocalDateTime dataCessazione = null;
        if (item.getDataCessazione() != null && !item.getDataCessazione().trim().isEmpty()) {
            dataCessazione = parseDate(item.getDataCessazione());
            if (dataCessazione != null) {
                dipendente.setDataCessazione(dataCessazione);
                logger.debug("Data cessazione parsata con successo: {} per dipendente: {}", dataCessazione, item.getNominativo());
            } else {
                logger.warn("Impossibile parsare la data cessazione '{}' per dipendente: {}", item.getDataCessazione(), item.getNominativo());
            }
        }

        // Campi con valori di default
        dipendente.setReparto(options.getDefaultReparto());
        dipendente.setCommerciale(options.getDefaultCommerciale());
        
        // Genera codice dipendente automatico
        dipendente.setCodiceDipendente(generateCodiceDipendente(nome, cognome));
        
        // Determina lo status basato sulla data di cessazione
        boolean isActive = isEmployeeActive(dataCessazione);
        dipendente.setAttivo(isActive);
        logger.info("DIPENDENTE CREATO - Nome: {}, Data Cessazione: {}, Status Attivo: {} (boolean: {})", 
                   item.getNominativo(), dataCessazione, isActive ? "SI" : "NO", isActive);
        dipendente.setDataAssunzione(LocalDateTime.now());
        
        return dipendente;
    }

    private String generateCodiceDipendente(String nome, String cognome) {
        // Genera codice nel formato: prime due lettere nome + prime due lettere cognome + numero casuale
        String base = (nome.substring(0, Math.min(2, nome.length())) + 
                      cognome.substring(0, Math.min(2, cognome.length()))).toUpperCase();
        
        String codice = base + String.format("%04d", (int)(Math.random() * 9999) + 1);
        
        // Assicurati che il codice sia unico
        int counter = 1;
        String originalCodice = codice;
        while (dipendenteRepository.findByCodiceDipendente(codice).isPresent()) {
            codice = originalCodice + String.format("%02d", counter);
            counter++;
        }
        
        return codice;
    }

    /**
     * Determina se un dipendente è attivo basandosi sulla data di cessazione.
     * Un dipendente è considerato non attivo se ha una data di cessazione che è oggi o nel passato.
     */
    private boolean isEmployeeActive(LocalDateTime dataCessazione) {
        if (dataCessazione == null) {
            return true; // Nessuna data di cessazione = attivo
        }
        
        LocalDateTime now = LocalDateTime.now();
        boolean isActive = dataCessazione.isAfter(now);
        
        // Log per debug con INFO level per essere sicuri che venga visualizzato
        logger.info("CONTROLLO ATTIVAZIONE - Data cessazione: {}, Data attuale: {}, Risultato isAfter: {}, Dipendente ATTIVO: {}", 
                   dataCessazione, now, dataCessazione.isAfter(now), isActive);
        
        // Il dipendente è non attivo se la data di cessazione è nel passato
        // Un dipendente è attivo solo se la data di cessazione è nel futuro
        return isActive;
    }

    private LocalDateTime parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }

        String cleanDateString = dateString.trim();
        logger.debug("Tentativo di parsing della data: '{}'", cleanDateString);
        
        // First try to parse as Excel serial number
        try {
            double excelSerialDate = Double.parseDouble(cleanDateString);
            if (excelSerialDate > 0) {
                // Excel serial date starts from 1900-01-01, but Excel incorrectly treats 1900 as a leap year
                // So we need to subtract 1 day for dates after 1900-02-28
                LocalDate excelEpoch = LocalDate.of(1900, 1, 1);
                long daysSinceEpoch = (long) excelSerialDate - 1; // Excel uses 1-based indexing
                
                // Account for Excel's leap year bug
                if (daysSinceEpoch >= 60) { // After 1900-02-28
                    daysSinceEpoch -= 1;
                }
                
                LocalDate parsedDate = excelEpoch.plusDays(daysSinceEpoch);
                LocalDateTime result = parsedDate.atStartOfDay();
                logger.debug("Data parsata come Excel serial number: {}", result);
                return result;
            }
        } catch (NumberFormatException e) {
            // Not a number, continue with other parsing methods
        }
        
        // Try to parse as LocalDateTime with time
        for (DateTimeFormatter formatter : DATETIME_FORMATTERS) {
            try {
                LocalDateTime result = LocalDateTime.parse(cleanDateString, formatter);
                logger.debug("Data parsata con successo usando formatter '{}': {}", formatter.toString(), result);
                return result;
            } catch (DateTimeParseException e) {
                // Try the next formatter
            }
        }
        
        // If that fails, try to parse as LocalDate and convert to LocalDateTime
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                LocalDate localDate = LocalDate.parse(cleanDateString, formatter);
                LocalDateTime result = localDate.atStartOfDay();
                logger.debug("Data parsata come LocalDate e convertita: {}", result);
                return result;
            } catch (DateTimeParseException e) {
                // Try the next formatter
            }
        }

        // If all formatters fail, log the error
        logger.warn("Unable to parse date string: {}", cleanDateString);
        return null;
    }

    /**
     * Checks for duplicates in the provided list of dipendenti without importing them
     * Returns information about which dipendenti are duplicates and whether they can be updated
     */
    public List<java.util.Map<String, Object>> checkDuplicates(List<Object> dipendenti) {
        List<java.util.Map<String, Object>> duplicateInfo = new java.util.ArrayList<>();
        
        for (int i = 0; i < dipendenti.size(); i++) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> item = (java.util.Map<String, Object>) dipendenti.get(i);
            
            String nominativo = (String) item.get("nominativo");
            if (nominativo == null || nominativo.trim().isEmpty()) {
                continue;
            }
            
            // Extract name and surname
            String[] nameParts = extractNameAndSurname(nominativo);
            if (nameParts == null) {
                continue;
            }
            
            String nome = nameParts[0];
            String cognome = nameParts[1];
            
            // Check for duplicates by name and surname
            List<Dipendente> existingByName = dipendenteRepository.findByNomeAndCognomeIgnoreCase(nome, cognome);
            
            java.util.Map<String, Object> duplicateCheck = new java.util.HashMap<>();
            duplicateCheck.put("index", i);
            duplicateCheck.put("nominativo", nominativo);
            duplicateCheck.put("isDuplicate", !existingByName.isEmpty());
            
            if (!existingByName.isEmpty()) {
                // Check if this duplicate can be updated (has different data)
                Dipendente existing = existingByName.get(0);
                boolean canUpdate = canUpdateDipendente(existing, item);
                
                duplicateCheck.put("canUpdate", canUpdate);
                duplicateCheck.put("existingId", existing.getId());
                duplicateCheck.put("existingData", java.util.Map.of(
                    "nome", existing.getNome(),
                    "cognome", existing.getCognome(),
                    "email", existing.getEmail(),
                    "ruolo", existing.getRuolo() != null ? existing.getRuolo() : "",
                    "azienda", existing.getAzienda() != null ? existing.getAzienda() : "",
                    "sede", existing.getSede() != null ? existing.getSede() : "",
                    "community", existing.getCommunity() != null ? existing.getCommunity() : "",
                    "isms", existing.getIsms() != null ? existing.getIsms() : "",
                    "responsabile", existing.getResponsabile() != null ? existing.getResponsabile() : ""
                ));
            } else {
                duplicateCheck.put("canUpdate", false);
            }
            
            duplicateInfo.add(duplicateCheck);
        }
        
        return duplicateInfo;
    }
    
    /**
     * Checks if a dipendente can be updated with new data
     */
    private boolean canUpdateDipendente(Dipendente existing, java.util.Map<String, Object> newData) {
        // Check if any field is different and can be updated
        String newRuolo = (String) newData.get("ruolo");
        String newAzienda = (String) newData.get("azienda");
        String newSede = (String) newData.get("sede");
        String newCommunity = (String) newData.get("community");
        String newIsms = (String) newData.get("isms");
        String newResponsabile = (String) newData.get("responsabile");
        String newDataCessazione = (String) newData.get("dataCessazione");
        
        // Check if any field has different value
        if (newRuolo != null && !newRuolo.trim().isEmpty() && 
            !newRuolo.trim().equals(existing.getRuolo())) {
            return true;
        }
        
        if (newAzienda != null && !newAzienda.trim().isEmpty() && 
            !newAzienda.trim().equals(existing.getAzienda())) {
            return true;
        }
        
        if (newSede != null && !newSede.trim().isEmpty() && 
            !newSede.trim().equals(existing.getSede() != null ? existing.getSede() : "")) {
            return true;
        }
        
        if (newCommunity != null && !newCommunity.trim().isEmpty() && 
            !newCommunity.trim().equals(existing.getCommunity() != null ? existing.getCommunity() : "")) {
            return true;
        }
        
        if (newIsms != null && !newIsms.trim().isEmpty() && 
            !newIsms.trim().equals(existing.getIsms() != null ? existing.getIsms() : "")) {
            return true;
        }
        
        if (newResponsabile != null && !newResponsabile.trim().isEmpty() && 
            !newResponsabile.trim().equals(existing.getResponsabile() != null ? existing.getResponsabile() : "")) {
            return true;
        }
        
        if (newDataCessazione != null && !newDataCessazione.trim().isEmpty()) {
            LocalDateTime newDate = parseDate(newDataCessazione);
            if (newDate != null && !newDate.equals(existing.getDataCessazione())) {
                return true;
            }
        }
        
        return false;
    }
}
