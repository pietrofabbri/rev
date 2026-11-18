# Strumento gratuito e sito

Ultimo aggiornamento: 2026-11-18 · Codice: https://github.com/pietrofabbri/rev · Sito: https://pietrofabbri.github.io/rev/

> **Da chiarire prima di uscire dall'anteprima (passo 6 di 18):** di chi è l'account `pietrofabbri`. Se è del promotore, l'indirizzo pubblico del servizio porta il suo nome, contro D-02: il repository passa all'account del responsabile.

## Modifiche recenti
- 16 nov: menu ridotto a 4 voci, testi della home più brevi (passo 1 di 18). Da ricontrollare sul sito.
- 18 nov: test automatici eseguiti, 16 su 16 superati. Manuale pubblicato in `docs/` (D-26).
- Da fare al passo 8 di 18: pagina Prezzi e `config.js` con il listino del passo 5; pagina tesi con le regole di [07](07-segmenti.md) in evidenza; via il dossier (D-19); pagina partner con il testo di [08](08-partner.md).

## Che cosa fa
Controlla fino a 30 riferimenti nel browser del visitatore, nell'ordine:
1. cataloghi propri in CSV, se configurati (oggi nessuno; in futuro l'archivio, D-12);
2. Crossref e Google Libri in parallelo (con ricerca per ISBN quando c'è);
3. Open Library;
4. OpenAlex per gli articoli ritirati.

Esiti: verde, giallo, rosso, "non verificato". Per ogni non verde, link già pronti a OPAC SBN (ricerca per autore), Google Libri e Google Scholar. Il formato del link OPAC SBN segue l'esempio della guida ufficiale ed è da controllare nel test dal vivo. Se un catalogo non risponde, l'esito non è mai rosso. Nessun server, nessun dato conservato.

## Configurazione
Tutto in `assets/config.js`: contatti e partita IVA (finché mancano il sito resta in "anteprima"), prezzi, cataloghi propri, `politeEmail` e `googleBooksKey`. I prezzi del sito vengono solo da lì e devono coincidere con [02](02-offerta.md).

## Attivazione (una volta)
Su GitHub: Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.

## Test
- **Automatici:** `node tests/run.js` (16 casi), eseguiti da GitHub a ogni modifica.
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
| | | | | | | | |

## Ordini
Oggi: per email. Con D-25 (passo 10 di 18): link di pagamento; dopo il pagamento, **pagina di conferma con numero d'ordine e indirizzo a cui inviare il file**; nella pagina d'ordine, accettazione delle condizioni e due caselle di consenso (registro pubblico, archivio); avviso del pagamento sul telefono del responsabile.

## Manutenzione
- Una volta al mese: 5 riferimenti di prova.
- Registro: una voce in `data/registro.json` per ogni verifica pubblicata.

## Evoluzioni (solo con decisione in 00)
1. Archivio dei riferimenti verificati come catalogo proprio (D-12, oltre 2.000 voci).
2. Interrogazione SBN con un piccolo servizio, dopo aver verificato le condizioni ICCU.
3. Dominio proprio.
