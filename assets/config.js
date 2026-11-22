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
    perError: 15,
    minimum: 30,
    capDefault: 350,
    capDefaultRefs: 300,
    thesis: 29,
    thesisMaxRefs: 100,
    thesisClaims: 10,
    deliveryDays: 3,         // giorni lavorativi dal ricevimento completo dei file
    delayDiscount: 20,
    partnerCommission: 20,
    partnerMonths: 12
  },

  methodVersion: "1.0",
  methodDate: "15 novembre 2026"
};
