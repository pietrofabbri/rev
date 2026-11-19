# Revisione critica del 16 novembre e piano a piccoli passi

Ultimo aggiornamento: 2026-11-19 · **Ingresso del manuale** (D-21): si parte da qui, gli altri file si aprono solo al bisogno.

Stato delle proposte: P-02, P-03, P-05, P-06, P-07, P-08 confermate il 18 nov (D-18…D-23). P-04 approvata ma non attiva (D-25). **P-01 in sospeso** fino al passo 5.

Il manuale è pubblico nella cartella `docs/` del repository pietrofabbri/rev (D-26) e si aggiorna insieme al progetto claude.ai.

## Il piano in una riga
Un solo prodotto, un solo prezzo fisso, un solo pubblico per le prime 6 settimane. Tutto il resto resta spento finché non arriva il primo incasso.

## Che cosa non reggeva di ciò che era stato sancito
| # | Deciso finora | Perché non regge | Proposta |
|---|---|---|---|
| P-01 | Prezzo a errore: 15 € con minimo e tetto (D-08) | Difficile da capire, costo imprevedibile per il cliente, incentivo a trovare errori, liti sulla fattura | **Prezzo fisso a fasce**: 29 € fino a 100 riferimenti, 79 € fino a 300, oltre su preventivo. Garanzia unica: rimborso se non sei soddisfatto · **In sospeso: passo 5** |
| P-02 | Quattro servizi e tre pubblici insieme | Sito e messaggi confusi; non si capisce cosa funziona | Prime 6 settimane: solo **tesi e autori** (decidono da soli, hanno una scadenza, cercano già online). Editori dopo i primi 10 lavori · **D-18** |
| P-03 | Dossier di revisione a 150 € | Nessuno l'ha chiesto; complica l'offerta | Tolto dal sito; torna solo su richiesta · **D-19** |
| P-04 | Ordine via email | Attrito: scrivere, allegare, aspettare il preventivo | Link di pagamento (es. Stripe Payment Link) e invio del file dopo il pagamento. Nessun preventivo sotto i 300 riferimenti · **D-25, dal passo 10** |
| P-05 | Programma partner attivo dalla fase A | Un'ora a settimana prima di avere un solo cliente | Pagina in fondo al sito, nessun lavoro attivo finché non ci sono 10 lavori pagati · **D-20** |
| P-06 | Manuale di 19 file | Troppo per una persona; nessuno lo rilegge | Questo file è l'ingresso. Gli altri si aprono solo al bisogno. Nessun nuovo file senza toglierne uno · **D-21** |
| P-07 | Barometro, bollino, registro come attività | Lavoro senza clienti | Registro e bollino restano perché non costano nulla; barometro spento fino a 20 lavori al mese · **D-22** |
| P-08 | Roadmap a 6 fasi | Troppo lontana per guidare le scelte | Tre soglie: primo incasso → 10 lavori → 20 lavori al mese. A ogni soglia si accende una cosa sola · **D-23** |

## Che cosa resta valido
Verifica e non certificazione (D-03, D-04); persona indipendente (D-02); firma umana (D-05); pull e non push (D-06); sito statico a costo zero (D-13); niente piani che dipendono da terzi (D-17); criterio di stop a 3 mesi.

## Piccoli passi, in ordine (uno alla volta, ognuno chiuso prima del successivo)
Sostituisce la tabella del 16 nov (approvato il 18 nov). La colonna "Chiude" rimanda ai ritrovamenti più sotto.

| Passo | Cosa | Chi | Chiude | Stato |
|---|---|---|---|---|
| 1 | Menu a 4 voci, home più breve | Claude | — | Fatto il 16 nov; da ricontrollare sul sito |
| 2 | Confermare le proposte | Promotore | — | **Fatto il 18 nov** (P-01 rinviata al passo 5) |
| 3 | Test dal vivo: 30 libri italiani, soglia 20 verdi; provare i link "Cerca a mano". Sotto i 20 verdi non si annuncia e si rifà il conto dei tempi. Istruzioni e tabella dei risultati in 10 | Claude (in automatico) | R-26 | **Fatto il 19 nov: non superato**, 0 verdi su 30. Con la correzione provata in pagina, 17 su 30 con il solo Open Library. Si ripete dopo il 3b |
| 3b | Correggere lo strumento: chiave Google Libri in `config.js` (gratuita, va creata dal responsabile o dal promotore su Google Cloud e limitata al dominio del sito); Open Library per titolo e autore; somiglianza nei due sensi e autore obbligatorio per i libri; lettura del titolo nello stile "Autore, Titolo, Città, Editore, Anno"; OPAC per cognome e titolo; avviso sugli ISBN ripetuti. Poi ripetere il passo 3 | Claude + chi crea la chiave | R-40…R-47 | Da fare |
| 4 | **Lavoro di prova cronometrato**: una tesi vera da circa 100 riferimenti, gratis in cambio di una testimonianza; minuti per passo nella tabella di 04 | Responsabile | R-06, R-11, R-20 | Da fare |
| 5 | Con i minuti misurati: fissare contenuto, prezzo e garanzie di ogni fascia; decidere sulla garanzia "nessun errore, rimborso" (R-30). Poi aggiornare 02, 03, 05 | Promotore + Claude | R-01, R-02, R-03, R-07, R-30, R-37 | In attesa del passo 4 |
| 6 | Commercialista; D-11 scritta; chiarire di chi è l'account del sito | Responsabile + promotore | R-04, R-21, R-28 | Da fare (si può fare in parallelo ai passi 3-5) |
| 7 | Condizioni (03) riscritte per prezzo fisso e vendita online, rilette da un legale | Claude + legale | R-12, R-13 | In attesa del passo 5 |
| 8 | Sito: `config.js`, pagina Prezzi, pagina tesi (con le regole di 07), pagina partner senza "si paga solo l'errore" | Claude | R-22, R-23, R-33 | In attesa del passo 5 (dossier e partner si possono già togliere) |
| 9 | Email, nome e partita IVA in `config.js`: il sito esce dall'anteprima | Responsabile | — | In attesa dei passi 6-8 |
| 10 | Link di pagamento, pagina di conferma con l'indirizzo per il file, caselle di consenso, avviso degli ordini sul telefono | Responsabile + Claude | R-05, R-15, R-27, R-38 | In attesa del passo 9 |
| 11 | Primo lavoro pagato; ore reali in 12 | Responsabile | — | — |

## Gli orologi, in fila (R-35)
- **Settimana 6** dall'uscita dall'anteprima: primo controllo (obiettivo 3 lavori pagati, 12).
- **Settimana 8:** un motore che non ha portato richieste si spegne (06).
- **Mese 3:** nessun lavoro pagato → ci si ferma e si rivede l'ipotesi (14).

## Problemi ancora aperti (ripresi da 16, archiviato)
- **Domanda reale non provata:** nessuno ha ancora pagato.
- **Copertura reale dei libri italiani:** passo 3.
- **Prezzo:** passo 5.
- **Nome e dominio** del servizio.
- **Revisione legale** di condizioni e bollino: passo 7.

## Limite di questa revisione
È stata fatta con poche risorse residue nella sessione: i prezzi delle fasce (29 € e 79 €) sono stime da provare, non misure.

---

## Seconda passata: registro dei ritrovamenti (16 nov, sera)

**Applicazione del 18 nov:** applicati nei file R-04, R-06 (in 02), R-07 (in 02), R-08, R-09, R-10, R-14, R-15, R-16, R-17 (nota in 04), R-18, R-19, R-21, R-22, R-23, R-24, R-25, R-26, R-27 (nota in 10), R-29, R-31, R-32, R-33, R-34, R-35, R-36, R-38 (nota in 03 e 11). Restano aperti perché dipendono dal prezzo o da persone: R-01, R-02, R-03, R-05, R-11, R-12, R-13, R-20, R-28, R-30, R-37 (passi 4-7). Il sito non è stato toccato.

Revisione file per file del manuale alla luce di P-01…P-08. Ogni ritrovamento è annotato appena trovato. Gravità: **A** = blocca il primo lavoro pagato · **B** = incoerenza da sistemare quando si conferma la proposta · **C** = pulizia.

**Avanzamento:** letti tutti i file da 00 a 18 e README. Non riletti: `fonti.md` (elenco di link, non toccato dalle proposte). **Non verificato: il sito pubblico** (non raggiungibile da questa sessione), quindi il passo 1 e la coerenza tra `config.js` e 02 restano da controllare a mano.

### Da 18, 00, README, 02
| # | Gr. | Dove | Ritrovamento | Che cosa fare |
|---|---|---|---|---|
| R-01 | A | 18 P-01 · 02 | **P-01 non dice che cosa comprende ogni fascia.** Oggi in 02 i 29 € della tesi coprono la coerenza fonte-frase solo su 10 passaggi; la verifica completa la copre su tutto. Con le fasce 29/79 € non è scritto se il contenuto dipende dal pubblico o solo dal numero di riferimenti | Scrivere in P-01 una riga per fascia: che cosa è compreso. Senza questo il prezzo non è confermabile |
| R-02 | A | 18 P-01 · 02 | **Per gli autori il prezzo crolla.** La fascia 29 € è già il prezzo della tesi in 02: per gli studenti P-01 non cambia nulla. Il cambio vero è per autori: da tetto 350 € (250 € al lancio) a 79 € per 300 riferimenti con verifica completa. Va confrontato con le ore reali di 04 prima di confermare | Vedi verifica dei tempi più sotto (file 04 e 12) |
| R-03 | A | 18 P-01 · 02 Garanzie | **Garanzie in conflitto.** "Garanzia unica: rimborso se non sei soddisfatto" sostituisce sei garanzie di 02 senza dirlo. Con prezzo fisso pagato in anticipo cadono per forza la 2 (nessun errore, nessun pagamento) e la 3 (errore non provato, non pagato). Restano da decidere: garanzia sul verde, 72 ore o sconto 20%, riservatezza | Elencare in P-01 quali garanzie restano. Proposta: restano prova per ogni segnalazione, tempi, riservatezza; il rimborso assorbe la garanzia sul verde |
| R-04 | A | 00 D-11 · 18 passi | **D-11 (proprietà dell'archivio) è ancora "da decidere"** e per 00 va chiusa per iscritto prima del primo lavoro pagato, ma non compare nei piccoli passi | Aggiungere un passo prima del 7: chiudere D-11 |
| R-05 | B | 18 P-04 · 02 | **Pagamento prima, file dopo: manca il caso "lavoro non fattibile"** (file illeggibile, più di 300 riferimenti, bibliografia giuridica esclusa da D-10). Serve una regola di rimborso automatico. Con rimborso su carta le commissioni di solito non tornano indietro: da verificare sulle condizioni del fornitore di pagamento | Una riga nelle condizioni (03) e nella pagina d'ordine |
| R-06 | B | 02 Lancio | L'offerta di lancio (tetto 250 € per i primi 3 in cambio di testimonianza) perde senso con P-01 ma non è citata tra le cose superate | Sostituirla: primi 3 lavori gratis o scontati in cambio di testimonianza, oppure toglierla |
| R-07 | B | 02 Bollino · 18 P-07 | Il bollino in 02 vale "solo per la verifica completa". Se la fascia da 29 € non comprende la coerenza fonte-frase su tutto, il bollino su una tesi promette più di quanto si è controllato | Legare il bollino a ciò che la fascia comprende (dipende da R-01) |
| R-08 | B | README | **README non conosce 18.** Non è nella tabella dei file; "Da dove partire" manda a 15, 04, 02 e 14, 16, 00, mentre P-06 dice che l'ingresso è 18 | Se P-06 è confermata: una riga in tabella e "Da dove partire: 18" |
| R-09 | C | 18 P-06 | P-06 dice "19 file": con 18 i file sono 21 (README, 00-18, fonti). La regola "nessun nuovo file senza toglierne uno" è già stata violata da 18 stesso | Indicare quale file esce: candidato 16 (analisi critica), che 18 supera |
| R-10 | C | 00 | D-17 è scritta prima di D-16; ultimo aggiornamento fermo al 15 nov ma contiene D-17 del 16; "nome del servizio e dominio" aperto senza numero mentre D-13 usa "REV" | Riordinare e datare al prossimo aggiornamento di 00 |

### Da 03, 04, 12, 15
| # | Gr. | Dove | Ritrovamento | Che cosa fare |
|---|---|---|---|---|
| R-11 | A | 04 · 12 · 18 P-01 | **La fascia da 29 € non raggiunge l'obiettivo del progetto.** 04 stima 1-1,5 ore umane a lavoro; 12 chiede almeno 40 € per ora umana. A 29 € si ottengono 19-29 €/ora (lordi, prima di commissioni e tasse): l'obiettivo regge solo sotto i 43 minuti a lavoro. A 79 € si ottengono 53-79 €/ora, ma solo se 300 riferimenti con coerenza fonte-frase stanno davvero in 1-1,5 ore: 04 chiede di rivedere tutti i gialli e rossi più 1 verde su 10 (30 verdi), e nessun tempo è ancora misurato | Prima di confermare P-01: cronometrare un lavoro di prova da 100 e uno da 300 riferimenti (può essere il passo 4 allargato). Poi scegliere: alzare la fascia bassa, ridurre ciò che comprende, o accettare 29 € come prezzo d'ingresso dichiarato |
| R-12 | A | 03 · 18 P-02, P-04 | **Le condizioni sono una bozza "da far rivedere a un legale prima dell'uso" e nessun passo lo prevede.** Con P-02 i clienti sono consumatori (studenti, autori) che pagano online: servono informazioni precontrattuali e la regola sul recesso di 14 giorni, compreso il consenso espresso a iniziare subito il lavoro. In 03 il recesso non c'è | Aggiungere un passo prima del 6: 03 riscritta per prezzo fisso e vendita online, riletta da un legale. Punto da verificare con il legale: recesso nei contratti a distanza (Codice del consumo) |
| R-13 | B | 03 art. 4, 10 | Art. 4 descrive ancora il prezzo a errore; art. 10 (garanzia sul verde) va fuso con il rimborso di P-01 | Riscrivere insieme a R-03 |
| R-14 | B | 02 · 03 | **72 ore non è la stessa cosa nei due file:** 02 dice "72 ore dalla ricezione dei file", 03 dice "72 ore lavorative" | Una sola formula. Proposta: "3 giorni lavorativi dal ricevimento del file" |
| R-15 | B | 15 · 18 P-04 | **La routine guarda le richieste solo il lunedì.** Con pagamento immediato un ordine del martedì aspetta sei giorni: salta la promessa delle 72 ore e lo studente con la scadenza se ne va | Con P-04: controllo quotidiano di 5 minuti degli ordini pagati, oppure avviso automatico del pagamento sul telefono |
| R-16 | B | 15 · 18 P-05, P-07 | La routine riserva 45 minuti il mercoledì ai partner e 60 il giovedì al motore (barometro compreso): con P-05 e P-07 sono attività spente | Se confermate: routine ridotta a richieste, lavori, venerdì. Il giovedì resta per un solo motore |
| R-17 | B | 04 passo 1 · 15 lunedì | Il passo "ricezione e preventivo" e l'"accettazione scritta delle condizioni" spariscono con P-04: l'accettazione deve avvenire al pagamento (casella o frase sotto il pulsante) | Riscrivere il passo 1 di 04 quando P-04 è confermata |
| R-18 | B | 12 · 18 P-02, P-08 | **Le soglie non stanno nel tempo di stop.** 12 prevede 3 lavori pagati in 6 settimane; 18 apre agli editori "dopo i primi 10 lavori". A quel ritmo i 10 lavori arrivano dopo circa 20 settimane, oltre il criterio di stop a 3 mesi | Decidere: o la soglia per gli editori scende (es. 3 lavori), o lo stop si misura sul primo incasso e non sui 10 lavori |
| R-19 | B | 12 | Due metriche perdono senso con il prezzo fisso: "contestazioni accolte < 5% degli errori addebitati" e la contromisura "alzare minimo o tetto" | Sostituire con: rimborsi chiesti sul totale dei lavori; contromisura "alzare la fascia" |
| R-20 | C | 04 passo 2 | Lo strumento accetta 30 riferimenti alla volta: un lavoro da 300 sono 10 incolla-e-copia manuali. Sopportabile, ma è tempo umano non contato in 04 | Misurarlo nel lavoro di prova di R-11 |

### Da 07, 10, 13, 14
| # | Gr. | Dove | Ritrovamento | Che cosa fare |
|---|---|---|---|---|
| R-21 | A | 14 fase 0 · 13 · 18 passi | **I piccoli passi saltano tre condizioni della fase 0:** commercialista prima del primo incasso (13 e 14), D-11 scritta, condizioni riviste. Il passo 5 chiede la partita IVA ma non dice che prima serve il commercialista | Inserirli nei passi (vedi "Passi corretti" in fondo) |
| R-22 | B | 07 · 14 · 18 P-02 | **P-02 capovolge l'ordine dei segmenti senza dirlo.** In 07 e 14 gli editori sono fase A e le tesi fase A2 (mesi 2-3, con la "pagina tesi" ancora da fare). Con P-02 le tesi vengono prima: la pagina tesi diventa il primo lavoro, ma non è nei passi | Aggiungere il passo "pagina tesi" e aggiornare la colonna Stato di 07 alla conferma |
| R-23 | B | 13 · 18 P-02 | **Con le tesi al centro, il rischio "integrità accademica" non è più marginale.** In 13 è "bassa probabilità": valeva quando le tesi erano un segmento secondario. Ora è il rischio di immagine principale (università e relatori che leggono "servizio a pagamento per tesi") | Portare in home le regole di 07 ("solo le fonti, mai il testo") e la frase per il relatore; rivalutare la riga in 13 |
| R-24 | B | 13 · 18 P-01, P-04 | **Mancano i rischi nuovi creati dalle proposte:** chi riceve il rapporto e poi chiede il rimborso "perché non soddisfatto"; contestazioni di pagamento con carta; blocco dell'account di pagamento. La riga "contestazioni sul prezzo a errore" invece decade | Regola semplice: rimborso entro 7 giorni, una volta per cliente. Bonifico come riserva. Aggiornare 13 |
| R-25 | B | 14 · 18 P-08 | **Le soglie di P-08 non reggono i conti di 14.** 14 considera equivalenti "20 lavori al mese o 2.000 €": con fasce da 29-79 €, 20 lavori valgono 580-1.580 €. E 20 lavori a 1-1,5 ore sono 20-30 ore al mese, cioè 5-7 a settimana contro le 3-4 previste. Il "secondo revisore pagato a lavoro" della fase C non è pagabile a 29 € | Scrivere le soglie in euro e ore, non solo in numero di lavori |
| R-26 | B | 10 · 13 · 18 passo 4 | Il passo 4 dice "contare i verdi" senza soglia: in 10 la soglia c'è (almeno due terzi, cioè 20 su 30). 13 dà "alta" la probabilità di rossi falsi sui libri italiani, che sono il grosso di una tesi umanistica: più rossi falsi = più tempo umano nel lavoro pagato (vedi R-11) | Soglia nel passo 4. Se i verdi sono meno di 20: non si annuncia e si rifà il conto dei tempi |
| R-27 | B | 10 Evoluzioni · 18 P-04 | 10 prevede il modulo al posto dell'email "oltre 20 richieste al mese"; P-04 lo anticipa. Resta non scritto come arriva il file dopo il pagamento (email di risposta? pagina di conferma con l'indirizzo?) | Una riga in P-04: dopo il pagamento, pagina di conferma con l'indirizzo a cui inviare il file e il numero d'ordine |
| R-28 | B | 00 D-02, D-13 · 10 | **Domanda aperta sull'indipendenza:** il sito è su `pietrofabbri.github.io/rev`. Se quell'account è del promotore, l'indirizzo pubblico del servizio porta il suo nome, contro D-02 (persona indipendente) | Chiarire di chi è l'account. Se è del promotore: spostare il repository sull'account del responsabile prima di uscire dall'anteprima |
| R-29 | C | 10 | 10 è datato 15 nov e non registra il passo 1 di oggi (menu a 4 voci, home accorciata) | Aggiornare data e una riga alla prossima modifica |

### Da 05, 06, 08, 16, 17
| # | Gr. | Dove | Ritrovamento | Che cosa fare |
|---|---|---|---|---|
| R-30 | A | 17 · 18 P-01 | **P-01 toglie la prima difesa dichiarata in 17.** Tra le difese di breve periodo la prima è "si paga solo l'errore provato, garanzia sul verde": è ciò che uno strumento gratuito non può offrire. Il prezzo fisso la cancella e 18 non lo dice. Inoltre il difetto "incentivo a trovare errori" era già stato chiuso in 16 (n. 3) con la prova obbligatoria | Via di mezzo da valutare: prezzo fisso **più** "se non troviamo nemmeno un errore, ti rimborsiamo". Tiene la promessa forte, costa poco (una bibliografia senza errori è rara e veloce), non riapre le liti sulla fattura |
| R-31 | B | 06 · 18 P-02, P-05 | **06 dice il contrario di 18.** Motore B (partner) "attivo dalla fase A", motore C (pagina tesi e biblioteche) "in attesa". Con P-02 e P-05 i motori attivi diventano A (strumento) e C (tesi), e B si spegne | Aggiornare la tabella di 06 alla conferma. Il costo di C è già scritto: 2 ore a settimana per 4 settimane |
| R-32 | B | 06 E · 08 | **Commissioni pensate per lavori da 350 €.** Credito di 10 € a chi presenta un cliente = 34% di un lavoro da 29 €; 20% al partner = 5,80 €, troppo poco per muovere qualcuno. Sommati, su 29 € restano circa 13 € prima di commissioni di pagamento e tasse | Sospendere il credito di 10 € insieme ai partner; ripensare entrambi alla soglia dei 10 lavori |
| R-33 | B | 08 messaggio | Il messaggio ai partner dice "il cliente paga solo per gli errori trovati": con P-01 è falso. La pagina partner "in fondo al sito" (P-05) non deve riportarlo | Correggere il testo prima di lasciare la pagina online |
| R-34 | B | 05 | Il rapporto contiene la riga "Importo: [n errori] × 15 € (minimo 30 €, tetto…)" e la dicitura "non addebitato". Per le tesi manca la riga che dice su quali passaggi è stata controllata la coerenza fonte-frase | Riga importo → "Fascia: fino a 100 / fino a 300 riferimenti". Aggiungere "Che cosa è stato controllato" (dipende da R-01) |
| R-35 | C | 06 · 12 · 14 · 18 | Quattro orologi diversi: 6 settimane (12 e 18), 8 settimane per spegnere un motore (06), 3 mesi per lo stop (14), 6 settimane poi "10 lavori" (18). Non si contraddicono, ma nessun file li mette in fila | Una riga in 18: settimana 6 = primo controllo, settimana 8 = si cambia motore, mese 3 = stop |
| R-36 | C | 16 | 16 è superato da 18: la soluzione n. 2 (due modelli di prezzo) è proprio ciò che P-01 rovescia. Restano utili solo i "problemi ancora aperti" (domanda non provata, copertura italiana, nome e dominio, revisione legale): tutti ancora aperti | È il file da togliere per rispettare P-06 (vedi R-09): portare qui i quattro problemi aperti e archiviare 16 |

### Da 01, 09, 11
| # | Gr. | Dove | Ritrovamento | Che cosa fare |
|---|---|---|---|---|
| R-37 | A | 01 punto 4 · 02 · 18 P-01 | **Il prodotto da 29 € è quasi tutto ciò che 01 dice di regalare.** 01: "il solo controllo di esistenza non è difendibile: va dato gratis e si fa pagare il resto". La verifica tesi comprende esistenza, dati bibliografici e coerenza fonte-frase su soli 10 passaggi. Per il pubblico scelto da P-02 la parte che vale (fonte-frase, firma) è la più piccola | Nella pagina tesi mettere davanti ciò che lo strumento gratuito non fa: correzioni pronte, ricerca a mano dei non trovati, i 10 passaggi, la firma. Va deciso con R-01 |
| R-38 | B | 11 · 03 art. 6-7 · 18 P-04 | Consenso al registro pubblico ed esclusione dall'archivio oggi si chiedono per email. Con il link di pagamento non c'è più un momento in cui chiederli | Due caselle nella pagina d'ordine o due righe nell'email di conferma |
| R-39 | C | 09 | Nessun problema: il barometro è già "in attesa" e P-07 lo conferma spento. Resta valido il conflitto dichiarato | Nulla |

### Dal test dal vivo del 19 nov (dati in `tests/dal-vivo/2026-11-19.md`)
| # | Gr. | Dove | Ritrovamento | Che cosa fare |
|---|---|---|---|---|
| R-40 | A | `config.js` | **Google Libri non risponde: errore 429, quota esaurita.** Senza `googleBooksKey` le chiamate anonime condividono un limite giornaliero comune. Il catalogo più utile per i libri italiani è di fatto spento, e ogni riga diventa "non verificato" | Creare una chiave gratuita su Google Cloud, limitata al dominio del sito, e inserirla in `config.js` |
| R-41 | A | `checker.js` | **Open Library riceve l'intero riferimento** (città, editore, ISBN) e non trova quasi nulla. Interrogato per titolo e cognome, sullo stesso campione trova 17 libri su 30 | Ricerca per `title` e `author` |
| R-42 | A | `checker.js` | **Crossref produce solo falsi abbinamenti sui libri** (8 su 8): la somiglianza conta solo le parole del titolo trovato presenti nel riferimento, quindi titoli corti come "Garibaldi, Giuseppe" o "Documenti" combaciano con tutto | Somiglianza nei due sensi; per un "da controllare" serve anche l'autore |
| R-43 | B | `checker.js` | Lo strumento non sa leggere il titolo nello stile italiano "Autore, Titolo, Città, Editore, Anno". Anche il prototipo sbaglia 4 casi con virgole o trattini nel titolo | Lettura del titolo più robusta, con test automatici sui casi del 19 nov |
| R-44 | B | `checker.js` | Open Library risponde in circa 7 secondi a domanda; con 3 controlli in parallelo alcune righe danno "2-3 cataloghi non hanno risposto". Durante il test la pagina è rimasta bloccata oltre 45 secondi | Tempo massimo per catalogo e un nuovo tentativo prima del "non verificato" |
| R-45 | B | `checker.js` | Il link OPAC SBN cerca solo il cognome (1.880 risultati per Acton) e taglia i cognomi composti ("Mack Smith" diventa "Smith", "de Cesare" diventa "Cesare") | Cognome intero più due parole del titolo |
| R-46 | B | 10 | Le trappole danno "non verificato" invece di rosso e giallo: non si possono giudicare finché c'è R-40 | Ripeterle con il passo 3 |
| R-47 | C | `checker.js` · 02 | **Errore vero trovato a mano:** due righe della bibliografia di Wikipedia hanno lo stesso ISBN (88-17-33601-7). Lo strumento non lo segnala, eppure è un controllo che non richiede nessun catalogo. È un buon esempio di ciò che il servizio trova | Avviso "ISBN ripetuto in due righe". Usare il caso come esempio nella pagina tesi |

**Limite del test:** il campione (Wikipedia, voce "Spedizione dei Mille") è più difficile di una tesi tipica: circa due terzi sono edizioni dell'Ottocento o del primo Novecento, 5 non sono in italiano. Il prossimo giro va fatto anche su una bibliografia recente.

---

## Giudizio sulle otto proposte dopo la seconda passata

| Proposta | Giudizio | Condizione |
|---|---|---|
| P-01 prezzo fisso a fasce | **Non confermabile così com'è** | Prima: che cosa comprende ogni fascia (R-01), quali garanzie restano (R-03, R-30), un lavoro cronometrato (R-11). Il prezzo fisso in sé è giusto per le tesi, dove c'è già |
| P-02 solo tesi e autori | Confermabile | Pagina tesi nei passi (R-22), regole sull'integrità in home (R-23), soglia per gli editori rivista (R-18) |
| P-03 via il dossier | Confermabile subito | Nessuna |
| P-04 link di pagamento | Confermabile, ma non attivabile subito | Prima commercialista e condizioni riviste (R-12, R-21); poi R-05, R-15, R-27, R-38 |
| P-05 partner spenti | Confermabile subito | Correggere il testo della pagina (R-33); sospendere anche il credito di 10 € (R-32) |
| P-06 18 come ingresso | Confermabile subito | Aggiornare README (R-08) e archiviare 16 (R-36) |
| P-07 barometro spento | Confermabile subito | Bollino legato a ciò che la fascia controlla (R-07) |
| P-08 tre soglie | Confermabile | Soglie scritte anche in euro e ore (R-25); orologi in fila (R-35) |

**In breve:** sette proposte su otto reggono. Quella che non regge ancora è la più importante, il prezzo: più di un terzo dei 39 ritrovamenti riguarda P-01 o le sue conseguenze. Il nodo non è "fisso o a errore", ma che il prezzo fisso è stato proposto senza definire il contenuto, senza misurare il tempo e togliendo la garanzia che distingueva il servizio.

## Passi corretti
Adottati il 18 nov: sono la tabella "Piccoli passi" in cima al file.

## Limiti della seconda passata
- I conti di R-11, R-25 e R-32 usano le stime di 04 e 12, mai misurate: indicano dove guardare, non quanto si guadagna.
- I punti legali e fiscali (R-05, R-12, R-24) sono segnalazioni da portare a un legale e al commercialista, non pareri.
- Il sito pubblico non è stato riletto.
