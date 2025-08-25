-- INSERT di 40 utenti di test con ruolo 'USER'
-- Password hashata BCrypt per "password123" = $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.

INSERT INTO utenti (
    username, 
    email, 
    password, 
    attivo, 
    ruoli, 
    nome, 
    cognome, 
    codice_fiscale, 
    certificato_medico, 
    patologie, 
    descrizione_patologie, 
    obiettivi,
    data_creazione
) VALUES 
-- Utenti 1-10
('mario.rossi', 'mario.rossi@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Mario', 'Rossi', 'RSSMRA80A01H501Z', NULL, false, NULL, 'Migliorare la postura e rafforzare il core', NOW()),
('giulia.bianchi', 'giulia.bianchi@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Giulia', 'Bianchi', 'BNCGLI85B02F205A', NULL, true, 'Problemi alla schiena lombare', 'Alleviare il mal di schiena e aumentare la flessibilità', NOW()),
('luca.ferrari', 'luca.ferrari@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Luca', 'Ferrari', 'FRRLCU90C03L219B', NULL, false, NULL, 'Tonificare il corpo e migliorare la resistenza', NOW()),
('anna.verdi', 'anna.verdi@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Anna', 'Verdi', 'VRDNNA75D04M456C', NULL, true, 'Artrite alle ginocchia', 'Mantenere la mobilità articolare senza dolore', NOW()),
('francesco.bruno', 'francesco.bruno@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Francesco', 'Bruno', 'BRNFNC88E05N789D', NULL, false, NULL, 'Recupero post-infortunio sportivo', NOW()),
('valentina.conti', 'valentina.conti@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Valentina', 'Conti', 'CNTVNT92F06P123E', NULL, false, NULL, 'Prepararsi al matrimonio e sentirsi in forma', NOW()),
('davide.romano', 'davide.romano@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Davide', 'Romano', 'RMNDVD87G07Q456F', NULL, true, 'Tensione cervicale cronica', 'Ridurre la tensione al collo e alle spalle', NOW()),
('serena.galli', 'serena.galli@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Serena', 'Galli', 'GLLSRN91H08R789G', NULL, false, NULL, 'Migliorare la forma fisica generale', NOW()),
('alessandro.costa', 'alessandro.costa@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Alessandro', 'Costa', 'CSTLSS83I09S012H', NULL, false, NULL, 'Aumentare la massa muscolare magra', NOW()),
('martina.ricci', 'martina.ricci@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Martina', 'Ricci', 'RCCMTN89L10T345I', NULL, true, 'Scoliosi lieve', 'Correggere la postura e rafforzare la schiena', NOW()),

-- Utenti 11-20
('matteo.moretti', 'matteo.moretti@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Matteo', 'Moretti', 'MRTMTT86M11U678J', NULL, false, NULL, 'Ridurre lo stress e rilassarsi', NOW()),
('chiara.fontana', 'chiara.fontana@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Chiara', 'Fontana', 'FNTCHR94N12V901K', NULL, false, NULL, 'Tonificare gambe e glutei', NOW()),
('simone.barbieri', 'simone.barbieri@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Simone', 'Barbieri', 'BRBSMN82O13W234L', NULL, true, 'Ernia del disco L4-L5', 'Rafforzare il core senza aggravare la schiena', NOW()),
('elena.marini', 'elena.marini@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Elena', 'Marini', 'MRNLEN90P14X567M', NULL, false, NULL, 'Prepararsi alla gravidanza', NOW()),
('roberto.santoro', 'roberto.santoro@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Roberto', 'Santoro', 'SNTRBT77Q15Y890N', NULL, false, NULL, 'Mantenersi in forma dopo i 45 anni', NOW()),
('federica.giuliani', 'federica.giuliani@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Federica', 'Giuliani', 'GLFDRK93R16Z123O', NULL, true, 'Fibromialgia', 'Gestire il dolore cronico con movimento dolce', NOW()),
('andrea.caruso', 'andrea.caruso@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Andrea', 'Caruso', 'CRSNDR84S17A456P', NULL, false, NULL, 'Migliorare le performance atletiche', NOW()),
('silvia.pellegrini', 'silvia.pellegrini@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Silvia', 'Pellegrini', 'PLLSLV88T18B789Q', NULL, false, NULL, 'Recuperare dopo il parto', NOW()),
('marco.de.luca', 'marco.deluca@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Marco', 'De Luca', 'DLCMRC91U19C012R', NULL, false, NULL, 'Combattere la sedentarietà da lavoro d\'ufficio', NOW()),
('laura.mancini', 'laura.mancini@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Laura', 'Mancini', 'MNCLAR85V20D345S', NULL, true, 'Osteoporosi', 'Rafforzare le ossa e prevenire fratture', NOW()),

-- Utenti 21-30
('stefano.lombardi', 'stefano.lombardi@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Stefano', 'Lombardi', 'LMBSTN79W21E678T', NULL, false, NULL, 'Migliorare la coordinazione e l\'equilibrio', NOW()),
('paola.rizzo', 'paola.rizzo@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Paola', 'Rizzo', 'RZZPLA92X22F901U', NULL, false, NULL, 'Tonificare tutto il corpo', NOW()),
('giovanni.greco', 'giovanni.greco@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Giovanni', 'Greco', 'GRCGVN86Y23G234V', NULL, true, 'Problemi alle spalle post-intervento', 'Recuperare la mobilità delle spalle', NOW()),
('monica.serra', 'monica.serra@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Monica', 'Serra', 'SRRMNT89Z24H567W', NULL, false, NULL, 'Migliorare la flessibilità e rilassarsi', NOW()),
('emanuele.orlando', 'emanuele.orlando@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Emanuele', 'Orlando', 'RLNMNL93A25I890X', NULL, false, NULL, 'Sviluppare la forza funzionale', NOW()),
('cristina.vitale', 'cristina.vitale@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Cristina', 'Vitale', 'VTLCRS87B26L123Y', NULL, true, 'Ansia e attacchi di panico', 'Utilizzare il movimento per gestire l\'ansia', NOW()),
('daniele.gatti', 'daniele.gatti@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Daniele', 'Gatti', 'GTTDNL81C27M456Z', NULL, false, NULL, 'Aumentare la resistenza cardiovascolare', NOW()),
('alessia.marchetti', 'alessia.marchetti@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Alessia', 'Marchetti', 'MRCLSS95D28N789A', NULL, false, NULL, 'Sentirsi più sicura del proprio corpo', NOW()),
('fabrizio.colombo', 'fabrizio.colombo@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Fabrizio', 'Colombo', 'CLMFRZ83E29O012B', NULL, true, 'Sciatica ricorrente', 'Alleviare il dolore sciatico e prevenire recidive', NOW()),
('barbara.longo', 'barbara.longo@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Barbara', 'Longo', 'LNGBBR88F30P345C', NULL, false, NULL, 'Migliorare la qualità del sonno attraverso il movimento', NOW()),

-- Utenti 31-40
('nicola.esposito', 'nicola.esposito@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Nicola', 'Esposito', 'SPSNLC90G31Q678D', NULL, false, NULL, 'Mantenersi agile e forte', NOW()),
('giorgia.fabbri', 'giorgia.fabbri@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Giorgia', 'Fabbri', 'FBBGRG92H32R901E', NULL, false, NULL, 'Tonificare dopo una lunga pausa dall\'attività fisica', NOW()),
('alberto.russo', 'alberto.russo@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Alberto', 'Russo', 'RSSLRT76I33S234F', NULL, true, 'Problemi cardiovascolari lievi', 'Fare attività fisica sicura per il cuore', NOW()),
('sara.benedetti', 'sara.benedetti@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Sara', 'Benedetti', 'BNDSRA91L34T567G', NULL, false, NULL, 'Migliorare la concentrazione e la mindfulness', NOW()),
('massimo.pellegrino', 'massimo.pellegrino@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Massimo', 'Pellegrino', 'PLLMSM84M35U890H', NULL, false, NULL, 'Recuperare dopo un periodo di stress intenso', NOW()),
('claudia.morari', 'claudia.morari@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Claudia', 'Morari', 'MRRCLD86N36V123I', NULL, true, 'Diastasi addominale post-parto', 'Recuperare la funzionalità addominale', NOW()),
('riccardo.martelli', 'riccardo.martelli@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Riccardo', 'Martelli', 'MRTRCR89O37W456J', NULL, false, NULL, 'Prepararsi per una maratona', NOW()),
('valentina.silvestri', 'valentina.silvestri@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Valentina', 'Silvestri', 'SLVVNT93P38X789K', NULL, false, NULL, 'Migliorare la tecnica di respirazione', NOW()),
('michele.ferretti', 'michele.ferretti@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Michele', 'Ferretti', 'FRRMHL87Q39Y012L', NULL, true, 'Lombalgia cronica', 'Gestire il dolore lombare con esercizi specifici', NOW()),
('francesca.paris', 'francesca.paris@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Si', '["USER"]', 'Francesca', 'Paris', 'PRSFNC94R40Z345M', NULL, false, NULL, 'Acquisire consapevolezza corporea e autostima', NOW());

-- Verifica inserimento
SELECT COUNT(*) as 'Utenti inseriti' FROM utenti WHERE ruoli = '["USER"]' AND data_creazione >= DATE_SUB(NOW(), INTERVAL 1 MINUTE);

-- ========================================
-- PASSWORD DECRIPTATE PER TUTTI GLI UTENTI
-- ========================================
-- Tutti gli utenti hanno la stessa password: password123
--
-- ELENCO CREDENZIALI DI ACCESSO:
-- Username: mario.rossi          | Password: password123
-- Username: giulia.bianchi       | Password: password123
-- Username: luca.ferrari         | Password: password123
-- Username: anna.verdi           | Password: password123
-- Username: francesco.bruno      | Password: password123
-- Username: valentina.conti      | Password: password123
-- Username: davide.romano        | Password: password123
-- Username: serena.galli         | Password: password123
-- Username: alessandro.costa     | Password: password123
-- Username: martina.ricci        | Password: password123
-- Username: matteo.moretti       | Password: password123
-- Username: chiara.fontana       | Password: password123
-- Username: simone.barbieri      | Password: password123
-- Username: elena.marini         | Password: password123
-- Username: roberto.santoro      | Password: password123
-- Username: federica.giuliani    | Password: password123
-- Username: andrea.caruso        | Password: password123
-- Username: silvia.pellegrini    | Password: password123
-- Username: marco.deluca         | Password: password123
-- Username: laura.mancini        | Password: password123
-- Username: stefano.lombardi     | Password: password123
-- Username: paola.rizzo          | Password: password123
-- Username: giovanni.greco       | Password: password123
-- Username: monica.serra         | Password: password123
-- Username: emanuele.orlando     | Password: password123
-- Username: cristina.vitale      | Password: password123
-- Username: daniele.gatti        | Password: password123
-- Username: alessia.marchetti    | Password: password123
-- Username: fabrizio.colombo     | Password: password123
-- Username: barbara.longo        | Password: password123
-- Username: nicola.esposito      | Password: password123
-- Username: giorgia.fabbri       | Password: password123
-- Username: alberto.russo        | Password: password123
-- Username: sara.benedetti       | Password: password123
-- Username: massimo.pellegrino   | Password: password123
-- Username: claudia.morari       | Password: password123
-- Username: riccardo.martelli    | Password: password123
-- Username: valentina.silvestri  | Password: password123
-- Username: michele.ferretti     | Password: password123
-- Username: francesca.paris      | Password: password123
--
-- NOTA: Hash BCrypt utilizzato: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
-- RUOLO: Tutti gli utenti hanno ruolo "USER"
