package com.example.ellepilates.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service per la gestione dell'upload e download di file
 */
@Service
public class FileUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final String CERTIFICATI_DIR = "certificati-medici";

    /**
     * Salva il certificato medico dell'utente
     */
    public String saveCertificatoMedico(MultipartFile file, Long userId) throws IOException {
        
        // Crea la directory se non esiste
        Path uploadPath = Paths.get(uploadDir, CERTIFICATI_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Genera nome file univoco
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String newFileName = "certificato_" + userId + "_" + timestamp + extension;

        // Salva il file
        Path filePath = uploadPath.resolve(newFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return newFileName;
    }

    /**
     * Recupera il certificato medico dell'utente
     */
    public ResponseEntity<byte[]> getCertificatoMedico(Long userId) throws IOException {
        
        Path uploadPath = Paths.get(uploadDir, CERTIFICATI_DIR);
        
        // Cerca il file più recente per l'utente
        String fileName = Files.list(uploadPath)
            .map(Path::getFileName)
            .map(Path::toString)
            .filter(name -> name.startsWith("certificato_" + userId + "_"))
            .sorted((a, b) -> b.compareTo(a)) // Ordine decrescente per avere il più recente
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Certificato medico non trovato"));

        Path filePath = uploadPath.resolve(fileName);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File non trovato: " + fileName);
        }

        byte[] fileContent = Files.readAllBytes(filePath);
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(fileContent);
    }

    /**
     * Elimina il certificato medico dell'utente
     */
    public boolean deleteCertificatoMedico(Long userId) {
        try {
            Path uploadPath = Paths.get(uploadDir, CERTIFICATI_DIR);
            
            return Files.list(uploadPath)
                .filter(path -> path.getFileName().toString().startsWith("certificato_" + userId + "_"))
                .findFirst()
                .map(path -> {
                    try {
                        return Files.deleteIfExists(path);
                    } catch (IOException e) {
                        return false;
                    }
                })
                .orElse(false);
                
        } catch (IOException e) {
            return false;
        }
    }
}
