CREATE OR REPLACE FUNCTION most_caught_birds(
  result_limit integer DEFAULT 5,
  species_filter TEXT DEFAULT NULL,
  year_filter integer DEFAULT NULL
) RETURNS TABLE (
  species_name TEXT,
  ring_no TEXT,
  encounters BIGINT
)
LANGUAGE "plpgsql" STABLE
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.species_name as species_name,
    b.ring_no as ring_no,
    count(en.*) as encounters
  FROM public."Encounters" en
    LEFT JOIN public."Birds" b on  b.id=en.bird_id
    LEFT JOIN public."Species" sp on sp.id=b.species_id
    LEFT JOIN public."Sessions" sess on sess.id=en.session_id
  WHERE
    (species_filter IS NULL OR sp.species_name ilike species_filter) AND
    (year_filter IS NULL OR EXTRACT(YEAR FROM sess.visit_date) = year_filter)
  GROUP BY
    sp.species_name,
    b.ring_no
  ORDER BY
    encounters DESC
  LIMIT result_limit;
END;
$$;
