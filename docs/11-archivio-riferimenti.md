# Archivio dei riferimenti verificati

Ultimo aggiornamento: 2026-11-22 · Revisione: ogni 3 mesi

## Perché
È il vantaggio che un concorrente non può copiare subito: un elenco crescente di riferimenti italiani verificati a mano (libri, capitoli, riviste senza DOI) che i cataloghi automatici non coprono.

## Formato (semplice e trasferibile)
Un file CSV in un repository con cronologia, una riga per riferimento:

| Campo | Esempio |
|---|---|
| id | 2026-0001 |
| autore | Eco, Umberto |
| titolo | Il nome della rosa |
| anno | 1980 |
| editore_o_rivista | Bompiani |
| identificativo | ISBN, DOI o codice SBN, se presente |
| link_prova | URL del catalogo o della scheda |
| data_verifica | 2026-11-20 |
| verificato_da | iniziali |

## Regole
- Si salvano **solo dati bibliografici pubblici**, mai il testo dei clienti né il titolo del lavoro verificato.
- Si aggiunge una riga solo quando la persona ha confermato il riferimento con una prova.
- Il cliente può chiedere di escludere i riferimenti del suo lavoro (condizioni, punto 6). Oggi lo chiede per email; con il link di pagamento (D-25) lo indica con una casella al momento dell'ordine.
- La proprietà dell'archivio va decisa per iscritto (D-11) prima del primo lavoro pagato: passo 6 di [18](18-revisione-critica.md).

## Bozza di accordo sulla proprietà dell'archivio (D-11)
Da adattare, firmare in due copie e conservare **prima del primo lavoro pagato**. È una bozza di lavoro, non un parere legale: va fatta leggere al legale insieme alle condizioni (passo 7 di 18).

> **Accordo sull'archivio dei riferimenti verificati**
>
> Tra [nome del responsabile], P.IVA [numero] ("il Responsabile"), e [nome del promotore] ("il Promotore").
>
> 1. **Oggetto.** L'archivio è l'elenco dei riferimenti bibliografici verificati nel servizio REV, nel formato descritto nel documento "Archivio dei riferimenti verificati". Contiene solo dati bibliografici pubblici, mai testi dei clienti.
> 2. **Proprietà.** L'archivio appartiene al Responsabile, che lo costruisce con il proprio lavoro.
> 3. **Licenza al Promotore.** Il Responsabile concede al Promotore una licenza d'uso gratuita, non esclusiva e senza scadenza, per consultarlo e per usarlo in servizi propri, anche dopo la fine della collaborazione.
> 4. **Formato aperto.** L'archivio è tenuto in un file CSV in un repository con cronologia, accessibile a entrambi. Nessuno dei due può chiuderlo in un formato o in un servizio che l'altro non possa leggere.
> 5. **Clienti.** Il Responsabile esclude dall'archivio i riferimenti dei clienti che lo chiedono, come previsto dalle condizioni del servizio.
> 6. **Cessione o fine del servizio.** Se l'archivio viene ceduto o il servizio chiude, il Promotore ha diritto di prelazione a parità di condizioni, e la licenza del punto 3 resta valida.
> 7. **Modifiche.** Solo per iscritto, firmate da entrambi.
>
> Luogo e data. Firme.

## Effort
Circa 5 minuti a lavoro, già contati in [04](04-processo-verifica.md), passo 6.

## Quando collegarlo allo strumento
Oltre 2.000 righe (D-12). Va considerato che pubblicarlo come file statico lo rende copiabile: in quel momento si sceglierà tra una pubblicazione aperta (più traffico, nessuna esclusiva) e una piccola funzione online che risponde solo a singole ricerche.
