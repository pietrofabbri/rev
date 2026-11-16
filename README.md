# REV · Revisione delle fonti

Sito statico del servizio di verifica di bibliografie e citazioni: controllo gratuito nel browser, verifica completa a pagamento, registro pubblico.

Il sito non ha server né build: sono file HTML, CSS e JavaScript serviti da GitHub Pages.

## Struttura
| Percorso | Contenuto |
|---|---|
| `assets/config.js` | **Unico file da modificare**: nome, contatti, prezzi, cataloghi |
| `assets/checker.js` | Motore del controllo gratuito (Crossref, Google Libri, Open Library, OpenAlex, cataloghi CSV) |
| `assets/site.js` | Intestazione, piè di pagina, prezzi e link d'ordine generati da `config.js` |
| `assets/style.css` | Stile unico |
| `index.html` | Controllo gratuito |
| `servizio.html`, `tesi.html`, `editori.html`, `partner.html` | Offerte |
| `metodo.html` | Metodo pubblico e versionato |
| `registro.html` + `data/registro.json` | Registro pubblico delle verifiche |
| `condizioni.html`, `privacy.html` | Bozze in revisione legale |
| `tests/run.js` | Test del motore senza rete (`node tests/run.js`), eseguiti a ogni push |

## Prima del lancio
1. In `assets/config.js` compilare `contactEmail`, `operatorName`, `vatNumber`: il banner "anteprima" sparisce e i pulsanti d'ordine si attivano.
2. Facoltativo ma consigliato: `politeEmail` e `googleBooksKey` (chiave limitata al dominio del sito).
3. Far rivedere `condizioni.html` e `privacy.html` e togliere le note "bozza".

## Operazioni ricorrenti
- **Nuova verifica pubblicata:** aggiungere una voce in `data/registro.json`.
- **Catalogo proprio** (es. archivio dei riferimenti verificati, quando conviene pubblicarlo): file CSV in `data/` (isbn,autore,titolo,anno,editore,link) e una voce in `localCatalogs` di `config.js`. Viene consultato per primo, senza rete.
- **Cambio di prezzo:** solo in `config.js`.
- **Cambio di metodo:** aggiornare `metodo.html` e `methodVersion`.

## Pubblicazione
Settings → Pages → Deploy from a branch → `main` / `(root)`. Il sito è su `https://pietrofabbri.github.io/rev/`.
