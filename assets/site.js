/* REV — intestazione, piè di pagina e dati comuni, generati da config.js */
(function(){
  var C = window.REV_CONFIG || {};
  var P = C.prices || {};
  var NAV = [
    ["index.html","Controllo gratuito"],
    ["servizio.html","Prezzi"],
    ["tesi.html","Tesi"],
    ["metodo.html","Come lavoriamo"]
  ];
  var isPreview = !(C.contactEmail && C.operatorName && C.vatNumber);
  window.REV_PREVIEW = isPreview;

  function here(){
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }
  function el(tag, attrs, html){
    var e = document.createElement(tag);
    for (var k in (attrs||{})) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function euro(n){ return n.toLocaleString("it-IT") + " €"; }

  // Header
  var head = el("header",{class:"site-head"});
  var hw = el("div",{class:"wrap"});
  hw.appendChild(el("a",{class:"brand",href:"index.html"}, (C.name||"REV") + "<span>" + (C.tagline||"") + "</span>"));
  var nav = el("nav",{class:"nav","aria-label":"Sezioni"});
  NAV.forEach(function(n){
    var a = el("a",{href:n[0]}, n[1]);
    if (here() === n[0]) a.setAttribute("aria-current","page");
    nav.appendChild(a);
  });
  hw.appendChild(nav); head.appendChild(hw);
  document.body.insertBefore(head, document.body.firstChild);

  if (isPreview){
    document.body.insertBefore(el("div",{class:"preview",role:"note"},
      "Anteprima: il servizio a pagamento non è ancora attivo. Il controllo gratuito funziona già."), head);
  }

  // Footer
  var foot = el("footer",{class:"site-foot"});
  var fw = el("div",{class:"wrap"});
  var who = isPreview ? "Fornitore: dati in arrivo." :
    "Servizio fornito da " + C.operatorName + " · P.IVA " + C.vatNumber + " · " +
    '<a href="mailto:' + C.contactEmail + '">' + C.contactEmail + "</a>";
  fw.appendChild(el("div",{}, who));
  fw.appendChild(el("div",{},
    '<a href="partner.html">Partner</a> · ' +
    '<a href="condizioni.html">Condizioni</a> · <a href="privacy.html">Privacy</a> · ' +
    '<a href="registro.html">Registro delle verifiche</a>'));
  foot.appendChild(fw);
  document.body.appendChild(foot);

  // Prezzi e dati: <span data-price="perError"></span>, <span data-cfg="name"></span>
  document.querySelectorAll("[data-price]").forEach(function(s){
    var v = P[s.getAttribute("data-price")];
    if (v == null) return;
    s.textContent = s.hasAttribute("data-num") ? String(v) : euro(v);
  });
  document.querySelectorAll("[data-cfg]").forEach(function(s){
    var v = C[s.getAttribute("data-cfg")];
    if (v != null && v !== "") s.textContent = v;
  });
  document.querySelectorAll("[data-registry-url]").forEach(function(s){
    s.textContent = location.host ? location.host + location.pathname.replace(/[^/]*$/,"") + "registro" : "[sito]/registro";
  });

  // Link d'ordine: <a data-mail="Oggetto">…</a>
  document.querySelectorAll("a[data-mail]").forEach(function(a){
    if (isPreview){
      a.removeAttribute("href");
      a.setAttribute("aria-disabled","true");
      a.style.opacity = ".55";
      a.style.cursor = "not-allowed";
      a.title = "Il servizio a pagamento non è ancora attivo";
      return;
    }
    var body = a.getAttribute("data-body") || "";
    a.href = "mailto:" + C.contactEmail + "?subject=" + encodeURIComponent(a.getAttribute("data-mail")) +
      (body ? "&body=" + encodeURIComponent(body) : "");
  });
  document.querySelectorAll("[data-contact]").forEach(function(s){
    s.textContent = isPreview ? "(indirizzo in arrivo)" : C.contactEmail;
  });
})();
