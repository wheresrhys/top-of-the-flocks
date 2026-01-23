-- Step 1: Drop foreign key constraints that depend on primary keys (in reverse dependency order)
-- Drop Encounters FK first (depends on Birds_pkey)
ALTER TABLE "Encounters" DROP CONSTRAINT IF EXISTS "Encounters_ring_no_fkey";
-- Drop Birds FK (depends on Species_pkey)
ALTER TABLE "Birds" DROP CONSTRAINT IF EXISTS "Birds_species_name_fkey";

-- Step 2: Drop existing primary key constraints (now safe since FKs are dropped)
ALTER TABLE "Encounters" DROP CONSTRAINT IF EXISTS "Encounters_pkey";
ALTER TABLE "Birds" DROP CONSTRAINT IF EXISTS "Birds_pkey";
ALTER TABLE "Species" DROP CONSTRAINT IF EXISTS "Species_pkey";

-- Step 3: Add new ID columns and primary keys
ALTER TABLE "Species" ADD COLUMN id BIGSERIAL;
ALTER TABLE "Species" ADD PRIMARY KEY (id);
ALTER TABLE "Species" ADD CONSTRAINT species_species_name_unique UNIQUE (species_name);

ALTER TABLE "Birds" ADD COLUMN id BIGSERIAL;
ALTER TABLE "Birds" ADD COLUMN species_id BIGINT;
ALTER TABLE "Birds" ADD PRIMARY KEY (id);
UPDATE "Birds" SET species_id = (SELECT id FROM "Species" WHERE "Species".species_name = "Birds".species_name);
ALTER TABLE "Birds" ALTER COLUMN species_id SET NOT NULL;
ALTER TABLE "Birds" ADD CONSTRAINT birds_species_id_fkey FOREIGN KEY (species_id) REFERENCES "Species"(id);
ALTER TABLE "Birds" ADD CONSTRAINT birds_ring_no_unique UNIQUE (ring_no);
CREATE INDEX idx_birds_species_id ON "Birds"(species_id);

ALTER TABLE "Encounters" ADD COLUMN id BIGSERIAL;
ALTER TABLE "Encounters" ADD COLUMN bird_id BIGINT;
ALTER TABLE "Encounters" ADD PRIMARY KEY (id);
UPDATE "Encounters" SET bird_id = (SELECT id FROM "Birds" WHERE "Birds".ring_no = "Encounters".ring_no);
ALTER TABLE "Encounters" ALTER COLUMN bird_id SET NOT NULL;
ALTER TABLE "Encounters" ADD CONSTRAINT encounters_bird_id_fkey FOREIGN KEY (bird_id) REFERENCES "Birds"(id);
CREATE INDEX idx_encounters_bird_id ON "Encounters"(bird_id);

-- Create Sessions table
CREATE TABLE "Sessions" (
  id BIGSERIAL PRIMARY KEY,
  visit_date DATE NOT NULL UNIQUE
);

-- Add session_id to Encounters
ALTER TABLE "Encounters" ADD COLUMN session_id BIGINT;

-- Create sessions from unique visit dates
INSERT INTO "Sessions" (visit_date)
SELECT DISTINCT visit_date FROM "Encounters"
ON CONFLICT (visit_date) DO NOTHING;

-- Populate session_id in Encounters based on visit_date
UPDATE "Encounters" SET session_id = (SELECT id FROM "Sessions" WHERE "Sessions".visit_date = "Encounters".visit_date);

-- Make session_id NOT NULL and add foreign key constraint
ALTER TABLE "Encounters" ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE "Encounters" ADD CONSTRAINT encounters_session_id_fkey FOREIGN KEY (session_id) REFERENCES "Sessions"(id);
ALTER TABLE "Encounters" ADD CONSTRAINT encounters_bird_id_session_id_unique UNIQUE (bird_id, session_id);
CREATE INDEX idx_encounters_session_id ON "Encounters"(session_id);
