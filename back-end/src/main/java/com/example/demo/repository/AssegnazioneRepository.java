package com.example.demo.repository;

import com.example.demo.entity.Assegnazione;
import com.example.demo.entity.Corso;
import com.example.demo.entity.Dipendente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssegnazioneRepository extends JpaRepository<Assegnazione, Long> {

    // Find assignments by employee
    List<Assegnazione> findByDipendente(Dipendente dipendente);

    // Find assignments by employee ID
    List<Assegnazione> findByDipendenteId(Long dipendenteId);

    // Find assignments by course
    List<Assegnazione> findByCorso(Corso corso);

    // Find assignments by course ID
    List<Assegnazione> findByCorsoId(Long corsoId);

    // Find assignments by status
    List<Assegnazione> findByStato(Assegnazione.StatoAssegnazione stato);

    // Find specific assignment by employee and course
    Optional<Assegnazione> findByDipendenteAndCorso(Dipendente dipendente, Corso corso);

    // Find specific assignment by employee ID and course ID
    Optional<Assegnazione> findByDipendenteIdAndCorsoId(Long dipendenteId, Long corsoId);

    // Find completed assignments
    List<Assegnazione> findByStatoAndDataCompletamentoIsNotNull(Assegnazione.StatoAssegnazione stato);

    // Find mandatory assignments
    List<Assegnazione> findByObbligatorioTrue();

    // Find assignments requiring feedback
    @Query("SELECT a FROM Assegnazione a WHERE a.corso.feedbackRichiesto = true AND a.feedbackFornito = false AND a.stato = 'COMPLETATO'")
    List<Assegnazione> findCompletedAssignmentsRequiringFeedback();

    // Check if assignment already exists
    boolean existsByDipendenteIdAndCorsoId(Long dipendenteId, Long corsoId);
}