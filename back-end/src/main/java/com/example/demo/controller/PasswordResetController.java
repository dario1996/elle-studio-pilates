package com.example.demo.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.PasswordResetService;

@RestController
@RequestMapping("/api/auth/password")
@CrossOrigin(origins = {"http://localhost:4200", "https://d1g9w0fi1247xw.cloudfront.net", "http://frontendstack-angularsitebucket92ab5f40-0eshkezhkns1.s3-website-eu-west-1.amazonaws.com"})
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    @PostMapping("/reset-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        try {
            passwordResetService.createPasswordResetTokenAndSendEmail(email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email inviata con successo"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Errore durante l'invio dell'email"
            ));
        }
    }
    
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            Map<String, Object> validationResult = passwordResetService.validateTokenWithUser(token);
            return ResponseEntity.ok(validationResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", "Token non valido o scaduto"
            ));
        }
    }
    
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        try {
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password aggiornata con successo"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Token non valido o scaduto"
            ));
        }
    }
}
