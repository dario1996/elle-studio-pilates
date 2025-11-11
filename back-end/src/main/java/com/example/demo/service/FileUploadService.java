package com.example.demo.service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.entity.Utenti;
import com.example.demo.repository.UtenteRepository;

/**
 * Service per la gestione dell'upload e download di certificati medici
 * Salva i file come BLOB nel database
 */
@Service
public class FileUploadService {

    @Autowired
    private UtenteRepository utenteRepository;

    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    /**
     * Salva il certificato medico dell'utente come BLOB nel database
     * Accetta solo file PDF
     */
    public String saveCertificatoMedico(MultipartFile file, Long userId) throws IOException {
        
        // Validazione: file non vuoto
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Il file è vuoto");
        }

        // Validazione: dimensione massima
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Il file supera la dimensione massima di 10 MB");
        }

        // Validazione: solo PDF
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        
        if (!PDF_CONTENT_TYPE.equals(contentType) || 
            originalFilename == null || 
            !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Sono accettati solo file PDF");
        }

        // Recupera l'utente
        Utenti utente = utenteRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + userId));

        // Salva il file come BLOB
        utente.setCertificatoMedicoFile(file.getBytes());
        utente.setCertificatoMedicoNome(originalFilename);
        utente.setCertificatoMedicoDataUpload(LocalDateTime.now());
        
        utenteRepository.save(utente);

        return originalFilename;
    }

    /**
     * Recupera il certificato medico dell'utente dal database
     */
    public ResponseEntity<byte[]> getCertificatoMedico(Long userId) {
        
        Utenti utente = utenteRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + userId));

        if (utente.getCertificatoMedicoFile() == null || utente.getCertificatoMedicoFile().length == 0) {
            throw new RuntimeException("Certificato medico non trovato per l'utente");
        }

        String fileName = utente.getCertificatoMedicoNome() != null ? 
                         utente.getCertificatoMedicoNome() : 
                         "certificato_" + userId + ".pdf";
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(utente.getCertificatoMedicoFile());
    }

    /**
     * Elimina il certificato medico dell'utente dal database
     */
    public boolean deleteCertificatoMedico(Long userId) {
        try {
            Utenti utente = utenteRepository.findById(userId).orElse(null);
            
            if (utente != null && utente.getCertificatoMedicoFile() != null) {
                utente.setCertificatoMedicoFile(null);
                utente.setCertificatoMedicoNome(null);
                utente.setCertificatoMedicoDataUpload(null);
                utenteRepository.save(utente);
                return true;
            }
            
            return false;
                
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Verifica se l'utente ha un certificato medico
     */
    public boolean hasCertificato(Long userId) {
        return utenteRepository.findById(userId)
            .map(utente -> utente.getCertificatoMedicoFile() != null && 
                          utente.getCertificatoMedicoFile().length > 0)
            .orElse(false);
    }
}
