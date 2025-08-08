package com.example.demo.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegistrazioneUtenteDTO {
    
    // Step 1: Dettagli Profilo
    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100, message = "Il nome non può superare i 100 caratteri")
    private String nome;
    
    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(max = 100, message = "Il cognome non può superare i 100 caratteri")
    private String cognome;
    
    @NotBlank(message = "Il codice fiscale è obbligatorio")
    @Size(min = 16, max = 16, message = "Il codice fiscale deve essere di 16 caratteri")
    private String codiceFiscale;
    
    // Step 2: Certificato Medico
    private String certificatoMedico; // Path del file uploadato
    
    @NotNull(message = "Specificare se si hanno patologie è obbligatorio")
    private Boolean patologie;
    
    private String descrizionePatologie;
    
    private String obiettivi;
    
    // Step 3: Email e Password
    @NotBlank(message = "Lo username è obbligatorio")
    @Size(min = 3, max = 50, message = "Lo username deve essere tra 3 e 50 caratteri")
    private String username;
    
    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
    @Size(max = 150, message = "L'email non può superare i 150 caratteri")
    private String email;
    
    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, message = "La password deve avere almeno 8 caratteri")
    private String password;
    
    @NotBlank(message = "La conferma password è obbligatoria")
    private String confirmPassword;
    
    // Campi di sistema
    private String attivo = "Si";
    private List<String> ruoli;
    
    // Metodo per validare che le password coincidano
    public boolean isPasswordMatching() {
        return password != null && password.equals(confirmPassword);
    }
}
