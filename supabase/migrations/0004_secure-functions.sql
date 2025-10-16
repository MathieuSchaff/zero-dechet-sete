-- Custom SQL migration file, put your code below! --

-- ============================================
-- FONCTION : CRÉATION AUTOMATIQUE DU PROFIL
-- ============================================

-- Cette fonction est déclenchée automatiquement lors de l'inscription d'un nouvel utilisateur.
-- Elle crée une entrée dans la table public.profiles pour chaque nouveau compte Supabase Auth.

create or replace function public.handle_new_user()
returns trigger                    -- Type de fonction : trigger (déclenchée par un événement)
language plpgsql                   -- Langage : PL/pgSQL (SQL procédural de PostgreSQL)
security definer                   -- IMPORTANT : s'exécute avec les privilèges du créateur (superuser)
                                   -- Nécessaire car un nouvel utilisateur n'a pas encore de permissions
set search_path = public           -- SÉCURITÉ : force l'utilisation du schéma "public"
                                   -- Empêche un attaquant de rediriger vers ses propres tables
                                   -- Corrige le warning "Function Search Path Mutable"
as $$
begin
  -- Insère un nouveau profil dans la table public.profiles
  insert into public.profiles (id, display_name, role)
  values (
    new.id,                        -- new.id : UUID de l'utilisateur depuis auth.users
    -- Génère un nom d'affichage unique à partir de l'email
    -- Exemple : jean.dupont@mail.com → jean.dupont_a1b2c3d4
    split_part(new.email, '@', 1)  -- Prend la partie avant le @
    || '_'                         -- Ajoute un underscore
    || substr(new.id::text, 1, 8), -- Ajoute les 8 premiers caractères de l'UUID
    'user'                         -- Rôle par défaut : utilisateur standard
  );
  return new;                      -- Retourne le nouvel enregistrement (requis pour les triggers)
end; $$;


-- ============================================
-- FONCTION : MISE À JOUR AUTOMATIQUE DE updated_at
-- ============================================

-- Cette fonction met à jour automatiquement le champ "updated_at" 
-- à chaque modification d'un enregistrement.
-- Évite d'avoir à mettre à jour manuellement ce champ dans chaque requête UPDATE.

create or replace function public.set_updated_at()
returns trigger                    -- Type de fonction : trigger
language plpgsql                   -- Langage : PL/pgSQL
set search_path = public           -- SÉCURITÉ : fixe le schéma à "public"
                                   -- Garantit que now() appelle bien pg_catalog.now()
                                   -- et non une fonction malveillante créée par un attaquant
as $$
begin
  new.updated_at = now();          -- Met à jour le champ updated_at avec l'heure actuelle
                                   -- "new" représente la nouvelle version de la ligne modifiée
  return new;                      -- Retourne la ligne modifiée avec updated_at mis à jour
end; $$;