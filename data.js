/* ============================================================
   ECOWATT — DONNÉES DE TARIFS ET D'AGENDA (source unique)
   Modifier un prix ici le met à jour dans : l'estimateur de l'accueil,
   la page de réservation, l'espace pro (prix HTVA).
   Les pages de service sont générées avec les mêmes chiffres
   (voir tools/build_site.py si vous régénérez les pages).
   ============================================================ */
(function () {
  var CAL = "https://calendly.com/ecowattpeb/";
  var G1 = "Studio et appartement", G2 = "Maison";

  window.ECOWATT = {
    /* Les prix ci-dessous sont des prix TTC (particuliers). */
    PRICE_SUFFIX: "TTC",
    TVA: 0.21,
    CAL: CAL,
    services: {
      peb: {
        label: "Certificat PEB", short: "Certificat PEB",
        tiers: [
          { id: "studio-50",   group: G1, label: "Studio, jusqu'à 50 m²",        price: 160, url: CAL + "certifpebstudio" },
          { id: "app-51-75",   group: G1, label: "Appartement de 51 à 75 m²",     price: 200, url: CAL + "30min" },
          { id: "app-76-125",  group: G1, label: "Appartement de 76 à 125 m²",    price: 240, url: CAL + "certificat-peb-studio-50m-160-clone" },
          { id: "app-126-200", group: G1, label: "Appartement de 126 à 200 m²",   price: 280, url: CAL + "certificat-peb-appartement-76-125m-240-clone" },
          { id: "mai-150",     group: G2, label: "Maison jusqu'à 150 m²",         price: 300, url: CAL + "certificat-peb-appartement-126-200m-280-clone" },
          { id: "mai-151-250", group: G2, label: "Maison de 151 à 250 m²",        price: 340, url: CAL + "certificat-peb-maison-150m-300-clone" },
          { id: "mai-251-350", group: G2, label: "Maison de 251 à 350 m²",        price: 400, url: CAL + "certificat-peb-maison-151-250m-340-clone" },
          { id: "mai-350",     group: G2, label: "Maison de plus de 350 m²",      price: 450, url: CAL + "certificat-peb-maison-251-350m-400-clone" }
        ]
        /* Attention : certaines adresses Calendly contiennent d'anciens prix ou noms
           (ex. « …76-125m-240-clone » ouvre le type « appartement 126-200 m² à 280 € »).
           Les associations ci-dessus ont été vérifiées avec les noms des types dans Calendly. */
      },
      pae: {
        label: "Audit logement (audit PAE)", short: "Audit logement",
        tiers: [
          { id: "studio-50",   group: G1, label: "Studio, jusqu'à 50 m²",        price: 900,  url: CAL + "audit-pae-a-partir-de-700" },
          { id: "app-51-75",   group: G1, label: "Appartement de 51 à 75 m²",     price: 925,  url: CAL + "audit-pae-appartement-51-75m-900" },
          { id: "app-76-125",  group: G1, label: "Appartement de 76 à 125 m²",    price: 950,  url: CAL + "audit-pae-appartement-76-125m-1050" },
          { id: "app-126-200", group: G1, label: "Appartement de 126 à 200 m²",   price: 975,  url: CAL + "audit-pae-appartement-126-200m-1250" },
          { id: "mai-150",     group: G2, label: "Maison jusqu'à 150 m²",         price: 1000, url: CAL + "audit-pae-maison-150m-1300" },
          { id: "mai-151-250", group: G2, label: "Maison de 151 à 250 m²",        price: 1025, url: CAL + "audit-pae-maison-151-250m-1500" },
          { id: "mai-251-350", group: G2, label: "Maison de 251 à 350 m²",        price: 1075, url: CAL + "audit-pae-maison-251-350m-1750" },
          { id: "mai-350",     group: G2, label: "Maison de plus de 350 m²",      price: 1100, url: CAL + "audit-pae-maison-350m-2000" }
        ]
      },
      conseil: {
        label: "Conseil en rénovation", short: "Conseil en rénovation",
        price: 72, unit: "heure", url: CAL + "conseil-en-renovation-72-heure"
      },
      efficacite: {
        label: "Consultation efficacité énergétique", short: "Consultation efficacité",
        price: 72, unit: "heure", url: CAL + "consultation-efficacite-energetique-72-heure"
      },
      responsable: {
        label: "Responsable PEB", short: "Responsable PEB",
        price: 1250, mode: "quote"
      }
    },

    /* --- utilitaires --- */
    fmt: function (n, decimals) {
      var d = decimals ? 2 : 0;
      var s = Number(n).toFixed(d).replace(".", ",");
      var parts = s.split(",");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
      return parts.join(",") + "\u00a0€";
    },
    /* prix HTVA d'un prix TTC */
    htva: function (ttc) { return Math.round(ttc / (1 + this.TVA) * 100) / 100; },
    /* prix HTVA net après remise (en %) */
    proPrice: function (ttc, discountPct) {
      var base = this.htva(ttc);
      return Math.round(base * (1 - (Number(discountPct) || 0) / 100) * 100) / 100;
    },
    tier: function (service, id) {
      var s = this.services[service];
      if (!s || !s.tiers) return null;
      for (var i = 0; i < s.tiers.length; i++) if (s.tiers[i].id === id) return s.tiers[i];
      return null;
    },
    range: function (service) {
      var p = this.services[service].tiers.map(function (t) { return t.price; });
      return { min: Math.min.apply(null, p), max: Math.max.apply(null, p) };
    }
  };

  /* --- Mise à jour automatique des prix affichés sur la page ---
     Tout élément portant data-price="range:peb", "tier:peb:studio-50" ou "flat:conseil"
     est recalculé à partir des données ci-dessus dès que la page se charge.
     Résultat concret : changer un prix ici (ou via GitHub) met à jour, sans autre
     manipulation, l'accueil, les 8 pages de service, la page « Prix du certificat PEB »,
     la page de réservation et l'espace professionnel. */
  function paintPrices() {
    var E = window.ECOWATT;
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var parts = el.getAttribute('data-price').split(':');
      var kind = parts[0], svc = parts[1], id = parts[2];
      try {
        if (kind === 'range') {
          var r = E.range(svc);
          el.textContent = E.fmt(r.min) + ' à ' + E.fmt(r.max);
        } else if (kind === 'min') {
          el.textContent = E.fmt(E.range(svc).min);
        } else if (kind === 'tier') {
          var t = E.tier(svc, id);
          if (t) el.textContent = E.fmt(t.price);
        } else if (kind === 'flat') {
          var s = E.services[svc];
          if (s) el.textContent = E.fmt(s.price);
        }
      } catch (e) { /* si l'identifiant est introuvable, on laisse le texte déjà présent */ }
    });
  }
  window.ECOWATT.paint = paintPrices;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintPrices);
  else paintPrices();
})();
