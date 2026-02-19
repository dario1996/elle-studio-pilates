package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.PasswordResetToken;
import com.example.demo.entity.Utenti;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.UtenteRepository;

@Service
public class PasswordResetService {
    
    @Autowired
    private UtenteRepository utenteRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Transactional
    public void createPasswordResetTokenAndSendEmail(String email) {
        // Verifica che l'utente esista
        Utenti utente = utenteRepository.findByEmail(email);
        
        if (utente == null) {
            throw new IllegalArgumentException("Nessun utente trovato con questa email");
        }
        
        // Genera token univoco
        String token = UUID.randomUUID().toString();
        
        // Crea il record del token (valido per 24 ore)
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUtente(utente);
        resetToken.setDataScadenza(LocalDateTime.now().plusHours(24));
        resetToken.setUtilizzato(false);
        
        passwordResetTokenRepository.save(resetToken);
        
        // Invia l'email
        sendPasswordResetEmail(utente.getEmail(), token, utente.getUsername());
    }
    
    private void sendPasswordResetEmail(String toEmail, String token, String username) {
        // URL del frontend per il reset
        String resetLink = "http://localhost:4200/login?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("vincenzo.cusaniello@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Recupero Password");
        
        String emailBody = String.format(
            "Ciao %s!\n\n" +
            "Se hai richiesto il recupero della password non devi fare altro che seguire le indicazioni al seguente link:\n\n" +
            "%s\n\n" +
            "Questo link sarà valido per 24 ore.\n\n" +
            "Se invece non hai richiesto il reset della password ti consigliamo di ignorare questa mail.\n\n" +
            "Grazie\n" +
            "Elle Studio Pilates",
            username,
            resetLink
        );
        
        message.setText(emailBody);
        
        mailSender.send(message);
    }
    
    public boolean validateToken(String token) {
        Optional<PasswordResetToken> resetTokenOptional = passwordResetTokenRepository.findByToken(token);
        
        if (resetTokenOptional.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = resetTokenOptional.get();
        
        // Verifica che non sia scaduto e non sia stato utilizzato
        return !resetToken.isUtilizzato() && 
               resetToken.getDataScadenza().isAfter(LocalDateTime.now());
    }
    
    public Map<String, Object> validateTokenWithUser(String token) {
        Optional<PasswordResetToken> resetTokenOptional = passwordResetTokenRepository.findByToken(token);
        
        if (resetTokenOptional.isEmpty()) {
            return Map.of("valid", false);
        }
        
        PasswordResetToken resetToken = resetTokenOptional.get();
        boolean isValid = !resetToken.isUtilizzato() && 
                         resetToken.getDataScadenza().isAfter(LocalDateTime.now());
        
        if (isValid) {
            Utenti utente = resetToken.getUtente();
            return Map.of(
                "valid", true,
                "username", utente.getUsername(),
                "email", utente.getEmail()
            );
        } else {
            return Map.of("valid", false);
        }
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> resetTokenOptional = passwordResetTokenRepository.findByToken(token);
        
        if (resetTokenOptional.isEmpty()) {
            throw new IllegalArgumentException("Token non valido");
        }
        
        PasswordResetToken resetToken = resetTokenOptional.get();
        
        // Verifica validità
        if (resetToken.isUtilizzato() || resetToken.getDataScadenza().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token scaduto o già utilizzato");
        }
        
        // Aggiorna la password
        Utenti utente = resetToken.getUtente();
        utente.setPassword(passwordEncoder.encode(newPassword));
        utenteRepository.save(utente);
        
        // Marca il token come utilizzato
        resetToken.setUtilizzato(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
