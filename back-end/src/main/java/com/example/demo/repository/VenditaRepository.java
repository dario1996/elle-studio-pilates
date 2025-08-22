package com.example.demo.repository;

import com.example.demo.entity.Vendita;
import com.example.demo.entity.Vendita.StatoVendita;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Repository per gestire le operazioni CRUD sulla tabella vendite
 */
@Repository
public interface VenditaRepository extends JpaRepository<Vendita, Long> {

    // Query per trovare vendite per utente
    List<Vendita> findByUtenteUsernameOrderByDataAcquistoDesc(String username);

    // Query per trovare vendite per corso
    List<Vendita> findByCorsoIdOrderByDataAcquistoDesc(Long corsoId);

    // Query per trovare vendite per stato
    List<Vendita> findByStatoOrderByDataAcquistoDesc(StatoVendita stato);

    // Query per trovare vendite in un range di date
    List<Vendita> findByDataAcquistoBetweenOrderByDataAcquistoDesc(
            LocalDateTime dataInizio, 
            LocalDateTime dataFine
    );

    // Query per statistiche: totale vendite per mese
    @Query(value = """
        SELECT 
            YEAR(data_acquisto) as anno,
            MONTH(data_acquisto) as mese,
            COUNT(*) as numero_vendite,
            SUM(CASE WHEN stato = 'PAID' THEN importo ELSE 0 END) as ricavi_totali
        FROM vendite 
        WHERE data_acquisto >= :dataInizio 
        AND data_acquisto <= :dataFine
        GROUP BY YEAR(data_acquisto), MONTH(data_acquisto)
        ORDER BY anno DESC, mese DESC
        """, nativeQuery = true)
    List<Map<String, Object>> getStatisticheVenditePerMese(
            @Param("dataInizio") LocalDateTime dataInizio,
            @Param("dataFine") LocalDateTime dataFine
    );

    // Query per statistiche: vendite per corso
    @Query(value = """
        SELECT 
            c.nome as nome_corso,
            COUNT(*) as numero_vendite,
            SUM(CASE WHEN v.stato = 'PAID' THEN v.importo ELSE 0 END) as ricavi_totali,
            AVG(CASE WHEN v.stato = 'PAID' THEN v.importo ELSE NULL END) as ricavo_medio
        FROM vendite v
        JOIN corsi c ON v.corso_id = c.id
        WHERE v.data_acquisto >= :dataInizio 
        AND v.data_acquisto <= :dataFine
        GROUP BY c.id, c.nome
        ORDER BY ricavi_totali DESC
        """, nativeQuery = true)
    List<Map<String, Object>> getStatisticheVenditePerCorso(
            @Param("dataInizio") LocalDateTime dataInizio,
            @Param("dataFine") LocalDateTime dataFine
    );

    // Query per dashboard: ricavi totali
    @Query("SELECT COALESCE(SUM(v.importo), 0) FROM Vendita v WHERE v.stato = :stato")
    BigDecimal getTotaleRicavi(@Param("stato") StatoVendita stato);

    // Query per dashboard: ricavi del mese corrente
    @Query(value = """
        SELECT COALESCE(SUM(importo), 0) 
        FROM vendite 
        WHERE stato = 'PAID' 
        AND YEAR(data_acquisto) = YEAR(CURRENT_DATE)
        AND MONTH(data_acquisto) = MONTH(CURRENT_DATE)
        """, nativeQuery = true)
    BigDecimal getRicaviMeseCorrente();

    // Query per dashboard: numero vendite del mese
    @Query(value = """
        SELECT COUNT(*) 
        FROM vendite 
        WHERE YEAR(data_acquisto) = YEAR(CURRENT_DATE)
        AND MONTH(data_acquisto) = MONTH(CURRENT_DATE)
        """, nativeQuery = true)
    Long getNumeroVenditeMeseCorrente();

    // Query per dashboard: vendite pending
    Long countByStato(StatoVendita stato);

    // Query per trend: crescita mensile dei ricavi (ultimi 12 mesi)
    @Query(value = """
        SELECT 
            DATE_FORMAT(data_acquisto, '%Y-%m') as mese,
            SUM(CASE WHEN stato = 'PAID' THEN importo ELSE 0 END) as ricavi
        FROM vendite 
        WHERE data_acquisto >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(data_acquisto, '%Y-%m')
        ORDER BY mese ASC
        """, nativeQuery = true)
    List<Map<String, Object>> getTrendRicaviUltimi12Mesi();

    // Query per trend: numero vendite mensili (ultimi 12 mesi)
    @Query(value = """
        SELECT 
            DATE_FORMAT(data_acquisto, '%Y-%m') as mese,
            COUNT(*) as numero_vendite
        FROM vendite 
        WHERE data_acquisto >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(data_acquisto, '%Y-%m')
        ORDER BY mese ASC
        """, nativeQuery = true)
    List<Map<String, Object>> getTrendVenditeUltimi12Mesi();

    // Query per trovare le vendite più recenti con fetch delle relazioni
    @Query("SELECT v FROM Vendita v LEFT JOIN FETCH v.utente LEFT JOIN FETCH v.corso ORDER BY v.dataAcquisto DESC")
    List<Vendita> findTop10WithRelations(Pageable pageable);

    // Query per vendite di un utente in un range di date
    List<Vendita> findByUtenteUsernameAndDataAcquistoBetweenOrderByDataAcquistoDesc(
            String username, 
            LocalDateTime dataInizio, 
            LocalDateTime dataFine
    );

    // Query per verificare se un utente ha già acquistato un corso
    boolean existsByUtenteUsernameAndCorsoIdAndStato(String username, Long corsoId, StatoVendita stato);
}
