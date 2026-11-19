/*
 * REV — lettura dei file della tesi nel browser e controllo note/bibliografia.
 * Il file non lascia il computer del visitatore: si legge qui, in JavaScript.
 *  - .docx: testo, note a piè di pagina e note di chiusura (lettore ZIP minimo, senza librerie)
 *  - .pdf : testo con pdf.js (assets/vendor/pdfjs), caricato solo quando serve
 *  - .txt : testo semplice
 * Poi: trova la bibliografia finale e confronta le note con la bibliografia.
 */
(function(root){
  "use strict";
  var K = root.REV_CHECKER || (typeof require !== "undefined" ? require("./checker.js") : null);

  // ---------- ZIP (solo lettura, metodi "stored" e "deflate") ----------
  async function inflateRaw(bytes){
    var ds = new DecompressionStream("deflate-raw");
    var out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function unzip(buf, wanted){
    var u8 = new Uint8Array(buf), dv = new DataView(buf instanceof ArrayBuffer ? buf : u8.buffer, u8.byteOffset, u8.byteLength);
    var eocd = -1;
    for (var i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--){ if (dv.getUint32(i, true) === 0x06054b50){ eocd = i; break; } }
    if (eocd < 0) throw new Error("Il file non è un documento Word valido.");
    var count = dv.getUint16(eocd + 10, true), p = dv.getUint32(eocd + 16, true), files = {};
    var dec = new TextDecoder("utf-8");
    for (var n = 0; n < count; n++){
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      var nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      var local = dv.getUint32(p + 42, true);
      var name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + xlen + clen;
      if (wanted && wanted.indexOf(name) < 0) continue;
      var lnlen = dv.getUint16(local + 26, true), lxlen = dv.getUint16(local + 28, true);
      var data = u8.subarray(local + 30 + lnlen + lxlen, local + 30 + lnlen + lxlen + csize);
      files[name] = dec.decode(method === 0 ? data : await inflateRaw(data));
    }
    return files;
  }

  // ---------- Word ----------
  function paragraphs(xml){
    var out = [], re = /<w:p[ >][\s\S]*?<\/w:p>/g, m;
    while ((m = re.exec(xml))){
      var style = (m[0].match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || "";
      var text = runsText(m[0]);
      if (text) out.push({text:text, heading: /^(heading|titolo|title)/i.test(style)});
    }
    return out;
  }
  function runsText(px){
    var parts = [], re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br[^>]*\/>/g, m;
    while ((m = re.exec(px))) parts.push(m[1] != null ? m[1] : " ");
    return parts.join("").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&")
      .replace(/\s+/g," ").trim();
  }
  function notesFrom(xml, tag){
    var out = [], re = new RegExp("<w:" + tag + "\\b([^>]*)>([\\s\\S]*?)</w:" + tag + ">", "g"), m;
    while ((m = re.exec(xml))){
      if (/w:type="(separator|continuationSeparator|continuationNotice)"/.test(m[1])) continue;
      var t = runsText(m[2]);
      if (t) out.push(t);
    }
    return out;
  }
  async function readDocx(buf){
    var f = await unzip(buf, ["word/document.xml","word/footnotes.xml","word/endnotes.xml"]);
    if (!f["word/document.xml"]) throw new Error("Nel file non c'è il testo del documento.");
    var notes = notesFrom(f["word/footnotes.xml"] || "", "footnote").concat(notesFrom(f["word/endnotes.xml"] || "", "endnote"));
    return {paragraphs: paragraphs(f["word/document.xml"]), notes: notes, kind:"docx"};
  }

  // ---------- PDF ----------
  async function readPdf(buf){
    var base = (root.REV_ASSETS || "assets/") + "vendor/pdfjs/";
    var pdfjs = await import(new URL(base + "pdf.mjs", root.location.href).href);
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(base + "pdf.worker.mjs", root.location.href).href;
    var doc = await pdfjs.getDocument({data: new Uint8Array(buf)}).promise, lines = [];
    for (var i = 1; i <= doc.numPages; i++){
      var c = await (await doc.getPage(i)).getTextContent(), line = "", lastY = null;
      c.items.forEach(function(it){
        var y = it.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 2){ if (line.trim()) lines.push(line.trim()); line = ""; }
        line += it.str; lastY = y;
      });
      if (line.trim()) lines.push(line.trim());
    }
    return {paragraphs: joinPdfLines(lines), notes: [], kind:"pdf"};
  }
  // Nei PDF una voce di bibliografia va a capo su più righe: le riuniamo.
  var ENTRY_START = /^([A-ZÀ-Ý][A-ZÀ-Ý'’\- ]{1,}|[A-ZÀ-Ý][a-zà-ÿ'’\-]+(\s+[A-ZÀ-Ý][a-zà-ÿ'’\-]+){0,2}),\s/;
  function joinPdfLines(lines){
    var out = [];
    lines.forEach(function(l){
      var isHead = HEAD.test(l) || /^\d+$/.test(l);
      var prev = out[out.length - 1];
      if (isHead || !prev || prev.heading || ENTRY_START.test(l) || /\.\s*$/.test(prev.text) && /^[A-ZÀ-Ý«"“]/.test(l))
        out.push({text:l, heading:isHead});
      else prev.text += (/-$/.test(prev.text) ? "" : " ") + l;
    });
    return out;
  }

  // ---------- bibliografia ----------
  var HEAD = /^\s*(bibliografia( generale| essenziale| citata)?|riferimenti bibliografici|opere citate|fonti e bibliografia|sitografia|bibliography|references|works cited)\s*$/i;
  var STOP_HEAD = /^\s*(indice|appendic|allegat|ringraziament|abstract|sommario|nota biografica)/i;
  function findBibliography(pars){
    var start = -1;
    pars.forEach(function(p, i){ if (HEAD.test(p.text)) start = i; });
    // l'indice all'inizio contiene anche "Bibliografia": prendiamo la prima intestazione dopo la metà del documento
    var firsts = pars.map(function(p, i){ return HEAD.test(p.text) ? i : -1; }).filter(function(i){ return i >= 0; });
    var late = firsts.filter(function(i){ return i > pars.length * 0.5; });
    if (late.length) start = late[0];
    if (start < 0) return [];
    var out = [];
    for (var i = start + 1; i < pars.length; i++){
      var t = pars[i].text;
      if (STOP_HEAD.test(t) && t.length < 40) break;
      if (pars[i].heading && !HEAD.test(t)) break;   // un nuovo titolo di Word chiude la bibliografia
      if (HEAD.test(t) || t.length < 15) continue;
      out.push(t.replace(/^\s*(\[\d+\]|\d+[.)])\s*/,""));
    }
    return out;
  }

  // ---------- note e bibliografia ----------
  var RINVIO = /^(ibidem|ibid\.?|ivi|ibi|id\.|eadem|idem)\b/i;
  var ABBREV = /\b(op\.\s*cit|cit\.|art\.\s*cit)\b/i;
  function cleanNote(n){ return n.replace(/^\s*\d+\s+/,"").replace(/^(cfr\.|cf\.|si veda|vedi|v\.|sul[^:]{0,120}:)\s*/i,"").trim(); }
  function noteSurname(n){
    var c = cleanNote(n);
    var m = c.match(/^([A-ZÀ-Ý][A-ZÀ-Ý'’\- ]{2,}),/) || c.match(/^([A-ZÀ-Ý][a-zà-ÿ'’\-]+),\s*[A-Z]\./);
    if (m) return m[1].trim();
    var p = K ? K.parseRef(c) : null;
    return p && p.surname && /^[A-ZÀ-Ý]/.test(p.surname) ? p.surname : "";
  }
  function norm(s){ return K ? K.normalize(s) : String(s||"").toLowerCase(); }
  function analyzeNotes(notes, bib){
    var bibText = " " + norm(bib.join(" \n ")) + " ";
    var res = {total: notes.length, rinvii:0, abbreviate:0, complete:0, commento:0,
      rinvioIniziale:false, mancanti:[], nonCitate:[]};
    var allNotes = " " + norm(notes.join(" \n ")) + " ";
    notes.forEach(function(n, i){
      var c = cleanNote(n);
      if (RINVIO.test(c)){ res.rinvii++; if (i === 0) res.rinvioIniziale = true; return; }
      var sur = noteSurname(n);
      if (!sur){ res.commento++; return; }
      if (ABBREV.test(c)) res.abbreviate++; else res.complete++;
      var key = norm(sur);
      if (key.length >= 3 && bibText.indexOf(" " + key) < 0 && res.mancanti.indexOf(sur) < 0) res.mancanti.push(sur);
    });
    if (notes.length >= 5){
      bib.forEach(function(b){
        var s = K ? K.parseRef(b).surname : "";
        var key = norm(s);
        if (key.length >= 3 && allNotes.indexOf(" " + key) < 0) res.nonCitate.push(b);
      });
    }
    return res;
  }

  async function readFile(file){
    var buf = await file.arrayBuffer(), name = (file.name || "").toLowerCase();
    if (/\.docx$/.test(name)) return readDocx(buf);
    if (/\.pdf$/.test(name)) return readPdf(buf);
    if (/\.(txt|md)$/.test(name)) return {paragraphs: new TextDecoder().decode(buf).split(/\r?\n/).map(function(t){ return {text:t.trim(), heading:false}; }).filter(function(p){ return p.text; }), notes:[], kind:"txt"};
    throw new Error("Formato non letto: usa un file Word (.docx), PDF o di testo.");
  }

  var api = {unzip:unzip, paragraphs:paragraphs, notesFrom:notesFrom, readDocx:readDocx, joinPdfLines:joinPdfLines,
    findBibliography:findBibliography, analyzeNotes:analyzeNotes, noteSurname:noteSurname, readFile:readFile};
  root.REV_ESTRAI = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // ---------- interfaccia ----------
  if (typeof document === "undefined") return;
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function plural(n, one, many){ return n + " " + (n === 1 ? one : many); }
  function init(){
    var input = $("rev-file"); if (!input) return;
    input.addEventListener("change", async function(){
      var f = input.files && input.files[0], st = $("rev-file-status"), box = $("rev-notes");
      if (!f) return;
      st.textContent = "Leggo " + f.name + "…"; box.classList.add("hidden");
      try {
        var doc = await readFile(f), bib = findBibliography(doc.paragraphs);
        if (!bib.length){
          st.textContent = "Non abbiamo trovato una sezione intitolata \"Bibliografia\" o \"Riferimenti bibliografici\". Copia la bibliografia e incollala qui sopra.";
          return;
        }
        $("rev-input").value = bib.join("\n");
        var max = (root.REV_CONFIG && root.REV_CONFIG.maxRefs) || 30;
        st.textContent = "Bibliografia trovata: " + plural(bib.length, "voce", "voci") + "." +
          (bib.length > max ? " Il controllo gratuito guarda le prime " + max + "." : "") + " Premi Controlla le fonti.";
        if (doc.notes.length) showNotes(analyzeNotes(doc.notes, bib), box);
        else if (doc.kind === "pdf"){ box.innerHTML = '<p class="small">Nei PDF non possiamo separare le note dal testo: il confronto tra note e bibliografia funziona con i file Word.</p>'; box.classList.remove("hidden"); }
      } catch(e){
        st.textContent = "Non siamo riusciti a leggere il file: " + e.message + " Puoi sempre copiare e incollare la bibliografia.";
      } finally { input.value = ""; }
    });
  }
  function showNotes(r, box){
    var h = "<h3>Note e bibliografia</h3><p>Su " + plural(r.total, "nota", "note") + ": " +
      plural(r.complete, "riferimento completo", "riferimenti completi") + ", " +
      plural(r.abbreviate, "citazione abbreviata", "citazioni abbreviate") + " (\"op. cit.\"), " +
      plural(r.rinvii, "rinvio", "rinvii") + " (\"Ibidem\", \"Ivi\").</p>";
    if (r.rinvioIniziale) h += '<p><span class="pill y">Da controllare</span> La prima nota è un "Ibidem": non c\'è una nota precedente a cui rimandare.</p>';
    if (r.mancanti.length) h += '<p><span class="pill r">Mancano in bibliografia</span> autori citati nelle note ma assenti dalla bibliografia: ' +
      r.mancanti.slice(0,15).map(esc).join(", ") + (r.mancanti.length > 15 ? " e altri " + (r.mancanti.length - 15) : "") + ".</p>";
    if (r.nonCitate.length) h += '<p><span class="pill y">Mai citate in nota</span> ' + plural(r.nonCitate.length, "voce della bibliografia non compare", "voci della bibliografia non compaiono") +
      " nelle note. Può andare bene (opere di consultazione), ma conviene controllare.</p><ul class=\"small\">" +
      r.nonCitate.slice(0,8).map(function(b){ return "<li>" + esc(b.slice(0,140)) + "</li>"; }).join("") + "</ul>";
    if (!r.rinvioIniziale && !r.mancanti.length && !r.nonCitate.length) h += '<p><span class="pill g">Allineate</span> Ogni autore citato nelle note compare in bibliografia.</p>';
    h += '<p class="small">Il confronto è per cognome: un omonimo o un cognome scritto in modo diverso può sfuggire o dare un falso allarme.</p>';
    box.innerHTML = h; box.classList.remove("hidden");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : globalThis);
