-- Add two new number columns to encounters table
ALTER TABLE "Encounters"
  ADD COLUMN ageCode smallint,
  ADD COLUMN minimumYears smallint;

-- Copy values from age to ageCode
UPDATE "Encounters"
SET ageCode = age;

-- Calculate minimumYears using the formula: Math.max(0, Math.floor((ageCode/2) -1))
UPDATE "Encounters"
SET minimumYears = GREATEST(0, FLOOR((ageCode / 2) - 1));

-- Drop the age column
ALTER TABLE "Encounters"
  DROP COLUMN age;
