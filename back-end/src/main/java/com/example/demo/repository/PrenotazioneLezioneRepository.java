package com.example.demo.repository;

import com.example.demo.entity.PrenotazioneLezione;
import com.example.demo.entity.PrenotazioneLezione.StatoPrenotazione;
import com.example.demo.entity.Vendita;
import com.example.demo.entity.Utenti;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrenotazioneLezioneRepository extends JpaRepository<PrenotazioneLezione, Long> {

    /**
     * Trova tutte le prenotazioni di un utente
     */
    List<PrenotazioneLezione> findByUtenteOrderByDataLezioneAsc(Utenti utente);

    /**
     * Trova le prenotazioni future di un utente
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.utente = :utente AND p.dataLezione >= :dataOggi AND p.stato = :stato ORDER BY p.dataLezione ASC")
    List<PrenotazioneLezione> findPrenotazioniFuture(@Param("utente") Utenti utente, 
                                                      @Param("dataOggi") LocalDate dataOggi,
                                                      @Param("stato") StatoPrenotazione stato);

    /**
     * Trova tutte le prenotazioni di una vendita
     */
    List<PrenotazioneLezione> findByVenditaOrderByDataLezioneAsc(Vendita vendita);

    /**
     * Trova le prenotazioni per un gruppo (stesso gruppo_prenotazione_id)
     */
    List<PrenotazioneLezione> findByGruppoPrenotazioneId(String gruppoPrenotazioneId);

    /**
     * Trova le prenotazioni per un template in una data specifica
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.template.id = :templateId AND p.dataLezione = :dataLezione AND p.stato = 'CONFERMATA'")
    List<PrenotazioneLezione> findByTemplateAndDataLezione(@Param("templateId") Long templateId, 
                                                            @Param("dataLezione") LocalDate dataLezione);

    /**
     * Conta i partecipanti per un template in una data specifica
     */
    @Query("SELECT COUNT(p) FROM PrenotazioneLezione p WHERE p.template.id = :templateId AND p.dataLezione = :dataLezione AND p.stato = 'CONFERMATA'")
    Long countPartecipantiByTemplateAndData(@Param("templateId") Long templateId, 
                                             @Param("dataLezione") LocalDate dataLezione);

    /**
     * Trova le prenotazioni di un utente per un tipo lezione specifico
     */
    @Query("SELECT p FROM PrenotazioneLezione p WHERE p.utente = :utente AND p.tipoLezione = :tipoLezione AND p.dataLezione >= :dataOggi ORDER BY p.dataLezione ASC")
    List<PrenotazioneLezione> findByUtenteAndTipoLezione(@Param("utente") Utenti utente,
                                                          @Param("tipoLezione") String tipoLezione,
                                                          @Param("dataOggi") LocalDate dataOggi);

    /**
     * Verifica se esiste già una prenotazione per un utente in quella data/ora
     */
    @Query("SELECT COUNT(p) > 0 FROM PrenotazioneLezione p WHERE p.utente = :utente AND p.dataLezione = :dataLezione AND p.oraInizio = :oraInizio AND p.stato = 'CONFERMATA'")
    boolean existsByUtenteAndDataAndOra(@Param("utente") Utenti utente,
                                         @Param("dataLezione") LocalDate dataLezione,
                                         @Param("oraInizio") java.time.LocalTime oraInizio);

    /**
     * Trova tutte le prenotazioni in coda
     */
    List<PrenotazioneLezione> findByStatoOrderByDataLezioneAsc(StatoPrenotazione stato);
}
