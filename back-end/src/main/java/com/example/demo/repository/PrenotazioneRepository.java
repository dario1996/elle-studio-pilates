package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Lezione;
import com.example.demo.entity.Prenotazione;
import com.example.demo.entity.Utenti;

@Repository
public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {
    long countByLezioneAndAttivaTrue(Lezione lezione);

    boolean existsByLezioneAndUtenteAndAttivaTrue(Lezione lezione, Utenti utente);

    java.util.Optional<Prenotazione> findByLezioneAndUtenteAndAttivaTrue(Lezione lezione, Utenti utente);

    List<Prenotazione> findByUtenteAndAttivaTrue(Utenti utente);

    List<Prenotazione> findByLezioneAndAttivaTrue(Lezione lezione);

    List<Prenotazione> findByConsumataFalseAndAttivaTrueAndLezioneDataInizioBefore(LocalDateTime dataFine);
}
