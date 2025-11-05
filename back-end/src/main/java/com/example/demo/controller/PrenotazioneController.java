package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Vendita;
import com.example.demo.entity.Vendita.StatoVendita;
import com.example.demo.repository.VenditaRepository;

/**
 * Controller REST per gestire le prenotazioni
 */
@RestController
@RequestMapping("/api/prenotazioni")
@PreAuthorize("isAuthenticated()")
public class PrenotazioneController {

    @Autowired
    private VenditaRepository venditaRepository;

    /**
     * Recupera i pacchetti acquistati e pagati dall'utente corrente
     */
    @GetMapping("/pacchetti-utente")
    public ResponseEntity<List<PacchettoUtenteDTO>> getPacchettiUtente(Authentication authentication) {
        try {
            String username = authentication.getName();
            
            // Recupera tutte le vendite PAID per questo utente
            List<Vendita> vendite = venditaRepository.findByUtenteUsernameAndStato(username, StatoVendita.PAID);

            // Converte le vendite in DTO con i dettagli del pacchetto
            List<PacchettoUtenteDTO> pacchetti = vendite.stream()
                    .map(vendita -> {
                        PacchettoUtenteDTO dto = new PacchettoUtenteDTO();
                        dto.setVenditaId(vendita.getId());
                        dto.setId(vendita.getPacchetto().getId());
                        dto.setNome(vendita.getPacchetto().getNome());
                        dto.setCategoria(vendita.getPacchetto().getCategoria());
                        dto.setDescrizione(vendita.getPacchetto().getDescrizione());
                        dto.setLivello(vendita.getPacchetto().getLivello());
                        dto.setPrezzo(vendita.getImporto());
                        dto.setAttivo(vendita.getPacchetto().getAttivo());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(pacchetti);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * DTO per rappresentare un pacchetto acquistato dall'utente
     */
    public static class PacchettoUtenteDTO {
        private Long venditaId;
        private Long id;
        private String nome;
        private String categoria;
        private String descrizione;
        private String livello;
        private java.math.BigDecimal prezzo;
        private Boolean attivo;

        // Getters e Setters
        public Long getVenditaId() {
            return venditaId;
        }

        public void setVenditaId(Long venditaId) {
            this.venditaId = venditaId;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public String getDescrizione() {
            return descrizione;
        }

        public void setDescrizione(String descrizione) {
            this.descrizione = descrizione;
        }

        public String getLivello() {
            return livello;
        }

        public void setLivello(String livello) {
            this.livello = livello;
        }

        public java.math.BigDecimal getPrezzo() {
            return prezzo;
        }

        public void setPrezzo(java.math.BigDecimal prezzo) {
            this.prezzo = prezzo;
        }

        public Boolean getAttivo() {
            return attivo;
        }

        public void setAttivo(Boolean attivo) {
            this.attivo = attivo;
        }
    }
}
