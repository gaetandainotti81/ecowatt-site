/* ============================================================
   CONFIGURATION DE L'ESPACE CLIENT / PRO (Supabase)
   Tant que ces deux valeurs sont vides, le site n'affiche AUCUN lien
   vers les espaces client et pro : vous pouvez mettre le site en ligne
   avant d'avoir installé Supabase.
   Voir le guide : portal/GUIDE-INSTALLATION.md
   ============================================================ */
window.PORTAL_CONFIG = {
  SUPABASE_URL: "",       // ex. https://abcdefghijk.supabase.co
  SUPABASE_ANON_KEY: "",  // clé « anon / public » (elle est faite pour être publique)
  BUCKET: "portal-documents",
  ADMIN_EMAIL_HINT: "info@ecowattpeb.be"
};
