CREATE TABLE IF NOT EXISTS top_periods_result (
  visit_date DATE,
  metric_value BIGINT
);

-- Drop the function first to allow changing return type
DROP FUNCTION IF EXISTS top_periods_by_metric(TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION top_periods_by_metric(
  temporal_unit TEXT DEFAULT 'day',
  metric_name TEXT DEFAULT 'encounters',
  result_limit INTEGER DEFAULT 5
)
RETURNS SETOF top_periods_result
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc(temporal_unit, e.visit_date)::DATE AS visit_date,
    CASE
      WHEN metric_name = 'encounters' THEN count(e.*)
      WHEN metric_name = 'individuals' THEN count(DISTINCT e.ring_no)
      WHEN metric_name = 'species' THEN count(DISTINCT b.species_name)
      ELSE count(e.*)
    END::BIGINT AS metric_value
  FROM
    "Birds" b
    LEFT JOIN "Encounters" e ON b.ring_no = e.ring_no
  WHERE
    e.visit_date IS NOT NULL
  GROUP BY
    date_trunc(temporal_unit, e.visit_date)
  ORDER BY
    metric_value DESC
  LIMIT result_limit;
END;
$$;
