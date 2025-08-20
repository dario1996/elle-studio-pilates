package com.example.demo.repository;

import com.example.demo.entity.Corso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CorsoRepository extends JpaRepository<Corso, Long> {

    // Search by name (case insensitive)
    List<Corso> findByNomeContainingIgnoreCase(String nome);

    // Find courses by category
    List<Corso> findByCategoria(String categoria);

    // Find courses by level
    List<Corso> findByLivello(String livello);

    // Find active courses only
    List<Corso> findByAttivoTrue();

    // Find inactive courses only
    List<Corso> findByAttivoFalse();

    // Find courses by category and level
    List<Corso> findByCategoriaAndLivello(String categoria, String livello);

    // Find courses by price range
    @Query("SELECT c FROM Corso c WHERE c.prezzo BETWEEN :minPrezzo AND :maxPrezzo")
    List<Corso> findByPrezzoRange(Double minPrezzo, Double maxPrezzo);

    // Find by name and active status
    Optional<Corso> findByNomeAndAttivo(String nome, boolean attivo);

    // Find courses with max participants greater than or equal to value
    List<Corso> findByMaxPartecipantiGreaterThanEqual(Integer minPartecipanti);

    // Find courses by duration range
    @Query("SELECT c FROM Corso c WHERE c.durataMinuti BETWEEN :minDurata AND :maxDurata")
    List<Corso> findByDurataRange(Integer minDurata, Integer maxDurata);
}