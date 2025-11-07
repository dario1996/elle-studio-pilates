package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
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
        // Minimal, safe implementation to avoid compile errors while keeping behavior predictable.
        try {
            String username = authentication.getName();
            List<Vendita> vendite = venditaRepository.findByUtenteUsernameAndStato(username, StatoVendita.PAID);
            java.util.List<PacchettoUtenteDTO> pacchetti = new java.util.ArrayList<>();
            for (Vendita vendita : vendite) {
                PacchettoUtenteDTO dto = new PacchettoUtenteDTO();
                dto.setVenditaId(vendita.getId());
                if (vendita.getPacchetto() != null) {
                    var p = vendita.getPacchetto();
                    dto.setId(p.getId());
                    dto.setNome(p.getNome());
                    dto.setCategoria(p.getCategoria());
                    dto.setDescrizione(p.getDescrizione());
                    if (vendita.getLezioniResidue() != null) dto.setLezioniResidue(vendita.getLezioniResidue());
                    else if (p.getNumeroLezioni() != null) dto.setLezioniResidue(p.getNumeroLezioni());
                }
                pacchetti.add(dto);
            }
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
        private Boolean isCombo = false;
        private java.util.List<AllowedTypeDTO> allowedTypes;

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

        public Boolean getIsCombo() { return isCombo; }
        public void setIsCombo(Boolean isCombo) { this.isCombo = isCombo; }
        public java.util.List<AllowedTypeDTO> getAllowedTypes() { return allowedTypes; }
        public void setAllowedTypes(java.util.List<AllowedTypeDTO> allowedTypes) { this.allowedTypes = allowedTypes; }
    }

    public static class AllowedTypeDTO {
        private Long templateId;
        private String tipoLezione;
        private String titolo;
        private Integer maxPartecipanti;
        private Integer numeroLezioni;

        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }
        public String getTipoLezione() { return tipoLezione; }
        public void setTipoLezione(String tipoLezione) { this.tipoLezione = tipoLezione; }
        public String getTitolo() { return titolo; }
        public void setTitolo(String titolo) { this.titolo = titolo; }
        public Integer getMaxPartecipanti() { return maxPartecipanti; }
        public void setMaxPartecipanti(Integer maxPartecipanti) { this.maxPartecipanti = maxPartecipanti; }
        public Integer getNumeroLezioni() { return numeroLezioni; }
        public void setNumeroLezioni(Integer numeroLezioni) { this.numeroLezioni = numeroLezioni; }
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

    /**
     * Crea una prenotazione in prenotazioni_lezioni.
     * Accetta due modalità di input:
     * - body contiene `lezioneId`: si prenota sulla lezione esistente (verifica capienza/opzioni)
     * - body contiene `tipoLezione` e `data` (o `data_slot`): il server cerca una lezione materializzata
     *   (tabella `lezioni` join calendario_settimanale) per quella data con lo stesso tipo; se trovata,
     *   la usa per creare la prenotazione. Se non trovata, risponde 404 (non si crea lezione al volo).
     * Body example: { lezioneId?: number, tipoLezione?: string, data?: 'YYYY-MM-DD', venditaId?: number, pacchettoUtenteId?: number, note?: string }
     */
    @PostMapping("/utente")
    public ResponseEntity<?> creaPrenotazioneUtente(@RequestBody java.util.Map<String,Object> body, Authentication authentication) {
        try {
            String username = authentication.getName();
            Object lezioneObj = body.get("lezioneId");
            Object tipoLezioneObj = body.get("tipoLezione");
            Object venditaObj = body.get("venditaId");
            Object pacchettoUtenteObj = body.get("pacchettoUtenteId");
            Object noteObj = body.get("note");
            // optional slot date provided by client (YYYY-MM-DD) or data_slot
            Object dataObj = body.get("data");
            if (dataObj == null) dataObj = body.get("data_slot");

            Long venditaId = venditaObj != null ? (venditaObj instanceof Number ? ((Number)venditaObj).longValue() : Long.valueOf(String.valueOf(venditaObj))) : null;
            Long pacchettoUtenteId = pacchettoUtenteObj != null ? (pacchettoUtenteObj instanceof Number ? ((Number)pacchettoUtenteObj).longValue() : Long.valueOf(String.valueOf(pacchettoUtenteObj))) : null;
            String note = noteObj != null ? String.valueOf(noteObj) : null;

            // resolve user id from username
            Long utenteId = jdbcTemplate.queryForObject("select id from utenti where username = ?", new Object[]{username}, Long.class);

            Long lezioneId = null;
            java.sql.Timestamp dataPrenotazioneTs = null;
            if (lezioneObj != null) {
                lezioneId = lezioneObj instanceof Number ? ((Number)lezioneObj).longValue() : Long.valueOf(String.valueOf(lezioneObj));
            } else {
                // resolve via tipoLezione only (no date)
                if (lezioneObj != null) {
                    lezioneId = lezioneObj instanceof Number ? ((Number)lezioneObj).longValue() : Long.valueOf(String.valueOf(lezioneObj));
                } else {
                        // resolve via tipoLezione only (take next upcoming materialized lezione for that type)
                        if (tipoLezioneObj == null) {
                            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Provide either lezioneId or tipoLezione"));
                        }
                        String tipoLezione = String.valueOf(tipoLezioneObj);
                        // Cerca nella tabella `lezioni` una lezione del tipo richiesto (senza usare calendario_settimanale)
                        // Nota: non filtriamo per data qui, il requisito è di risolvere solo per tipo
                        // ma prendiamo comunque il campo data_inizio se presente per poter valorizzare data_prenotazione
                        String sqlFind = "select l.id, l.max_partecipanti, l.tipo_lezione, l.data_inizio from lezioni l where l.attiva = 1 and lower(l.tipo_lezione) = lower(?) order by l.data_inizio limit 1";
                        java.util.List<java.util.Map<String,Object>> found = jdbcTemplate.queryForList(sqlFind, tipoLezione);
                        if (found == null || found.isEmpty()) {
                            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Nessuna lezione materializzata trovata per il tipo richiesto"));
                        }
                        var row = found.get(0);
                        lezioneId = row.get("id") instanceof Number ? ((Number)row.get("id")).longValue() : Long.valueOf(String.valueOf(row.get("id")));
                        // if client provided a slot date, prefer that
                        if (dataObj != null) {
                            try {
                                String s = String.valueOf(dataObj);
                                java.time.LocalDate ld = java.time.LocalDate.parse(s);
                                dataPrenotazioneTs = java.sql.Timestamp.valueOf(ld.atStartOfDay());
                            } catch (Exception ex) {
                                // ignore parse error and continue to try using lezione data
                            }
                        }
                        // if not provided or parse failed, try to extract from the found lezione row
                        if (dataPrenotazioneTs == null) {
                            Object di = row.get("data_inizio");
                            if (di instanceof java.sql.Timestamp) dataPrenotazioneTs = (java.sql.Timestamp) di;
                            else if (di instanceof java.sql.Date) dataPrenotazioneTs = new java.sql.Timestamp(((java.sql.Date)di).getTime());
                            else if (di instanceof java.time.LocalDateTime) dataPrenotazioneTs = java.sql.Timestamp.valueOf((java.time.LocalDateTime)di);
                        }
                }
            }

            // verify lezione exists and capacity
            java.util.Map<String,Object> lezioneRow = null;
            try {
                lezioneRow = jdbcTemplate.queryForMap("select l.id, l.template_id, l.max_partecipanti, l.attiva, l.data_inizio, cs.tipo_lezione as template_tipo from lezioni l left join calendario_settimanale cs on cs.id = l.template_id where l.id = ?", lezioneId);
            } catch (org.springframework.dao.EmptyResultDataAccessException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("message", "Lezione non trovata"));
            }

            Integer maxP = lezioneRow.get("max_partecipanti") != null ? ((Number)lezioneRow.get("max_partecipanti")).intValue() : null;
            // if client provided a date for the slot and we haven't set dataPrenotazioneTs yet, use it
            if (dataPrenotazioneTs == null && dataObj != null) {
                try {
                    String s = String.valueOf(dataObj);
                    java.time.LocalDate ld = java.time.LocalDate.parse(s);
                    dataPrenotazioneTs = java.sql.Timestamp.valueOf(ld.atStartOfDay());
                } catch (Exception ex) {
                    // ignore parse error
                }
            }
            // if still null, try to get it from the lezione's data_inizio
            if (dataPrenotazioneTs == null) {
                Object di = lezioneRow.get("data_inizio");
                if (di instanceof java.sql.Timestamp) dataPrenotazioneTs = (java.sql.Timestamp) di;
                else if (di instanceof java.sql.Date) dataPrenotazioneTs = new java.sql.Timestamp(((java.sql.Date)di).getTime());
                else if (di instanceof java.time.LocalDateTime) dataPrenotazioneTs = java.sql.Timestamp.valueOf((java.time.LocalDateTime)di);
            }
            Integer prenotati = jdbcTemplate.queryForObject("select count(*) from prenotazioni_lezioni where lezione_id = ? and attiva = 1", new Object[]{lezioneId}, Integer.class);
            int pren = prenotati != null ? prenotati : 0;
            if (maxP != null && pren >= maxP) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("message", "Lezione piena"));
            }

            // insert into prenotazioni_lezioni
            // ensure we have some timestamp for data_prenotazione
            if (dataPrenotazioneTs == null) dataPrenotazioneTs = new java.sql.Timestamp(System.currentTimeMillis());

            String insertSql = "insert into prenotazioni_lezioni (lezione_id, vendita_id, pacchetto_utente_id, utente_id, note, consumata, attiva, data_prenotazione, created_at) values (?, ?, ?, ?, ?, 0, 1, ?, now())";
            jdbcTemplate.update(insertSql, lezioneId, venditaId, pacchettoUtenteId, utenteId, note, dataPrenotazioneTs);

            return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("message", "Prenotazione creata"));
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

            // Recupera i template attivi per la categoria del pacchetto usando tipo_lezione = categoria
            String sql = "select id, giorno_settimana, ora_inizio, ora_fine, tipo_lezione, titolo, istruttore, max_partecipanti, colore, note, attivo from calendario_settimanale where attivo = 1 and lower(tipo_lezione) = lower(?) order by giorno_settimana, ora_inizio";
            java.util.List<TipoLezioneDTO> all = jdbcTemplate.query(sql, new Object[]{categoria}, (rs, rowNum) -> {
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
            java.util.List<TipoLezioneDTO> list = all;

            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Variante che accetta direttamente la categoria (utile se il client già la possiede).
     */
    @GetMapping("/tipi-lezione/categoria/{categoria}")
    public ResponseEntity<?> getTipiLezionePerCategoria(@PathVariable String categoria) {
        try {
            if (categoria == null || categoria.isBlank()) return ResponseEntity.ok(java.util.Collections.emptyList());

            String sql = "select id, giorno_settimana, ora_inizio, ora_fine, tipo_lezione, titolo, istruttore, max_partecipanti, colore, note, attivo from calendario_settimanale where attivo = 1 and lower(tipo_lezione) = lower(?) order by giorno_settimana, ora_inizio";
            java.util.List<TipoLezioneDTO> all = jdbcTemplate.query(sql, new Object[]{categoria}, (rs, rowNum) -> {
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

            return ResponseEntity.ok(all);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Fallback: recupera i tipi di lezione. Se viene passata la query param `categoria` filtra per quella categoria.
     * Utile per chiamate dal client dove la categoria può contenere caratteri speciali (evita problemi di path encoding).
     */
    @GetMapping("/tipi-lezione")
    public ResponseEntity<?> getTipiLezione(@RequestParam(required = false) String categoria) {
        try {
            final String baseSql = "select id, giorno_settimana, ora_inizio, ora_fine, tipo_lezione, titolo, istruttore, max_partecipanti, colore, note, attivo from calendario_settimanale where attivo = 1";

            if (categoria == null || categoria.isBlank()) {
                String sql = baseSql + " order by giorno_settimana, ora_inizio";
                java.util.List<TipoLezioneDTO> all = jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToTipoLezioneDTO(rs));
                return ResponseEntity.ok(all);
            }

            String sqlByCat = baseSql + " and lower(tipo_lezione) = lower(?) order by giorno_settimana, ora_inizio";
            java.util.List<TipoLezioneDTO> all = jdbcTemplate.query(sqlByCat, new Object[]{categoria}, (rs, rowNum) -> mapRowToTipoLezioneDTO(rs));
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private TipoLezioneDTO mapRowToTipoLezioneDTO(java.sql.ResultSet rs) throws java.sql.SQLException {
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
    
                /**
             * Restituisce gli slot disponibili generati a partire da un template di calendario
             * Il risultato è costruito sempre a partire da `calendario_settimanale` (giorno/ora)
             * Se per una data esiste una riga nella tabella `lezioni` con lo stesso template_id
             * usiamo i valori materializzati (maxPartecipanti e conteggio prenotazioni). Altrimenti
             * mostriamo lo slot generato dal template con posti liberi pari a maxPartecipanti.
             *
             * Parametri:
             * - templateId (required): id del template in calendario_settimanale
             * - weeks (optional, default 4): numero di settimane nel futuro da includere
             */
            @RequestMapping(value = "/slots", method = {RequestMethod.GET, RequestMethod.POST})
            public ResponseEntity<?> getAvailableSlots(@RequestParam String tipoLezione, @RequestParam(required = false, defaultValue = "4") Integer weeks) {
                // Only allow requests by tipoLezione. tipoLezione must match calendario_settimanale.tipo_lezione (case-insensitive).
                try {
                    if (tipoLezione == null || tipoLezione.isBlank()) {
                        return ResponseEntity.badRequest().body(java.util.Map.of("message", "tipoLezione is required"));
                    }

                    // Always true: we are serving by tipoLezione, so do not expose templateId in SlotDTO
                    boolean requestByTipo = true;

                    String sqlByTipo = "select id, giorno_settimana, ora_inizio, ora_fine, tipo_lezione, titolo, istruttore, max_partecipanti from calendario_settimanale where attivo = 1 and lower(tipo_lezione) = lower(?) order by giorno_settimana, ora_inizio";
                    java.util.List<TipoLezioneDTO> tplList = jdbcTemplate.query(sqlByTipo, new Object[]{tipoLezione}, (rs, rowNum) -> {
                        TipoLezioneDTO dto = new TipoLezioneDTO();
                        dto.setId(rs.getLong("id"));
                        dto.setGiornoSettimana(rs.getString("giorno_settimana"));
                        dto.setOraInizio(rs.getString("ora_inizio"));
                        dto.setOraFine(rs.getString("ora_fine"));
                        dto.setTitolo(rs.getString("titolo"));
                        dto.setTipoLezione(rs.getString("tipo_lezione"));
                        Object mp = rs.getObject("max_partecipanti");
                        dto.setMaxPartecipanti(mp != null ? rs.getInt("max_partecipanti") : null);
                        return dto;
                    });

                    if (tplList == null || tplList.isEmpty()) return ResponseEntity.ok(java.util.Collections.emptyList());

                    java.time.LocalDate start = java.time.LocalDate.now();
                    java.time.LocalDate end = start.plusWeeks(weeks != null ? weeks : 4);

                    java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss");

                    java.util.List<SlotDTO> slots = new java.util.ArrayList<>();

                    // request is by tipoLezione; templateId is intentionally not exposed in SlotDTO

                    // For each matching template generate slots
                    for (TipoLezioneDTO tpl : tplList) {
                        java.time.LocalTime oraIn = java.time.LocalTime.parse(tpl.getOraInizio(), timeFormatter);
                        java.time.LocalTime oraFine = java.time.LocalTime.parse(tpl.getOraFine(), timeFormatter);

                        java.time.DayOfWeek wanted = dayOfWeekFromItalian(tpl.getGiornoSettimana());
                        for (java.time.LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                            if (wanted != null && d.getDayOfWeek() != wanted) continue;

                            // cerca lezioni materializzate per questo template e data
                            java.sql.Date sqlDate = java.sql.Date.valueOf(d);
                            String sqlLez = "select id, data_inizio, data_fine, max_partecipanti from lezioni where template_id = ? and date(data_inizio) = ? and attiva = 1";
                            java.util.List<java.util.Map<String,Object>> found = jdbcTemplate.queryForList(sqlLez, tpl.getId(), sqlDate);

                            if (found != null && !found.isEmpty()) {
                                for (var row : found) {
                                    Long lezioneId = row.get("id") instanceof Number ? ((Number)row.get("id")).longValue() : Long.valueOf(row.get("id").toString());
                                    java.time.LocalDateTime dataInizio = null;
                                    Object di = row.get("data_inizio");
                                    if (di instanceof java.sql.Timestamp) dataInizio = ((java.sql.Timestamp)di).toLocalDateTime();
                                    else if (di instanceof java.time.LocalDateTime) dataInizio = (java.time.LocalDateTime)di;
                                    Integer maxP = row.get("max_partecipanti") != null ? ((Number)row.get("max_partecipanti")).intValue() : tpl.getMaxPartecipanti();

                                    Integer prenotati = jdbcTemplate.queryForObject("select count(*) from prenotazioni_lezioni where lezione_id = ? and attiva = 1", new Object[]{lezioneId}, Integer.class);

                                    SlotDTO s = new SlotDTO();
                                    // sempre esponiamo il templateId: necessario per operazioni lato client
                                    s.setTemplateId(tpl.getId());
                                    s.setLezioneId(lezioneId);
                                    s.setTitolo(tpl.getTitolo());
                                    s.setDataInizio(dataInizio);
                                    // try to compute dataFine from lezioni row or fallback to template time
                                    Object df = row.get("data_fine");
                                    if (df instanceof java.sql.Timestamp) s.setDataFine(((java.sql.Timestamp)df).toLocalDateTime());
                                    else if (df instanceof java.time.LocalDateTime) s.setDataFine((java.time.LocalDateTime)df);
                                    else s.setDataFine(java.time.LocalDateTime.of(d, oraFine));
                                    s.setMaxPartecipanti(maxP);
                                    int pren = prenotati != null ? prenotati : 0;
                                    s.setPrenotati(pren);
                                    Integer postiDisp = (maxP != null) ? (maxP - pren) : null;
                                    s.setPostiDisponibili(postiDisp);
                                    s.setMaterializzata(true);
                                    // only include slot if there are available seats (postiDisponibili > 0)
                                    if (postiDisp == null || postiDisp > 0) {
                                        slots.add(s);
                                    }
                                }
                            } else {
                                // slot generato dal template
                                SlotDTO s = new SlotDTO();
                                // Valorizziamo sempre templateId: il client usa questo valore per riferirsi al template
                                s.setTemplateId(tpl.getId());
                                s.setLezioneId(null);
                                s.setTitolo(tpl.getTitolo());
                                s.setDataInizio(java.time.LocalDateTime.of(d, oraIn));
                                s.setDataFine(java.time.LocalDateTime.of(d, oraFine));
                                s.setMaxPartecipanti(tpl.getMaxPartecipanti());
                                s.setPrenotati(0);
                                Integer postiDispTpl = tpl.getMaxPartecipanti();
                                s.setPostiDisponibili(postiDispTpl);
                                s.setMaterializzata(false);
                                // include generated slot only if template defines available seats (>0)
                                if (postiDispTpl == null || postiDispTpl > 0) {
                                    slots.add(s);
                                }
                            }
                        }
                    }

                    return ResponseEntity.ok(slots);
                } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.internalServerError().build();
                }
            }

            private java.time.DayOfWeek dayOfWeekFromItalian(String giorno) {
                if (giorno == null) return null;
                String g = giorno.trim().toUpperCase();
                return switch (g) {
                    case "LUNEDI", "LUNEDÌ" -> java.time.DayOfWeek.MONDAY;
                    case "MARTEDI", "MARTEDÌ" -> java.time.DayOfWeek.TUESDAY;
                    case "MERCOLEDI", "MERCOLEDÌ" -> java.time.DayOfWeek.WEDNESDAY;
                    case "GIOVEDI", "GIOVEDÌ" -> java.time.DayOfWeek.THURSDAY;
                    case "VENERDI", "VENERDÌ" -> java.time.DayOfWeek.FRIDAY;
                    case "SABATO" -> java.time.DayOfWeek.SATURDAY;
                    case "DOMENICA" -> java.time.DayOfWeek.SUNDAY;
                    default -> null;
                };
            }

            public static class SlotDTO {
                private Long templateId;
                private Long lezioneId;
                private String titolo;
                private java.time.LocalDateTime dataInizio;
                private java.time.LocalDateTime dataFine;
                private Integer maxPartecipanti;
                private Integer prenotati;
                private Integer postiDisponibili;
                private Boolean materializzata;

                public Long getTemplateId() { return templateId; }
                public void setTemplateId(Long templateId) { this.templateId = templateId; }
                public Long getLezioneId() { return lezioneId; }
                public void setLezioneId(Long lezioneId) { this.lezioneId = lezioneId; }
                public String getTitolo() { return titolo; }
                public void setTitolo(String titolo) { this.titolo = titolo; }
                public java.time.LocalDateTime getDataInizio() { return dataInizio; }
                public void setDataInizio(java.time.LocalDateTime dataInizio) { this.dataInizio = dataInizio; }
                public java.time.LocalDateTime getDataFine() { return dataFine; }
                public void setDataFine(java.time.LocalDateTime dataFine) { this.dataFine = dataFine; }
                public Integer getMaxPartecipanti() { return maxPartecipanti; }
                public void setMaxPartecipanti(Integer maxPartecipanti) { this.maxPartecipanti = maxPartecipanti; }
                public Integer getPrenotati() { return prenotati; }
                public void setPrenotati(Integer prenotati) { this.prenotati = prenotati; }
                public Integer getPostiDisponibili() { return postiDisponibili; }
                public void setPostiDisponibili(Integer postiDisponibili) { this.postiDisponibili = postiDisponibili; }
                public Boolean getMaterializzata() { return materializzata; }
                public void setMaterializzata(Boolean materializzata) { this.materializzata = materializzata; }
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
