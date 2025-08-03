package com.example.demo.repository;

import com.example.demo.entity.Piattaforma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PiattaformaRepository extends JpaRepository<Piattaforma, Long> {

    // Find active platforms
    List<Piattaforma> findByAttivaTrue();

    // Find platforms by name (case insensitive)
    List<Piattaforma> findByNomeContainingIgnoreCase(String nome);

    // Find platform by exact name
    Piattaforma findByNome(String nome);

    // Find platform by name (case insensitive)
    Optional<Piattaforma> findByNomeIgnoreCase(String nome);
}