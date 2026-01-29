-- Add two new number columns to encounters table
ALTER TABLE "Encounters"
ADD COLUMN age_code smallint,
ADD COLUMN minimum_years smallint;

-- Copy values from age to ageCode
UPDATE "Encounters"
SET age_code = ageCode,
    minimum_years = minimumYears;

-- Drop the age column
ALTER TABLE "Encounters"
  DROP COLUMN ageCode,
  DROP COLUMN minimumYears;
