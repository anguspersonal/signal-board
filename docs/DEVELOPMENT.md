# Development Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses the following Supabase tables:

### startups
```sql
CREATE TABLE startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  tags text[],
  logo_url text,
  visibility text NOT NULL DEFAULT 'invite-only',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
```

### startup_ratings
```sql
CREATE TABLE startup_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  startup_id uuid NOT NULL REFERENCES startups(id),
  dimension text NOT NULL,
  score int NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE startup_ratings ENABLE ROW LEVEL SECURITY;
```

### startup_engagements
```sql
CREATE TABLE startup_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  startup_id uuid NOT NULL REFERENCES startups(id),
  type text NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE startup_engagements ENABLE ROW LEVEL SECURITY;
```

### follows
```sql
CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id),
  followee_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
```

### startup_access
```sql
CREATE TABLE startup_access (
  startup_id uuid REFERENCES startups(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('viewer','commenter','editor')),
  PRIMARY KEY (startup_id, user_id)
);
ALTER TABLE startup_access ENABLE ROW LEVEL SECURITY;
```

## Row Level Security (RLS) Policies

The following RLS policies have been applied to ensure data security:

```sql
-- Startups RLS
CREATE POLICY startups_select ON startups
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY startups_insert ON startups
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY startups_update ON startups
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY startups_delete ON startups
  FOR DELETE USING (user_id = auth.uid());

-- Startup ratings RLS
CREATE POLICY ratings_user ON startup_ratings
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM startups s 
      WHERE s.id = startup_ratings.startup_id 
      AND s.user_id = auth.uid()
    )
  );

-- Startup engagements RLS
CREATE POLICY engagements_user ON startup_engagements
  FOR ALL USING (user_id = auth.uid());

-- Follows RLS
CREATE POLICY follows_user ON follows
  FOR ALL USING (follower_id = auth.uid());

-- Startup access RLS
CREATE POLICY access_select ON startup_access
  FOR SELECT USING (true);
-- Use this in startups RLS to allow shared viewers:
-- e.g., USING (user_id = auth.uid() OR EXISTS (SELECT 1...access.user_id=auth.uid()))
```

## Running the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/startups` to see the startups page. 