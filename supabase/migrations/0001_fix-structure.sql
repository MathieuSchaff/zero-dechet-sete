-- Custom SQL migration file, put your code below! --
create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ============================================
-- INDEX POUR RECHERCHE FLOUE (TRIGRAM)
-- ============================================

-- Recherche floue sur les slugs d'articles
create index if not exists article_slug_trgm_idx
  on public.article using gin (slug gin_trgm_ops);

-- Recherche floue sur les noms de lieux
create index if not exists place_name_trgm_idx
  on public.place using gin (name gin_trgm_ops);


-- ============================================
-- INDEX SUR ARRAYS ET DONNÉES STRUCTURÉES
-- ============================================

-- Tags des articles (recherche dans array)
create index if not exists article_tags_gin_idx
  on public.article using gin (tags);


-- ============================================
-- INDEX GÉOSPATIAL (POSTGIS)
-- ============================================

-- Géolocalisation des lieux (recherche par proximité)
create index if not exists place_geo_gist_idx
  on public.place using gist (geo);


-- ============================================
-- CONTRAINTE UNIQUE SUR SLUG
-- ============================================

-- Un slug unique par article publié (permet les doublons en draft)
create unique index if not exists article_slug_unique_idx
  on public.article (slug) 
  where status = 'published';


-- ============================================
-- INDEX SUR STATUS (FILTRAGE FRÉQUENT)
-- ============================================

-- Filtrer les articles par statut (draft, published, archived)
create index if not exists article_status_idx 
  on public.article (status);

-- Filtrer les lieux par statut
create index if not exists place_status_idx 
  on public.place (status);

-- Filtrer les événements par statut
create index if not exists event_status_idx 
  on public.event (status);

-- Filtrer les annonces par statut (active, given, removed)
create index if not exists post_status_idx 
  on public.post (status);


-- ============================================
-- INDEX SUR FOREIGN KEYS (JOINTURES)
-- ============================================

-- Récupérer les articles d'un auteur
create index if not exists article_author_idx 
  on public.article (author_id);

-- Récupérer les annonces d'un auteur
create index if not exists post_author_idx 
  on public.post (author_id);

-- Récupérer les événements d'un créateur
create index if not exists event_creator_idx 
  on public.event (created_by);

-- Récupérer les lieux soumis par un utilisateur
-- create index if not exists place_submitter_idx 
--  on public.place (submitted_by);

-- Messages envoyés par un utilisateur
create index if not exists message_from_idx 
  on public.message (from_user);

-- Messages reçus par un utilisateur
create index if not exists message_to_idx 
  on public.message (to_user);

-- Événements liés à un lieu
create index if not exists event_place_idx 
  on public.event (place_id);


-- ============================================
-- INDEX SUR DATES (TRI CHRONOLOGIQUE)
-- ============================================

-- Articles récents en premier
create index if not exists article_created_idx 
  on public.article (created_at desc);

-- Annonces récentes en premier
create index if not exists post_created_idx 
  on public.post (created_at desc);

-- Événements triés par date de début
create index if not exists event_start_idx 
  on public.event (start);

-- Messages chronologiques
create index if not exists message_created_idx 
  on public.message (created_at desc);


-- ============================================
-- INDEX COMPOSITE (REQUÊTES COMPLEXES)
-- ============================================

-- Conversations entre deux utilisateurs (messagerie)
create index if not exists message_conversation_idx 
  on public.message (from_user, to_user, created_at desc);

-- Articles publiés d'un auteur (profil public)
create index if not exists article_author_status_idx 
  on public.article (author_id, status, created_at desc);

-- Annonces actives par catégorie
create index if not exists post_category_status_idx 
  on public.post (category, status, created_at desc);


-- ============================================
-- INDEX GÉOGRAPHIQUE LÉGER (TEXTE)
-- ============================================

-- Filtrer les annonces par quartier
create index if not exists post_location_hint_idx 
  on public.post (location_hint);

-- Filtrer les lieux par quartier
create index if not exists place_quartier_idx 
  on public.place (quartier);

-- Filtrer les lieux par ville
create index if not exists place_city_idx 
  on public.place (city);



-- ============================================
-- ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================
alter table public.profiles enable row level security;
alter table public.article  enable row level security;
alter table public.place    enable row level security;
alter table public.event    enable row level security;
alter table public.post     enable row level security;
alter table public.message  enable row level security;


-- ============================================
-- PROFILES
-- Données publiques : displayName, role, createdAt
-- ============================================

-- Lecture : tout le monde peut voir les profils
create policy "read profiles (public)"
  on public.profiles for select using (true);

-- Modification : chacun peut modifier son propre profil
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ============================================
-- ARTICLE (contenus éditoriaux)
-- Workflow : draft → published → archived
-- ============================================

-- Lecture : articles publiés visibles par tous
create policy "read published articles"
  on public.article for select 
  using (status = 'published');

-- Lecture : auteur voit ses propres brouillons et archives
create policy "read own drafts"
  on public.article for select
  using (auth.uid() = author_id);

-- Création : auteur crée en brouillon uniquement
create policy "authors insert drafts"
  on public.article for insert
  with check (
    auth.uid() = author_id 
    and status = 'draft'
  );

-- Modification : auteur modifie ses propres articles (tous statuts)
create policy "authors update own articles"
  on public.article for update
  using (auth.uid() = author_id);

-- Suppression : auteur supprime ses brouillons
create policy "authors delete own drafts"
  on public.article for delete
  using (auth.uid() = author_id and status = 'draft');

-- Admin : accès total (lecture, modification, suppression)
create policy "admin full access articles"
  on public.article for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );


-- ============================================
-- PLACE (lieux - soumission communautaire ouverte)
-- Workflow : published directement (pas de validation)
-- ============================================

-- Lecture : tous les lieux publiés
create policy "read published places"
  on public.place for select 
  using (status = 'published');

-- Création : utilisateur connecté peut créer et publier directement
-- create policy "authenticated insert places"
--   on public.place for insert
--   with check (
--     auth.role() = 'authenticated'
--     and auth.uid() = submitted_by
--     and status = 'published'
--   );

-- Modification : créateur peut modifier ses propres lieux
-- create policy "update own places"
--   on public.place for update
--   using (auth.uid() = submitted_by);

-- Suppression : créateur supprime ses propres lieux
-- create policy "delete own places"
--   on public.place for delete
--   using (auth.uid() = submitted_by);

-- Modérateur : peut supprimer n'importe quel lieu
create policy "moderator delete any place"
  on public.place for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );

-- Modérateur : peut modifier n'importe quel lieu
create policy "moderator update any place"
  on public.place for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );


-- ============================================
-- EVENT (événements - soumission communautaire ouverte)
-- Workflow : published directement (pas de validation)
-- ============================================

-- Lecture : tous les événements publiés
create policy "read published events"
  on public.event for select 
  using (status = 'published');

-- Création : utilisateur connecté peut créer et publier directement
create policy "authenticated insert events"
  on public.event for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = created_by
    and status = 'published'
  );

-- Modification : créateur peut modifier ses propres événements
create policy "update own events"
  on public.event for update
  using (auth.uid() = created_by);

-- Suppression : créateur supprime ses propres événements
create policy "delete own events"
  on public.event for delete
  using (auth.uid() = created_by);

-- Modérateur : peut supprimer n'importe quel événement
create policy "moderator delete any event"
  on public.event for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );

-- Modérateur : peut modifier n'importe quel événement
create policy "moderator update any event"
  on public.event for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );


-- ============================================
-- POST (annonces dons/recherche/entraide)
-- Workflow : active → given/removed
-- ============================================

-- Lecture : annonces actives visibles par tous
create policy "read active posts"
  on public.post for select 
  using (status = 'active');

-- Lecture : auteur voit toutes ses annonces (actives ou clôturées)
create policy "read own posts"
  on public.post for select
  using (auth.uid() = author_id);

-- Création : utilisateur crée son propre post
create policy "insert own post"
  on public.post for insert 
  with check (auth.uid() = author_id);

-- Modification : auteur modifie son propre post
create policy "update own post"
  on public.post for update 
  using (auth.uid() = author_id);

-- Suppression : auteur supprime son propre post
create policy "delete own post"
  on public.post for delete
  using (auth.uid() = author_id);

-- Modérateur : peut modifier/supprimer n'importe quel post (modération)
create policy "moderator manage posts"
  on public.post for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );


-- ============================================
-- MESSAGE (messagerie privée)
-- ============================================

-- Lecture : participants à la conversation
create policy "read messages (participant)"
  on public.message for select
  using (auth.uid() = from_user or auth.uid() = to_user);

-- Création : envoyer un message en son nom
create policy "insert messages (participant)"
  on public.message for insert
  with check (auth.uid() = from_user);

-- Mise à jour : destinataire peut marquer comme lu
create policy "update message read status"
  on public.message for update
  using (auth.uid() = to_user);


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


-- ============================================
-- REALTIME : PUBLICATION DES TABLES
-- ============================================

-- Active les notifications temps réel pour ces tables
-- L'application frontend recevra les changements instantanément
alter publication supabase_realtime
  add table public.post, 
           public.message, 
           public.event, 
           public.article, 
           public.place;


-- ============================================
-- STORAGE : CRÉATION DES BUCKETS
-- ============================================

-- Bucket pour les images des articles éditoriaux
-- Bucket pour les photos des annonces (dons/recherche)
-- Bucket pour les photos des lieux
insert into storage.buckets (id, name, public)
values 
  ('images-articles', 'images-articles', true),
  ('images-annonces', 'images-annonces', true),
  ('images-lieux', 'images-lieux', true)
on conflict (id) do nothing;


-- ============================================
-- STORAGE : POLITIQUES DE SÉCURITÉ
-- ============================================

-- Lecture publique : tout le monde peut voir les images (même sans compte)
create policy "public read images"
  on storage.objects for select
  using (bucket_id in ('images-articles', 'images-annonces', 'images-lieux'));

-- Upload : utilisateur connecté peut uploader dans ces buckets
-- Il devient automatiquement propriétaire (owner) du fichier
create policy "authenticated upload images"
  on storage.objects for insert
  with check (
    bucket_id in ('images-articles', 'images-annonces', 'images-lieux')
    and auth.role() = 'authenticated'
  );

-- Mise à jour/Suppression : seul le propriétaire peut modifier/supprimer ses fichiers
create policy "owner manage own images"
  on storage.objects for update
  using (
    bucket_id in ('images-articles', 'images-annonces', 'images-lieux')
    and auth.uid() = owner
  );

create policy "owner delete own images"
  on storage.objects for delete
  using (
    bucket_id in ('images-articles', 'images-annonces', 'images-lieux')
    and auth.uid() = owner
  );

-- Modérateur : peut supprimer n'importe quelle image (modération)
create policy "moderator delete any image"
  on storage.objects for delete
  using (
    bucket_id in ('images-articles', 'images-annonces', 'images-lieux')
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );