CREATE OR REPLACE FUNCTION top_sessions_by_metric(
  sort_by TEXT DEFAULT 'encounters',
  result_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  visit_date DATE,
  metric_value BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.visit_date,
    CASE
      WHEN sort_by = 'encounters' THEN count(e.*)
      WHEN sort_by = 'individuals' THEN count(DISTINCT e.ring_no)
      WHEN sort_by = 'species' THEN count(DISTINCT b.species_name)
      ELSE count(e.*)
    END::BIGINT AS metric_value
  FROM
    "Birds" b
    LEFT JOIN "Encounters" e ON b.ring_no = e.ring_no
  WHERE
    e.visit_date IS NOT NULL
  GROUP BY
    e.visit_date
  ORDER BY
    metric_value DESC
  LIMIT result_limit;
END;
$$;
