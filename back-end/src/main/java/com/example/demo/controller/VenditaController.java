package com.example.demo.controller;

import com.example.demo.entity.Vendita;
import com.example.demo.entity.Vendita.StatoVendita;
import com.example.demo.service.VenditaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller REST per gestire le vendite e le statistiche
 */
@RestController
@RequestMapping("/api/vendite")
@PreAuthorize("hasRole('ADMIN')")
public class VenditaController {

    @Autowired
    private VenditaService venditaService;

    // ===== OPERAZIONI CRUD =====

    /**
     * Crea una nuova vendita
     */
    @PostMapping
    public ResponseEntity<Vendita> creaVendita(@RequestBody VenditaRequest request) {
        try {
            Vendita vendita = venditaService.creaVendita(
                    request.getUsername(),
                    request.getCorsoId(),
                    request.getImporto(),
                    request.getNote()
            );
            return ResponseEntity.ok(vendita);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ottiene una vendita per ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Vendita> getVendita(@PathVariable Long id) {
        Optional<Vendita> vendita = venditaService.trovaVenditaPerId(id);
        return vendita.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Aggiorna una vendita
     */
    @PutMapping("/{id}")
    public ResponseEntity<Vendita> aggiornaVendita(
            @PathVariable Long id,
            @RequestBody VenditaUpdateRequest request) {
        try {
            Vendita vendita = venditaService.aggiornaVendita(
                    id,
                    request.getImporto(),
                    request.getStato(),
                    request.getNote()
            );
            return ResponseEntity.ok(vendita);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Marca una vendita come pagata
     */
    @PutMapping("/{id}/paga")
    public ResponseEntity<Vendita> marcaComePagata(@PathVariable Long id) {
        try {
            Vendita vendita = venditaService.marcaComePagata(id);
            return ResponseEntity.ok(vendita);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cancella una vendita
     */
    @PutMapping("/{id}/cancella")
    public ResponseEntity<Vendita> cancellaVendita(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            Vendita vendita = venditaService.cancellaVendita(id, motivo);
            return ResponseEntity.ok(vendita);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Elimina una vendita
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminaVendita(@PathVariable Long id) {
        try {
            venditaService.eliminaVendita(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== RICERCHE E LISTE =====

    /**
     * Ottiene tutte le vendite con paginazione
     */
    @GetMapping
    public ResponseEntity<Page<Vendita>> getTutteLeVendite(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "dataAcquisto") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Vendita> vendite = venditaService.trovaTutteLeVendite(pageable);
        
        return ResponseEntity.ok(vendite);
    }

    /**
     * Ottiene vendite per utente
     */
    @GetMapping("/utente/{username}")
    public ResponseEntity<List<Vendita>> getVenditePerUtente(@PathVariable String username) {
        List<Vendita> vendite = venditaService.trovaVenditePerUtente(username);
        return ResponseEntity.ok(vendite);
    }

    /**
     * Ottiene vendite per corso
     */
    @GetMapping("/corso/{corsoId}")
    public ResponseEntity<List<Vendita>> getVenditePerCorso(@PathVariable Long corsoId) {
        List<Vendita> vendite = venditaService.trovaVenditePerCorso(corsoId);
        return ResponseEntity.ok(vendite);
    }

    /**
     * Ottiene vendite per stato
     */
    @GetMapping("/stato/{stato}")
    public ResponseEntity<List<Vendita>> getVenditePerStato(@PathVariable StatoVendita stato) {
        List<Vendita> vendite = venditaService.trovaVenditePerStato(stato);
        return ResponseEntity.ok(vendite);
    }

    /**
     * Ottiene vendite in un range di date
     */
    @GetMapping("/range")
    public ResponseEntity<List<Vendita>> getVenditeInRange(
            @RequestParam String dataInizio,
            @RequestParam String dataFine) {
        try {
            LocalDateTime dataInizioConverted = LocalDateTime.parse(dataInizio + "T00:00:00");
            LocalDateTime dataFineConverted = LocalDateTime.parse(dataFine + "T23:59:59");
            
            List<Vendita> vendite = venditaService.trovaVenditeInRange(dataInizioConverted, dataFineConverted);
            return ResponseEntity.ok(vendite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ottiene le ultime vendite
     */
    @GetMapping("/recenti")
    public ResponseEntity<List<Vendita>> getUltimeVendite() {
        List<Vendita> vendite = venditaService.trovaUltimeVendite();
        return ResponseEntity.ok(vendite);
    }

    // ===== STATISTICHE E DASHBOARD =====

    /**
     * Ottiene le statistiche complete per la pagina statistiche
     */
    @GetMapping("/statistiche")
    public ResponseEntity<Map<String, Object>> getStatisticheComplete(
            @RequestParam(defaultValue = "ultimo_anno") String periodo,
            @RequestParam(required = false) String dataInizio,
            @RequestParam(required = false) String dataFine) {
        try {
            LocalDateTime dataInizioConverted = null;
            LocalDateTime dataFineConverted = null;
            
            // Converti le date dal formato string (YYYY-MM-DD) a LocalDateTime
            if (dataInizio != null && !dataInizio.trim().isEmpty()) {
                dataInizioConverted = LocalDateTime.parse(dataInizio + "T00:00:00");
            }
            
            if (dataFine != null && !dataFine.trim().isEmpty()) {
                dataFineConverted = LocalDateTime.parse(dataFine + "T23:59:59");
            }
            
            Map<String, Object> stats = venditaService.getStatisticheComplete(periodo, dataInizioConverted, dataFineConverted);
            System.out.println("Stats generated successfully: " + (stats != null ? stats.size() + " keys" : "null"));
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error generating statistics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Ottiene le statistiche per la dashboard
     */
    @GetMapping("/statistiche/dashboard")
    public ResponseEntity<Map<String, Object>> getStatisticheDashboard() {
        Map<String, Object> stats = venditaService.getStatisticheDashboard();
        return ResponseEntity.ok(stats);
    }

    /**
     * Ottiene il trend dei ricavi per Chart.js
     */
    @GetMapping("/statistiche/trend-ricavi")
    public ResponseEntity<Map<String, Object>> getTrendRicavi() {
        Map<String, Object> trend = venditaService.getTrendRicavi();
        return ResponseEntity.ok(trend);
    }

    /**
     * Ottiene il trend delle vendite per Chart.js
     */
    @GetMapping("/statistiche/trend-vendite")
    public ResponseEntity<Map<String, Object>> getTrendVendite() {
        Map<String, Object> trend = venditaService.getTrendVendite();
        return ResponseEntity.ok(trend);
    }

    /**
     * Ottiene statistiche per mese in un range
     */
    @GetMapping("/statistiche/per-mese")
    public ResponseEntity<List<Map<String, Object>>> getStatistichePerMese(
            @RequestParam String dataInizio,
            @RequestParam String dataFine) {
        try {
            LocalDateTime dataInizioConverted = LocalDateTime.parse(dataInizio + "T00:00:00");
            LocalDateTime dataFineConverted = LocalDateTime.parse(dataFine + "T23:59:59");
            
            List<Map<String, Object>> stats = venditaService.getStatistichePerMese(dataInizioConverted, dataFineConverted);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ottiene statistiche per corso in un range
     */
    @GetMapping("/statistiche/per-corso")
    public ResponseEntity<List<Map<String, Object>>> getStatistichePerCorso(
            @RequestParam String dataInizio,
            @RequestParam String dataFine) {
        try {
            LocalDateTime dataInizioConverted = LocalDateTime.parse(dataInizio + "T00:00:00");
            LocalDateTime dataFineConverted = LocalDateTime.parse(dataFine + "T23:59:59");
            
            List<Map<String, Object>> stats = venditaService.getStatistichePerCorso(dataInizioConverted, dataFineConverted);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ottiene statistiche per periodo
     */
    @GetMapping("/statistiche/periodo")
    public ResponseEntity<Map<String, Object>> getStatistichePeriodo(
            @RequestParam String dataInizio,
            @RequestParam String dataFine) {
        try {
            LocalDateTime dataInizioConverted = LocalDateTime.parse(dataInizio + "T00:00:00");
            LocalDateTime dataFineConverted = LocalDateTime.parse(dataFine + "T23:59:59");
            
            Map<String, Object> stats = venditaService.getStatistichePeriodo(dataInizioConverted, dataFineConverted);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Verifica se un utente ha acquistato un corso
     */
    @GetMapping("/verifica/{username}/{corsoId}")
    public ResponseEntity<Map<String, Boolean>> verificaAcquisto(
            @PathVariable String username, 
            @PathVariable Long corsoId) {
        
        boolean haAcquistato = venditaService.utenteHaAcquistatoCorso(username, corsoId);
        return ResponseEntity.ok(Map.of("haAcquistato", haAcquistato));
    }

    // ===== DTO CLASSES =====

    /**
     * DTO per creare una nuova vendita
     */
    public static class VenditaRequest {
        private String username;
        private Long corsoId;
        private BigDecimal importo;
        private String note;

        // Getters e Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public Long getCorsoId() { return corsoId; }
        public void setCorsoId(Long corsoId) { this.corsoId = corsoId; }
        
        public BigDecimal getImporto() { return importo; }
        public void setImporto(BigDecimal importo) { this.importo = importo; }
        
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    /**
     * DTO per aggiornare una vendita
     */
    public static class VenditaUpdateRequest {
        private BigDecimal importo;
        private StatoVendita stato;
        private String note;

        // Getters e Setters
        public BigDecimal getImporto() { return importo; }
        public void setImporto(BigDecimal importo) { this.importo = importo; }
        
        public StatoVendita getStato() { return stato; }
        public void setStato(StatoVendita stato) { this.stato = stato; }
        
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }
}
