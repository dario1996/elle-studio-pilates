package com.example.demo.controller;

import com.example.demo.controller.InfoMsg;
import com.example.ellepilates.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller per la gestione dell'upload di file
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload del certificato medico
     */
    @PostMapping("/certificato-medico")
    public ResponseEntity<InfoMsg> uploadCertificatoMedico(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new InfoMsg("File non valido", "Errore"));
            }

            String fileName = fileUploadService.saveCertificatoMedico(file, userId);
            
            return ResponseEntity.ok(
                new InfoMsg("File caricato con successo: " + fileName, "Successo"));
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new InfoMsg("Errore durante il caricamento del file: " + e.getMessage(), "Errore"));
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
}
