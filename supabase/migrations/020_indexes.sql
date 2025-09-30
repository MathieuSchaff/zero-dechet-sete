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
create index if not exists place_submitter_idx 
  on public.place (submitted_by);

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
  on public.event (start_date);

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