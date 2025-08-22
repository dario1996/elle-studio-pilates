package com.example.demo.service;

import com.example.demo.entity.Corso;
import com.example.demo.entity.Utenti;
import com.example.demo.entity.Vendita;
import com.example.demo.entity.Vendita.StatoVendita;
import com.example.demo.repository.CorsoRepository;
import com.example.demo.repository.UtenteRepository;
import com.example.demo.repository.VenditaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service per gestire le operazioni di business relative alle vendite
 */
@Service
@Transactional
public class VenditaService {

    @Autowired
    private VenditaRepository venditaRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private CorsoRepository corsoRepository;

    // ===== OPERAZIONI CRUD =====

    /**
     * Crea una nuova vendita
     */
    public Vendita creaVendita(String username, Long corsoId, BigDecimal importo, String note) {
        Utenti utente = utenteRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Utente non trovato con username: " + username));
        
        Corso corso = corsoRepository.findById(corsoId)
                .orElseThrow(() -> new RuntimeException("Corso non trovato con ID: " + corsoId));

        Vendita vendita = new Vendita(utente, corso, importo);
        vendita.setNote(note);
        
        return venditaRepository.save(vendita);
    }

    /**
     * Trova vendita per ID
     */
    @Transactional(readOnly = true)
    public Optional<Vendita> trovaVenditaPerId(Long id) {
        return venditaRepository.findById(id);
    }

    /**
     * Aggiorna una vendita
     */
    public Vendita aggiornaVendita(Long id, BigDecimal importo, StatoVendita stato, String note) {
        Vendita vendita = venditaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendita non trovata con ID: " + id));

        if (importo != null) {
            vendita.setImporto(importo);
        }
        
        if (stato != null && stato != vendita.getStato()) {
            vendita.setStato(stato);
            if (stato == StatoVendita.PAID && vendita.getDataPagamento() == null) {
                vendita.setDataPagamento(LocalDateTime.now());
            }
        }
        
        if (note != null) {
            vendita.setNote(note);
        }

        return venditaRepository.save(vendita);
    }

    /**
     * Marca una vendita come pagata
     */
    public Vendita marcaComePagata(Long venditaId) {
        Vendita vendita = venditaRepository.findById(venditaId)
                .orElseThrow(() -> new RuntimeException("Vendita non trovata con ID: " + venditaId));

        vendita.marcaComePagata();
        return venditaRepository.save(vendita);
    }

    /**
     * Cancella una vendita
     */
    public Vendita cancellaVendita(Long venditaId, String motivo) {
        Vendita vendita = venditaRepository.findById(venditaId)
                .orElseThrow(() -> new RuntimeException("Vendita non trovata con ID: " + venditaId));

        vendita.cancella(motivo);
        return venditaRepository.save(vendita);
    }

    /**
     * Elimina una vendita
     */
    public void eliminaVendita(Long id) {
        if (!venditaRepository.existsById(id)) {
            throw new RuntimeException("Vendita non trovata con ID: " + id);
        }
        venditaRepository.deleteById(id);
    }

    // ===== QUERY E RICERCHE =====

    /**
     * Trova tutte le vendite con paginazione
     */
    @Transactional(readOnly = true)
    public Page<Vendita> trovaTutteLeVendite(Pageable pageable) {
        return venditaRepository.findAll(pageable);
    }

    /**
     * Trova vendite per utente
     */
    @Transactional(readOnly = true)
    public List<Vendita> trovaVenditePerUtente(String username) {
        return venditaRepository.findByUtenteUsernameOrderByDataAcquistoDesc(username);
    }

    /**
     * Trova vendite per corso
     */
    @Transactional(readOnly = true)
    public List<Vendita> trovaVenditePerCorso(Long corsoId) {
        return venditaRepository.findByCorsoIdOrderByDataAcquistoDesc(corsoId);
    }

    /**
     * Trova vendite per stato
     */
    @Transactional(readOnly = true)
    public List<Vendita> trovaVenditePerStato(StatoVendita stato) {
        return venditaRepository.findByStatoOrderByDataAcquistoDesc(stato);
    }

    /**
     * Trova vendite in un range di date
     */
    @Transactional(readOnly = true)
    public List<Vendita> trovaVenditeInRange(LocalDateTime dataInizio, LocalDateTime dataFine) {
        return venditaRepository.findByDataAcquistoBetweenOrderByDataAcquistoDesc(dataInizio, dataFine);
    }

    /**
     * Trova le ultime vendite
     */
    @Transactional(readOnly = true)
    public List<Vendita> trovaUltimeVendite() {
        Pageable topTen = PageRequest.of(0, 10);
        return venditaRepository.findTop10WithRelations(topTen);
    }

    // ===== STATISTICHE E DASHBOARD =====

    /**
     * Ottiene le statistiche complete per la pagina statistiche frontend (versione con filtri)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatisticheComplete(String periodo, LocalDateTime dataInizio, LocalDateTime dataFine) {
        System.out.println("Starting getStatisticheComplete() with filters: periodo=" + periodo + ", dataInizio=" + dataInizio + ", dataFine=" + dataFine);
        
        // Calcola il range di date basato sul periodo
        LocalDateTime[] dateRange = calcolaRangePeriodo(periodo, dataInizio, dataFine);
        LocalDateTime inizioPeriodo = dateRange[0];
        LocalDateTime finePeriodo = dateRange[1];
        
        System.out.println("Calculated date range: " + inizioPeriodo + " to " + finePeriodo);
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Statistiche filtrate per il periodo selezionato
            List<Vendita> venditeDelPeriodo = venditaRepository.findByDataAcquistoBetweenOrderByDataAcquistoDesc(inizioPeriodo, finePeriodo);
            
            // Totale fatturato del periodo (vendite pagate)
            System.out.println("Getting totale fatturato per periodo");
            BigDecimal totaleFatturatoPeriodo = venditeDelPeriodo.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .map(Vendita::getImporto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.put("totaleFatturato", totaleFatturatoPeriodo);
            System.out.println("Totale fatturato periodo: " + totaleFatturatoPeriodo);
            
            // Totale vendite del periodo
            System.out.println("Getting totale vendite per periodo");
            Long totaleVenditePeriodo = venditeDelPeriodo.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .count();
            stats.put("totaleVendite", totaleVenditePeriodo);
            System.out.println("Totale vendite periodo: " + totaleVenditePeriodo);
            
            // Calcola statistiche specifiche per periodo
            if ("ultimo_mese".equals(periodo)) {
                // Per ultimo mese: mostra dati del mese corrente
                stats.put("venditeMese", totaleVenditePeriodo);
                stats.put("fatturateMese", totaleFatturatoPeriodo);
            } else if ("ultima_settimana".equals(periodo)) {
                // Per ultima settimana: mostra dati della settimana
                stats.put("venditeMese", totaleVenditePeriodo);
                stats.put("fatturateMese", totaleFatturatoPeriodo);
            } else {
                // Per altri periodi: calcola medie mensili
                long giorniPeriodo = java.time.Duration.between(inizioPeriodo, finePeriodo).toDays();
                long mesiApprossimativi = Math.max(1, giorniPeriodo / 30);
                
                Long venditeMediaMensili = totaleVenditePeriodo / mesiApprossimativi;
                BigDecimal fatturatoMedioMensile = mesiApprossimativi > 0 ? 
                    totaleFatturatoPeriodo.divide(BigDecimal.valueOf(mesiApprossimativi), 2, BigDecimal.ROUND_HALF_UP) : 
                    BigDecimal.ZERO;
                
                stats.put("venditeMese", venditeMediaMensili);
                stats.put("fatturateMese", fatturatoMedioMensile);
            }
            
            // Media vendita giornaliera del periodo
            long giorniTotali = Math.max(1, java.time.Duration.between(inizioPeriodo, finePeriodo).toDays());
            BigDecimal mediaGiornaliera = giorniTotali > 0 ? 
                totaleFatturatoPeriodo.divide(BigDecimal.valueOf(giorniTotali), 2, BigDecimal.ROUND_HALF_UP) : 
                BigDecimal.ZERO;
            stats.put("mediaVenditaGiornaliera", mediaGiornaliera);
            
            // Andamento basato sul periodo selezionato
            List<Map<String, Object>> andamentoMensile = calcolaAndamentoPeriodo(periodo, inizioPeriodo, finePeriodo);
            stats.put("andamentoMensile", andamentoMensile);
            
            // Distribuzione prodotti (top corsi venduti)
            List<Map<String, Object>> distribuzioneProdotti = new ArrayList<>();
            // TODO: implementare query per top corsi venduti
            stats.put("distribuzioneProdotti", distribuzioneProdotti);
            
            // Vendite per stato
            System.out.println("Getting vendite per stato");
            List<Map<String, Object>> venditePerStato = new ArrayList<>();
            Long paid = venditaRepository.countByStato(StatoVendita.PAID);
            Long pending = venditaRepository.countByStato(StatoVendita.PENDING);
            Long cancelled = venditaRepository.countByStato(StatoVendita.CANCELLED);
            Long totale = paid + pending + cancelled;
            
            if (totale > 0) {
                Map<String, Object> paidStats = new HashMap<>();
                paidStats.put("stato", "PAID");
                paidStats.put("count", paid);
                paidStats.put("percentuale", (paid * 100.0) / totale);
                venditePerStato.add(paidStats);
                
                Map<String, Object> pendingStats = new HashMap<>();
                pendingStats.put("stato", "PENDING");
                pendingStats.put("count", pending);
                pendingStats.put("percentuale", (pending * 100.0) / totale);
                venditePerStato.add(pendingStats);
                
                Map<String, Object> cancelledStats = new HashMap<>();
                cancelledStats.put("stato", "CANCELLED");
                cancelledStats.put("count", cancelled);
                cancelledStats.put("percentuale", (cancelled * 100.0) / totale);
                venditePerStato.add(cancelledStats);
            }
            stats.put("venditePerStato", venditePerStato);
            
            // Vendite più recenti (ultime 10) - usiamo solo i dati essenziali per evitare problemi di serializzazione
            System.out.println("Getting vendite recenti");
            Pageable topTen = PageRequest.of(0, 10);
            List<Vendita> venditeRecenti = venditaRepository.findTop10WithRelations(topTen);
            List<Map<String, Object>> venditeRecentiDTO = venditeRecenti.stream()
                .map(v -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", v.getId());
                    dto.put("importo", v.getImporto());
                    dto.put("stato", v.getStato().toString());
                    dto.put("dataAcquisto", v.getDataAcquisto());
                    dto.put("dataPagamento", v.getDataPagamento());
                    dto.put("utenteId", v.getUtente() != null ? v.getUtente().getUsername() : null);
                    dto.put("corsoId", v.getCorso() != null ? v.getCorso().getId() : null);
                    dto.put("corsoNome", v.getCorso() != null ? v.getCorso().getNome() : null);
                    dto.put("note", v.getNote());
                    return dto;
                })
                .collect(Collectors.toList());
            stats.put("venditePiuRecenti", venditeRecentiDTO);
            
            System.out.println("Completed getStatisticheComplete() with " + stats.size() + " keys");
            return stats;
        } catch (Exception e) {
            System.err.println("Error in getStatisticheComplete(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Calcola il range di date basato sul periodo
     */
    private LocalDateTime[] calcolaRangePeriodo(String periodo, LocalDateTime dataInizio, LocalDateTime dataFine) {
        LocalDateTime inizio;
        LocalDateTime fine = LocalDateTime.now();
        
        if ("ultimo_mese".equals(periodo)) {
            // Solo il mese corrente (dal primo giorno del mese corrente)
            YearMonth meseCorrente = YearMonth.now();
            inizio = meseCorrente.atDay(1).atStartOfDay();
            fine = meseCorrente.atEndOfMonth().atTime(23, 59, 59);
        } else if ("ultima_settimana".equals(periodo)) {
            // Ultimi 7 giorni
            inizio = fine.minusDays(7).toLocalDate().atStartOfDay();
            fine = fine.toLocalDate().atTime(23, 59, 59);
        } else if ("ultimi_3_mesi".equals(periodo)) {
            // Ultimi 3 mesi completi
            YearMonth meseCorrente = YearMonth.now();
            YearMonth treeMesiDa = meseCorrente.minusMonths(2); // 2 mesi fa + mese corrente = 3 mesi
            inizio = treeMesiDa.atDay(1).atStartOfDay();
            fine = meseCorrente.atEndOfMonth().atTime(23, 59, 59);
        } else if ("ultimo_anno".equals(periodo)) {
            inizio = fine.minusYears(1);
        } else if ("personalizzato".equals(periodo) && dataInizio != null && dataFine != null) {
            inizio = dataInizio;
            fine = dataFine;
        } else {
            // Default: ultimo anno
            inizio = fine.minusYears(1);
        }
        
        return new LocalDateTime[]{inizio, fine};
    }

    /**
     * Calcola l'andamento basato sul periodo selezionato
     */
    private List<Map<String, Object>> calcolaAndamentoPeriodo(String periodo, LocalDateTime inizioPeriodo, LocalDateTime finePeriodo) {
        List<Map<String, Object>> andamento = new ArrayList<>();
        
        if ("ultimo_mese".equals(periodo) || "ultima_settimana".equals(periodo)) {
            // Per ultimo mese o ultima settimana, mostra dati giornalieri
            return calcolaAndamentoGiornaliero(inizioPeriodo, finePeriodo);
        } else if ("ultimi_3_mesi".equals(periodo)) {
            // Per ultimi 3 mesi, mostra dati mensili aggregati
            return calcolaAndamentoMensile(inizioPeriodo, finePeriodo);
        } else {
            // Per anno/personalizzato, mostra dati mensili
            return calcolaAndamentoMensile(inizioPeriodo, finePeriodo);
        }
    }

    /**
     * Calcola l'andamento giornaliero
     */
    private List<Map<String, Object>> calcolaAndamentoGiornaliero(LocalDateTime inizio, LocalDateTime fine) {
        List<Map<String, Object>> andamento = new ArrayList<>();
        
        LocalDateTime dataCorrente = inizio.toLocalDate().atStartOfDay();
        while (!dataCorrente.isAfter(fine)) {
            LocalDateTime inizioGiorno = dataCorrente;
            LocalDateTime fineGiorno = dataCorrente.toLocalDate().atTime(23, 59, 59);
            
            List<Vendita> venditeDelGiorno = venditaRepository.findByDataAcquistoBetweenOrderByDataAcquistoDesc(inizioGiorno, fineGiorno);
            
            long numeroVendite = venditeDelGiorno.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .count();
                
            BigDecimal fatturato = venditeDelGiorno.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .map(Vendita::getImporto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> datiGiorno = new HashMap<>();
            // Se è una settimana, mostra anche il giorno della settimana
            long giorni = java.time.Duration.between(inizio, fine).toDays();
            if (giorni <= 7) {
                String giornoSettimana = getGiornoSettimanaItaliano(dataCorrente.getDayOfWeek().getValue());
                datiGiorno.put("mese", giornoSettimana + " " + dataCorrente.getDayOfMonth());
            } else {
                datiGiorno.put("mese", dataCorrente.getDayOfMonth() + " " + getMeseNomeItaliano(dataCorrente.getMonthValue()));
            }
            datiGiorno.put("vendite", numeroVendite);
            datiGiorno.put("fatturato", fatturato);
            andamento.add(datiGiorno);
            
            dataCorrente = dataCorrente.plusDays(1);
        }
        
        return andamento;
    }

    /**
     * Calcola l'andamento mensile
     */
    private List<Map<String, Object>> calcolaAndamentoMensile(LocalDateTime inizio, LocalDateTime fine) {
        List<Map<String, Object>> andamento = new ArrayList<>();
        
        YearMonth meseInizio = YearMonth.from(inizio);
        YearMonth meseFine = YearMonth.from(fine);
        
        YearMonth meseCorrente = meseInizio;
        while (!meseCorrente.isAfter(meseFine)) {
            LocalDateTime inizioMese = meseCorrente.atDay(1).atStartOfDay();
            LocalDateTime fineMese = meseCorrente.atEndOfMonth().atTime(23, 59, 59);
            
            List<Vendita> venditeDelMese = venditaRepository.findByDataAcquistoBetweenOrderByDataAcquistoDesc(inizioMese, fineMese);
            
            long numeroVendite = venditeDelMese.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .count();
                
            BigDecimal fatturato = venditeDelMese.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .map(Vendita::getImporto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> datiMese = new HashMap<>();
            datiMese.put("mese", getMeseNomeItaliano(meseCorrente.getMonthValue()) + " " + meseCorrente.getYear());
            datiMese.put("vendite", numeroVendite);
            datiMese.put("fatturato", fatturato);
            andamento.add(datiMese);
            
            meseCorrente = meseCorrente.plusMonths(1);
        }
        
        return andamento;
    }

    /**
     * Ottiene le statistiche complete per la pagina statistiche frontend
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatisticheComplete() {
        System.out.println("Starting getStatisticheComplete()");
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Totale fatturato (vendite pagate)
            System.out.println("Getting totale fatturato");
            BigDecimal totaleFatturato = venditaRepository.getTotaleRicavi(StatoVendita.PAID);
            stats.put("totaleFatturato", totaleFatturato != null ? totaleFatturato : BigDecimal.ZERO);
            System.out.println("Totale fatturato: " + totaleFatturato);
            
            // Totale vendite
            System.out.println("Getting totale vendite");
            Long totaleVendite = venditaRepository.countByStato(StatoVendita.PAID);
            stats.put("totaleVendite", totaleVendite != null ? totaleVendite : 0L);
            System.out.println("Totale vendite: " + totaleVendite);
            
            // Vendite del mese corrente
            System.out.println("Getting vendite mese");
            Long venditeMese = venditaRepository.getNumeroVenditeMeseCorrente();
            stats.put("venditeMese", venditeMese != null ? venditeMese : 0L);
            System.out.println("Vendite mese: " + venditeMese);
            
            // Fatturato del mese corrente
            System.out.println("Getting fatturato mese");
            BigDecimal fatturateMese = venditaRepository.getRicaviMeseCorrente();
            stats.put("fatturateMese", fatturateMese != null ? fatturateMese : BigDecimal.ZERO);
            System.out.println("Fatturato mese: " + fatturateMese);
            
            // Media vendita giornaliera (fatturato totale / 30 giorni)
            BigDecimal mediaGiornaliera = totaleFatturato != null ? 
                totaleFatturato.divide(BigDecimal.valueOf(30), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
            stats.put("mediaVenditaGiornaliera", mediaGiornaliera);
            
        // Andamento mensile (ultimi 12 mesi) - ora con dati reali
        System.out.println("Calculating andamento mensile...");
        List<Map<String, Object>> andamentoMensile = new ArrayList<>();
        YearMonth meseCorrente = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth mese = meseCorrente.minusMonths(i);
            
            // Calcola i dati per questo mese
            LocalDateTime inizioMese = mese.atDay(1).atStartOfDay();
            LocalDateTime fineMese = mese.atEndOfMonth().atTime(23, 59, 59);
            
            System.out.println("Checking month: " + mese + " from " + inizioMese + " to " + fineMese);
            
            List<Vendita> venditeDelMese = venditaRepository.findByDataAcquistoBetweenOrderByDataAcquistoDesc(inizioMese, fineMese);
            System.out.println("Found " + venditeDelMese.size() + " vendite for month " + mese);
            
            long numeroVendite = venditeDelMese.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .count();
                
            BigDecimal fatturato = venditeDelMese.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .map(Vendita::getImporto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            System.out.println("Month " + mese + ": " + numeroVendite + " vendite, fatturato: " + fatturato);
            
            Map<String, Object> datiMese = new HashMap<>();
            datiMese.put("mese", getMeseNomeItaliano(mese.getMonthValue()) + " " + mese.getYear());
            datiMese.put("vendite", numeroVendite);
            datiMese.put("fatturato", fatturato);
            andamentoMensile.add(datiMese);
        }
        stats.put("andamentoMensile", andamentoMensile);            // Distribuzione prodotti (top corsi venduti)
            List<Map<String, Object>> distribuzioneProdotti = new ArrayList<>();
            // TODO: implementare query per top corsi venduti
            stats.put("distribuzioneProdotti", distribuzioneProdotti);
            
            // Vendite per stato
            System.out.println("Getting vendite per stato");
            List<Map<String, Object>> venditePerStato = new ArrayList<>();
            Long paid = venditaRepository.countByStato(StatoVendita.PAID);
            Long pending = venditaRepository.countByStato(StatoVendita.PENDING);
            Long cancelled = venditaRepository.countByStato(StatoVendita.CANCELLED);
            Long totale = paid + pending + cancelled;
            
            if (totale > 0) {
                Map<String, Object> paidStats = new HashMap<>();
                paidStats.put("stato", "PAID");
                paidStats.put("count", paid);
                paidStats.put("percentuale", (paid * 100.0) / totale);
                venditePerStato.add(paidStats);
                
                Map<String, Object> pendingStats = new HashMap<>();
                pendingStats.put("stato", "PENDING");
                pendingStats.put("count", pending);
                pendingStats.put("percentuale", (pending * 100.0) / totale);
                venditePerStato.add(pendingStats);
                
                Map<String, Object> cancelledStats = new HashMap<>();
                cancelledStats.put("stato", "CANCELLED");
                cancelledStats.put("count", cancelled);
                cancelledStats.put("percentuale", (cancelled * 100.0) / totale);
                venditePerStato.add(cancelledStats);
            }
            stats.put("venditePerStato", venditePerStato);
            
            // Vendite più recenti (ultime 10) - usiamo solo i dati essenziali per evitare problemi di serializzazione
            System.out.println("Getting vendite recenti");
            Pageable topTen = PageRequest.of(0, 10);
            List<Vendita> venditeRecenti = venditaRepository.findTop10WithRelations(topTen);
            List<Map<String, Object>> venditeRecentiDTO = venditeRecenti.stream()
                .map(v -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", v.getId());
                    dto.put("importo", v.getImporto());
                    dto.put("stato", v.getStato().toString());
                    dto.put("dataAcquisto", v.getDataAcquisto());
                    dto.put("dataPagamento", v.getDataPagamento());
                    dto.put("utenteId", v.getUtente() != null ? v.getUtente().getUsername() : null);
                    dto.put("corsoId", v.getCorso() != null ? v.getCorso().getId() : null);
                    dto.put("corsoNome", v.getCorso() != null ? v.getCorso().getNome() : null);
                    dto.put("note", v.getNote());
                    return dto;
                })
                .collect(Collectors.toList());
            stats.put("venditePiuRecenti", venditeRecentiDTO);
            
            System.out.println("Completed getStatisticheComplete() with " + stats.size() + " keys");
            return stats;
        } catch (Exception e) {
            System.err.println("Error in getStatisticheComplete(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Ottiene le statistiche per la dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatisticheDashboard() {
        Map<String, Object> stats = new HashMap<>();
        
        // Ricavi totali
        BigDecimal ricaviTotali = venditaRepository.getTotaleRicavi(StatoVendita.PAID);
        stats.put("ricaviTotali", ricaviTotali != null ? ricaviTotali : BigDecimal.ZERO);
        
        // Ricavi del mese corrente
        BigDecimal ricaviMese = venditaRepository.getRicaviMeseCorrente();
        stats.put("ricaviMeseCorrente", ricaviMese != null ? ricaviMese : BigDecimal.ZERO);
        
        // Numero vendite del mese
        Long venditeMessu = venditaRepository.getNumeroVenditeMeseCorrente();
        stats.put("venditeMessa", venditeMessu != null ? venditeMessu : 0L);
        
        // Vendite in attesa
        Long venditePending = venditaRepository.countByStato(StatoVendita.PENDING);
        stats.put("venditePending", venditePending != null ? venditePending : 0L);
        
        return stats;
    }

    /**
     * Ottiene le statistiche vendite per mese in un range
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStatistichePerMese(LocalDateTime dataInizio, LocalDateTime dataFine) {
        return venditaRepository.getStatisticheVenditePerMese(dataInizio, dataFine);
    }

    /**
     * Ottiene le statistiche vendite per corso in un range
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStatistichePerCorso(LocalDateTime dataInizio, LocalDateTime dataFine) {
        return venditaRepository.getStatisticheVenditePerCorso(dataInizio, dataFine);
    }

    /**
     * Ottiene il trend dei ricavi degli ultimi 12 mesi per Chart.js
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTrendRicavi() {
        List<Map<String, Object>> datiRaw = venditaRepository.getTrendRicaviUltimi12Mesi();
        
        // Prepara i dati per Chart.js
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();
        
        // Crea una mappa per accesso veloce ai dati
        Map<String, BigDecimal> datiMappa = new HashMap<>();
        for (Map<String, Object> riga : datiRaw) {
            String mese = (String) riga.get("mese");
            BigDecimal ricavi = (BigDecimal) riga.get("ricavi");
            datiMappa.put(mese, ricavi != null ? ricavi : BigDecimal.ZERO);
        }
        
        // Genera etichette per ultimi 12 mesi
        YearMonth meseCorrente = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth mese = meseCorrente.minusMonths(i);
            String meseKey = mese.toString();
            labels.add(getMeseNomeItaliano(mese.getMonthValue()) + " " + mese.getYear());
            data.add(datiMappa.getOrDefault(meseKey, BigDecimal.ZERO));
        }
        
        Map<String, Object> risultato = new HashMap<>();
        risultato.put("labels", labels);
        risultato.put("data", data);
        
        return risultato;
    }

    /**
     * Ottiene il trend del numero di vendite degli ultimi 12 mesi per Chart.js
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTrendVendite() {
        List<Map<String, Object>> datiRaw = venditaRepository.getTrendVenditeUltimi12Mesi();
        
        // Prepara i dati per Chart.js
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();
        
        // Crea una mappa per accesso veloce ai dati
        Map<String, Long> datiMappa = new HashMap<>();
        for (Map<String, Object> riga : datiRaw) {
            String mese = (String) riga.get("mese");
            Number numeroVendite = (Number) riga.get("numero_vendite");
            datiMappa.put(mese, numeroVendite != null ? numeroVendite.longValue() : 0L);
        }
        
        // Genera etichette per ultimi 12 mesi
        YearMonth meseCorrente = YearMonth.now();
        for (int i = 11; i >= 0; i--) {
            YearMonth mese = meseCorrente.minusMonths(i);
            String meseKey = mese.toString();
            labels.add(getMeseNomeItaliano(mese.getMonthValue()) + " " + mese.getYear());
            data.add(datiMappa.getOrDefault(meseKey, 0L));
        }
        
        Map<String, Object> risultato = new HashMap<>();
        risultato.put("labels", labels);
        risultato.put("data", data);
        
        return risultato;
    }

    // ===== METODI DI UTILITÀ =====

    /**
     * Verifica se un utente ha già acquistato un corso
     */
    @Transactional(readOnly = true)
    public boolean utenteHaAcquistatoCorso(String username, Long corsoId) {
        return venditaRepository.existsByUtenteUsernameAndCorsoIdAndStato(username, corsoId, StatoVendita.PAID);
    }

    /**
     * Converte numero mese in nome italiano
     */
    private String getMeseNomeItaliano(int mese) {
        String[] nomiMesi = {
            "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
            "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
        };
        return nomiMesi[mese - 1];
    }

    /**
     * Converte giorno della settimana in nome italiano
     */
    private String getGiornoSettimanaItaliano(int giorno) {
        String[] nomiGiorni = {
            "Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"
        };
        return nomiGiorni[giorno - 1];
    }

    /**
     * Ottiene statistiche rapide per periodo
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistichePeriodo(LocalDateTime dataInizio, LocalDateTime dataFine) {
        List<Vendita> vendite = trovaVenditeInRange(dataInizio, dataFine);
        
        Map<String, Object> stats = new HashMap<>();
        
        long totaleVendite = vendite.size();
        long venditePagate = vendite.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .count();
        
        BigDecimal ricaviTotali = vendite.stream()
                .filter(v -> v.getStato() == StatoVendita.PAID)
                .map(Vendita::getImporto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal ricavoMedio = venditePagate > 0 ? 
                ricaviTotali.divide(BigDecimal.valueOf(venditePagate), 2, BigDecimal.ROUND_HALF_UP) : 
                BigDecimal.ZERO;
        
        stats.put("totaleVendite", totaleVendite);
        stats.put("venditePagate", venditePagate);
        stats.put("ricaviTotali", ricaviTotali);
        stats.put("ricavoMedio", ricavoMedio);
        
        return stats;
    }
}
