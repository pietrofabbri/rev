# Procedura di verifica

Ultimo aggiornamento: 2026-11-18 · Revisione: dopo ogni 10 lavori, aggiornando i tempi reali · **Unica fonte dei tempi**

## Tempi obiettivo (stime mai misurate: si misurano al passo 4 di 18)

| Passo | Chi | Tempo stimato |
|---|---|---|
| 1. Ricezione | Responsabile + modello email | 5 min |
| 2. Controllo automatico di esistenza (blocchi da 30 riferimenti) | Strumento online | 5-10 min ogni 100 riferimenti |
| 3. Controllo fonte-frase | AI con il prompt qui sotto | 10-20 min, in automatico |
| 4. Revisione di gialli e rossi | **Persona** | 30-60 min |
| 5. Rapporto e consegna | AI compila, persona rilegge | 10 min |
| 6. Registro, archivio, fattura | Responsabile | 10 min |

**Totale umano stimato: 1-1,5 ore a lavoro.** Se un lavoro supera le 3 ore, va annotato e la causa entra nella revisione mensile.

**Perché conta:** a 29 € l'obiettivo di 40 € per ora umana (12) regge solo sotto i 43 minuti a lavoro. Il prezzo si fissa dopo la misura (D-24).

## Cronometro del lavoro di prova (passo 4 di 18)
Da compilare durante il lavoro, un minuto per volta, poi riportare in 12.

| Passo | Minuti reali | Note (cosa ha rallentato) |
|---|---|---|
| 1. Ricezione | | |
| 2. Esistenza (n. blocchi da 30: __ ) | | Tempo di incolla-e-copia compreso |
| 3. Fonte-frase (n. passaggi: __ ) | | |
| 4. Revisione gialli e rossi (n. gialli __ · rossi __ · verdi a campione __ ) | | Rossi falsi su libri italiani: __ |
| 5. Rapporto | | |
| 6. Chiusura | | |
| **Totale** | | Riferimenti: __ |

## Passi
1. **Ricezione.** Il cliente invia bibliografia e, per il controllo fonte-frase, il testo con le citazioni (per le tesi: i 10 passaggi scelti). Oggi si risponde con prezzo o tetto e data di consegna, e si parte solo dopo l'accettazione scritta delle condizioni. *Con il link di pagamento (D-25, passo 10) il preventivo sparisce: l'accettazione delle condizioni e i consensi a registro e archivio si danno al momento del pagamento; si controlla solo che il file sia nella fascia pagata (altrimenti: condizioni, punto 11).*
2. **Esistenza.** Si incolla la bibliografia nello strumento (in blocchi da 30) e si salva il rapporto copiato.
3. **Fonte-frase.** Per ogni citazione con fonte accessibile si usa il prompt qui sotto. Se la fonte non è accessibile: "contenuto non verificabile".
4. **Revisione umana.** La persona controlla **tutti** i gialli e i rossi, più 1 verde ogni 10 a campione. Un errore conta solo con la prova trovata o confermata dalla persona.
5. **Rapporto.** Si compila [05-modello-rapporto.md](05-modello-rapporto.md).
6. **Chiusura.** Fattura, registro (se il cliente acconsente), archivio ([11](11-archivio-riferimenti.md)), cancellazione dei file del cliente.

## Prompt per il controllo fonte-frase
```
Ti do una frase tratta da un testo e l'estratto della fonte che cita.
Rispondi solo in questo formato:
ESITO: SOSTIENE | NON SOSTIENE | PARZIALE | NON DETERMINABILE
ESTRATTO DECISIVO: [frase della fonte, copiata alla lettera, max 40 parole]
MOTIVO: [una frase]
Regole: se non trovi una frase della fonte che giustifichi l'esito, rispondi NON DETERMINABILE.
Non usare conoscenze esterne alla fonte fornita.
FRASE: ...
FONTE (estratto): ...
```
**Regola di sicurezza:** un esito dell'AI senza estratto copiato alla lettera e controllato dalla persona non entra mai nel rapporto come errore.

## Fonti per la ricerca manuale
Crossref, OpenAlex, PubMed, OPAC SBN, Google Libri, Open Library, Normattiva, EUR-Lex, siti delle riviste. L'ordine è dal più veloce al più lento.
