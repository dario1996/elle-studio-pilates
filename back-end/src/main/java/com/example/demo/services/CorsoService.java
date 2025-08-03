package com.example.demo.services;

import java.util.List;

import com.example.demo.entity.Corso;

public interface CorsoService {

    public List<Corso> SelAllCorsi();
    public void deleteCorso(Long id);
    public void InsCorso(Corso corso);
}
