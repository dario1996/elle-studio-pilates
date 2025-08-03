package com.example.demo.repository;

import com.example.demo.entity.Corso;
import com.example.demo.entity.Piattaforma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CorsoRepository extends JpaRepository<Corso, Long> {

    // Find by platform
    List<Corso> findByPiattaforma(Piattaforma piattaforma);

    // Find by platform ID
    List<Corso> findByPiattaformaId(Long piattaformaId);

    // Find by status
    List<Corso> findByStato(Corso.StatoCorso stato);

    // Find by codice corso
    Optional<Corso> findByCodiceCorso(String codiceCorso);

    // Search by name (case insensitive)
    List<Corso> findByNomeContainingIgnoreCase(String nome);

    // Find courses by category
    List<Corso> findByCategoriaIgnoreCase(String categoria);

    // Find active courses (not suspended or cancelled)
    @Query("SELECT c FROM Corso c WHERE c.stato NOT IN ('SOSPESO', 'ANNULLATO')")
    List<Corso> findActiveCourses();

    // Find courses by platform and status
    List<Corso> findByPiattaformaIdAndStato(Long piattaformaId, Corso.StatoCorso stato);

    // Check if codice corso exists
    boolean existsByCodiceCorso(String codiceCorso);

    // Find courses requiring feedback
    List<Corso> findByFeedbackRichiestoTrue();

    // Find by LinkedIn content ID
    Optional<Corso> findByIdContenutoLinkedin(String idContenutoLinkedin);

    // Find by name and platform
    Optional<Corso> findByNomeAndPiattaforma(String nome, Piattaforma piattaforma);
}