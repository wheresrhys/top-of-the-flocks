DROP VIEW IF EXISTS "public"."SpeciesStats";
CREATE OR REPLACE VIEW "public"."SpeciesStats"
WITH ("security_invoker"='true') AS

WITH species_encounters AS (
  -- Pre-aggregate all encounter data per species
  SELECT
    sp.id AS species_id,
    sp.species_name,
    b.id AS bird_id,
    b.ring_no,
    e.id AS encounter_id,
    e.weight,
    e.wing_length,
    sess.id AS session_id,
    sess.visit_date,
    e.minimum_years
  FROM public."Species" sp
  JOIN public."Birds" b ON sp.id = b.species_id
  LEFT JOIN public."Encounters" e ON b.id = e.bird_id
  LEFT JOIN public."Sessions" sess ON e.session_id = sess.id
),
bird_stats AS (
  -- Calculate per-bird statistics once
  SELECT
    species_id,
    bird_id,
    COUNT(*) AS encounter_count,
    MIN(visit_date) AS first_visit,
    MAX(visit_date) AS last_visit,
    MIN(minimum_years) AS min_years_at_first,
    EXTRACT(EPOCH FROM (MAX(visit_date)::timestamp - MIN(visit_date)::timestamp)) / 86400.0 AS time_span_days
  FROM species_encounters
  WHERE encounter_id IS NOT NULL
  GROUP BY species_id, bird_id
),
species_bird_aggregates AS (
  -- Aggregate bird-level stats to species level
  SELECT
    species_id,
    MAX(encounter_count) AS max_encounter_count,
    MAX(time_span_days) AS max_time_span,
    MAX(
      min_years_at_first +
      EXTRACT(YEAR FROM last_visit) -
      EXTRACT(YEAR FROM first_visit)
    ) AS max_proven_age
  FROM bird_stats
  GROUP BY species_id
),
session_counts AS (
  -- Count encounters per session per species
  SELECT
    species_id,
    session_id,
    COUNT(*) AS encounter_count
  FROM species_encounters
  WHERE session_id IS NOT NULL
  GROUP BY species_id, session_id
),
species_session_max AS (
  -- Get max encounters per session per species
  SELECT
    species_id,
    MAX(encounter_count) AS max_per_session
  FROM session_counts
  GROUP BY species_id
)
SELECT
  se.species_name,
  COUNT(DISTINCT se.bird_id) AS "bird_count",
  COUNT(se.encounter_id) AS "encounter_count",
  COUNT(DISTINCT se.visit_date) AS "session_count",
  MAX(se.weight) AS "max_weight",
  ROUND(AVG(se.weight)::numeric, 1) AS "avg_weight",
  MIN(se.weight) AS "min_weight",
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY se.wing_length) AS "median_weight",
  MAX(se.wing_length) AS "max_wing",
  ROUND(AVG(se.wing_length)::numeric, 1) AS "avg_wing",
  MIN(se.wing_length) AS "min_wing",
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY se.wing_length) AS "median_wing",
  sba.max_encounter_count AS "max_encountered_bird",
  ROUND(
    100 * COUNT(DISTINCT CASE WHEN bs.encounter_count > 1 THEN se.bird_id END)::numeric /
    NULLIF(COUNT(DISTINCT se.bird_id), 0)::numeric,
    0
  ) AS "pct_retrapped",
  ROUND(sba.max_time_span, 0) AS "max_time_span",
  ssm.max_per_session AS "max_per_session",
  sba.max_proven_age AS "max_proven_age"
FROM species_encounters se
LEFT JOIN bird_stats bs ON se.bird_id = bs.bird_id
LEFT JOIN species_bird_aggregates sba ON se.species_id = sba.species_id
LEFT JOIN species_session_max ssm ON se.species_id = ssm.species_id
GROUP BY se.species_name, sba.max_encounter_count, sba.max_time_span, ssm.max_per_session, sba.max_proven_age;

ALTER VIEW "public"."SpeciesStats" OWNER TO "postgres";
