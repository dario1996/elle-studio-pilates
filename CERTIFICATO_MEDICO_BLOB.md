# Implementazione Certificato Medico come BLOB

## Riepilogo Modifiche

Il certificato medico viene ora salvato come **BLOB** direttamente nel database, accettando **solo file PDF**.

---

## 🔧 Modifiche al Database

### Tabella `utenti` - Nuove Colonne

Aggiunte 3 nuove colonne tramite Liquibase migration `005-aggiungi-certificato-medico-blob.xml`:

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `certificato_medico_file` | LONGBLOB | File PDF salvato come byte array |
| `certificato_medico_nome` | VARCHAR(255) | Nome originale del file |
| `certificato_medico_data_upload` | TIMESTAMP | Data e ora dell'upload |

La colonna `certificato_medico` (VARCHAR) rimane per retrocompatibilità e indica lo stato: "presente" o "assente".

---

## 📦 Backend - Java

### 1. Entità `Utenti.java`

Aggiunti i nuovi campi con getter/setter:

```java
@Column(name = "certificato_medico_file", columnDefinition = "LONGBLOB")
private byte[] certificatoMedicoFile;

@Column(name = "certificato_medico_nome")
private String certificatoMedicoNome;

@Column(name = "certificato_medico_data_upload")
private LocalDateTime certificatoMedicoDataUpload;
```

### 2. Service `FileUploadService.java`

**Modifiche principali:**

- ✅ Salvataggio file come BLOB nel database (non più su file system)
- ✅ Validazione **solo PDF** (content-type e estensione)
- ✅ Limite dimensione: **10 MB**
- ✅ Metodi aggiornati:
  - `saveCertificatoMedico()` - salva PDF come BLOB
  - `getCertificatoMedico()` - recupera PDF dal database
  - `deleteCertificatoMedico()` - elimina BLOB
  - `hasCertificato()` - verifica presenza

**Validazioni implementate:**

```java
- File non vuoto
- Solo PDF (application/pdf e estensione .pdf)
- Max 10 MB
```

### 3. Controller `FileUploadController.java`

**Endpoints aggiornati:**

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/upload/certificato-medico` | Upload PDF (con validazione) |
| GET | `/api/upload/certificato-medico/{userId}` | Download PDF |
| DELETE | `/api/upload/certificato-medico/{userId}` | Elimina PDF |
| GET | `/api/upload/certificato-medico/{userId}/exists` | Verifica esistenza |

**Validazione doppia:**
1. Nel controller: verifica content-type e estensione
2. Nel service: validazione più approfondita

---

## 🎨 Frontend - Angular

### 1. Componente `certificato-medico.component.ts`

**Modifiche:**

- ✅ Validazione: **solo PDF** accettati
- ✅ Messaggi di errore specifici per formato non valido
- ✅ Attributo `accept=".pdf,application/pdf"` nell'input file
- ✅ Label aggiornata: "Certificato medico (solo PDF)"

**Codice validazione:**

```typescript
const isPdf = file.type === 'application/pdf' || 
              file.name.toLowerCase().endsWith('.pdf');

if (!isPdf) {
  this.uploadError = 'Sono accettati solo file in formato PDF';
  return;
}
```

### 2. Template `certificato-medico.component.html`

- ✅ Input file accetta solo PDF: `accept=".pdf,application/pdf"`
- ✅ Placeholder: "Aggiungi allegato PDF"
- ✅ Info utente: "Formato accettato: solo PDF (max 10MB)"

### 3. Componente `account-panel.component.ts`

Stesse validazioni del componente registrazione:

- ✅ Solo PDF accettati
- ✅ Max 10 MB
- ✅ Toast notifications per errori

### 4. Template `account-panel.component.html`

- ✅ Label: "Certificato medico (PDF)"
- ✅ Input file: `accept=".pdf,application/pdf"`
- ✅ Funzioni upload/download/sostituisci

---

## 🚀 Vantaggi della Soluzione

### ✅ BLOB nel Database

1. **Backup semplificato** - Tutto in un unico database
2. **Transazioni atomiche** - File e dati sempre sincronizzati
3. **No gestione file system** - Non serve creare directory
4. **Sicurezza** - File non accessibili direttamente dal file system

### ✅ Solo PDF

1. **Standard professionale** - PDF è il formato medico standard
2. **Sicurezza** - Meno rischi di malware rispetto ad altri formati
3. **Compatibilità** - Visualizzabile su qualsiasi dispositivo
4. **Dimensione ottimale** - PDF compresso mantiene qualità

---

## 📋 Prossimi Passi

### Eseguire la Migrazione

1. **Avviare il backend** - Liquibase applicherà automaticamente la migration
2. **Verificare** - Controllare che le colonne siano create:

```sql
DESCRIBE utenti;
```

Dovrebbero apparire:
- `certificato_medico_file`
- `certificato_medico_nome`
- `certificato_medico_data_upload`

### Test da Eseguire

1. ✅ **Upload PDF** - Caricare un certificato PDF valido
2. ✅ **Validazione formato** - Provare con file non-PDF (deve fallire)
3. ✅ **Validazione dimensione** - Provare con file > 10MB (deve fallire)
4. ✅ **Download** - Scaricare il certificato caricato
5. ✅ **Sostituisci** - Caricare un nuovo PDF
6. ✅ **Elimina** - Eliminare il certificato

---

## 🛡️ Sicurezza

### Validazioni Implementate

| Livello | Validazione |
|---------|-------------|
| **Frontend** | Content-type + estensione .pdf |
| **Backend Controller** | Content-type + estensione .pdf |
| **Backend Service** | Content-type + estensione + dimensione |
| **Database** | LONGBLOB gestisce file binari |

### Limiti Configurati

- **Formato**: Solo PDF (`application/pdf`)
- **Dimensione**: Max 10 MB
- **Storage**: Database (non file system)

---

## 📝 Note Tecniche

### Compatibilità

- La colonna `certificato_medico` (VARCHAR) rimane per retrocompatibilità
- Valori: "presente" o "assente"
- I vecchi record avranno `certificato_medico_file` NULL

### Performance

- **LONGBLOB** può contenere fino a 4GB
- Per PDF di 1-2 MB l'impatto sul database è minimo
- Consigliato monitorare dimensione del database se molti utenti

### Rollback

Se necessario tornare indietro, Liquibase supporta il rollback:

```bash
./mvnw liquibase:rollback -Dliquibase.rollbackCount=1
```

---

## ✅ Completato

Tutte le funzionalità sono state implementate:

1. ✅ Salvare il file come BLOB
2. ✅ Estensioni accettate: solo PDF
3. ✅ Download disponibile lato admin e utente

---

**Data implementazione:** 11 Novembre 2025  
**Versione:** 1.0
