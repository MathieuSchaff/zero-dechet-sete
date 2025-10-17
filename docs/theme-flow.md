┌──────────────────────────────────────────────────────────────┐
│ 1️⃣ SSR : le serveur rend la page initiale │
│--------------------------------------------------------------│
│ → Le serveur lit le cookie "theme" du navigateur. │
│ → Si présent : applique <html data-theme="dark"> (ou light). │
│ → Sinon : "system" (par défaut). │
│ → Il envoie ce HTML initial au client. │
└──────────────┬───────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│ 2️⃣ Hydratation (client) │
│--------------------------------------------------------------│
│ → React "réveille" les composants avec le HTML existant. │
│ → Le composant ThemeToggle s’exécute. │
│ → useEffect lit data-theme="dark" depuis le DOM. │
│ → setCurrent("dark") → UI affiche 🌙 Dark. │
└──────────────┬───────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│ 3️⃣ Interaction utilisateur │
│--------------------------------------------------------------│
│ → L’utilisateur clique sur le bouton. │
│ → onClick() calcule le prochain thème ("light"). │
│ → setCurrent("light") → UI affiche ☀️ Light. │
│ → startTransition(() => setTheme("light")). │
│ ↳ Appelle la Server Action `setTheme()` côté serveur. │
└──────────────┬───────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│ 4️⃣ Exécution de l’action serveur │
│--------------------------------------------------------------│
│ → `setTheme(next)` est une "Server Action" (Next.js). │
│ → Elle s’exécute sur le serveur Node. │
│ → Elle reçoit le paramètre `next = "light"`. │
│ → Elle peut accéder à : │
│ - la requête HTTP (donc les cookies, headers, etc.) │
│ - la réponse (et donc définir un nouveau cookie). │
│ → Exemple : │
│ cookies().set("theme", next) │
│ → Le serveur renvoie une confirmation au client. │
└──────────────┬───────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────┐
│ 5️⃣ Rechargement SSR / navigation suivante │
│--------------------------------------------------------------│
│ → Le navigateur garde le cookie "theme=light". │
│ → Au prochain rendu SSR (nouvelle page, refresh, etc.) │
│ ↳ Next.js lit ce cookie côté serveur. │
│ → Il insère <html data-theme="light"> dans le HTML. │
│ → Résultat : pas de flash, cohérence entre SSR et client. │
└──────────────────────────────────────────────────────────────┘
