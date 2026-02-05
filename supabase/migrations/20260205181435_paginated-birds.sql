DROP FUNCTION IF EXISTS paginated_birds_table;
CREATE OR REPLACE FUNCTION paginated_birds_table(
  species_name_param TEXT,
  result_limit INTEGER,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  encounter_id BIGINT,
  session_id BIGINT,
  bird_id BIGINT,
  visit_date DATE,
  capture_time TIME,
  ring_no TEXT,
  age_code INT2,
  is_juv BOOLEAN,
  minimum_years INT2,
  record_type TEXT,
  sex TEXT,
  weight REAL,
  wing_length INT2
) AS $$
BEGIN
  RETURN QUERY
 WITH bird_first_encounters AS (
    -- Get the most recent encounter for each bird
    SELECT DISTINCT ON (b.id)
      b.id,
      ss.visit_date as visit_date,
      e.capture_time as capture_time
    FROM "Species" sp
    LEFT JOIN "Birds" b ON b.species_id = sp.id
    LEFT JOIN "Encounters" e ON b.id = e.bird_id
    LEFT JOIN "Sessions" ss ON ss.id = e.session_id
    WHERE sp.species_name = species_name_param
    ORDER BY
      b.id,
      ss.visit_date DESC,
      e.capture_time DESC
  ),
  top_birds AS (
    -- Select distinct bird IDs based on their most recent encounter
    SELECT id
    FROM bird_first_encounters
    ORDER BY bird_first_encounters.visit_date DESC, bird_first_encounters.capture_time DESC
    LIMIT result_limit
    OFFSET result_offset
  )
  -- Return ALL encounters for those birds
  SELECT
    e.id as encounter_id,
    ss.id as session_id,
    b.id as bird_id,
    ss.visit_date,
    e.capture_time,
    b.ring_no,
    e.age_code,
    e.is_juv,
    e.minimum_years,
    e.record_type,
    e.sex,
    e.weight,
    e.wing_length
  FROM top_birds tb
  JOIN "Birds" b ON b.id = tb.id
  LEFT JOIN "Encounters" e ON b.id = e.bird_id
  LEFT JOIN "Sessions" ss ON ss.id = e.session_id
  ORDER BY
    ss.visit_date DESC,
    e.capture_time DESC;
END;
$$ LANGUAGE plpgsql;
