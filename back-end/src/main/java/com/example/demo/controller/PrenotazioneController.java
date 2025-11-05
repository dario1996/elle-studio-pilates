package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Vendita;
import com.example.demo.exceptions.BindingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.service.LezioneService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    @Autowired
    private com.example.demo.repository.PacchettoUtenteRepository pacchettoUtenteRepository;
    @Autowired
    private LezioneService lezioneService;
    @Autowired
    private com.example.demo.repository.CalendarioSettimanaleRepository calendarioRepository;
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    @Autowired
    private com.example.demo.repository.PacchettoRepository pacchettoRepository;

    @Autowired
    private com.example.demo.service.PrenotazioneService prenotazioneService;

    /**
     * Recupera i pacchetti acquistati e pagati dall'utente corrente
     */
    @GetMapping("/pacchetti-utente")
    public ResponseEntity<List<PacchettoUtenteDTO>> getPacchettiUtente(Authentication authentication) {
        try {
            String username = authentication.getName();
            
            // Recupera tutte le vendite PAID per questo utente
            List<Vendita> vendite = venditaRepository.findByUtenteUsernameAndStato(username, StatoVendita.PAID);

            // Converte le vendite in DTO con i dettagli del pacchetto e le lezioni residue (se disponibili)
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

                        // trova record pacchetti_utenti creato dal servizio VenditaService (se presente)
                        pacchettoUtenteRepository.findByVendita(vendita).ifPresent(pu -> dto.setLezioniResidue(pu.getLezioniResidue()));

                        // fallback: usa vendite.lezioni_residue o pacchetto.numeroLezioni
                        if (dto.getLezioniResidue() == null) {
                            if (vendita.getLezioniResidue() != null) dto.setLezioniResidue(vendita.getLezioniResidue());
                            else if (vendita.getPacchetto() != null && vendita.getPacchetto().getNumeroLezioni() != null)
                                dto.setLezioniResidue(vendita.getPacchetto().getNumeroLezioni());
                        }

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
        private Integer lezioniResidue;

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

        public Integer getLezioniResidue() {
            return lezioniResidue;
        }

        public void setLezioniResidue(Integer lezioniResidue) {
            this.lezioniResidue = lezioniResidue;
        }
    }

    /**
     * DTO richiesta prenotazione (temporanea)
     */
    public static class PrenotazioneRequest {
        private Long lezioneId;
        private String note;
        private Long venditaId;

        public Long getLezioneId() { return lezioneId; }
        public void setLezioneId(Long lezioneId) { this.lezioneId = lezioneId; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public Long getVenditaId() { return venditaId; }
        public void setVenditaId(Long venditaId) { this.venditaId = venditaId; }
    }

    @PostMapping("")
    public ResponseEntity<?> creaPrenotazione(@RequestBody PrenotazioneRequest request, Authentication authentication) {
        try {
            String username = authentication.getName();
            // use the new PrenotazioneService for the definitive flow
            prenotazioneService.creaPrenotazione(request.getLezioneId(), username, request.getNote(), request.getVenditaId());
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (BindingException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{lezioneId}")
    public ResponseEntity<?> cancellaPrenotazione(@PathVariable Long lezioneId, Authentication authentication) {
        try {
            String username = authentication.getName();
            prenotazioneService.cancellaPrenotazione(lezioneId, username);
            return ResponseEntity.noContent().build();
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/mie")
    public ResponseEntity<?> miePrenotazioni(Authentication authentication) {
        try {
            String username = authentication.getName();
            var lista = prenotazioneService.getPrenotazioniUtente(username);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/lezione/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSEGNANTE')")
    public ResponseEntity<?> prenotazioniPerLezione(@PathVariable Long id) {
        try {
            var lista = prenotazioneService.getPrenotazioniPerLezione(id);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Restituisce i tipi di lezione disponibili per un pacchetto (minimo implementazione per frontend).
     * Fornisce almeno il nome del tipo di lezione e un titolo semplice per popolare la select lato client.
     */
    @GetMapping("/tipi-lezione/pacchetto/{pacchettoId}")
    public ResponseEntity<?> getTipiLezionePerPacchetto(@PathVariable Long pacchettoId) {
        try {
            var pacchettoOpt = pacchettoRepository.findById(pacchettoId);
            if (pacchettoOpt.isEmpty()) return ResponseEntity.ok(java.util.Collections.emptyList());
            String categoria = pacchettoOpt.get().getCategoria();

            // Recupera tutti i template attivi tramite JDBC per evitare errori di parsing enum presenti in DB
            String sql = "select id, giorno_settimana, ora_inizio, ora_fine, tipo_lezione, titolo, istruttore, max_partecipanti, colore, note, attivo from calendario_settimanale where attivo = 1 order by giorno_settimana, ora_inizio";
            java.util.List<TipoLezioneDTO> all = jdbcTemplate.query(sql, (rs, rowNum) -> {
                TipoLezioneDTO dto = new TipoLezioneDTO();
                dto.setId(rs.getLong("id"));
                dto.setGiornoSettimana(rs.getString("giorno_settimana"));
                dto.setOraInizio(rs.getString("ora_inizio"));
                dto.setOraFine(rs.getString("ora_fine"));
                dto.setTitolo(rs.getString("titolo"));
                dto.setTipoLezione(rs.getString("tipo_lezione"));
                dto.setIstruttore(rs.getString("istruttore"));
                Object mp = rs.getObject("max_partecipanti");
                dto.setMaxPartecipanti(mp != null ? rs.getInt("max_partecipanti") : null);
                dto.setColore(rs.getString("colore"));
                dto.setNote(rs.getString("note"));
                Object at = rs.getObject("attivo");
                dto.setAttivo(at != null ? rs.getBoolean("attivo") : null);
                return dto;
            });

            java.util.List<TipoLezioneDTO> list = all.stream()
                    .filter(t -> matchesCategoria(t.getTipoLezione(), categoria))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private String mapTipoLezioneToCategoria(com.example.demo.enums.TipoLezione tipoLezione) {
        if (tipoLezione == null) return "";
        switch (tipoLezione) {
            case PRIVATA:
                return "PRIVATA";
            case PRIMA_LEZIONE:
                return "PRIMA_LEZIONE";
            case SEMI_PRIVATA:
                return "SEMI_PRIVATA";
            case PILATES_MATWORK:
                return "PILATES_MATWORK";
            case YOGA:
                return "YOGA";
            default:
                return tipoLezione.name();
        }
    }

    private boolean matchesCategoria(String rawTipoLezione, String categoria) {
        if (rawTipoLezione == null || categoria == null) return false;
        String a = rawTipoLezione.trim().toLowerCase();
        String b = categoria.trim().toLowerCase();
        if (a.equals(b)) return true;
        if (a.contains(b)) return true;
        if (b.contains(a)) return true;
        // normalize underscores and spaces
        if (a.replace('_',' ').contains(b)) return true;
        if (b.replace('_',' ').contains(a)) return true;
        // try splitting on underscore and check parts
        for (String part : a.split("_")) {
            if (part.equalsIgnoreCase(b)) return true;
            if (part.contains(b)) return true;
        }
        return false;
    }

    public static class TipoLezioneDTO {
        private Long id;
        private String tipoLezione;
        private String titolo;
        private String giornoSettimana;
        private String oraInizio;
        private String oraFine;
        private String istruttore;
        private Integer maxPartecipanti;
        private String colore;
        private String note;
        private Boolean attivo;

        public TipoLezioneDTO() {}

        public TipoLezioneDTO(String tipoLezione, String titolo) {
            this.tipoLezione = tipoLezione;
            this.titolo = titolo;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTipoLezione() { return tipoLezione; }
        public void setTipoLezione(String tipoLezione) { this.tipoLezione = tipoLezione; }
        public String getTitolo() { return titolo; }
        public void setTitolo(String titolo) { this.titolo = titolo; }
        public String getGiornoSettimana() { return giornoSettimana; }
        public void setGiornoSettimana(String giornoSettimana) { this.giornoSettimana = giornoSettimana; }
        public String getOraInizio() { return oraInizio; }
        public void setOraInizio(String oraInizio) { this.oraInizio = oraInizio; }
        public String getOraFine() { return oraFine; }
        public void setOraFine(String oraFine) { this.oraFine = oraFine; }
        public String getIstruttore() { return istruttore; }
        public void setIstruttore(String istruttore) { this.istruttore = istruttore; }
        public Integer getMaxPartecipanti() { return maxPartecipanti; }
        public void setMaxPartecipanti(Integer maxPartecipanti) { this.maxPartecipanti = maxPartecipanti; }
        public String getColore() { return colore; }
        public void setColore(String colore) { this.colore = colore; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public Boolean getAttivo() { return attivo; }
        public void setAttivo(Boolean attivo) { this.attivo = attivo; }
    }
}
