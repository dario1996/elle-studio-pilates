package com.example.demo.services;

import java.util.List;

import com.example.demo.entity.Piattaforma;

public interface PiattaformeService {

    public List<Piattaforma> SelAllPiattaforme();

    public void InsPiattaforma(Piattaforma piattaforma);

    public void DelDipendente(Piattaforma piattaforma);
}
