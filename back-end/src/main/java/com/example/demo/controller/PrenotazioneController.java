package com.example.demo.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.PrenotazioneLezione;
import com.example.demo.entity.RichiestaSpostamento;
import com.example.demo.entity.Vendita;
import com.example.demo.entity.Vendita.StatoVendita;
import com.example.demo.repository.VenditaRepository;
import com.example.demo.service.PrenotazioneRicorrenteService;
import com.example.demo.service.RichiestaSpostamentoService;
import com.example.demo.service.SpostamentoLezioneService;

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
    private PrenotazioneRicorrenteService prenotazioneRicorrenteService;

    @Autowired
    private RichiestaSpostamentoService richiestaSpostamentoService;

    @Autowired
    private SpostamentoLezioneService spostamentoLezioneService;

    /**
     * Recupera i pacchetti acquistati e pagati dall'utente corrente
     */
    @GetMapping("/pacchetti-utente")
    public ResponseEntity<List<PacchettoUtenteDTO>> getPacchettiUtente(Authentication authentication) {
        try {
            String username = authentication.getName();
            
            // Recupera tutte le vendite PAID per questo utente
            List<Vendita> vendite = venditaRepository.findByUtenteUsernameAndStato(username, StatoVendita.PAID);

            System.out.println("=== DEBUG getPacchettiUtente ===");
            System.out.println("Username: " + username);
            System.out.println("Numero vendite PAID: " + vendite.size());
            for (Vendita v : vendite) {
                System.out.println("  - Vendita ID: " + v.getId() + ", Pacchetto: " + v.getPacchetto().getNome() + " (ID: " + v.getPacchetto().getId() + ")");
            }

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
                        dto.setCategorieLezioni(vendita.getPacchetto().getCategorieLezioni());
                        dto.setDistribuzioneLezioni(vendita.getPacchetto().getDistribuzioneLezioni());
                        dto.setNumeroLezioni(vendita.getPacchetto().getNumeroLezioni());
                        dto.setLezioniRimanenti(vendita.getLezioniRimanenti());
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
     * Crea prenotazioni ricorrenti per un pacchetto
     */
    @PostMapping("/prenota-ricorrente")
    public ResponseEntity<?> prenotaRicorrente(
            @RequestBody PrenotazioneRicorrenteRequest request,
            Authentication authentication) {
        try {
            // Recupera la vendita per ottenere l'utente che ha acquistato il pacchetto
            Vendita vendita = venditaRepository.findById(request.getVenditaId())
                    .orElseThrow(() -> new RuntimeException("Vendita non trovata con ID: " + request.getVenditaId()));
            
            // Usa l'username dell'utente che ha acquistato il pacchetto (dalla vendita)
            // NON l'admin che sta effettuando la prenotazione
            String username = vendita.getUtente().getUsername();
            
            System.out.println("🎯 Creazione prenotazione per utente dalla vendita: " + username);
            System.out.println("👤 Admin che effettua l'operazione: " + authentication.getName());

            List<PrenotazioneLezione> prenotazioni = prenotazioneRicorrenteService.creaPrenotazioniRicorrenti(
                    request.getVenditaId(),
                    request.getTemplateId(),
                    username,
                    request.getTipoLezione(),
                    request.getNumeroLezioni()
            );

            // Converti in DTO
            List<PrenotazioneDTO> dtos = prenotazioni.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new PrenotazioneRicorrenteResponse(
                    "Prenotazioni create con successo",
                    dtos.size(),
                    dtos
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Crea prenotazioni COMBO per multiple categorie
     */
    @PostMapping("/prenota-ricorrente-combo")
    public ResponseEntity<?> prenotaCombo(
            @RequestBody com.example.demo.dto.PrenotazioneComboRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();

            List<PrenotazioneLezione> prenotazioni = prenotazioneRicorrenteService.creaPrenotazioniCombo(
                    request.getVenditaId(),
                    request.getSelezioni(),
                    username
            );

            // Converti in DTO
            List<PrenotazioneDTO> dtos = prenotazioni.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new PrenotazioneRicorrenteResponse(
                    "Prenotazioni COMBO create con successo",
                    dtos.size(),
                    dtos
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Ottiene le prenotazioni future dell'utente
     */
    @GetMapping("/mie-prenotazioni")
    public ResponseEntity<List<PrenotazioneDTO>> getMiePrenotazioni(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<PrenotazioneLezione> prenotazioni = prenotazioneRicorrenteService.getPrenotazioniFuture(username);

            List<PrenotazioneDTO> dtos = prenotazioni.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Ottiene TUTTE le prenotazioni future (solo admin)
     */
    @GetMapping("/tutte-prenotazioni")
    public ResponseEntity<List<PrenotazioneDTO>> getTuttePrenotazioni() {
        try {
            List<PrenotazioneLezione> prenotazioni = prenotazioneRicorrenteService.getTuttePrenotazioniFuture();

            List<PrenotazioneDTO> dtos = prenotazioni.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Richiedi spostamento lezione (automatico o richiesta admin)
     */
    @PostMapping("/richiedi-spostamento/{prenotazioneId}")
    public ResponseEntity<?> richiediSpostamentoLezione(
            @PathVariable Long prenotazioneId,
            @RequestBody(required = false) SpostamentoRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            String motivazione = request != null ? request.getMotivazione() : null;

            boolean spostamentoAutomatico = spostamentoLezioneService.richiediSpostamento(
                    prenotazioneId, username, motivazione);

            if (spostamentoAutomatico) {
                return ResponseEntity.ok(new SpostamentoResponse(
                        true,
                        "Lezione spostata automaticamente alla prima settimana disponibile",
                        null
                ));
            } else {
                return ResponseEntity.ok(new SpostamentoResponse(
                        false,
                        "Nessuna data disponibile. Richiesta inviata all'amministratore",
                        "La richiesta verrà elaborata dal personale. Riceverai una notifica."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Cancella una prenotazione
     */
    @DeleteMapping("/cancella/{prenotazioneId}")
    public ResponseEntity<?> cancellaPrenotazione(
            @PathVariable Long prenotazioneId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            prenotazioneRicorrenteService.cancellaPrenotazione(prenotazioneId, username);

            return ResponseEntity.ok(new SuccessResponse("Prenotazione cancellata con successo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Crea una richiesta di spostamento
     */
    @PostMapping("/richiesta-spostamento")
    public ResponseEntity<?> richiestaSpostamento(
            @RequestBody RichiestaSpostamentoRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();

            RichiestaSpostamento richiesta = richiestaSpostamentoService.creaRichiestaSpostamento(
                    request.getPrenotazioneId(),
                    username,
                    request.getTipoRichiesta(),
                    request.getDataRichiesta(),
                    request.getMotivazione()
            );

            return ResponseEntity.ok(new SuccessResponse(
                    "Richiesta di spostamento inviata. Riceverai una notifica quando verrà processata."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Ottiene le richieste di spostamento dell'utente
     */
    @GetMapping("/mie-richieste-spostamento")
    public ResponseEntity<List<RichiestaSpostamentoDTO>> getMieRichieste(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<RichiestaSpostamento> richieste = richiestaSpostamentoService.getRichiesteUtente(username);

            List<RichiestaSpostamentoDTO> dtos = richieste.stream()
                    .map(this::convertRichiestaToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Ottiene TUTTE le richieste di spostamento (admin)
     */
    @GetMapping("/richieste-spostamento")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RichiestaSpostamentoDTO>> getTutteRichieste() {
        try {
            List<RichiestaSpostamento> richieste = richiestaSpostamentoService.getAllRichieste();

            List<RichiestaSpostamentoDTO> dtos = richieste.stream()
                    .map(this::convertRichiestaToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/richieste-spostamento/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse> rifiutaRichiesta(@PathVariable Long id) {
        richiestaSpostamentoService.rifiutaRichiesta(id, "Richiesta eliminata dall'amministratore");
        return ResponseEntity.ok(new SuccessResponse("Richiesta eliminata con successo"));
    }

    // Metodi di conversione DTO
    private PrenotazioneDTO convertToDTO(PrenotazioneLezione prenotazione) {
        PrenotazioneDTO dto = new PrenotazioneDTO();
        dto.setId(prenotazione.getId());
        dto.setVenditaId(prenotazione.getVendita().getId());
        dto.setUtenteId(prenotazione.getUtente().getId());
        dto.setTemplateId(prenotazione.getTemplate().getId());
        dto.setDataLezione(prenotazione.getDataLezione());
        dto.setOraInizio(prenotazione.getOraInizio());
        dto.setOraFine(prenotazione.getOraFine());
        dto.setTipoLezione(prenotazione.getTipoLezione());
        dto.setStato(prenotazione.getStato().toString());
        dto.setNumeroSpostamenti(prenotazione.getNumeroSpostamenti());
        dto.setGruppoId(prenotazione.getGruppoPrenotazioneId());
        dto.setNote(prenotazione.getNote());
        dto.setPuoEssereSpostata(prenotazione.puoEssereSpostata());
        dto.setTitolo(prenotazione.getTemplate().getTitolo());
        dto.setUtenteNome(prenotazione.getUtente().getNome() + " " + prenotazione.getUtente().getCognome());
        dto.setIstruttore(prenotazione.getTemplate().getIstruttore());
        return dto;
    }

    private RichiestaSpostamentoDTO convertRichiestaToDTO(RichiestaSpostamento richiesta) {
        RichiestaSpostamentoDTO dto = new RichiestaSpostamentoDTO();
        dto.setId(richiesta.getId());
        dto.setTipoRichiesta(richiesta.getTipoRichiesta().toString());
        dto.setStato(richiesta.getStato().toString());
        dto.setDataOriginale(richiesta.getDataOriginale());
        dto.setDataRichiesta(richiesta.getDataRichiesta());
        dto.setMotivazione(richiesta.getMotivazione());
        dto.setRispostaAdmin(richiesta.getRispostaAdmin());
        dto.setDataCreazione(richiesta.getDataCreazione());
        dto.setDataRisposta(richiesta.getDataRisposta());
        
        // Popola dati utente
        if (richiesta.getUtente() != null) {
            dto.setNomeUtente(richiesta.getUtente().getNome());
            dto.setCognomeUtente(richiesta.getUtente().getCognome());
            dto.setEmailUtente(richiesta.getUtente().getEmail());
        }
        
        // Popola dati prenotazione
        if (richiesta.getPrenotazione() != null) {
            PrenotazioneLezione prenotazione = richiesta.getPrenotazione();
            // Il titolo viene dal template associato alla prenotazione
            if (prenotazione.getTemplate() != null) {
                dto.setTitoloLezione(prenotazione.getTemplate().getTitolo());
            }
            dto.setDataLezione(prenotazione.getDataLezione());
            dto.setOraInizio(prenotazione.getOraInizio());
            dto.setOraFine(prenotazione.getOraFine());
        }
        
        return dto;
    }

    // DTOs e Request/Response classes
    
    public static class PrenotazioneRicorrenteRequest {
        private Long venditaId;
        private Long templateId;
        private String tipoLezione;
        private Integer numeroLezioni;

        public Long getVenditaId() { return venditaId; }
        public void setVenditaId(Long venditaId) { this.venditaId = venditaId; }
        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }
        public String getTipoLezione() { return tipoLezione; }
        public void setTipoLezione(String tipoLezione) { this.tipoLezione = tipoLezione; }
        public Integer getNumeroLezioni() { return numeroLezioni; }
        public void setNumeroLezioni(Integer numeroLezioni) { this.numeroLezioni = numeroLezioni; }
    }

    public static class RichiestaSpostamentoRequest {
        private Long prenotazioneId;
        private RichiestaSpostamento.TipoRichiesta tipoRichiesta;
        private LocalDate dataRichiesta;
        private String motivazione;

        public Long getPrenotazioneId() { return prenotazioneId; }
        public void setPrenotazioneId(Long prenotazioneId) { this.prenotazioneId = prenotazioneId; }
        public RichiestaSpostamento.TipoRichiesta getTipoRichiesta() { return tipoRichiesta; }
        public void setTipoRichiesta(RichiestaSpostamento.TipoRichiesta tipoRichiesta) { this.tipoRichiesta = tipoRichiesta; }
        public LocalDate getDataRichiesta() { return dataRichiesta; }
        public void setDataRichiesta(LocalDate dataRichiesta) { this.dataRichiesta = dataRichiesta; }
        public String getMotivazione() { return motivazione; }
        public void setMotivazione(String motivazione) { this.motivazione = motivazione; }
    }

    public static class PrenotazioneDTO {
        private Long id;
        private Long venditaId;
        private Long utenteId;
        private Long templateId;
        private LocalDate dataLezione;
        private java.time.LocalTime oraInizio;
        private java.time.LocalTime oraFine;
        private String tipoLezione;
        private String stato;
        private Integer numeroSpostamenti;
        private String gruppoId;
        private String note;
        private boolean puoEssereSpostata;
        private String titolo;
        private String utenteNome;
        private String istruttore;

        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public LocalDate getDataLezione() { return dataLezione; }
        public void setDataLezione(LocalDate dataLezione) { this.dataLezione = dataLezione; }
        public java.time.LocalTime getOraInizio() { return oraInizio; }
        public void setOraInizio(java.time.LocalTime oraInizio) { this.oraInizio = oraInizio; }
        public java.time.LocalTime getOraFine() { return oraFine; }
        public void setOraFine(java.time.LocalTime oraFine) { this.oraFine = oraFine; }
        public String getTipoLezione() { return tipoLezione; }
        public void setTipoLezione(String tipoLezione) { this.tipoLezione = tipoLezione; }
        public String getStato() { return stato; }
        public void setStato(String stato) { this.stato = stato; }
        public Integer getNumeroSpostamenti() { return numeroSpostamenti; }
        public void setNumeroSpostamenti(Integer numeroSpostamenti) { this.numeroSpostamenti = numeroSpostamenti; }
        public String getGruppoId() { return gruppoId; }
        public void setGruppoId(String gruppoId) { this.gruppoId = gruppoId; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public boolean isPuoEssereSpostata() { return puoEssereSpostata; }
        public void setPuoEssereSpostata(boolean puoEssereSpostata) { this.puoEssereSpostata = puoEssereSpostata; }
        public String getTitolo() { return titolo; }
        public void setTitolo(String titolo) { this.titolo = titolo; }
        public Long getVenditaId() { return venditaId; }
        public void setVenditaId(Long venditaId) { this.venditaId = venditaId; }
        public Long getUtenteId() { return utenteId; }
        public void setUtenteId(Long utenteId) { this.utenteId = utenteId; }
        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }
        public String getUtenteNome() { return utenteNome; }
        public void setUtenteNome(String utenteNome) { this.utenteNome = utenteNome; }
        public String getIstruttore() { return istruttore; }
        public void setIstruttore(String istruttore) { this.istruttore = istruttore; }
    }

    public static class RichiestaSpostamentoDTO {
        private Long id;
        private String tipoRichiesta;
        private String stato;
        private LocalDate dataOriginale;
        private LocalDate dataRichiesta;
        private String motivazione;
        private String rispostaAdmin;
        private java.time.LocalDateTime dataCreazione;
        private java.time.LocalDateTime dataRisposta;
        
        // Dati utente
        private String nomeUtente;
        private String cognomeUtente;
        private String emailUtente;
        
        // Dati prenotazione
        private String titoloLezione;
        private LocalDate dataLezione;
        private java.time.LocalTime oraInizio;
        private java.time.LocalTime oraFine;

        // Getters e Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTipoRichiesta() { return tipoRichiesta; }
        public void setTipoRichiesta(String tipoRichiesta) { this.tipoRichiesta = tipoRichiesta; }
        public String getStato() { return stato; }
        public void setStato(String stato) { this.stato = stato; }
        public LocalDate getDataOriginale() { return dataOriginale; }
        public void setDataOriginale(LocalDate dataOriginale) { this.dataOriginale = dataOriginale; }
        public LocalDate getDataRichiesta() { return dataRichiesta; }
        public void setDataRichiesta(LocalDate dataRichiesta) { this.dataRichiesta = dataRichiesta; }
        public String getMotivazione() { return motivazione; }
        public void setMotivazione(String motivazione) { this.motivazione = motivazione; }
        public String getRispostaAdmin() { return rispostaAdmin; }
        public void setRispostaAdmin(String rispostaAdmin) { this.rispostaAdmin = rispostaAdmin; }
        public java.time.LocalDateTime getDataCreazione() { return dataCreazione; }
        public void setDataCreazione(java.time.LocalDateTime dataCreazione) { this.dataCreazione = dataCreazione; }
        public java.time.LocalDateTime getDataRisposta() { return dataRisposta; }
        public void setDataRisposta(java.time.LocalDateTime dataRisposta) { this.dataRisposta = dataRisposta; }
        
        public String getNomeUtente() { return nomeUtente; }
        public void setNomeUtente(String nomeUtente) { this.nomeUtente = nomeUtente; }
        public String getCognomeUtente() { return cognomeUtente; }
        public void setCognomeUtente(String cognomeUtente) { this.cognomeUtente = cognomeUtente; }
        public String getEmailUtente() { return emailUtente; }
        public void setEmailUtente(String emailUtente) { this.emailUtente = emailUtente; }
        
        public String getTitoloLezione() { return titoloLezione; }
        public void setTitoloLezione(String titoloLezione) { this.titoloLezione = titoloLezione; }
        public LocalDate getDataLezione() { return dataLezione; }
        public void setDataLezione(LocalDate dataLezione) { this.dataLezione = dataLezione; }
        public java.time.LocalTime getOraInizio() { return oraInizio; }
        public void setOraInizio(java.time.LocalTime oraInizio) { this.oraInizio = oraInizio; }
        public java.time.LocalTime getOraFine() { return oraFine; }
        public void setOraFine(java.time.LocalTime oraFine) { this.oraFine = oraFine; }
    }

    public static class PrenotazioneRicorrenteResponse {
        private String messaggio;
        private int numeroPrenotazioni;
        private List<PrenotazioneDTO> prenotazioni;

        public PrenotazioneRicorrenteResponse(String messaggio, int numeroPrenotazioni, List<PrenotazioneDTO> prenotazioni) {
            this.messaggio = messaggio;
            this.numeroPrenotazioni = numeroPrenotazioni;
            this.prenotazioni = prenotazioni;
        }

        public String getMessaggio() { return messaggio; }
        public int getNumeroPrenotazioni() { return numeroPrenotazioni; }
        public List<PrenotazioneDTO> getPrenotazioni() { return prenotazioni; }
    }

    public static class SuccessResponse {
        private String messaggio;

        public SuccessResponse(String messaggio) {
            this.messaggio = messaggio;
        }

        public String getMessaggio() { return messaggio; }
    }

    public static class ErrorResponse {
        private String errore;

        public ErrorResponse(String errore) {
            this.errore = errore;
        }

        public String getErrore() { return errore; }
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
        private String categorieLezioni;
        private String distribuzioneLezioni;
        private Integer numeroLezioni;
        private Integer lezioniRimanenti;

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

        public String getCategorieLezioni() {
            return categorieLezioni;
        }

        public void setCategorieLezioni(String categorieLezioni) {
            this.categorieLezioni = categorieLezioni;
        }

        public String getDistribuzioneLezioni() {
            return distribuzioneLezioni;
        }

        public void setDistribuzioneLezioni(String distribuzioneLezioni) {
            this.distribuzioneLezioni = distribuzioneLezioni;
        }

        public Integer getNumeroLezioni() {
            return numeroLezioni;
        }

        public void setNumeroLezioni(Integer numeroLezioni) {
            this.numeroLezioni = numeroLezioni;
        }

        public Integer getLezioniRimanenti() {
            return lezioniRimanenti;
        }

        public void setLezioniRimanenti(Integer lezioniRimanenti) {
            this.lezioniRimanenti = lezioniRimanenti;
        }
    }

    /**
     * Request DTO per spostamento lezione
     */
    public static class SpostamentoRequest {
        private String motivazione;

        public String getMotivazione() {
            return motivazione;
        }

        public void setMotivazione(String motivazione) {
            this.motivazione = motivazione;
        }
    }

    /**
     * Response DTO per spostamento lezione
     */
    public static class SpostamentoResponse {
        private boolean spostamentoAutomatico;
        private String messaggio;
        private String dettaglio;

        public SpostamentoResponse(boolean spostamentoAutomatico, String messaggio, String dettaglio) {
            this.spostamentoAutomatico = spostamentoAutomatico;
            this.messaggio = messaggio;
            this.dettaglio = dettaglio;
        }

        public boolean isSpostamentoAutomatico() {
            return spostamentoAutomatico;
        }

        public String getMessaggio() {
            return messaggio;
        }

        public String getDettaglio() {
            return dettaglio;
        }
    }
}
