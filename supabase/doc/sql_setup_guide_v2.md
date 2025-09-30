# Guide complet des fichiers SQL de configuration

Documentation complète pour le setup de la base de données du projet **Zéro Déchet Sète**.

---

## 📋 Vue d'ensemble

Ce guide décrit les 5 fichiers SQL à exécuter **dans l'ordre** pour configurer votre base de données Supabase/PostgreSQL.

### Ordre d'exécution

```
1. 010_extensions.sql      → Active PostGIS et Trigram
2. 020_indexes.sql         → Crée tous les index de performance
3. 030_rls_policies.sql    → Configure la sécurité (RLS)
4. 040_triggers.sql        → Automatise certaines actions
5. 050_realtime_storage.sql → Configure temps réel et stockage
```

### Schéma simplifié du workflow

```
┌─────────────────────────────────────────────────────────┐
│  UTILISATEUR S'INSCRIT (auth.users)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓ (Trigger automatique)
         ┌─────────────────────┐
         │  profiles créé auto  │
         │  role = 'user'       │
         └─────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ↓              ↓              ↓
┌────────┐   ┌─────────┐   ┌──────────┐
│ARTICLE │   │ PLACE   │   │  POST    │
│(draft) │   │(public) │   │ (annonce)│
└────────┘   └─────────┘   └──────────┘
    │              │              │
    ↓ publish      ↓ RLS check    ↓ status change
┌────────┐   ┌─────────┐   ┌──────────┐
│published│   │visible  │   │  given   │
└────────┘   └─────────┘   └──────────┘
```

---

## 1️⃣ 010_extensions.sql

### 🎯 Objectif
Active les extensions PostgreSQL nécessaires pour les fonctionnalités avancées.

### 📦 Extensions activées

#### PostGIS
```sql
create extension if not exists postgis;
```
- **Usage** : Données géospatiales (coordonnées GPS, cartes)
- **Permet** : 
  - Stocker des points géographiques (`GEOGRAPHY(POINT)`)
  - Calculer des distances entre lieux
  - Rechercher dans un rayon (ex: "lieux à 5km")
  - Optimiser avec des index GIST

**Exemple d'utilisation** :
```sql
-- Trouver les lieux à moins de 5km
SELECT * FROM place 
WHERE ST_DWithin(
  geo, 
  ST_MakePoint(43.4042, 3.6983)::geography, 
  5000
);
```

#### pg_trgm (Trigram)
```sql
create extension if not exists pg_trgm;
```
- **Usage** : Recherche floue et tolérance aux fautes
- **Permet** :
  - Chercher "restauran" → trouve "Restaurant"
  - Chercher "compost" → trouve "composteur"
  - Similarité textuelle
  - Autocomplete intelligent

**Exemple d'utilisation** :
```sql
-- Recherche floue sur les noms de lieux
SELECT * FROM place 
WHERE name ILIKE '%compost%' 
  OR similarity(name, 'compost') > 0.3
ORDER BY similarity(name, 'compost') DESC;
```

### ⚠️ Important
Ces extensions doivent être activées **avant** de créer les tables et index qui les utilisent.

---

## 2️⃣ 020_indexes.sql

### 🎯 Objectif
Optimiser les performances des requêtes en créant des index stratégiques.

### 📊 Types d'index créés

#### Index Trigram (Recherche floue)
```sql
create index article_slug_trgm_idx 
  on public.article using gin (slug gin_trgm_ops);
```
- **Tables** : `article.slug`, `place.name`
- **Performance** : Recherche floue 10x-100x plus rapide
- **Usage** : Barre de recherche, autocomplete

#### Index GIN (Arrays)
```sql
create index article_tags_gin_idx 
  on public.article using gin (tags);
```
- **Tables** : `article.tags`
- **Performance** : Recherche dans arrays instantanée
- **Usage** : Filtrer par tags multiples

#### Index GIST (Géospatial)
```sql
create index place_geo_gist_idx 
  on public.place using gist (geo);
```
- **Tables** : `place.geo`
- **Performance** : Requêtes géographiques optimisées
- **Usage** : Carte interactive, recherche par proximité

#### Index B-Tree (Classiques)
- **Foreign Keys** : `author_id`, `created_by`, `from_user`, etc.
- **Status** : Filtrer rapidement par statut
- **Dates** : Tri chronologique performant
- **Texte** : `quartier`, `city`, `location_hint`

#### Index composites
```sql
create index message_conversation_idx 
  on public.message (from_user, to_user, created_at desc);
```
- **Usage** : Optimise les requêtes complexes multi-colonnes
- **Exemples** : 
  - Conversations entre 2 utilisateurs
  - Articles d'un auteur par statut
  - Annonces par catégorie et statut

#### Contrainte unique
```sql
create unique index article_slug_unique_idx 
  on public.article (slug) 
  where status = 'published';
```
- **Règle** : Un slug ne peut être utilisé qu'une seule fois pour les articles publiés
- **Permet** : Plusieurs brouillons avec le même slug (OK), mais pas 2 articles publiés

### 📈 Impact performance

| Opération | Sans index | Avec index | Gain |
|-----------|-----------|------------|------|
| Recherche texte | 500-2000ms | 10-50ms | **20-40x** |
| Filtre par status | 200-800ms | 5-20ms | **40x** |
| Tri par date | 300-1000ms | 10-30ms | **30x** |
| Recherche géo | 1000-5000ms | 20-100ms | **50x** |

---

## 3️⃣ 030_rls_policies.sql

### 🎯 Objectif
Sécuriser l'accès aux données avec Row Level Security (RLS).

### 🔒 Principe de RLS

```
Sans RLS : SELECT * FROM article → Tout visible
Avec RLS : SELECT * FROM article → Filtre automatique selon les policies
```

### 📋 Politiques par table

#### Profiles
```
✅ Lecture : Public (displayName, role, createdAt)
✅ Modification : Soi-même uniquement
```

#### Article (contenu éditorial)
```
Workflow : draft → published → archived

✅ Lecture publique : Articles publiés
✅ Lecture auteur : Ses brouillons/archives
✅ Création : draft uniquement
✅ Modification : Ses propres articles (tous statuts)
✅ Suppression : Ses brouillons uniquement
✅ Admin : Accès total
```

#### Place & Event (communautaire)
```
Workflow : published (direct, pas de validation)

✅ Lecture : Tous les lieux/événements publiés
✅ Création : Utilisateur connecté → statut 'published'
✅ Modification : Créateur uniquement
✅ Suppression : Créateur OU Modérateur
✅ Modérateur : Peut tout modifier/supprimer
```

#### Post (annonces)
```
Workflow : active → given/removed

✅ Lecture publique : Annonces actives
✅ Lecture auteur : Toutes ses annonces
✅ Création/Modification/Suppression : Auteur uniquement
✅ Modérateur : Peut tout gérer
```

#### Message (messagerie)
```
✅ Lecture : Participants uniquement
✅ Envoi : En son nom uniquement
✅ Mise à jour : Destinataire (marquer comme lu)
```

### 🛡️ Workflow de sécurité

```
┌──────────────────────────────────────────────┐
│  Requête SQL depuis l'application            │
└───────────────┬──────────────────────────────┘
                │
                ↓
    ┌───────────────────────┐
    │ auth.uid() extrait    │ → UUID de l'utilisateur
    └───────────┬───────────┘
                │
                ↓
    ┌───────────────────────┐
    │ RLS policies évaluées │
    └───────────┬───────────┘
                │
        ┌───────┴────────┐
        ↓                ↓
    ✅ Autorisé      ❌ Refusé
    Données visibles  Rien retourné
```

### ⚠️ Points de vigilance

- **Données sensibles** : Ne jamais mettre email, téléphone dans `profiles` en lecture publique
- **Performance** : Les policies complexes peuvent ralentir les requêtes → tester avec EXPLAIN ANALYZE
- **Test** : Toujours tester avec différents rôles (anonyme, user, admin)

---

## 4️⃣ 040_triggers.sql

### 🎯 Objectif
Automatiser des actions lors d'événements dans la base de données.

### 🤖 Triggers configurés

#### 1. Création automatique de profil

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();
```

**Workflow** :
```
Utilisateur s'inscrit
      ↓
auth.users (nouvelle ligne)
      ↓ (Trigger automatique)
public.profiles créé avec :
  - id = auth.uid()
  - display_name = "email_a1b2c3d4"
  - role = "user"
```

**Exemple** :
- Email : `marie.dupont@gmail.com`
- UUID : `a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`
- Display name généré : `marie.dupont_a1b2c3d4`

**Avantages** :
- ✅ Pas de risque d'oublier de créer le profil
- ✅ Nom unique garanti (UUID)
- ✅ L'utilisateur peut le changer après

#### 2. Mise à jour automatique de `updated_at`

```sql
CREATE TRIGGER trg_article_updated_at
  BEFORE UPDATE ON public.article
  FOR EACH ROW 
  EXECUTE FUNCTION set_updated_at();
```

**Workflow** :
```
UPDATE article SET title = 'Nouveau titre'
              ↓ (Trigger automatique)
updated_at = NOW() ajouté automatiquement
```

**Tables concernées** :
- `article`
- `place`
- `event`
- `post`
- `profiles`

**Avantages** :
- ✅ Impossible d'oublier de mettre à jour la date
- ✅ Cohérence des données
- ✅ Historique fiable

### 🔄 Séquence d'événements

```
┌────────────────────────────────────────────────┐
│  1. Inscription utilisateur                    │
│     POST /auth/signup                          │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  2. auth.users créé                            │
│     (par Supabase Auth)                        │
└─────────────────┬──────────────────────────────┘
                  ↓ TRIGGER
┌────────────────────────────────────────────────┐
│  3. public.profiles créé automatiquement       │
│     - id, display_name, role                   │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  4. Utilisateur peut créer du contenu          │
│     - Article, Place, Event, Post              │
└────────────────────────────────────────────────┘
```

---

## 5️⃣ 050_realtime_storage.sql

### 🎯 Objectif
Configurer les fonctionnalités temps réel et le stockage de fichiers.

### ⚡ Realtime (Notifications en temps réel)

```sql
alter publication supabase_realtime
  add table public.post, public.message, public.event, 
            public.article, public.place;
```

**Fonctionnement** :
```
Backend : INSERT INTO post (...)
              ↓ (Publication PostgreSQL)
Supabase Realtime Server
              ↓ (WebSocket)
Frontend : Notification instantanée
              ↓
UI mise à jour automatiquement
```

**Use cases** :
- 💬 Nouvelle annonce apparaît sans refresh
- 📨 Message reçu → notification instantanée
- 📅 Événement ajouté → carte mise à jour en temps réel
- 📝 Article publié → liste actualisée

**Exemple code frontend** :
```typescript
const channel = supabase
  .channel('public:post')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'post' },
    (payload) => {
      console.log('Nouvelle annonce !', payload.new)
      // Ajouter à la liste sans recharger
    }
  )
  .subscribe()
```

### 📦 Storage (Buckets de fichiers)

#### Buckets créés
```sql
images-articles   → Photos des articles éditoriaux
images-annonces   → Photos des annonces (dons/recherche)
images-lieux      → Photos des lieux
```

#### Politiques de sécurité

**Lecture publique** (tout le monde) :
```sql
create policy "public read images"
  on storage.objects for select
  using (bucket_id in ('images-articles', ...));
```
- ✅ Pas besoin de compte pour voir les images
- ✅ Performances CDN optimales
- ✅ Partage facile (lien direct)

**Upload** (utilisateurs connectés) :
```sql
create policy "authenticated upload images"
  on storage.objects for insert
  with check (auth.role() = 'authenticated');
```
- ✅ Seuls les connectés peuvent uploader
- ✅ L'uploader devient `owner` automatiquement

**Modification/Suppression** (propriétaire uniquement) :
```sql
create policy "owner delete own images"
  on storage.objects for delete
  using (auth.uid() = owner);
```

**Modération** (admin/modérateur) :
```sql
create policy "moderator delete any image"
  on storage.objects for delete
  using (role in ('admin', 'moderator'));
```

### 🖼️ Workflow upload d'image

```
┌────────────────────────────────────────────────┐
│  1. Utilisateur sélectionne une photo          │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  2. Upload vers storage.objects                │
│     - bucket: 'images-annonces'                │
│     - owner: auth.uid()                        │
└─────────────────┬──────────────────────────────┘
                  ↓ RLS check
┌────────────────────────────────────────────────┐
│  3. Fichier stocké + URL publique générée      │
│     https://xyz.supabase.co/storage/v1/...     │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  4. URL enregistrée dans post.images[]         │
└────────────────────────────────────────────────┘
```

---

## 🎯 Récapitulatif des workflows

### Workflow complet : Création d'une annonce

```
1. Utilisateur inscrit (auth.users)
   ↓ TRIGGER
2. Profil créé (profiles)
   ↓
3. Utilisateur upload photo
   ↓ RLS check
4. Photo stockée (storage.objects)
   ↓
5. Utilisateur crée annonce avec URL photo
   ↓ RLS check (auth.uid() = author_id)
6. Annonce insérée (post)
   ↓ TRIGGER updated_at
7. updated_at = NOW()
   ↓ REALTIME
8. Tous les clients connectés reçoivent notification
   ↓
9. UI mise à jour automatiquement
```

### Workflow : Recherche de lieu

```
1. Utilisateur tape "compost" dans recherche
   ↓
2. Query SQL avec INDEX trigram
   ↓ 10-50ms (rapide !)
3. Résultats triés par similarité
   ↓ RLS check (status = 'published')
4. Seuls les lieux publiés retournés
   ↓
5. Affichage carte + liste
```

---

## 📊 Tableau récapitulatif

| Fichier | Rôle | Dépendances | Critique |
|---------|------|-------------|----------|
| 010_extensions.sql | Active PostGIS + Trigram | - | ⚠️ Obligatoire |
| 020_indexes.sql | Performance | Extensions, Tables | ⭐ Recommandé |
| 030_rls_policies.sql | Sécurité | Tables | 🔒 Obligatoire |
| 040_triggers.sql | Automatisation | Tables | ⭐ Recommandé |
| 050_realtime_storage.sql | Temps réel + Fichiers | Tables | 🎨 Optionnel |

---

## ⚡ Ordre d'exécution (résumé)

```bash
# 1. Extensions (prérequis)
psql -f drizzle/010_extensions.sql

# 2. Créer les tables avec Drizzle
npx drizzle-kit push

# 3. Index de performance
psql -f drizzle/020_indexes.sql

# 4. Sécurité RLS
psql -f drizzle/030_rls_policies.sql

# 5. Automatisation
psql -f drizzle/040_triggers.sql

# 6. Fonctionnalités avancées (optionnel)
psql -f drizzle/050_realtime_storage.sql
```

---

## 🐛 Troubleshooting

### Extension PostGIS non disponible
```sql
-- Vérifier les extensions disponibles
SELECT * FROM pg_available_extensions WHERE name LIKE 'postgis';

-- Si absent, installer sur le serveur (droits superuser requis)
```

### Policies qui bloquent tout
```sql
-- Désactiver temporairement RLS pour tester
ALTER TABLE article DISABLE ROW LEVEL SECURITY;

-- Tester la requête
SELECT * FROM article;

-- Réactiver
ALTER TABLE article ENABLE ROW LEVEL SECURITY;
```

### Trigger qui ne se déclenche pas
```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Vérifier les logs PostgreSQL
```

### Performances dégradées
```sql
-- Analyser une requête
EXPLAIN ANALYZE SELECT * FROM place WHERE name ILIKE '%compost%';

-- Vérifier que les index sont utilisés
-- Chercher "Index Scan" ou "Bitmap Index Scan" dans le résultat
```

---

## 📚 Pour aller plus loin

- [Documentation PostGIS](https://postgis.net/documentation/)
- [PostgreSQL Trigram](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## ✅ Checklist de déploiement

- [ ] Extensions activées (PostGIS, pg_trgm)
- [ ] Tables créées via Drizzle
- [ ] Index créés et validés
- [ ] RLS activé sur toutes les tables
- [ ] Policies testées (anonyme, user, admin)
- [ ] Triggers fonctionnels (test inscription)
- [ ] Buckets storage créés
- [ ] Realtime testé (WebSocket connecté)
- [ ] Tests de performance (requêtes <100ms)
- [ ] Documentation équipe à jour