-- Remove denormalized columns after views and functions have been updated
-- This migration runs after view/function updates, so dependencies are resolved

-- Drop species_name from Birds (view now uses Species.species_name via join)
ALTER TABLE "Birds" DROP COLUMN IF EXISTS species_name;

-- Drop ring_no from Encounters (function/view now use bird_id)
ALTER TABLE "Encounters" DROP COLUMN IF EXISTS ring_no;

-- Drop visit_date from Encounters (function/view now use session_id)
ALTER TABLE "Encounters" DROP COLUMN IF EXISTS visit_date;
