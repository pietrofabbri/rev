# Prova a secco del passo 4 — 19 novembre 2026

Eseguita da Claude nel browser del promotore, con lo strumento pubblicato più le correzioni del ramo `fix/stile-cognome-nome`. **Non è il passo 4 vero:** nessun cliente e nessun minuto umano misurato. Misura il lavoro automatico e conta i casi che vanno alla revisione umana, cioè quello che decide le ore.

## Materiale
Un articolo di storia contemporanea (storia del cinema militante, anni Sessanta-Settanta) pubblicato ad accesso aperto su una rivista italiana di OpenEdition. Ha 104 note a piè di pagina, come una tesi umanistica. Autore e titolo non sono riportati qui, perché questo manuale è pubblico e non si nominano persone per gli errori delle loro bibliografie (06).

Prima scelta, scartata: una tesi in PDF dell'archivio AMS Tesi di Laurea di Bologna. Il PDF non si è potuto leggere senza un'approvazione che non è arrivata, e caricare un lettore PDF esterno nella pagina dell'università è stato bloccato.

## 1. Che cosa c'è in 104 note
| Tipo | Note |
|---|---|
| Rinvii ("Ibidem", "Ivi") | 18 |
| Citazioni abbreviate ("op. cit.", "cit.") | 42 |
| Riferimenti completi (alcune note ne contengono più di uno) | 44 note |

**60 note su 104 non contengono un riferimento completo.** Dai riferimenti completi, tolti i doppioni, risultano **73 fonti**:

| Tipo di fonte | N. |
|---|---|
| Libri e volumi | 44 |
| Saggi in volume e articoli di rivista | 8 |
| Articoli di quotidiano | 12 |
| Pagine web | 7 |
| Fonti d'archivio | 2 |

## 2. Controllo automatico (64 fonti, senza pagine web e archivi)
Tre blocchi (30 + 30 + 4) come prevede la procedura in 04: **16 + 16 + 5 secondi**.

| | Strumento pubblicato | Con la correzione dello stile "COGNOME, Nome" |
|---|---|---|
| Verdi | 1 | **27** (tutti libri: 27 su 44) |
| Da controllare | 17 | 3 |
| Rossi | 39 | 20 |
| Non verificati | 7 | 14, di cui 12 sono i quotidiani, ora segnalati come "da controllare nell'archivio della testata" |

**Perché il primo giro è andato male:** lo stile più comune nelle tesi umanistiche, "COGNOME, Nome, Titolo, Città, Editore, Anno", veniva letto come se il nome proprio facesse parte del titolo ("Gianluca, Italy through the Red Lens").

**Che cosa sono i 20 rossi:**
- **6 sono errori di estrazione mia:** note di commento finite tra i riferimenti, un filmato d'archivio, saggi in volume con il titolo letto male. In un lavoro vero li separa la persona.
- **Libri rossi controllati a mano su OPAC SBN:** Fofi, Barletta, Grispigni e il volume della collana di Cazzullo **esistono tutti**. Sono rossi falsi: i libri sono registrati solo nel catalogo nazionale SBN, che lo strumento non interroga.
- **Saggi e articoli di rivista** (7 rossi): i cataloghi gratuiti li coprono poco.

**Link "Cerca a mano":** per cognome "Fofi" OPAC dà 1.115 documenti e il libro non è nella prima pagina. Per parole chiave, "Fofi senza Lenin", dà 2 documenti e il libro è il primo. Il link nello strumento è stato cambiato di conseguenza.

## 3. Controllo fonte-frase sui 10 passaggi
Non eseguito passaggio per passaggio. **Stima dai tipi di fonte:** delle 73 fonti, solo le 7 pagine web (circa il 10%) sono consultabili online. Libri, saggi e quotidiani d'epoca non lo sono. In una tesi umanistica quasi tutti i 10 passaggi risulterebbero "contenuto non verificabile".

## 4. Stima del tempo umano (minuti stimati, non misurati)
| Voce | Casi | Minuti a caso (stima) | Minuti |
|---|---|---|---|
| Libri non verdi, con link OPAC per parole chiave | 17 | 1,5 | 25 |
| Saggi in volume e articoli di rivista | 8 | 3 | 24 |
| Articoli di quotidiano (archivio della testata) | 12 | 3 | 36 |
| Pagine web e archivi | 9 | 1 | 9 |
| Verdi a campione (1 su 10) | 3 | 1 | 3 |
| Ricezione, rapporto, chiusura | — | — | 25 |
| **Totale con bibliografia finale fornita dal cliente** | | | **circa 2 ore** |
| Ricostruire le 60 note abbreviate, se manca la bibliografia | 60 | 0,5 | +30 |

**Per 73 fonti, circa 2-2,5 ore umane**, contro 1-1,5 previste in 04. A 29 € fanno circa 12-15 € l'ora, contro un obiettivo di 40.
