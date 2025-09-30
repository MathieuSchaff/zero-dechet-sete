-- ============================================
-- FONCTION : CRÉATION AUTO DU PROFIL
-- ============================================

-- Crée automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    -- Nom d'affichage : partie email + 8 premiers caractères de l'UUID
    -- Ex: jean.dupont@mail.com → jean.dupont_a1b2c3d4
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 8),
    'user'  -- Rôle par défaut
  );
  return new;
end; $$;

-- Déclencher la fonction à chaque nouvel utilisateur
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================
-- FONCTION : MISE À JOUR AUTO DE updated_at
-- ============================================

-- Met à jour automatiquement le champ updated_at lors d'une modification
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;


-- ============================================
-- TRIGGERS updated_at SUR LES TABLES
-- ============================================

-- Trigger sur article
drop trigger if exists trg_article_updated_at on public.article;
create trigger trg_article_updated_at
  before update on public.article
  for each row execute function public.set_updated_at();

-- Trigger sur place
drop trigger if exists trg_place_updated_at on public.place;
create trigger trg_place_updated_at
  before update on public.place
  for each row execute function public.set_updated_at();

-- Trigger sur event
drop trigger if exists trg_event_updated_at on public.event;
create trigger trg_event_updated_at
  before update on public.event
  for each row execute function public.set_updated_at();

-- Trigger sur post
drop trigger if exists trg_post_updated_at on public.post;
create trigger trg_post_updated_at
  before update on public.post
  for each row execute function public.set_updated_at();

-- Trigger sur profiles
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

