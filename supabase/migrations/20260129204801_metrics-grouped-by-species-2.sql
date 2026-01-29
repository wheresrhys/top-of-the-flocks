-- Update top_periods_by_metric function to use normalized schema with ID-based joins
CREATE TABLE IF NOT EXISTS top_species_result (
  species_name TEXT,
  visit_date DATE,
  metric_value BIGINT
);

-- Drop the function first to allow changing return type
DROP FUNCTION IF EXISTS top_species_by_metric(TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT[]);

CREATE OR REPLACE FUNCTION top_species_by_metric(
  temporal_unit TEXT DEFAULT 'day',
  metric_name TEXT DEFAULT 'encounters',
  result_limit INTEGER DEFAULT 5,
  month_filter INTEGER DEFAULT NULL,
  year_filter INTEGER DEFAULT NULL,
  exact_months_filter TEXT[] DEFAULT NULL,
  months_filter INTEGER[] DEFAULT NULL
)
RETURNS SETOF top_species_result
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc(temporal_unit, sess.visit_date)::DATE AS visit_date,
    sp.species_name as species_name,
    CASE
      WHEN metric_name = 'encounters' THEN count(e.*)
      WHEN metric_name = 'individuals' THEN count(DISTINCT b.ring_no)
      WHEN metric_name = 'species' THEN count(DISTINCT sp.species_name)
      ELSE count(e.*)
    END::BIGINT AS metric_value
  FROM
    "Birds" b
    LEFT JOIN "Encounters" e ON b.id = e.bird_id
    LEFT JOIN "Sessions" sess ON e.session_id = sess.id
    LEFT JOIN "Species" sp ON b.species_id = sp.id
  WHERE
    sess.visit_date IS NOT NULL
    AND (month_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = month_filter)
    AND (year_filter IS NULL OR EXTRACT(YEAR FROM sess.visit_date) = year_filter)
    AND (exact_months_filter IS NULL OR TO_CHAR(sess.visit_date, 'YYYY-MM') = ANY(exact_months_filter))
    AND (months_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = ANY(months_filter))
  GROUP BY
    species_name,
    visit_date
  ORDER BY
    metric_value DESC
  LIMIT result_limit;
END;
$$;
