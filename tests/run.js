// Test del motore di controllo, senza rete: i cataloghi sono simulati.
// Uso: node tests/run.js
"use strict";
const assert = require("assert");
const path = require("path");

globalThis.REV_CONFIG = {
  maxRefs: 30, concurrency: 2, retryDelayMs: 0,
  localCatalogs: [{ label: "Catalogo degli editori aderenti", url: "data/catalogo-editori.csv" }]
};

let calls = [];
let routes = {};
function reply(status, body){
  return { status, ok: status >= 200 && status < 300,
    json: async () => body, text: async () => (typeof body === "string" ? body : JSON.stringify(body)) };
}
globalThis.fetch = async (url) => {
  calls.push(url);
  for (const key of Object.keys(routes)) if (url.includes(key)) {
    const r = routes[key];
    return typeof r === "function" ? r(url) : r;
  }
  return reply(200, {});
};

const X = require(path.join(__dirname, "..", "assets", "checker.js"));
globalThis.REV_CHECKER = X;
const E = require(path.join(__dirname, "..", "assets", "estrai.js"));
const fs = require("fs");
const tests = [];
function test(name, fn){ tests.push([name, fn]); }
function setup(r){ calls = []; routes = r; X._resetCatalogs(); }

const EMPTY = {
  "catalogo-editori.csv": reply(200, "isbn,autore,titolo,anno,editore,link\n"),
  "api.crossref.org/works?": reply(200, { message: { items: [] } }),
  "googleapis.com/books": reply(200, {}),
  "openlibrary.org": reply(200, { docs: [] }),
  "openalex.org": reply(200, { is_retracted: false })
};

// ---- funzioni pure ----
test("ISBN-13 valido e non valido", () => {
  assert.strictEqual(X.extractISBN("Libro, ISBN 978-0-306-40615-7."), "9780306406157");
  assert.strictEqual(X.extractISBN("Libro, ISBN 978-0-306-40615-8."), null);
  assert.strictEqual(X.extractISBN("Libro 9780306406157 senza prefisso"), "9780306406157");
});
test("ISBN-10 valido", () => {
  assert.strictEqual(X.extractISBN("ISBN 0-306-40615-2"), "0306406152");
});
test("DOI e anno", () => {
  assert.strictEqual(X.extractDOI("Rossi (2020). Titolo. doi:10.1000/xyz123."), "10.1000/xyz123");
  assert.strictEqual(X.extractYear("Eco, U. (1977). Come si fa una tesi"), 1977);
});
test("CSV con virgolette e virgole", () => {
  const rows = X.parseCSV('isbn,autore,titolo,anno,editore,link\n123,"Eco, Umberto","Titolo, con virgola",1980,Bompiani,http://x\n');
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].autore, "Eco, Umberto");
  assert.strictEqual(rows[0].titolo, "Titolo, con virgola");
});
test("divisione dei riferimenti e numerazione", () => {
  const r = X.splitRefs("1. Eco, U. (1977). Come si fa una tesi di laurea.\n\ncorto\n[2] Calvino, I. (1988). Lezioni americane. Garzanti.");
  assert.deepStrictEqual(r.length, 2);
  assert.ok(r[0].startsWith("Eco"));
});

test("link di ricerca manuale", () => {
  assert.strictEqual(X.firstSurname("Eco, U. (1977). Come si fa una tesi."), "Eco");
  assert.strictEqual(X.firstSurname("Umberto Eco, Come si fa una tesi, Bompiani 1977"), "Eco");
  const l = X.searchLinks("Eco, U. (1977). Come si fa una tesi.");
  assert.ok(l[0][1].startsWith("https://opac.sbn.it/") && l[0][1].includes("fieldvalue%5B1%5D=Eco%20come%20tesi") && l[0][1].includes("Keywords"));
  assert.strictEqual(l.length, 3);
});

// ---- orchestrazione ----
test("DOI registrato: verde", async () => {
  setup({ ...EMPTY, "api.crossref.org/works/10.": reply(200, { message: { title: ["Attention Is All You Need"], issued: { "date-parts": [[2017]] } } }) });
  const r = await X.checkOne("Vaswani, A. (2017). Attention Is All You Need. NeurIPS. https://doi.org/10.5555/3295222.3295349");
  assert.strictEqual(r.state, "verde");
});
test("DOI ritirato: rosso", async () => {
  setup({ ...EMPTY, "api.crossref.org/works/10.": reply(200, { message: { title: ["Studio ritirato"], issued: { "date-parts": [[2019]] } } }),
    "openalex.org": reply(200, { is_retracted: true }) });
  const r = await X.checkOne("Bianchi (2019). Studio ritirato. doi:10.1234/abc");
  assert.strictEqual(r.state, "rosso");
  assert.ok(r.found.includes("ritirato"));
});
test("DOI con Crossref giù: non verificato, mai rosso", async () => {
  setup({ ...EMPTY, "api.crossref.org/works/10.": reply(503, {}) });
  const r = await X.checkOne("Bianchi (2019). Studio. doi:10.1234/abc");
  assert.strictEqual(r.state, "errore");
});
test("Catalogo aderenti: verde senza interrogare la rete", async () => {
  setup({ ...EMPTY, "catalogo-editori.csv": reply(200,
    'isbn,autore,titolo,anno,editore,link\n9780306406157,"Verdi, Anna",Storia minima della tipografia veneta,2019,Edizioni Esempio,https://example.org/libro\n') });
  const r = await X.checkOne("Verdi, A. (2019). Storia minima della tipografia veneta. Venezia: Edizioni Esempio.");
  assert.strictEqual(r.state, "verde");
  assert.ok(r.found.includes("editori aderenti"));
  assert.ok(!calls.some(u => u.includes("crossref") || u.includes("googleapis")));
});
test("Libro italiano trovato da Google Libri", async () => {
  setup({ ...EMPTY, "googleapis.com/books": reply(200, { items: [{ volumeInfo: {
    title: "Come si fa una tesi di laurea", authors: ["Umberto Eco"], publishedDate: "1977", publisher: "Bompiani", infoLink: "https://books.google.it/x" } }] }) });
  const r = await X.checkOne("Eco, U. (1977). Come si fa una tesi di laurea. Milano: Bompiani.");
  assert.strictEqual(r.state, "verde");
  assert.ok(r.found.includes("Google Libri"));
});
test("ISBN di un altro libro: da controllare", async () => {
  setup({ ...EMPTY, "googleapis.com/books": reply(200, { items: [{ volumeInfo: {
    title: "Manuale di giardinaggio", authors: ["Mario Neri"], publishedDate: "2010" } }] }) });
  const r = await X.checkOne("Eco, U. (1977). Come si fa una tesi di laurea. ISBN 978-0-306-40615-7.");
  assert.strictEqual(r.state, "giallo");
  assert.ok(r.found.includes("titolo diverso"));
});
test("Riferimento inventato: non trovato", async () => {
  setup({ ...EMPTY });
  const r = await X.checkOne("Rossi, M. (2021). Un libro che forse non esiste affatto. Roma: Editore Immaginario.");
  assert.strictEqual(r.state, "rosso");
  assert.ok(r.found.includes("controllato a mano"));
});
test("Un catalogo giù e nessun risultato: non verificato", async () => {
  setup({ ...EMPTY, "api.crossref.org/works?": reply(429, {}) });
  const r = await X.checkOne("Rossi, M. (2021). Un libro che forse non esiste affatto. Roma: Editore Immaginario.");
  assert.strictEqual(r.state, "errore");
});
test("Un catalogo giù ma un altro trova: verde", async () => {
  setup({ ...EMPTY, "api.crossref.org/works?": reply(500, {}), "googleapis.com/books": reply(200, { items: [{ volumeInfo: {
    title: "Lezioni americane", authors: ["Italo Calvino"], publishedDate: "1988", publisher: "Garzanti" } }] }) });
  const r = await X.checkOne("Calvino, I. (1988). Lezioni americane. Milano: Garzanti.");
  assert.strictEqual(r.state, "verde");
});
test("checkAll rispetta il limite e l'ordine", async () => {
  setup({ ...EMPTY });
  const refs = Array.from({ length: 35 }, (_, i) => "Autore" + i + ", A. (2001). Titolo inventato numero " + i + ". Editore.");
  const out = await X.checkAll(refs);
  assert.strictEqual(out.list.length, 30);
  assert.strictEqual(out.results.length, 30);
  assert.ok(out.results.every(r => r && r.state === "rosso"));
});

// ---- casi reali del test dal vivo del 19 nov 2026 (tests/dal-vivo/2026-11-19.md) ----
const CARTER = "Nick Carter, Britain, Ireland and the Italian Risorgimento, Londra, Palgrave Macmillan, 2015, ISBN 978-1-137-29771-6.";
const CURATOLO = "Giacomo Emilio Curatolo, Garibaldi, Vittorio Emanuele, Cavour nei fasti della Patria – Documenti inediti, Bologna, Zanichelli, MCMXI.";
const GARIBALDI = "Giuseppe Garibaldi, I Mille, Torino, Tip. e Lit. Camilla e Bertolero, 1874.";
const BANTI = "Alberto Mario Banti, Il Risorgimento italiano, Roma-Bari, Laterza, 2008, ISBN 9788842085744.";
test("lettura dello stile italiano: titoli con virgole e anno romano", () => {
  assert.strictEqual(X.parseRef(CARTER).title, "Britain, Ireland and the Italian Risorgimento");
  assert.strictEqual(X.parseRef(CARTER).year, 2015);
  assert.strictEqual(X.parseRef(CURATOLO).title, "Garibaldi, Vittorio Emanuele, Cavour nei fasti della Patria – Documenti inediti");
  assert.strictEqual(X.parseRef("Harold Acton, Gli ultimi Borboni di Napoli (1825-1861), Firenze, Giunti Editore, 1997, ISBN 88-09-21256-8.").title, "Gli ultimi Borboni di Napoli (1825-1861)");
  assert.strictEqual(X.mainTitle("Gli ultimi Borboni di Napoli (1825-1861)"), "Gli ultimi Borboni di Napoli");
  assert.strictEqual(X.parseRef("Eco, U. (1977). Come si fa una tesi di laurea. Milano: Bompiani.").title, "Come si fa una tesi di laurea");
});
test("cognomi composti", () => {
  assert.strictEqual(X.surnameOf("Denis Mack Smith"), "Mack Smith");
  assert.strictEqual(X.surnameOf("Raffaele de Cesare"), "de Cesare");
  assert.strictEqual(X.surnameOf("Gigi Di Fiore"), "Di Fiore");
  assert.strictEqual(X.surnameOf("Giuseppe Cesare Abba"), "Abba");
  assert.strictEqual(X.surnameOf("Alexandre Dumas (padre)"), "Dumas");
  assert.ok(X.searchLinks("Denis Mack Smith, I Savoia re d'Italia, Milano, Rizzoli, 1990.")[0][1].includes("fieldvalue%5B1%5D=Mack%20Smith%20savoia"));
  assert.ok(X.searchLinks("FOFI, Goffredo, Il ’68 senza Lenin, Roma, e/o, 1998.")[0][1].includes("fieldvalue%5B1%5D=FOFI%20senza%20lenin"));
});
test("titolo corto di Crossref non combacia con tutto", async () => {
  setup({ ...EMPTY, "api.crossref.org/works?": reply(200, { message: { items: [
    { DOI: "10.4135/x", title: ["Garibaldi, Giuseppe"], author: [], issued: { "date-parts": [[2013]] } },
    { DOI: "10.1163/y", title: ["Documenti"], issued: { "date-parts": [[1973]] } } ] } }) });
  const r = await X.checkOne(GARIBALDI);
  assert.strictEqual(r.state, "rosso");
});
test("Open Library cercato per titolo e autore", async () => {
  setup({ ...EMPTY, "openlibrary.org": (url) => url.includes("title=") && url.includes("author=Banti")
    ? reply(200, { docs: [{ title: "Il Risorgimento italiano", author_name: ["Alberto Mario Banti"], first_publish_year: 2004, key: "/works/OL1W" }] })
    : reply(200, { docs: [] }) });
  const r = await X.checkOne(BANTI);
  assert.strictEqual(r.state, "verde");
  assert.ok(r.found.includes("Open Library"));
});
test("stesso ISBN in due righe: da controllare, con avviso", async () => {
  setup({ ...EMPTY, "openlibrary.org": reply(200, { docs: [
    { title: "La fine di un regno", author_name: ["Raffaele de Cesare"], first_publish_year: 1900, key: "/works/OL2W" },
    { title: "I Savoia re d'Italia", author_name: ["Denis Mack Smith"], first_publish_year: 1990, key: "/works/OL3W" } ] }) });
  const out = await X.checkAll([
    "Raffaele de Cesare, La Fine di un regno - vol.II, Città di Castello, S. Lapi tipografo editore, 1900, ISBN 88-17-33601-7.",
    "Denis Mack Smith, I Savoia re d'Italia, Milano, Rizzoli, 1990, ISBN 88-17-33601-7."]);
  assert.ok(out.results.every(r => r.state === "giallo" && r.found.includes("Lo stesso ISBN")));
});
test("ISBN di un altro libro: il verde del titolo non basta", async () => {
  setup({ ...EMPTY, "openlibrary.org": (url) => url.includes("isbn=")
    ? reply(200, { docs: [{ title: "Borbonia felix", author_name: ["Renata De Lorenzo"], key: "/works/OL9W" }] })
    : reply(200, { docs: [{ title: "Il Risorgimento italiano", author_name: ["Alberto Mario Banti"], first_publish_year: 2004, key: "/works/OL1W" }] }) });
  const r = await X.checkOne("Alberto Mario Banti, Il Risorgimento italiano, Roma-Bari, Laterza, 2008, ISBN 978-88-8402-830-3.");
  assert.strictEqual(r.state, "giallo");
  assert.ok(r.found.includes("titolo diverso") && r.found.includes("Borbonia felix"));
});
test("ISBN giusto confermato da Open Library: verde", async () => {
  setup({ ...EMPTY, "openlibrary.org": (url) => url.includes("isbn=")
    ? reply(200, { docs: [{ title: "Il Risorgimento italiano (Economica Laterza) (Italian Edition)", author_name: ["Alberto M. Banti"], key: "/works/OL1W" }] })
    : reply(200, { docs: [{ title: "Il Risorgimento italiano (Economica Laterza) (Italian Edition)", author_name: ["Alberto Mario Banti"], first_publish_year: 2004, key: "/works/OL1W" }] }) });
  const r = await X.checkOne(BANTI);
  assert.strictEqual(r.state, "verde");
});
// ---- casi reali della prova a secco del 19 nov (articolo di storia con 104 note) ----
test("stile COGNOME, Nome", () => {
  const a = X.parseRef("FANTONI, Gianluca, Italy through the Red Lens, Londra, Palgrave, 2019.");
  assert.strictEqual(a.surname, "FANTONI"); assert.strictEqual(a.title, "Italy through the Red Lens"); assert.strictEqual(a.year, 2019);
  const b = X.parseRef("MASONI, Tullio, VECCHI, Paolo, Cinenotizie in poesia e prosa. Zavattini e la non-fiction, Torino, Lindau, 2000, p. 3.");
  assert.strictEqual(b.surname, "MASONI"); assert.strictEqual(b.title, "Cinenotizie in poesia e prosa. Zavattini e la non-fiction"); assert.strictEqual(b.year, 2000);
  const c = X.parseRef("BARLETTA, Luigi (a cura di), Scritti scostumati per uno zibaldone gregorettiano, Napoli, Guida, 2012, p. 14.");
  assert.strictEqual(c.title, "Scritti scostumati per uno zibaldone gregorettiano");
  const d = X.parseRef("BRUNETTA, Gian Piero, Cent’anni di cinema italiano. Dal 1945 ai giorni nostri, vol. 2, Roma-Bari, Laterza, 2004.");
  assert.strictEqual(d.surname, "BRUNETTA"); assert.ok(d.title.startsWith("Cent’anni di cinema italiano"));
  const e = X.parseRef("DELLA CASA, Stefano, «Il cinema militante», in CANOVA, Gianni (ed.), Storia del cinema italiano, Venezia, Marsilio, 2002, pp. 3-9.");
  assert.strictEqual(e.surname, "DELLA CASA"); assert.strictEqual(e.title, "Il cinema militante");
});
test("articolo di quotidiano: mai rosso", async () => {
  setup({ ...EMPTY });
  const ref = "CRESPI, Alberto, «Gregoretti: “Nel ’69 l’Italia era nel futuro”», in l’Unità, 21 novembre 1999, p. 4.";
  assert.ok(X.isNewspaper(ref));
  const r = await X.checkOne(ref);
  assert.strictEqual(r.state, "errore"); assert.ok(r.found.includes("Articolo di giornale"));
  assert.ok(!X.isNewspaper("DELLA CASA, Stefano, «Il cinema militante», in Storia del cinema italiano, Venezia, Marsilio, 2002."));
});
// ---- lettura dei file e note/bibliografia ----
test("Word: bibliografia finale e note a piè di pagina", async () => {
  const buf = fs.readFileSync(path.join(__dirname, "fixtures", "tesi-di-prova.docx"));
  const doc = await E.readDocx(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  assert.strictEqual(doc.notes.length, 6);
  const bib = E.findBibliography(doc.paragraphs);
  assert.strictEqual(bib.length, 4);
  assert.ok(bib[0].startsWith("CRAINZ"));
  assert.ok(!bib.some(b => b.includes("Grazie")));
  const r = E.analyzeNotes(doc.notes, bib);
  assert.strictEqual(r.rinvii, 1);
  assert.strictEqual(r.abbreviate, 2);
  assert.strictEqual(r.commento, 1);
  assert.deepStrictEqual(r.mancanti, ["GINSBORG"]);
  assert.strictEqual(r.nonCitate.length, 1);
  assert.ok(r.nonCitate[0].startsWith("BRUNETTA"));
});
test("Ibidem nella prima nota", () => {
  const r = E.analyzeNotes(["Ibidem, p. 3.", "FOFI, Goffredo, Il ’68 senza Lenin, Roma, e/o, 1998.", "a", "b", "c"], ["FOFI, Goffredo, Il ’68 senza Lenin, Roma, e/o, 1998."]);
  assert.strictEqual(r.rinvioIniziale, true);
});
test("PDF: righe a capo riunite in una voce", () => {
  const p = E.joinPdfLines(["Bibliografia", "CRAINZ, Guido, Il paese mancato. Dal miracolo", "economico agli anni Ottanta, Roma, Donzelli, 2003.", "FOFI, Goffredo, Il ’68 senza Lenin, Roma, e/o, 1998."]);
  const bib = E.findBibliography(p);
  assert.strictEqual(bib.length, 2);
  assert.ok(bib[0].endsWith("Donzelli, 2003."));
});
// ---- esportazione ----
test("autori e editore letti dal riferimento", () => {
  const a = X.parseRef("MASONI, Tullio, VECCHI, Paolo, Cinenotizie in poesia e prosa, Torino, Lindau, 2000, p. 3.");
  assert.deepStrictEqual(a.authors, ["Masoni, Tullio", "Vecchi, Paolo"]);
  assert.strictEqual(a.publisher, "Lindau"); assert.strictEqual(a.city, "Torino");
  const b = X.parseRef("Eco, U. (1977). Come si fa una tesi di laurea. Milano: Bompiani.");
  assert.deepStrictEqual(b.authors, ["Eco, U."]); assert.strictEqual(b.publisher, "Bompiani"); assert.strictEqual(b.city, "Milano");
  assert.strictEqual(X.lastFirst("Denis Mack Smith"), "Mack Smith, Denis");
  const c = X.parseRef("DELLA CASA, Stefano, «Il cinema militante», in Storia del cinema italiano, Venezia, Marsilio, 2002.");
  assert.deepStrictEqual(c.authors, ["Della Casa, Stefano"]); assert.strictEqual(c.container, "Storia del cinema italiano");
});
test("RIS e BibTeX: dati del catalogo, edizione del riferimento, esito in nota", () => {
  const list = ["Eco, U. (1977). Come si fa una tesi di laurea. Milano: Bompiani.",
    "Rossi, M. (2021). Un libro che forse non esiste. Roma: Editore Immaginario."];
  const results = [
    { state: "verde", found: "Libro in Google Libri", meta: { source: "Google Libri", type: "book", title: "Come si fa una tesi di laurea", authors: ["Eco, Umberto"], year: 2017, publisher: "La nave di Teseo", isbn: "9788893442312" } },
    { state: "rosso", found: "Non trovato nei cataloghi consultati." }];
  const recs = X.buildRecords(list, results, new Date(2026, 10, 19));
  assert.strictEqual(recs[0].year, 1977);                 // edizione citata, non quella del catalogo
  assert.strictEqual(recs[0].publisher, "Bompiani");
  assert.deepStrictEqual(recs[0].authors, ["Eco, Umberto"]);
  const ris = X.toRIS(recs);
  assert.ok(ris.includes("TY  - BOOK\r\nAU  - Eco, Umberto\r\nTI  - Come si fa una tesi di laurea"));
  assert.ok(ris.includes("N1  - REV, controllo automatico del 19/11/2026: non trovato nei cataloghi."));
  assert.strictEqual((ris.match(/ER  - /g) || []).length, 2);
  const bib = X.toBibTeX(recs);
  assert.ok(bib.startsWith("@book{eco1977,"));
  assert.ok(bib.includes("author = {Eco, Umberto}") && bib.includes("publisher = {Bompiani}"));
  assert.ok(bib.includes("@book{rossi2021,") || bib.includes("@misc{rossi2021,"));
});
test("errore temporaneo: secondo tentativo", async () => {
  let n = 0;
  setup({ ...EMPTY, "api.crossref.org/works/10.": () => (++n === 1 ? reply(503, {}) :
    reply(200, { message: { title: ["Attention Is All You Need"], issued: { "date-parts": [[2017]] } } })) });
  const r = await X.checkOne("Vaswani, A. (2017). Attention Is All You Need. doi:10.5555/3295222.3295349");
  assert.strictEqual(r.state, "verde");
  assert.strictEqual(n, 2);
});

(async () => {
  let fail = 0;
  for (const [name, fn] of tests){
    try { await fn(); console.log("ok   " + name); }
    catch (e){ fail++; console.log("FAIL " + name + "\n     " + e.message); }
  }
  console.log(`\n${tests.length - fail}/${tests.length} test superati`);
  process.exit(fail ? 1 : 0);
})();
