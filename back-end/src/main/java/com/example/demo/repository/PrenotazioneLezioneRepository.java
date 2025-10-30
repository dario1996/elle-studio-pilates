package com.example.demo.repository;

import com.example.demo.entity.PrenotazioneLezione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrenotazioneLezioneRepository extends JpaRepository<PrenotazioneLezione, Long> {

    /**
     * Trova tutte le prenotazioni attive di un utente
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.utente.username = :username AND p.stato = 'CONFERMATA' ORDER BY p.lezione.dataInizio DESC")
    List<PrenotazioneLezione> findPrenotazioniAttivaByUsername(@Param("username") String username);

    /**
     * Trova tutte le prenotazioni di un utente (anche cancellate)
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.utente.username = :username ORDER BY p.dataPrenotazione DESC")
    List<PrenotazioneLezione> findAllByUsername(@Param("username") String username);

    /**
     * Trova le prenotazioni future di un utente
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.utente.username = :username AND p.lezione.dataInizio > :now AND p.stato = 'CONFERMATA' ORDER BY p.lezione.dataInizio ASC")
    List<PrenotazioneLezione> findPrenotazioniFutureByUsername(@Param("username") String username, @Param("now") LocalDateTime now);

    /**
     * Trova le prenotazioni di una lezione specifica
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.lezione.id = :lezioneId AND p.stato = 'CONFERMATA'")
    List<PrenotazioneLezione> findByLezioneId(@Param("lezioneId") Long lezioneId);

    /**
     * Conta il numero di posti occupati per una lezione
     */
    @Query("SELECT COUNT(p) FROM PrenotazioneLezione p WHERE p.lezione.id = :lezioneId AND p.stato = 'CONFERMATA'")
    Long countPostiOccupatiByLezioneId(@Param("lezioneId") Long lezioneId);

    /**
     * Verifica se un utente ha già prenotato una specifica lezione
     */
    @Query("SELECT COUNT(p) > 0 FROM PrenotazioneLezione p WHERE p.lezione.id = :lezioneId AND p.utente.username = :username AND p.stato = 'CONFERMATA'")
    boolean existsPrenotazioneAttiva(@Param("lezioneId") Long lezioneId, @Param("username") String username);

    /**
     * Trova una prenotazione specifica attiva
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.lezione.id = :lezioneId AND p.utente.username = :username AND p.stato = 'CONFERMATA'")
    Optional<PrenotazioneLezione> findPrenotazioneAttiva(@Param("lezioneId") Long lezioneId, @Param("username") String username);

    /**
     * Trova le prenotazioni di un range di date per un utente
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.utente.username = :username AND p.lezione.dataInizio BETWEEN :dataInizio AND :dataFine AND p.stato = 'CONFERMATA' ORDER BY p.lezione.dataInizio ASC")
    List<PrenotazioneLezione> findByUsernameAndDateRange(
        @Param("username") String username, 
        @Param("dataInizio") LocalDateTime dataInizio, 
        @Param("dataFine") LocalDateTime dataFine
    );
}
