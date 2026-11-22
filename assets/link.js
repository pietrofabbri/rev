/*
 * REV — controllo dei link citati, dal browser del visitatore.
 * Che cosa si può sapere da una pagina web:
 *  - se il SITO risponde (un dominio inesistente o scaduto dà errore di rete);
 *  - NON se la singola pagina esiste ancora: le risposte degli altri siti sono opache;
 *  - se esiste una copia nella Wayback Machine (Internet Archive), anche vicina alla
 *    data di consultazione indicata nel riferimento ("consultato il 3/3/2021").
 */
(function(root){
  "use strict";
  var C = root.REV_CONFIG || {};
  var MONTHS = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];

  // URL nel riferimento, anche nella forma "URL: < https://… >".
  function extractURLs(ref){
    var out = [], re = /https?:\/\/[^\s<>"«»]+/g, m;
    while ((m = re.exec(String(ref||"")))){
      var u = m[0].replace(/[.,;:)\]]+$/,"");
      if (/^https?:\/\/(dx\.)?doi\.org\//i.test(u)) continue;   // i DOI si controllano già su Crossref e DataCite
      if (out.indexOf(u) < 0) out.push(u);
    }
    return out;
  }
  // Data di consultazione: "consultato il 3/3/2021", "ultima consultazione: 12 marzo 2021", "accesso 2021-03-12".
  function accessDate(ref){
    var s = String(ref||"").toLowerCase();
    var m = s.match(/(consultat[oaie]|consultazione|accesso|visitat[oaie]|ultimo accesso|retrieved|accessed)[^0-9]{0,20}(\d{1,2})[\s\/.\-]+(\d{1,2}|[a-zà]+)[\s\/.\-,]+(\d{4})/);
    if (m){
      var mon = /^\d+$/.test(m[3]) ? parseInt(m[3],10) : MONTHS.indexOf(m[3]) + 1;
      var d = parseInt(m[2],10), y = parseInt(m[4],10);
      if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31) return y + pad(mon) + pad(d);
    }
    m = s.match(/(consultat[oaie]|consultazione|accesso|accessed)[^0-9]{0,20}(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[2] + m[3] + m[4] : null;
  }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function itDate(ts){ return ts ? ts.slice(6,8) + "/" + ts.slice(4,6) + "/" + ts.slice(0,4) : ""; }

  function withTimeout(p, ms){
    return Promise.race([p, new Promise(function(_, rej){ setTimeout(function(){ rej(new Error("timeout")); }, ms); })]);
  }
  async function siteResponds(url){
    if (/^http:\/\//i.test(url)) return "http";            // il browser blocca le richieste http da una pagina https
    try { await withTimeout(root.fetch(url, {mode:"no-cors", cache:"no-store", redirect:"follow"}), C.linkTimeoutMs || 8000); return "risponde"; }
    catch(e){
      // un secondo tentativo, per non scambiare un rallentamento per un sito chiuso
      try { await withTimeout(root.fetch(url, {mode:"no-cors", cache:"no-store"}), C.linkTimeoutMs || 8000); return "risponde"; }
      catch(e2){ return "non risponde"; }
    }
  }
  async function archived(url, ts){
    try {
      var api = "https://archive.org/wayback/available?url=" + encodeURIComponent(url.replace(/^https?:\/\//,"")) + (ts ? "&timestamp=" + ts : "");
      var r = await withTimeout(root.fetch(api), C.linkTimeoutMs || 8000);
      if (!r.ok) return {error:true};
      var j = await r.json(), c = j && j.archived_snapshots && j.archived_snapshots.closest;
      if (!c || !c.available) return null;
      return {url: c.url.replace(/^http:/,"https:"), ts: c.timestamp, status: c.status};
    } catch(e){ return {error:true}; }
  }
  async function checkLink(url, ts){
    var both = await Promise.all([siteResponds(url), archived(url, ts)]);
    return {url:url, live:both[0], archive: both[1] && !both[1].error ? both[1] : null, archiveError: !!(both[1] && both[1].error), wanted:ts};
  }
  // Tutti i link della bibliografia, al massimo `max`, tre alla volta.
  async function checkLinks(refs, max){
    var items = [];
    refs.forEach(function(ref, i){ extractURLs(ref).forEach(function(u){ items.push({row:i+1, url:u, ts:accessDate(ref)}); }); });
    items = items.slice(0, max || 30);
    var out = new Array(items.length), next = 0;
    async function worker(){ while (next < items.length){ var k = next++; var r = await checkLink(items[k].url, items[k].ts); r.row = items[k].row; out[k] = r; } }
    await Promise.all([worker(), worker(), worker()]);
    return out;
  }

  var api = {extractURLs:extractURLs, accessDate:accessDate, checkLink:checkLink, checkLinks:checkLinks, itDate:itDate};
  root.REV_LINK = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // ---------- interfaccia ----------
  if (typeof document === "undefined") return;
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function short(u){ return u.length > 70 ? u.slice(0, 67) + "…" : u; }
  async function run(refs){
    var box = document.getElementById("rev-links");
    if (!box) return;
    var n = refs.reduce(function(a, r){ return a + extractURLs(r).length; }, 0);
    if (!n){ box.classList.add("hidden"); return; }
    box.classList.remove("hidden");
    box.innerHTML = "<h3>Link citati</h3><p class=\"small\">Controllo " + n + " link…</p>";
    var res = await checkLinks(refs, (C.maxRefs || 30));
    var dead = res.filter(function(r){ return r.live === "non risponde"; }).length;
    var rows = res.map(function(r){
      var pill = r.live === "risponde" ? '<span class="pill g">Il sito risponde</span>' :
                 r.live === "non risponde" ? '<span class="pill r">Il sito non risponde</span>' :
                 '<span class="pill y">Non controllabile</span>';
      var arch = r.archive ? 'Copia d\'archivio del ' + itDate(r.archive.ts) + ': <a href="' + esc(r.archive.url) + '" target="_blank" rel="noopener">apri</a>' +
                   (r.wanted ? " (la più vicina alla data di consultazione, " + itDate(r.wanted) + ")" : "") :
                 r.archiveError ? "L'archivio non ha risposto: riprova più tardi." : "Nessuna copia nell'archivio.";
      var note = r.live === "http" ? " Indirizzo non sicuro (http): il browser non permette di controllarlo da qui." :
                 r.live === "risponde" ? " Il sito è raggiungibile, ma la pagina potrebbe essere stata spostata o tolta: aprila per esserne sicuro." : "";
      return '<tr><td class="num">' + r.row + '</td><td>' + pill + '</td><td class="ref"><a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(short(r.url)) + "</a></td><td>" + arch + '<span class="small">' + note + "</span></td></tr>";
    }).join("");
    box.innerHTML = "<h3>Link citati</h3><p>" + res.length + " link: " + dead + (dead === 1 ? " sito non risponde" : " siti non rispondono") +
      ". Per i siti che non rispondono, la copia d'archivio è spesso l'unico modo di dimostrare che cosa c'era.</p>" +
      '<div class="table-wrap"><table><thead><tr><th class="num">Riga</th><th>Sito</th><th>Link</th><th>Copia d\'archivio</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }
  root.REV_LINK.run = run;
})(typeof window !== "undefined" ? window : globalThis);
