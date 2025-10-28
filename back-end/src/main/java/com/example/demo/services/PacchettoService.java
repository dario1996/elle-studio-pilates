package com.example.demo.services;

import java.util.List;

import com.example.demo.entity.Pacchetto;

public interface PacchettoService {

    public List<Pacchetto> SelAllPacchetti();
    public void deletePacchetto(Long id);
    public void InsPacchetto(Pacchetto pacchetto);
}
