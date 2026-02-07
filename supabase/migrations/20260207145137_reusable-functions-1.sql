-- Create composite type for filter parameters
CREATE TYPE top_metrics_filter_params AS (
	month_filter integer,
	year_filter integer,
	exact_months_filter TEXT[],
	months_filter INTEGER[],
	species_filter text
);

DROP FUNCTION IF EXISTS "public"."metrics_by_period_and_species";

CREATE OR REPLACE FUNCTION "public"."metrics_by_period_and_species" (
	"temporal_unit" text,
	"metric_name" text,
	"filters" top_metrics_filter_params DEFAULT NULL
) RETURNS TABLE (
	"species_name" text,
	"visit_date" date,
	"metric_value" bigint
) LANGUAGE "plpgsql" STABLE
SET
	"search_path" TO 'public',
	'pg_catalog' AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.species_name as species_name,
    date_trunc(temporal_unit, sess.visit_date)::DATE AS visit_date,
    CASE
      WHEN metric_name = 'encounters' THEN count(e.*)
      WHEN metric_name = 'individuals' THEN count(DISTINCT b.ring_no)
      ELSE count(e.*)
    END::BIGINT AS metric_value
  FROM
    public."Birds" b
    LEFT JOIN public."Encounters" e ON b.id = e.bird_id
    LEFT JOIN public."Sessions" sess ON e.session_id = sess.id
    LEFT JOIN public."Species" sp ON b.species_id = sp.id
  WHERE
    sess.visit_date IS NOT NULL
    AND (filters IS NULL OR filters.month_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = filters.month_filter)
    AND (filters IS NULL OR filters.year_filter IS NULL OR EXTRACT(YEAR FROM sess.visit_date) = filters.year_filter)
    AND (filters IS NULL OR filters.exact_months_filter IS NULL OR TO_CHAR(sess.visit_date, 'YYYY-MM') = ANY(filters.exact_months_filter))
    AND (filters IS NULL OR filters.months_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = ANY(filters.months_filter))
    AND (filters IS NULL OR filters.species_filter IS NULL OR sp.species_name = filters.species_filter)
  GROUP BY
    date_trunc(temporal_unit, sess.visit_date), sp.species_name;
END;
$$;

ALTER FUNCTION "public"."metrics_by_period_and_species" (
	"temporal_unit" text,
	"metric_name" text,
	"filters" top_metrics_filter_params
) OWNER TO "postgres";

DROP FUNCTION IF EXISTS "public"."top_metrics_by_period";

CREATE OR REPLACE FUNCTION "public"."top_metrics_by_period" (
	"temporal_unit" text,
	"metric_name" text,
	"result_limit" integer,
	"filters" top_metrics_filter_params DEFAULT NULL
) RETURNS TABLE ("visit_date" date, "metric_value" bigint) LANGUAGE "plpgsql" STABLE
SET
	"search_path" TO 'public',
	'pg_catalog' AS $$
BEGIN
  RETURN QUERY
  WITH by_period_and_species AS (
    SELECT * from metrics_by_period_and_species(
      temporal_unit=>temporal_unit,
      metric_name=>metric_name,
      filters=>filters
    )
  )
  SELECT
    "by_period_and_species"."visit_date",
    SUM("by_period_and_species"."metric_value")::bigint AS metric_value
  FROM
    by_period_and_species
  GROUP BY
    "by_period_and_species"."visit_date"
  ORDER BY
    SUM("by_period_and_species"."metric_value") DESC
  LIMIT result_limit;
END;
$$;

ALTER FUNCTION "public"."top_metrics_by_period" (
	"temporal_unit" text,
	"metric_name" text,
	"result_limit" integer,
	"filters" top_metrics_filter_params
) OWNER TO "postgres";

DROP FUNCTION IF EXISTS "public"."top_metrics_by_species_and_period";

CREATE OR REPLACE FUNCTION "public"."top_metrics_by_species_and_period" (
	"temporal_unit" text,
	"metric_name" text,
	"result_limit" integer,
	"filters" top_metrics_filter_params DEFAULT NULL
) RETURNS TABLE (
	"species_name" text,
	"visit_date" date,
	"metric_value" bigint
) LANGUAGE "plpgsql" STABLE
SET
	"search_path" TO 'public',
	'pg_catalog' AS $$
BEGIN
  RETURN QUERY
  WITH by_period_and_species AS (
    SELECT * from metrics_by_period_and_species(
      temporal_unit=>temporal_unit,
      metric_name=>metric_name,
      filters=>filters
    )
  )
  SELECT
    "by_period_and_species"."species_name",
    "by_period_and_species"."visit_date",
    "by_period_and_species"."metric_value"
  FROM
    by_period_and_species
  ORDER BY
    "by_period_and_species"."metric_value" DESC
  LIMIT result_limit;
END;
$$;

ALTER FUNCTION "public"."top_metrics_by_species_and_period" (
	"temporal_unit" text,
	"metric_name" text,
	"result_limit" integer,
	"filters" top_metrics_filter_params
) OWNER TO "postgres";
