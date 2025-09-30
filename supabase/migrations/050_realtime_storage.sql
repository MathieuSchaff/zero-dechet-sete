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
select storage.create_bucket('images-articles', public => true);

-- Bucket pour les photos des annonces (dons/recherche)
select storage.create_bucket('images-annonces', public => true);

-- Bucket pour les photos des lieux
select storage.create_bucket('images-lieux', public => true);


-- ============================================
-- STORAGE : ACTIVATION RLS
-- ============================================

-- Active Row Level Security sur les objets du storage
alter table storage.objects enable row level security;


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