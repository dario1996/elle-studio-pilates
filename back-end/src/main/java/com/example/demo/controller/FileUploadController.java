package com.example.demo.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.service.FileUploadService;

/**
 * Controller per la gestione dell'upload di certificati medici
 * Accetta solo file PDF e li salva come BLOB nel database
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload del certificato medico (solo PDF)
     */
    @PostMapping("/certificato-medico")
    public ResponseEntity<InfoMsg> uploadCertificatoMedico(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        
        try {
            // Validazione preliminare
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new InfoMsg(LocalDate.now(), "File non valido o vuoto"));
            }

            // Validazione formato PDF
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            
            if (!"application/pdf".equals(contentType) || 
                originalFilename == null || 
                !originalFilename.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest()
                    .body(new InfoMsg(LocalDate.now(), "Sono accettati solo file in formato PDF"));
            }

            // Salva il certificato come BLOB
            String fileName = fileUploadService.saveCertificatoMedico(file, userId);
            
            return ResponseEntity.ok(
                new InfoMsg(LocalDate.now(), "Certificato medico caricato con successo: " + fileName));
                
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new InfoMsg(LocalDate.now(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new InfoMsg(LocalDate.now(), "Errore durante il caricamento del certificato: " + e.getMessage()));
        }
    }

    /**
     * Download del certificato medico
     */
    @GetMapping("/certificato-medico/{userId}")
    public ResponseEntity<byte[]> downloadCertificatoMedico(@PathVariable Long userId) {
        try {
            return fileUploadService.getCertificatoMedico(userId);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Elimina il certificato medico
     */
    @DeleteMapping("/certificato-medico/{userId}")
    public ResponseEntity<InfoMsg> deleteCertificatoMedico(@PathVariable Long userId) {
        try {
            boolean deleted = fileUploadService.deleteCertificatoMedico(userId);
            
            if (deleted) {
                return ResponseEntity.ok(
                    new InfoMsg(LocalDate.now(), "Certificato medico eliminato con successo"));
            } else {
                return ResponseEntity.notFound()
                    .build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new InfoMsg(LocalDate.now(), "Errore durante l'eliminazione del certificato: " + e.getMessage()));
        }
    }
    
    /**
     * Verifica se l'utente ha un certificato medico
     */
    @GetMapping("/certificato-medico/{userId}/exists")
    public ResponseEntity<Boolean> checkCertificatoExists(@PathVariable Long userId) {
        try {
            boolean exists = fileUploadService.hasCertificato(userId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
