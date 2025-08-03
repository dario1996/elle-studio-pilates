package com.example.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Corso;
import com.example.demo.repository.CorsoRepository;

@Service
public class CorsoServiceImpl implements CorsoService {

    @Autowired
    private CorsoRepository corsoRepository;

    @Override
    public List<Corso> SelAllCorsi() {
        return corsoRepository.findAll();
    }

    @Override
    public void deleteCorso(Long id) {
        if (!corsoRepository.existsById(id)) {
            throw new RuntimeException("Corso non trovato");
        }
        corsoRepository.deleteById(id);
    }

    @Override
    public void InsCorso(Corso corso) {
        corsoRepository.save(corso);
    }

}
