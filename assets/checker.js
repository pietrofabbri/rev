/*
 * REV — controllo automatico delle bibliografie.
 * Gira nel browser del visitatore: nessun server, nessun dato conservato.
 * Fonti: cataloghi propri (CSV), Crossref, Google Libri, Open Library, OpenAlex (ritiri).
 * Regola: "non trovato" non significa "inesistente"; se un catalogo non risponde
 * l'esito è "non verificato", mai "non trovato".
 */
(function(root){
  "use strict";
  var C = (root.REV_CONFIG) || {};

  // ---------- testo ----------
  var STOP = new Set(("the and for with from into una uno gli lo la le il di da del della dei delle degli " +
    "nel nella con per tra fra sul sulla che of in on to an a des les du de et pour par dans der die das und von zu im").split(" "));
  function normalize(s){
    return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
      .replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  }
  function tokens(s){ return normalize(s).split(" ").filter(function(w){ return w.length >= 3 && !STOP.has(w); }); }
  // Quota delle parole del titolo trovato che compaiono nel riferimento.
  function titleSimilarity(candidateTitle, ref){
    var t = tokens(candidateTitle); if (!t.length) return 0;
    var r = new Set(tokens(ref));
    return t.filter(function(w){ return r.has(w); }).length / t.length;
  }
  function extractYear(ref){ var m = ref.match(/\b(1[5-9]\d\d|20\d\d)\b/); return m ? parseInt(m[1],10) : null; }
  function extractDOI(ref){ var m = ref.match(/10\.\d{4,9}\/[^\s"<>]+/); return m ? m[0].replace(/[.,;)\]]+$/,"") : null; }
  function isbn13CheckOk(d){
    if (!/^\d{13}$/.test(d)) return false;
    var s = 0; for (var i=0;i<12;i++) s += (+d[i]) * (i%2 ? 3 : 1);
    return (10 - s%10) % 10 === +d[12];
  }
  function isbn10CheckOk(d){
    if (!/^\d{9}[\dX]$/.test(d)) return false;
    var s = 0; for (var i=0;i<10;i++) s += (d[i]==="X" ? 10 : +d[i]) * (10-i);
    return s % 11 === 0;
  }
  function extractISBN(ref){
    var m = ref.match(/ISBN[^0-9]{0,6}([0-9][0-9Xx\-\s]{8,16}[0-9Xx])/i);
    var cand = m ? m[1] : (ref.match(/\b97[89](?:[-\s]?\d){10}\b/) || [null])[0];
    if (!cand) return null;
    var d = cand.replace(/[^0-9Xx]/g,"").toUpperCase();
    if (d.length === 13 && isbn13CheckOk(d)) return d;
    if (d.length === 10 && isbn10CheckOk(d)) return d;
    return null;
  }
  // ---------- lettura del riferimento ----------
  // Due stili: APA "Eco, U. (1977). Titolo. Città: Editore."
  // e italiano "Umberto Eco, Titolo, Città, Editore, 1977, ISBN …".
  var PARTICLES = new Set("de di da del della dei degli delle d la lo le van von der den mack mac mc st saint".split(" "));
  function surnameOf(name){
    name = String(name||"").replace(/\(.*?\)/g,"").replace(/\bet al\.?/i,"").trim();
    if (name.indexOf(",") > -1) return name.split(",")[0].trim();
    var w = name.split(/\s+/).filter(Boolean); if (!w.length) return "";
    var i = w.length - 1;
    while (i > 0 && PARTICLES.has(w[i-1].toLowerCase().replace(/[’']$/,""))) i--;
    return w.slice(i).join(" ");
  }
  var YEAR_PART = /^(1[5-9]\d\d|20\d\d)\.?$/, ROMAN_YEAR = /^M[MDCLXVI]+\.?$/i;
  // Stile "COGNOME, Nome, Titolo…": cognome in maiuscolo seguito dal nome proprio.
  var CAPS_NAME = /^[A-ZÀ-ÝĆČŠŽ][A-ZÀ-ÝĆČŠŽ'’\- ]+$/;
  var GIVEN_NAME = /^[A-ZÀ-Ý][a-zà-ÿ'’.\-]*(\s+[A-ZÀ-Ý][a-zà-ÿ'’.\-]*){0,2}(\s*\((a cura di|ed\.?|eds\.?|cur\.?)\))?$/;
  var MONTHS = "gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre";
  // Articolo di quotidiano o settimanale: «Titolo», in Testata, 21 novembre 1999
  var NEWSPAPER = new RegExp("»,?\\s+in\\s+[^,]+,\\s*(\\d{1,2}\\s+)?(" + MONTHS + ")\\s+(1[89]\\d\\d|20\\d\\d)", "i");
  function isNewspaper(ref){ return NEWSPAPER.test(ref); }
  function parseRef(ref){
    var r = String(ref||"").replace(/https?:\/\/\S+/g,"").replace(/\s+/g," ").trim();
    var m = r.match(/^(.{2,200}?)\s*\((\d{4})[a-z]?\)\.?\s*(.+)$/);
    if (m){
      var first = m[1].split(/;|&| e | and /)[0];
      return {author:first.trim(), surname:surnameOf(first), title:m[3].split(/\.\s+/)[0].trim(), year:parseInt(m[2],10), style:"apa"};
    }
    var parts = r.split(/,\s+/);
    if (parts.length >= 3){
      // Autori: "Nome Cognome" in una parte, oppure "COGNOME, Nome" in due (anche più autori di fila).
      var ts = 1, firstAuthor = parts[0], caps = false;
      if (CAPS_NAME.test(parts[0].trim()) && GIVEN_NAME.test((parts[1]||"").trim())){
        caps = true; ts = 0;
        while (ts + 1 < parts.length && CAPS_NAME.test(parts[ts].trim()) && GIVEN_NAME.test(parts[ts+1].trim())) ts += 2;
      }
      var j = -1;
      for (var k = parts.length - 1; k > ts; k--){ if (YEAR_PART.test(parts[k].trim()) || ROMAN_YEAR.test(parts[k].trim())){ j = k; break; } }
      var title = (j >= ts + 3) ? parts.slice(ts, j-2).join(", ") : (parts[ts] || "");
      // Saggi e articoli: il titolo è tra caporali.
      var q = r.match(/«([^»]{3,})»/);
      if (q) title = q[1];
      title = title.replace(/\s*\((a cura di|ed\.?|eds\.?)\)/i,"");
      var y = j > -1 ? parseInt(parts[j], 10) : extractYear(r);
      return {author:firstAuthor.trim(), surname: caps ? parts[0].trim() : surnameOf(parts[0]), title:title.trim(), year: isNaN(y) ? extractYear(r) : y, style: caps ? "it-caps" : "it"};
    }
    return {author:"", surname:"", title:"", year:extractYear(r), style:"?"};
  }
  // Titolo principale: prima di ":" o " - ", senza le date tra parentesi.
  function mainTitle(t){
    t = String(t||"").replace(/\([^)]*\d{4}[^)]*\)/g,"").trim();
    var pieces = t.split(/\s[-–—]\s|:\s|\.\s/);
    for (var i=0;i<pieces.length;i++) if (tokens(pieces[i]).length) return pieces[i].trim();
    return t;
  }
  function share(a, b){ // quota delle parole di a presenti in b
    var t = tokens(a); if (!t.length) return 0;
    var r = new Set(tokens(b));
    return t.filter(function(w){ return r.has(w); }).length / t.length;
  }
  // Somiglianza nei due sensi: il titolo trovato deve stare nel riferimento
  // e il titolo principale del riferimento deve stare nel titolo trovato.
  // Così un titolo corto ("Documenti", "Garibaldi, Giuseppe") non combacia con tutto.
  function bookSimilarity(candTitle, candSubtitle, ref, parsed){
    parsed = parsed || parseRef(ref);
    // I cataloghi aggiungono collana ed edizione tra parentesi: "(Economica Laterza) (Italian Edition)".
    candTitle = String(candTitle||"").replace(/\s*\([^)]*\)/g,"").trim();
    var refTitle = parsed.title || ref;
    var cMain = String(candTitle||"").split(/:\s|\s[-–—]\s/)[0];
    var a = Math.max(share(candTitle, refTitle), share(cMain, refTitle));
    if (!parsed.title) return a;
    var b = share(mainTitle(parsed.title), (candTitle||"") + " " + (candSubtitle||""));
    return Math.min(a, b);
  }

  function cleanLine(l){ return l.replace(/^\s*(\[\d+\]|\d+[.)]|[-•*])\s*/,"").trim(); }
  function splitRefs(text){ return text.split(/\r?\n/).map(cleanLine).filter(function(l){ return l.length >= 15; }); }
  function authorMatch(names, ref){
    var r = normalize(ref);
    return names.some(function(n){ var f = normalize(n); return f.length >= 3 && r.indexOf(f) !== -1; });
  }
  function lastName(full){ var p = String(full||"").replace(/,.*$/,"").trim().split(/\s+/); return p[p.length-1] || ""; }
  function familyFromCatalog(s){ // "Eco, Umberto; Rossi, Mario" -> ["Eco","Rossi"]
    return String(s||"").split(/[;|]/).map(function(a){ return a.indexOf(",") > -1 ? a.split(",")[0].trim() : lastName(a); }).filter(Boolean);
  }
  function judge(sim, aMatch, yMatch){
    if (sim >= 0.85 && (aMatch || yMatch)) return "verde";
    if (sim >= 0.6 && aMatch) return "giallo";
    return null;
  }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function link(url, text){ return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>" : esc(text); }

  // ---------- rete ----------
  function withPolite(url){
    if (!C.politeEmail || !/crossref|openalex/.test(url)) return url;
    return url + (url.indexOf("?") > -1 ? "&" : "?") + "mailto=" + encodeURIComponent(C.politeEmail);
  }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  // Tempo massimo per catalogo e un secondo tentativo sugli errori temporanei
  // (rete, timeout, 5xx). Un 429 (quota esaurita) non si ritenta.
  async function getJSON(url){
    var tries = 2, delay = C.retryDelayMs == null ? 800 : C.retryDelayMs;
    for (var attempt = 1; attempt <= tries; attempt++){
      var ctl = (typeof AbortController !== "undefined") ? new AbortController() : null;
      var timer = ctl ? setTimeout(function(){ ctl.abort(); }, C.timeoutMs || 12000) : null;
      var opts = {headers:{Accept:"application/json"}}; if (ctl) opts.signal = ctl.signal;
      try {
        var res = await root.fetch(withPolite(url), opts);
        if (res.status === 404) return null;
        if (res.ok) return await res.json();
        var err = new Error("HTTP " + res.status); err.status = res.status; throw err;
      } catch(e){
        var permanent = e.status && e.status < 500;
        if (permanent || attempt === tries) throw e;
      } finally { if (timer) clearTimeout(timer); }
      await sleep(delay);
    }
  }

  // ---------- cataloghi propri (CSV) ----------
  function parseCSV(text){
    var rows = [], row = [], f = "", q = false;
    for (var i=0;i<text.length;i++){
      var c = text[i];
      if (q){
        if (c === '"' && text[i+1] === '"'){ f += '"'; i++; }
        else if (c === '"') q = false;
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ","){ row.push(f); f = ""; }
      else if (c === "\n" || c === "\r"){
        if (c === "\r" && text[i+1] === "\n") i++;
        row.push(f); f = ""; if (row.some(function(x){ return x.trim(); })) rows.push(row); row = [];
      } else f += c;
    }
    row.push(f); if (row.some(function(x){ return x.trim(); })) rows.push(row);
    if (!rows.length) return [];
    var head = rows.shift().map(function(h){ return h.trim().toLowerCase(); });
    return rows.map(function(r){ var o = {}; head.forEach(function(h,i){ o[h] = (r[i]||"").trim(); }); return o; });
  }
  var catalogsPromise = null;
  function loadCatalogs(){
    if (catalogsPromise) return catalogsPromise;
    var list = C.localCatalogs || [];
    catalogsPromise = Promise.all(list.map(async function(cat){
      try {
        var res = await root.fetch(cat.url);
        if (!res.ok) return {label:cat.label, rows:[]};
        return {label:cat.label, rows: parseCSV(await res.text())};
      } catch(e){ return {label:cat.label, rows:[]}; }
    }));
    return catalogsPromise;
  }
  async function checkLocal(ref){
    var cats = await loadCatalogs();
    var isbn = extractISBN(ref), year = extractYear(ref), best = null;
    cats.forEach(function(cat){
      cat.rows.forEach(function(r){
        var rIsbn = (r.isbn||"").replace(/[^0-9Xx]/g,"").toUpperCase();
        var sim = titleSimilarity(r.titolo, ref);
        var aM = authorMatch(familyFromCatalog(r.autore), ref);
        var yM = !!(year && r.anno && Math.abs(parseInt(r.anno,10) - year) <= 1);
        var state = (isbn && rIsbn && isbn === rIsbn) ? (sim >= 0.6 ? "verde" : "giallo") : judge(sim, aM, yM);
        var score = sim + (aM ? .2 : 0) + (yM ? .1 : 0) + (isbn && isbn === rIsbn ? 1 : 0);
        if (state && (!best || score > best.score)) best = {state:state, score:score, r:r, label:cat.label};
      });
    });
    if (!best) return null;
    var r = best.r;
    var found = esc(best.label) + ": " + link(r.link, r.titolo) + (r.autore ? " di " + esc(r.autore) : "") +
      " (" + esc([r.editore, r.anno].filter(Boolean).join(", ")) + ").";
    if (best.state === "giallo") found += " Corrispondenza parziale: controllare i dati.";
    return {state:best.state, found:found, source:"locale"};
  }

  // ---------- Crossref e OpenAlex ----------
  function yearOf(it){
    var p = (it.issued && it.issued["date-parts"] && it.issued["date-parts"][0]) || [];
    return p[0] || null;
  }
  async function checkRetraction(doi){
    try {
      var w = await getJSON("https://api.openalex.org/works/doi:" + encodeURIComponent(doi) + "?select=is_retracted");
      return !!(w && w.is_retracted);
    } catch(e){ return false; }
  }
  async function checkCrossrefDOI(doi, ref){
    var data = await getJSON("https://api.crossref.org/works/" + encodeURIComponent(doi));
    if (!data) return {state:"rosso", found:"Il DOI indicato non risulta registrato in Crossref.", source:"crossref"};
    var it = data.message, title = (it.title||[""])[0];
    var sim = titleSimilarity(title, ref);
    var retracted = await checkRetraction(doi);
    var base = "DOI registrato: " + link("https://doi.org/" + doi, title || doi) + " (" + (yearOf(it) || "anno n.d.") + ").";
    if (retracted) return {state:"rosso", found: base + " <strong>Risulta ritirato (retracted).</strong>", source:"crossref"};
    if (sim >= 0.6 || !title) return {state:"verde", found:base, source:"crossref"};
    return {state:"giallo", found: base + " Il titolo nel riferimento sembra diverso da quello registrato.", source:"crossref"};
  }
  async function checkCrossrefSearch(ref){
    var data = await getJSON("https://api.crossref.org/works?rows=3&select=DOI,title,subtitle,author,issued,type&query.bibliographic=" + encodeURIComponent(ref.slice(0,300)));
    var items = (data && data.message && data.message.items) || [];
    var parsed = parseRef(ref), year = parsed.year || extractYear(ref), best = null;
    items.forEach(function(it){
      var title = (it.title||[""])[0];
      var sim = bookSimilarity(title, (it.subtitle||[""])[0], ref, parsed);
      var aM = authorMatch((it.author||[]).map(function(a){ return a.family || ""; }).filter(Boolean), ref);
      var yM = !!(year && yearOf(it) && Math.abs(yearOf(it) - year) <= 1);
      var state = judge(sim, aM, yM);
      var score = sim + (aM ? .2 : 0) + (yM ? .1 : 0);
      if (state && (!best || score > best.score)) best = {state:state, score:score, it:it, title:title, aM:aM, yM:yM};
    });
    if (!best) return null;
    var doi = best.it.DOI;
    var found = "Record Crossref: " + link("https://doi.org/" + doi, best.title) + " (" + (yearOf(best.it) || "anno n.d.") + "), DOI " + esc(doi) + ".";
    if (doi && await checkRetraction(doi)) return {state:"rosso", found: found + " <strong>Risulta ritirato (retracted).</strong>", source:"crossref"};
    if (best.state === "giallo"){
      var diffs = [];
      if (!best.aM) diffs.push("autore");
      if (year && !best.yM) diffs.push("anno");
      found += " Corrispondenza parziale" + (diffs.length ? " (verificare " + diffs.join(" e ") + ")" : "") + ".";
    }
    return {state:best.state, found:found, source:"crossref"};
  }

  // ---------- Google Libri ----------
  async function checkGoogleBooks(ref){
    var isbn = extractISBN(ref), parsed = parseRef(ref);
    var q = isbn ? "isbn:" + isbn :
      (parsed.title ? mainTitle(parsed.title) + (parsed.surname ? " inauthor:" + parsed.surname : "") : ref.replace(/https?:\/\/\S+/g,"").slice(0,200));
    var url = "https://www.googleapis.com/books/v1/volumes?maxResults=5&printType=books" +
      "&fields=items(volumeInfo(title,subtitle,authors,publishedDate,publisher,infoLink))&q=" + encodeURIComponent(q) +
      (C.googleBooksKey ? "&key=" + encodeURIComponent(C.googleBooksKey) : "");
    var data = await getJSON(url);
    var items = (data && data.items) || [];
    var year = parsed.year || extractYear(ref), best = null;
    items.forEach(function(it){
      var v = it.volumeInfo || {};
      var sim = bookSimilarity(v.title, v.subtitle, ref, parsed);
      var aM = authorMatch((v.authors||[]).map(lastName), ref);
      var py = v.publishedDate ? parseInt(v.publishedDate, 10) : null;
      var yM = !!(year && py && Math.abs(py - year) <= 1);
      var state = judge(sim, aM, yM);
      if (isbn && !state) state = "giallo"; // l'ISBN esiste ma il titolo non coincide
      var score = sim + (aM ? .2 : 0) + (yM ? .1 : 0);
      if (state && (!best || score > best.score)) best = {state:state, score:score, v:v, sim:sim};
    });
    if (!best) return null;
    var v = best.v;
    var found = "Libro in Google Libri: " + link(v.infoLink, v.title + (v.subtitle ? ". " + v.subtitle : "")) +
      (v.authors ? " di " + esc(v.authors.slice(0,3).join(", ")) : "") +
      " (" + esc([v.publisher, (v.publishedDate||"").slice(0,4)].filter(Boolean).join(", ") || "dati editoriali n.d.") + ").";
    if (isbn && best.sim < 0.6) found += " L'ISBN indicato corrisponde a un titolo diverso.";
    else if (best.state === "giallo") found += " Corrispondenza parziale: controllare autore, anno ed edizione.";
    else found += " Edizione e pagine da verificare a mano.";
    return {state:best.state, found:found, source:"googlebooks", isbnMismatch: !!(isbn && best.sim < 0.6)};
  }

  // ---------- Open Library ----------
  async function checkOpenLibrary(ref){
    var parsed = parseRef(ref);
    var qs = parsed.title ? "title=" + encodeURIComponent(mainTitle(parsed.title)) + (parsed.surname ? "&author=" + encodeURIComponent(parsed.surname) : "")
                          : "q=" + encodeURIComponent(ref.slice(0,200));
    var data = await getJSON("https://openlibrary.org/search.json?limit=5&fields=title,subtitle,author_name,first_publish_year,key&" + qs);
    var docs = (data && data.docs) || [];
    var year = parsed.year || extractYear(ref), best = null;
    docs.forEach(function(d){
      var sim = bookSimilarity(d.title, d.subtitle, ref, parsed);
      var aM = authorMatch((d.author_name||[]).map(lastName), ref);
      var yM = !!(year && d.first_publish_year && Math.abs(d.first_publish_year - year) <= 1);
      var state = judge(sim, aM, yM);
      if (state && (!best || sim > best.sim)) best = {state:state, sim:sim, d:d};
    });
    if (!best) return null;
    var d = best.d;
    return {state:best.state, source:"openlibrary", found: "Libro in Open Library: " + link("https://openlibrary.org" + d.key, d.title) +
      (d.author_name ? " di " + esc(d.author_name.slice(0,2).join(", ")) : "") +
      (d.first_publish_year ? " (prima ed. " + d.first_publish_year + ")" : "") + ". Edizione e pagine da verificare a mano."};
  }

  // ---------- ISBN su Open Library ----------
  // A che titolo corrisponde l'ISBN indicato? Serve a non dare verde
  // a un riferimento giusto nel titolo ma con l'ISBN di un altro libro.
  async function checkISBN(ref){
    var isbn = extractISBN(ref); if (!isbn) return null;
    var data = await getJSON("https://openlibrary.org/search.json?limit=1&fields=title,subtitle,author_name,key&isbn=" + isbn);
    var d = data && data.docs && data.docs[0];
    if (!d) return {known:false};
    // Basta che il titolo principale del riferimento stia nel titolo dell'ISBN.
    var p = parseRef(ref), main = mainTitle(p.title || ref);
    var match = share(main, (d.title||"") + " " + (d.subtitle||"")) >= 0.6 || bookSimilarity(d.title, d.subtitle, ref, p) >= 0.6;
    return {known:true, match: match, title:d.title, key:d.key};
  }

  // ---------- orchestrazione ----------
  var RANK = {verde:3, giallo:2, rosso:1};
  async function safe(fn){
    try { return {res: await fn()}; } catch(e){ return {err: true}; }
  }
  function pick(cands){
    var best = null;
    cands.forEach(function(c){ if (c && (!best || RANK[c.state] > RANK[best.state])) best = c; });
    return best;
  }
  async function checkOne(ref){
    var doi = extractDOI(ref);
    if (doi){
      var d = await safe(function(){ return checkCrossrefDOI(doi, ref); });
      if (d.res) return d.res;
      return {state:"errore", found:"Crossref non ha risposto: riprova tra qualche minuto."};
    }
    var errors = 0, cands = [];
    var loc = await safe(function(){ return checkLocal(ref); });
    if (loc.res && loc.res.state === "verde") return loc.res;
    cands.push(loc.res);

    var round1 = await Promise.all([
      safe(function(){ return checkCrossrefSearch(ref); }),
      safe(function(){ return checkGoogleBooks(ref); }),
      safe(function(){ return checkISBN(ref); })
    ]);
    var isbnInfo = round1[2].res || null;
    round1.slice(0,2).forEach(function(x){ if (x.err) errors++; cands.push(x.res); });
    var gb = round1[1].res;

    // Regola: un ISBN che corrisponde a un altro titolo prevale su ogni verde.
    function isbnWrong(best){
      var other = isbnInfo && isbnInfo.known && !isbnInfo.match ? isbnInfo.title : null;
      if (!other && !(gb && gb.isbnMismatch)) return null;
      var msg = other ? "L'ISBN indicato corrisponde a un titolo diverso (" + link("https://openlibrary.org" + isbnInfo.key, other) + ")."
                      : "L'ISBN indicato corrisponde a un titolo diverso (vedi Google Libri).";
      return {state:"giallo", source:"isbn", found: msg + (best && best.state === "verde" ? " Il titolo invece esiste: " + best.found : "")};
    }

    var best = pick(cands);
    if (best && best.state === "verde") return isbnWrong(best) || best;

    var ol = await safe(function(){ return checkOpenLibrary(ref); });
    if (ol.err) errors++;
    cands.push(ol.res);
    best = pick(cands);
    var wrong = isbnWrong(best);
    if (wrong) return wrong;
    if (best) return best;
    if (isNewspaper(ref)) return {state:"errore", found:"Articolo di giornale: i cataloghi bibliografici non registrano gli articoli dei quotidiani. Va controllato a mano nell'archivio della testata."};
    if (errors) return {state:"errore", found:"Non trovato nei cataloghi che hanno risposto; " + errors + " catalogo/i non ha risposto. Riprova tra qualche minuto."};
    return {state:"rosso", found:"Non trovato nei cataloghi consultati (Crossref, Google Libri, Open Library). Può essere un'opera non catalogata online oppure un riferimento errato: va controllato a mano."};
  }

  // Lo stesso ISBN in due righe diverse: almeno una delle due è sbagliata.
  function markDuplicateISBN(list, results){
    var seen = {};
    list.forEach(function(ref, i){ var is = extractISBN(ref); if (is) (seen[is] = seen[is] || []).push(i); });
    Object.keys(seen).forEach(function(k){
      var ix = seen[k]; if (ix.length < 2) return;
      ix.forEach(function(i){
        var others = ix.filter(function(j){ return j !== i; }).map(function(j){ return j + 1; }).join(", ");
        var r = results[i] || {state:"errore", found:""};
        results[i] = {state: r.state === "verde" ? "giallo" : r.state, source:r.source,
          found: r.found + " <strong>Lo stesso ISBN compare anche alla riga " + others + ": almeno uno dei due riferimenti è sbagliato.</strong>"};
      });
    });
  }
  async function checkAll(refs, onProgress){
    var list = refs.slice(0, C.maxRefs || 30);
    var results = new Array(list.length), next = 0, done = 0;
    async function worker(){
      while (next < list.length){
        var i = next++;
        results[i] = await checkOne(list[i]);
        done++; if (onProgress) onProgress(done, list.length);
        await new Promise(function(r){ setTimeout(r, 150); });
      }
    }
    var n = Math.max(1, Math.min(C.concurrency || 3, list.length));
    var ws = []; for (var k=0;k<n;k++) ws.push(worker());
    await Promise.all(ws);
    markDuplicateISBN(list, results);
    return {list:list, results:results};
  }

  // ---------- ricerca manuale in un clic ----------
  // Per i riferimenti non trovati: link già compilati ai cataloghi da consultare a mano.
  // Il formato OPAC SBN segue l'esempio della guida ufficiale (ricerca per autore).
  function firstSurname(ref){ return parseRef(ref).surname || ""; }
  function searchLinks(ref){
    var q = ref.replace(/https?:\/\/\S+/g,"").slice(0,200);
    var links = [];
    // OPAC SBN per parole chiave: cognome + prime parole del titolo.
    // Prova del 19 nov: "Fofi" da solo dà 1.115 documenti, "Fofi senza Lenin" ne dà 2.
    var p = parseRef(ref), sur = p.surname || "";
    var words = tokens(mainTitle(p.title || "")).slice(0, 4).join(" ");
    var kw = (sur + " " + words).trim();
    if (sur && sur.length >= 3 && kw.length > sur.length){
      links.push(["OPAC SBN", "https://opac.sbn.it/risultati-ricerca-avanzata?fieldstruct%5B1%5D=ricerca.parole_tutte%3A4%3D6" +
        "&struct%3A1001=ricerca.parole_almeno_una%3A%40or%40&fieldvalue%5B1%5D=" + encodeURIComponent(kw) +
        "&fieldaccess%5B1%5D=Keywords%3A1016"]);
    } else if (sur && sur.length >= 3){
      links.push(["OPAC SBN (autore)", "https://opac.sbn.it/risultati-ricerca-avanzata?fieldstruct%5B1%5D=ricerca.parole_tutte%3A4%3D6" +
        "&struct%3A1001=ricerca.parole_almeno_una%3A%40or%40&fieldvalue%5B1%5D=" + encodeURIComponent(sur) +
        "&fieldaccess%5B1%5D=Autore%3A1003%3Anocheck"]);
    }
    links.push(["Google Libri", "https://www.google.com/search?tbm=bks&q=" + encodeURIComponent(q)]);
    links.push(["Google Scholar", "https://scholar.google.com/scholar?q=" + encodeURIComponent(q)]);
    return links;
  }

  var api = {isNewspaper:isNewspaper, parseRef:parseRef, mainTitle:mainTitle, bookSimilarity:bookSimilarity, surnameOf:surnameOf, markDuplicateISBN:markDuplicateISBN, searchLinks:searchLinks, firstSurname:firstSurname, normalize:normalize, titleSimilarity:titleSimilarity, extractYear:extractYear, extractDOI:extractDOI,
    extractISBN:extractISBN, splitRefs:splitRefs, judge:judge, authorMatch:authorMatch, parseCSV:parseCSV,
    checkOne:checkOne, checkAll:checkAll, _resetCatalogs:function(){ catalogsPromise = null; }};
  root.REV_CHECKER = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // ---------- interfaccia (solo se la pagina contiene il modulo) ----------
  if (typeof document === "undefined") return;
  var LABEL = {verde:["Trovato","g"], giallo:["Da controllare","y"], rosso:["Non trovato","r"], errore:["Non verificato","y"]};
  function $(id){ return document.getElementById(id); }
  function init(){
    if (!$("rev-input")) return;
    var lastReport = "";
    $("rev-max").textContent = C.maxRefs || 30;
    $("rev-run").addEventListener("click", async function(){
      var refs = splitRefs($("rev-input").value), st = $("rev-status");
      if (!refs.length){ st.textContent = "Incolla almeno un riferimento, uno per riga."; return; }
      var max = C.maxRefs || 30;
      st.textContent = refs.length > max ? "Controllo i primi " + max + " riferimenti su " + refs.length + "…" : "Controllo " + refs.length + " riferimenti…";
      var btn = $("rev-run"); btn.disabled = true;
      var prog = $("rev-progress"); prog.classList.remove("hidden"); prog.value = 0;
      var out = await checkAll(refs, function(d, n){ prog.max = n; prog.value = d; });
      lastReport = render(out.list, out.results);
      btn.disabled = false; prog.classList.add("hidden"); st.textContent = "Fatto.";
    });
    $("rev-clear").addEventListener("click", function(){
      $("rev-input").value = ""; $("rev-results").classList.add("hidden"); $("rev-status").textContent = "";
    });
    $("rev-copy").addEventListener("click", async function(){
      try { await navigator.clipboard.writeText(lastReport); $("rev-copied").textContent = "Copiato."; }
      catch(e){ $("rev-copied").textContent = "Copia non riuscita: seleziona la tabella e copiala a mano."; }
    });
  }
  function render(list, results){
    var counts = {verde:0, giallo:0, rosso:0, errore:0}, rows = $("rev-rows"), lines = [];
    rows.innerHTML = "";
    results.forEach(function(r, i){
      counts[r.state]++;
      var lab = LABEL[r.state];
      var tr = document.createElement("tr");
      var more = r.state === "verde" ? "" : '<div class="small" style="margin-top:6px">Cerca a mano: ' +
        searchLinks(list[i]).map(function(l){ return link(l[1], l[0]); }).join(" · ") + "</div>";
      tr.innerHTML = '<td class="num">' + (i+1) + '</td><td><span class="pill ' + lab[1] + '">' + lab[0] + '</span></td><td class="ref">' + esc(list[i]) + "</td><td>" + r.found + more + "</td>";
      rows.appendChild(tr);
      var tmp = document.createElement("div"); tmp.innerHTML = r.found;
      lines.push((i+1) + ". [" + lab[0] + "] " + list[i] + "\n   " + tmp.textContent);
    });
    var n = results.length, open = counts.giallo + counts.rosso + counts.errore;
    $("rev-summary").innerHTML = "Su " + n + " riferiment" + (n === 1 ? "o" : "i") + ": <strong>" + counts.verde + " trovat" + (counts.verde === 1 ? "o" : "i") + "</strong>, " +
      (counts.giallo + counts.errore) + " da controllare, " + counts.rosso + " non trovat" + (counts.rosso === 1 ? "o" : "i") + ".";
    $("rev-results").classList.remove("hidden");
    if ($("rev-cta-title")) $("rev-cta-title").innerHTML = open ? 'Riferimenti da controllare a mano: <span id="rev-cta-count">' + open + "</span>"
      : "Tutte le fonti sono nei cataloghi";
    else $("rev-cta-count").textContent = open;
    return "Controllo automatico della bibliografia (" + new Date().toLocaleDateString("it-IT") + ")\n\n" + lines.join("\n") +
      "\n\n\"Non trovato\" non significa \"inesistente\". Controllo automatico: non valuta il contenuto delle fonti.";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : globalThis);
