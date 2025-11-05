package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.PacchettoUtente;
import com.example.demo.entity.Vendita;

@Repository
public interface PacchettoUtenteRepository extends JpaRepository<PacchettoUtente, Long> {
    Optional<PacchettoUtente> findByVendita(Vendita vendita);
}
