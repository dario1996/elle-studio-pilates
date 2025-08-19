package com.example.demo.repository;

import com.example.demo.entity.Lezione;
import com.example.demo.enums.TipoLezione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LezioneRepository extends JpaRepository<Lezione, Long> {

    // Trova tutte le lezioni attive
    List<Lezione> findByAttivaTrue();

    // Trova lezioni per range di date
    @Query("SELECT l FROM Lezione l WHERE l.dataInizio >= :dataInizio AND l.dataFine <= :dataFine AND l.attiva = true")
    List<Lezione> findByDataRange(@Param("dataInizio") LocalDateTime dataInizio, 
                                  @Param("dataFine") LocalDateTime dataFine);

    // Trova lezioni per istruttore
    List<Lezione> findByIstruttoreContainingIgnoreCaseAndAttivaTrue(String istruttore);

    // Trova lezioni per tipo
    List<Lezione> findByTipoLezioneAndAttivaTrue(TipoLezione tipoLezione);

    // Cambia stato attiva/disattiva
    @Modifying
    @Query("UPDATE Lezione l SET l.attiva = :attiva, l.updatedAt = CURRENT_TIMESTAMP WHERE l.id = :id")
    int updateAttivaStatus(@Param("id") Long id, @Param("attiva") Boolean attiva);

    // Verifica conflitti di orario per lo stesso istruttore
    @Query("SELECT COUNT(l) FROM Lezione l WHERE l.istruttore = :istruttore AND l.attiva = true AND " +
           "((l.dataInizio <= :dataInizio AND l.dataFine > :dataInizio) OR " +
           "(l.dataInizio < :dataFine AND l.dataFine >= :dataFine) OR " +
           "(l.dataInizio >= :dataInizio AND l.dataFine <= :dataFine)) " +
           "AND (:lezioneId IS NULL OR l.id != :lezioneId)")
    int countConflittiOrario(@Param("istruttore") String istruttore,
                            @Param("dataInizio") LocalDateTime dataInizio,
                            @Param("dataFine") LocalDateTime dataFine,
                            @Param("lezioneId") Long lezioneId);
}
