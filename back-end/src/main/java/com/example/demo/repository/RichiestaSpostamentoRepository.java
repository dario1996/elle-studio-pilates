package com.example.demo.repository;

import com.example.demo.entity.RichiestaSpostamento;
import com.example.demo.entity.RichiestaSpostamento.StatoRichiesta;
import com.example.demo.entity.PrenotazioneLezione;
import com.example.demo.entity.Utenti;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RichiestaSpostamentoRepository extends JpaRepository<RichiestaSpostamento, Long> {

    /**
     * Trova tutte le richieste di un utente
     */
    List<RichiestaSpostamento> findByUtenteOrderByDataCreazioneDesc(Utenti utente);

    /**
     * Trova le richieste pending
     */
    List<RichiestaSpostamento> findByStatoOrderByDataCreazioneAsc(StatoRichiesta stato);

    /**
     * Trova la richiesta pending per una prenotazione specifica
     */
    Optional<RichiestaSpostamento> findByPrenotazioneAndStato(PrenotazioneLezione prenotazione, StatoRichiesta stato);

    /**
     * Verifica se esiste già una richiesta pending per una prenotazione
     */
    @Query("SELECT COUNT(r) > 0 FROM RichiestaSpostamento r WHERE r.prenotazione = :prenotazione AND r.stato = 'PENDING'")
    boolean existsPendingRequest(@Param("prenotazione") PrenotazioneLezione prenotazione);

    /**
     * Trova tutte le richieste per una prenotazione
     */
    List<RichiestaSpostamento> findByPrenotazioneOrderByDataCreazioneDesc(PrenotazioneLezione prenotazione);

    /**
     * Trova TUTTE le richieste ordinate per data (per admin)
     */
    List<RichiestaSpostamento> findAllByOrderByDataCreazioneDesc();
}
