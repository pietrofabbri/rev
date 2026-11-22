# Strumento gratuito e sito

Ultimo aggiornamento: 2026-11-19 · Codice: https://github.com/pietrofabbri/rev · Sito: https://pietrofabbri.github.io/rev/

> **Da chiarire prima di uscire dall'anteprima (passo 6 di 18):** di chi è l'account `pietrofabbri`. Se è del promotore, l'indirizzo pubblico del servizio porta il suo nome, contro D-02: il repository passa all'account del responsabile.

## Modifiche recenti
- 16 nov: menu ridotto a 4 voci, testi della home più brevi (passo 1 di 18). Da ricontrollare sul sito.
- 18 nov: test automatici eseguiti, 16 su 16 superati. Manuale pubblicato in `docs/` (D-26).
- 19 nov: primo test dal vivo, **non superato** (0 verdi su 30). Da correggere prima di ripeterlo: chiave Google Libri, ricerca Open Library per titolo e autore, somiglianza nei due sensi (passo 3b di 18).
- 19 nov: **strumento corretto e pubblicato** (pull request #3).
- 19 nov: chiave Google Libri creata, limitata al sito e alla sola Books API, inserita in `config.js` (pull request #4). Terzo giro del test dal vivo: **superato**, 23 verdi su 30. Lettura dei riferimenti in stile APA e italiano; Open Library e Google Libri per titolo e autore; somiglianza nei due sensi; cognomi composti nei link OPAC; tempo massimo e secondo tentativo per catalogo; controllo dell'ISBN anche su Open Library, che prevale sul verde; avviso sugli ISBN ripetuti. Test automatici: 24. Secondo giro dal vivo: 18 verdi su 30.
- 19 nov, prova a secco del passo 4: lettura dello stile "COGNOME, Nome, Titolo" (da 1 a 27 libri verdi su 44); articoli di quotidiano mai rossi; link OPAC per cognome e titolo invece che per solo cognome. 26 test automatici. Pull request #5.
- 19 nov, decisioni del 18 nov sul sito (pull request #6): via il dossier; pagina partner solo informativa; "solo le fonti, mai il testo" in home e pagina tesi; prima verifica gratuita in cambio di testimonianza e del permesso di misurare i tempi; consegna in 3 giorni lavorativi (`deliveryDays`); link Editori tolto dal piè di pagina. I prezzi non cambiano finché il passo 5 non è confermato.
- 19 nov, **nuova esperienza d'uso** (pull request #7):
  - **menu per bisogno:** "Controlla gratis", "Tesi", "Libri", "Come lavoriamo";
  - **home con un solo compito:** lo strumento, disegnato come una scheda di catalogo;
  - **dopo il controllo,** una frase di sintesi e due porte, tesi o libro, ciascuna con il suo prezzo;
  - **pagine tesi e libro** con la stessa struttura: che cosa ricevi, prezzo, come si ordina, dettagli richiudibili;
  - **piè di pagina** con registro, condizioni, privacy e partner;
  - **colori** della matita rossa e blu dei correttori, solo caratteri di sistema (nessun font esterno), risultati leggibili anche su telefono.
- 19 nov, **caricare la tesi** (pull request #9): file Word, PDF o di testo letti nel browser, senza inviarli a nessuno. La bibliografia finale va da sola nella scheda. Per i file Word, confronto tra note e bibliografia. Per i PDF si usa pdf.js 4.4.168 (Mozilla, licenza Apache 2.0) in `assets/vendor/pdfjs/`, caricato solo quando serve. Test automatici: 29.
- 19 nov, **esportazione per Zotero (RIS) e BibTeX** (pull request #10). Titolo e autori vengono dal catalogo quando l'opera è trovata; anno, editore e città dal riferimento, perché indicano l'edizione citata. Nella nota del file ci sono l'esito e il riferimento originale.
- 19 nov, **DOI registrati in DataCite** (arXiv, Zenodo): prima risultavano rossi perché si interrogava solo Crossref. Ora, se Crossref non conosce il DOI, si chiede a DataCite. Test automatici: 33.
- 22 nov, **Google Libri di nuovo funzionante.** Dal 19 nov rispondeva "accesso negato" perché la restrizione della chiave era `https://pietrofabbri.github.io/rev/*`. Per le richieste verso altri siti, però, i browser inviano solo il dominio, `https://pietrofabbri.github.io/`, che quella regola non copre. Restrizione cambiata in `https://pietrofabbri.github.io/*`: la chiave vale solo dalle pagine di questo account GitHub e solo per la Books API.
- 22 nov, **controllo dei link citati** (`assets/link.js`). Per ogni link della bibliografia lo strumento indica:
  - se il sito risponde. Dal browser non si può sapere se la singola pagina esiste ancora, e il sito lo dice;
  - la copia nella Wayback Machine più vicina alla data di consultazione scritta nel riferimento ("consultato il…").

  I link DOI sono esclusi, perché si controllano già su Crossref e DataCite. Gli indirizzi in http sono segnalati come non controllabili dal browser. Test automatici: 35.
- Da fare al passo 8 di 18: pagina Prezzi e `config.js` con il listino del passo 5; pagina tesi con le regole di [07](07-segmenti.md) in evidenza; via il dossier (D-19); pagina partner con il testo di [08](08-partner.md).

## Che cosa fa
Si può incollare la bibliografia oppure caricare il file della tesi (Word, PDF, testo): il file si legge nel browser (`assets/estrai.js`) e non lascia il computer del visitatore. Dal file si prende la sezione intitolata "Bibliografia" o "Riferimenti bibliografici"; per i file Word si confrontano anche note e bibliografia, per cognome.

Controlla fino a 30 riferimenti nel browser del visitatore, nell'ordine:
1. cataloghi propri in CSV, se configurati (oggi nessuno; in futuro l'archivio, D-12);
2. per i DOI, Crossref e poi DataCite; per il resto, Crossref, Google Libri e controllo dell'ISBN su Open Library, in parallelo (libri cercati per titolo e cognome);
3. Open Library per titolo e cognome;
4. OpenAlex per gli articoli ritirati.

Esiti: verde, giallo, rosso, "non verificato". Un ISBN che corrisponde a un altro titolo dà sempre giallo, anche se il titolo esiste; lo stesso ISBN in due righe dà giallo a entrambe. Per ogni non verde, link già pronti a OPAC SBN (ricerca per parole chiave: cognome e prime parole del titolo), Google Libri e Google Scholar. Gli articoli di quotidiano sono sempre "non verificato", con il rinvio all'archivio della testata. Se un catalogo non risponde, l'esito non è mai rosso. Nessun server, nessun dato conservato.

## Configurazione
Tutto in `assets/config.js`: contatti e partita IVA (finché mancano il sito resta in "anteprima"), prezzi, cataloghi propri, `politeEmail` e `googleBooksKey`. La chiave Google Libri è pubblica per forza (si usa dal browser): la proteggono le restrizioni su Google Cloud, cioè sito `https://pietrofabbri.github.io/*` e sola Books API (progetto "My First Project", "Chiave API 1"), da aggiornare se il sito cambia indirizzo (R-28). Attenzione: la regola sul sito va scritta per dominio (`/*`), non per cartella (`/rev/*`), altrimenti Google rifiuta le richieste. I prezzi del sito vengono solo da lì e devono coincidere con [02](02-offerta.md).

## Attivazione (una volta)
Su GitHub: Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.

## Test
- **Automatici:** `node tests/run.js` (26 casi, 10 presi dalle prove dal vivo del 19 nov), eseguiti da GitHub a ogni modifica.
- **Dal vivo, obbligatorio prima di annunciarlo (passo 3 di 18):**

| Caso | Esito atteso |
|---|---|
| Articolo con DOI corretto | Verde |
| Stesso articolo con anno sbagliato | Giallo o verde con nota |
| Riferimento inventato | Rosso, con il testo "va controllato a mano" |
| 30 libri italiani reali di varia notorietà | **Almeno 20 verdi su 30.** Sotto i 20 non si annuncia e si rifà il conto dei tempi in 04: ogni rosso falso è tempo umano nel lavoro pagato |
| Libro con ISBN di un altro titolo | Giallo, "titolo diverso" |
| Link "Cerca a mano" (OPAC SBN, Google Libri, Scholar) | Aprono una ricerca utile in un clic |

**Come si fa il test dal vivo:** 30 riferimenti reali copiati da una bibliografia vera, senza ripulirli (circa 10 grandi editori, 10 editori medi recenti, 10 titoli difficili). Si incollano nello strumento, si preme "Copia il rapporto" e si salva il testo. Un secondo giro con le trappole (riferimento inventato, ISBN scambiato). Si provano 3 link "Cerca a mano". Il risultato si annota qui sotto.

### Risultati del test dal vivo
| Data | Verdi / 30 | Gialli | Rossi (di cui falsi) | Non verificati | Trappole | Link "Cerca a mano" | Esito |
|---|---|---|---|---|---|---|---|
| 19 nov | **0** (prototipo: 17) | 8, tutti abbinamenti sbagliati | 0 | 22 | Entrambe "non verificato" | OPAC funziona ma solo per cognome | **Non superato.** Cause nel codice, non nei cataloghi: vedi [18](18-revisione-critica.md), R-40…R-47, e i dati in `tests/dal-vivo/2026-11-19.md` |
| 19 nov, 2° giro (strumento corretto) | **18** | 1 (ISBN ripetuto, giusto) | 0 | 11, tutti per Google Libri | ISBN scambiato: giallo, giusto. Inventato: non verificato | — | **Non ancora superato** (18 su 20), nessun falso verde. Manca solo la chiave Google Libri (R-40) |
| 19 nov, 3° giro (con chiave Google Libri) | **23** | 4 (ISBN ripetuto ×2, 2 edizioni simili) | 1 (falso: Curatolo 1911) | 2 | Inventato: rosso. ISBN scambiato: giallo. Entrambi giusti | — | **Superato.** Nessun verde falso |

## Ordini
Oggi: per email. Con D-25 (passo 10 di 18): link di pagamento; dopo il pagamento, **pagina di conferma con numero d'ordine e indirizzo a cui inviare il file**; nella pagina d'ordine, accettazione delle condizioni e due caselle di consenso (registro pubblico, archivio); avviso del pagamento sul telefono del responsabile.

## Manutenzione
- Una volta al mese: 5 riferimenti di prova.
- Registro: una voce in `data/registro.json` per ogni verifica pubblicata.

## Evoluzioni (solo con decisione in 00)
1. Archivio dei riferimenti verificati come catalogo proprio (D-12, oltre 2.000 voci).
2. Interrogazione SBN con un piccolo servizio, dopo aver verificato le condizioni ICCU.
3. Dominio proprio.
