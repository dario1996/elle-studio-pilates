package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Pacchetto;
import com.example.demo.repository.PacchettoRepository;

@Service
public class PacchettoServiceImpl implements PacchettoService {

    @Autowired
    private PacchettoRepository pacchettoRepository;

    @Override
    public List<Pacchetto> SelAllPacchetti() {
        return pacchettoRepository.findAll();
    }

    @Override
    public void deletePacchetto(Long id) {
        if (!pacchettoRepository.existsById(id)) {
            throw new RuntimeException("Pacchetto non trovato");
        }
        pacchettoRepository.deleteById(id);
    }

    @Override
    public void InsPacchetto(Pacchetto pacchetto) {
        pacchettoRepository.save(pacchetto);
    }

}
