-- Creazione tabella lezioni
CREATE TABLE lezioni (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(200) NOT NULL,
    data_inizio DATETIME NOT NULL,
    data_fine DATETIME NOT NULL,
    istruttore VARCHAR(100) NOT NULL,
    tipo_lezione ENUM('PRIVATA', 'PRIMA_LEZIONE', 'SEMI_PRIVATA_DUETTO', 'SEMI_PRIVATA_GRUPPO', 'MATWORK', 'YOGA') NOT NULL,
    note TEXT,
    attiva BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indici per ottimizzare le query
    INDEX idx_data_inizio (data_inizio),
    INDEX idx_istruttore (istruttore),
    INDEX idx_tipo_lezione (tipo_lezione),
    INDEX idx_attiva (attiva),
    INDEX idx_range_date (data_inizio, data_fine)
);

-- Dati di esempio
INSERT INTO lezioni (titolo, data_inizio, data_fine, istruttore, tipo_lezione, note, attiva) VALUES 
('Pilates Privato con Eleonora', '2025-08-20 09:00:00', '2025-08-20 09:50:00', 'Eleonora Bianchi', 'PRIVATA', 'Prima lezione del cliente', TRUE),
('Matwork Gruppo', '2025-08-20 18:00:00', '2025-08-20 18:50:00', 'Marco Rossi', 'MATWORK', 'Gruppo avanzato', TRUE),
('Yoga Serale', '2025-08-21 19:30:00', '2025-08-21 20:30:00', 'Sofia Verdi', 'YOGA', 'Portare tappetino personale', TRUE),
('Semi-Privata Duetto', '2025-08-22 10:00:00', '2025-08-22 10:50:00', 'Eleonora Bianchi', 'SEMI_PRIVATA_DUETTO', 'Due amiche principianti', TRUE),
('Prima Lezione', '2025-08-22 15:00:00', '2025-08-22 16:00:00', 'Marco Rossi', 'PRIMA_LEZIONE', 'Valutazione posturale completa', TRUE);
