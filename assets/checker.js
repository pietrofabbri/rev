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
    if (sim >= 0.6) return "giallo";
    return null;
  }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function link(url, text){ return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>" : esc(text); }

  // ---------- rete ----------
  function withPolite(url){
    if (!C.politeEmail || !/crossref|openalex/.test(url)) return url;
    return url + (url.indexOf("?") > -1 ? "&" : "?") + "mailto=" + encodeURIComponent(C.politeEmail);
  }
  async function getJSON(url){
    var res = await root.fetch(withPolite(url), {headers:{Accept:"application/json"}});
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
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
    var data = await getJSON("https://api.crossref.org/works?rows=3&select=DOI,title,author,issued,type&query.bibliographic=" + encodeURIComponent(ref.slice(0,300)));
    var items = (data && data.message && data.message.items) || [];
    var year = extractYear(ref), best = null;
    items.forEach(function(it){
      var title = (it.title||[""])[0];
      var sim = titleSimilarity(title, ref);
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
    var isbn = extractISBN(ref);
    var q = isbn ? "isbn:" + isbn : ref.replace(/https?:\/\/\S+/g,"").slice(0,200);
    var url = "https://www.googleapis.com/books/v1/volumes?maxResults=5&printType=books" +
      "&fields=items(volumeInfo(title,subtitle,authors,publishedDate,publisher,infoLink))&q=" + encodeURIComponent(q) +
      (C.googleBooksKey ? "&key=" + encodeURIComponent(C.googleBooksKey) : "");
    var data = await getJSON(url);
    var items = (data && data.items) || [];
    var year = extractYear(ref), best = null;
    items.forEach(function(it){
      var v = it.volumeInfo || {};
      var sim = Math.max(titleSimilarity(v.title, ref), titleSimilarity((v.title||"") + " " + (v.subtitle||""), ref));
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
    return {state:best.state, found:found, source:"googlebooks"};
  }

  // ---------- Open Library ----------
  async function checkOpenLibrary(ref){
    var data = await getJSON("https://openlibrary.org/search.json?limit=3&fields=title,author_name,first_publish_year,key&q=" + encodeURIComponent(ref.slice(0,200)));
    var docs = (data && data.docs) || [];
    var year = extractYear(ref), best = null;
    docs.forEach(function(d){
      var sim = titleSimilarity(d.title, ref);
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

    var both = await Promise.all([
      safe(function(){ return checkCrossrefSearch(ref); }),
      safe(function(){ return checkGoogleBooks(ref); })
    ]);
    both.forEach(function(x){ if (x.err) errors++; cands.push(x.res); });
    var best = pick(cands);
    if (best && best.state === "verde") return best;

    var ol = await safe(function(){ return checkOpenLibrary(ref); });
    if (ol.err) errors++;
    cands.push(ol.res);
    best = pick(cands);
    if (best) return best;
    if (errors) return {state:"errore", found:"Non trovato nei cataloghi che hanno risposto; " + errors + " catalogo/i non ha risposto. Riprova tra qualche minuto."};
    return {state:"rosso", found:"Non trovato nei cataloghi consultati (Crossref, Google Libri, Open Library). Può essere un'opera non catalogata online oppure un riferimento errato: va controllato a mano."};
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
    return {list:list, results:results};
  }

  // ---------- ricerca manuale in un clic ----------
  // Per i riferimenti non trovati: link già compilati ai cataloghi da consultare a mano.
  // Il formato OPAC SBN segue l'esempio della guida ufficiale (ricerca per autore).
  function firstSurname(ref){
    var head = ref.split(",")[0].replace(/\(.*?\)/g,"").trim();
    var words = head.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0];            // "Eco, U."  -> Eco
    if (words.length <= 3) return words[words.length-1]; // "Umberto Eco, …" -> Eco
    return words[0] || "";
  }
  function searchLinks(ref){
    var q = ref.replace(/https?:\/\/\S+/g,"").slice(0,200);
    var links = [];
    var sur = firstSurname(ref);
    if (sur && sur.length >= 3){
      links.push(["OPAC SBN (autore)", "https://opac.sbn.it/risultati-ricerca-avanzata?fieldstruct%5B1%5D=ricerca.parole_tutte%3A4%3D6" +
        "&struct%3A1001=ricerca.parole_almeno_una%3A%40or%40&fieldvalue%5B1%5D=" + encodeURIComponent(sur) +
        "&fieldaccess%5B1%5D=Autore%3A1003%3Anocheck"]);
    }
    links.push(["Google Libri", "https://www.google.com/search?tbm=bks&q=" + encodeURIComponent(q)]);
    links.push(["Google Scholar", "https://scholar.google.com/scholar?q=" + encodeURIComponent(q)]);
    return links;
  }

  var api = {searchLinks:searchLinks, firstSurname:firstSurname, normalize:normalize, titleSimilarity:titleSimilarity, extractYear:extractYear, extractDOI:extractDOI,
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
      tr.innerHTML = "<td>" + (i+1) + '</td><td><span class="pill ' + lab[1] + '">' + lab[0] + "</span></td><td>" + esc(list[i]) + "</td><td>" + r.found + more + "</td>";
      rows.appendChild(tr);
      var tmp = document.createElement("div"); tmp.innerHTML = r.found;
      lines.push((i+1) + ". [" + lab[0] + "] " + list[i] + "\n   " + tmp.textContent);
    });
    $("rev-summary").innerHTML = '<span class="pill g">' + counts.verde + ' trovati</span><span class="pill y">' +
      (counts.giallo + counts.errore) + ' da controllare</span><span class="pill r">' + counts.rosso + " non trovati</span>";
    $("rev-results").classList.remove("hidden");
    $("rev-cta-count").textContent = counts.giallo + counts.rosso + counts.errore;
    return "Controllo automatico della bibliografia (" + new Date().toLocaleDateString("it-IT") + ")\n\n" + lines.join("\n") +
      "\n\n\"Non trovato\" non significa \"inesistente\". Controllo automatico: non valuta il contenuto delle fonti.";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : globalThis);
