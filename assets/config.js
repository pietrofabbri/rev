/*
 * REV — configurazione unica del sito.
 * È l'UNICO file da modificare per cambiare nome, contatti e prezzi:
 * tutte le pagine leggono da qui.
 *
 * Finché contactEmail, operatorName o vatNumber sono vuoti, il sito mostra
 * il banner "anteprima" e i pulsanti di ordine non inviano email.
 */
window.REV_CONFIG = {
  name: "REV",
  tagline: "Revisione delle fonti",

  // --- Dati del fornitore (obbligatori prima del lancio) ---
  contactEmail: "",          // es. "verifiche@dominio.it"
  operatorName: "",          // nome e cognome di chi fornisce il servizio
  vatNumber: "",             // partita IVA

  // --- Cataloghi ---
  politeEmail: "",           // email del servizio per Crossref/OpenAlex (consigliata)
  googleBooksKey: "AIzaSyDYeCItsg2UY5c7jed6ftQrvs9LrtEjLto", // limitata a https://pietrofabbri.github.io/* (i browser inviano solo il dominio, non /rev/) e alla sola Books API
  maxRefs: 30,
  concurrency: 3,
  // Cataloghi propri, in CSV (colonne: isbn,autore,titolo,anno,editore,link).
  // Si aggiungono qui senza toccare il codice.
  // Esempio: { label: "Archivio REV dei riferimenti verificati", url: "data/archivio.csv" }
  localCatalogs: [],

  // --- Listino (unica fonte dei prezzi del sito) ---
  prices: {
    // Listino D-28 (22 nov 2026): fasce a prezzo fisso, calcolate a 45 € per ora umana (soglia minima 40 €, D-27)
    thesis50: 69,            // verifica tesi fino a 50 fonti
    thesis100: 119,          // fino a 100 fonti
    thesis200: 219,          // fino a 200 fonti
    claims10: 25,            // controllo fonte-frase, 10 passaggi (solo fonti consultabili online)
    notesRebuild: 30,        // senza bibliografia finale: ricostruzione delle note abbreviate, fino a 100 note
    book150: 179,            // verifica di un libro fino a 150 fonti, fonte-frase compreso
    book300: 339,            // fino a 300 fonti
    deliveryDays: 3,         // giorni lavorativi dal ricevimento completo dei file
    delayDiscount: 20,
    partnerCommission: 20,
    partnerMonths: 12
  },

  methodVersion: "1.0",
  methodDate: "15 novembre 2026"
};
