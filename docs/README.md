# Servizio di verifica delle fonti — manuale operativo

Ultimo aggiornamento: 2026-11-18 · Responsabile della manutenzione: responsabile del servizio

> **Documento pubblico (D-26).** Questa cartella è la copia pubblica del manuale interno del servizio REV: decisioni, prezzi in discussione, rischi e piani compresi. Le cifre segnate come stime sono stime, e le proposte non ancora decise non sono un'offerta ai clienti: l'offerta valida è solo quella pubblicata sulle pagine del sito.

## Da dove partire
**Da [18-revisione-critica.md](18-revisione-critica.md)** (D-21): il piano in una riga, i piccoli passi in ordine e lo stato di ognuno. Gli altri file si aprono solo quando un passo lo richiede.

## Che cos'è
Un servizio che verifica bibliografie e citazioni (esistenza, correttezza, coerenza con la frase citata), gestito da una persona indipendente con l'AI per il 90-95% del lavoro. Si parte a costo quasi zero e si cresce solo con i ricavi. Pubblico iniziale: tesi e autori (D-18).

## Dove vive il manuale
Due copie identiche, aggiornate insieme (D-26): il progetto su claude.ai (cartella `ente-verifica/`) e la cartella `docs/` del repository [pietrofabbri/rev](https://github.com/pietrofabbri/rev). La cronologia delle modifiche è quella di git.

## Come è organizzata la cartella
Ogni informazione vive in **un solo file**. Gli altri file la richiamano con un link e non la ricopiano. **Nessun nuovo file senza toglierne uno** (D-21).

| File | Contenuto | Chi lo usa | Revisione |
|---|---|---|---|
| [18-revisione-critica.md](18-revisione-critica.md) | **Ingresso**: piano, passi, problemi aperti, ritrovamenti della revisione | Tutti | A ogni passo chiuso |
| [00-decisioni.md](00-decisioni.md) | Registro delle decisioni prese | Tutti | A ogni decisione |
| [01-sintesi-ricerca.md](01-sintesi-ricerca.md) | Perché il servizio ha senso: le prove | Promotore | Ogni 6 mesi |
| [02-offerta.md](02-offerta.md) | Servizi, **listino unico**, garanzie, definizione di errore | Tutti | Al passo 5, poi ogni 3 mesi |
| [03-condizioni-servizio.md](03-condizioni-servizio.md) | Bozza delle condizioni per i clienti | Clienti | Al passo 7, poi ogni anno |
| [04-processo-verifica.md](04-processo-verifica.md) | Procedura passo per passo, con i tempi e il cronometro | Responsabile | Dopo ogni 10 lavori |
| [05-modello-rapporto.md](05-modello-rapporto.md) | Rapporto da consegnare al cliente | Responsabile | Quando cambia l'offerta |
| [06-motori-pull.md](06-motori-pull.md) | Come attirare clienti senza disturbare | Responsabile | Ogni mese |
| [07-segmenti.md](07-segmenti.md) | Tesi, autori, editori, avvocati | Responsabile | Ogni 3 mesi |
| [08-partner.md](08-partner.md) | Programma partner (sospeso, D-20) | Responsabile | Alla soglia dei 10 lavori |
| [09-barometro-chatbot.md](09-barometro-chatbot.md) | Protocollo del barometro (spento, D-22) | Responsabile | Alla soglia dei 20 lavori al mese |
| [10-strumento-online.md](10-strumento-online.md) | Sito e strumento gratuito: configurazione, test | Responsabile | A ogni modifica |
| [11-archivio-riferimenti.md](11-archivio-riferimenti.md) | L'archivio dei riferimenti verificati | Responsabile | Ogni 3 mesi |
| [12-metriche.md](12-metriche.md) | Numeri da guardare e revisione settimanale | Tutti | Ogni settimana |
| [13-rischi.md](13-rischi.md) | Rischi, conformità e contromisure | Tutti | Ogni 3 mesi |
| [14-roadmap.md](14-roadmap.md) | Preparazione e tre soglie | Tutti | A ogni soglia |
| [15-routine-settimanale.md](15-routine-settimanale.md) | Agenda fissa della settimana | Responsabile | Ogni 3 mesi |
| [17-barriere.md](17-barriere.md) | Barriere all'ingresso e come costruirle con poco sforzo | Promotore | Ogni 3 mesi |
| [fonti.md](fonti.md) | Fonti principali con link | Tutti | Ogni 6 mesi |
| [indice-trattati.md](indice-trattati.md) | Indice dei sei trattati di ricerca | Promotore | Quando cambia un trattato |
| [16-analisi-critica.md](16-analisi-critica.md) | *Archiviato il 18 nov*: storico dei problemi del 9-16 nov. Non si aggiorna più | — | — |

## Regole di manutenzione
1. **Una sola fonte di verità.** Prezzi solo in 02, tempi solo in 04, numeri solo in 12, passi solo in 18.
2. **Ogni file riporta in cima la data di aggiornamento.** Un file non toccato da oltre 6 mesi va riletto.
3. **Ogni cambiamento importante entra in 00-decisioni.md** con data e motivo.
4. **Si decide guardando 12-metriche.md, non a sensazione.**
5. **Massimo due motori pull attivi alla volta** (vedi 06).
6. **Ogni modifica va nelle due copie** (progetto e `docs/`), con un commit che dice che cosa è cambiato.

## Documenti collegati
Sei trattati di ricerca e un registro delle fonti controllate, su claude.ai: sono privati del promotore finché non li condivide. I link sono in [01-sintesi-ricerca.md](01-sintesi-ricerca.md).
