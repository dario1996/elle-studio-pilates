package com.example.demo.repository;

import com.example.demo.entity.Dipendente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DipendenteRepository extends JpaRepository<Dipendente, Long> {

    // Find by codice dipendente
    Optional<Dipendente> findByCodiceDipendente(String codiceDipendente);

    // Find by email
    Optional<Dipendente> findByEmail(String email);

    // Find active employees
    List<Dipendente> findByAttivoTrue();

    // Find by department
    List<Dipendente> findByRepartoIgnoreCase(String reparto);

    // Find by commercial area
    List<Dipendente> findByCommercialeIgnoreCase(String commerciale);

    // Search by name, surname or email (case insensitive)
    @Query("SELECT d FROM Dipendente d WHERE " +
            "LOWER(d.nome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.cognome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Dipendente> searchByNameSurnameOrEmail(@Param("searchTerm") String searchTerm);

    // Find by nome and cognome (case insensitive)
    @Query("SELECT d FROM Dipendente d WHERE " +
            "LOWER(d.nome) = LOWER(:nome) AND LOWER(d.cognome) = LOWER(:cognome)")
    List<Dipendente> findByNomeAndCognomeIgnoreCase(@Param("nome") String nome, @Param("cognome") String cognome);

    // Check if codice dipendente exists
    boolean existsByCodiceDipendente(String codiceDipendente);

    // Check if email exists
    boolean existsByEmail(String email);
}