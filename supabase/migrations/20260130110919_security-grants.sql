ALTER TABLE public."Sessions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Birds" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Encounters" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Species" DISABLE ROW LEVEL SECURITY;


-- Grant SELECT on all tables to all users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant SELECT on all views to all users (views are included in TABLES, but being explicit)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant EXECUTE on all functions to all users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Set default privileges for future tables and views
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

-- Set default privileges for future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
