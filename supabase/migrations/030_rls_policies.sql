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
create policy "authenticated insert places"
  on public.place for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = submitted_by
    and status = 'published'
  );

-- Modification : créateur peut modifier ses propres lieux
create policy "update own places"
  on public.place for update
  using (auth.uid() = submitted_by);

-- Suppression : créateur supprime ses propres lieux
create policy "delete own places"
  on public.place for delete
  using (auth.uid() = submitted_by);

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