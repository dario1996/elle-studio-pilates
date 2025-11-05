package com.example.demo.repository;

import com.example.demo.entity.Pacchetto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PacchettoRepository extends JpaRepository<Pacchetto, Long> {

    // Search by name (case insensitive)
    List<Pacchetto> findByNomeContainingIgnoreCase(String nome);

    // Find courses by category
    List<Pacchetto> findByCategoria(String categoria);

    // Find courses by level
    List<Pacchetto> findByLivello(String livello);

    // Find active courses only
    List<Pacchetto> findByAttivoTrue();

    // Find inactive courses only
    List<Pacchetto> findByAttivoFalse();

    // Find courses by category and level
    List<Pacchetto> findByCategoriaAndLivello(String categoria, String livello);

    // Find courses by price range
    @Query("SELECT c FROM Pacchetto c WHERE c.prezzo BETWEEN :minPrezzo AND :maxPrezzo")
    List<Pacchetto> findByPrezzoRange(Double minPrezzo, Double maxPrezzo);

    // Find by name and active status
    Optional<Pacchetto> findByNomeAndAttivo(String nome, boolean attivo);

    // Find courses with max participants greater than or equal to value
    List<Pacchetto> findByMaxPartecipantiGreaterThanEqual(Integer minPartecipanti);

    // Find courses by duration range
    @Query("SELECT c FROM Pacchetto c WHERE c.durataMinuti BETWEEN :minDurata AND :maxDurata")
    List<Pacchetto> findByDurataRange(Integer minDurata, Integer maxDurata);
}