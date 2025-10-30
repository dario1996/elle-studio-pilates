package com.example.demo.repository;

import com.example.demo.entity.CalendarioSettimanale;
import com.example.demo.enums.GiornoSettimana;
import com.example.demo.enums.TipoLezione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarioSettimanaleRepository extends JpaRepository<CalendarioSettimanale, Long> {

    List<CalendarioSettimanale> findByGiornoSettimanaOrderByOraInizio(GiornoSettimana giornoSettimana);

    List<CalendarioSettimanale> findByAttivoTrueOrderByGiornoSettimanaAscOraInizioAsc();

    List<CalendarioSettimanale> findByTipoLezione(TipoLezione tipoLezione);

    List<CalendarioSettimanale> findByGiornoSettimanaAndAttivoTrue(GiornoSettimana giornoSettimana);
}
