-- Custom SQL migration file, put your code below! --

-- RLS sur article_revision
alter table public.article_revision enable row level security;

-- RLS sur report
alter table public.report enable row level security;

-- RLS sur spatial_ref_sys (table PostGIS, généralement en lecture seule)

-- article_revision : seuls les auteurs et admins peuvent voir l'historique
create policy "authors read own revisions"
  on public.article_revision for select
  using (
    exists (
      select 1 from public.article 
      where id = article_revision.article_id 
      and author_id = auth.uid()
    )
  );

-- report : seuls les modérateurs peuvent voir les signalements
create policy "moderators read reports"
  on public.report for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderator')
    )
  );
