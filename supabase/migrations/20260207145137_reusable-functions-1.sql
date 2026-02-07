


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS '@graphql({"inflect_names": true})';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."top_metrics_filter_params" AS (
	"month_filter" integer,
	"year_filter" integer,
	"exact_months_filter" "text"[],
	"months_filter" integer[],
	"species_filter" "text"
);


ALTER TYPE "public"."top_metrics_filter_params" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."metrics_by_period_and_species"("temporal_unit" "text", "metric_name" "text", "filters" "public"."top_metrics_filter_params" DEFAULT NULL::"public"."top_metrics_filter_params") RETURNS TABLE("species_name" "text", "visit_date" "date", "metric_value" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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


ALTER FUNCTION "public"."metrics_by_period_and_species"("temporal_unit" "text", "metric_name" "text", "filters" "public"."top_metrics_filter_params") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."most_caught_birds"("result_limit" integer DEFAULT 5, "species_filter" "text" DEFAULT NULL::"text", "year_filter" integer DEFAULT NULL::integer) RETURNS TABLE("species_name" "text", "ring_no" "text", "encounters" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
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


ALTER FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."paginated_birds_table"("species_name_param" "text", "result_limit" integer, "result_offset" integer DEFAULT 0) RETURNS TABLE("encounter_id" bigint, "session_id" bigint, "bird_id" bigint, "visit_date" "date", "capture_time" time without time zone, "ring_no" "text", "age_code" smallint, "is_juv" boolean, "minimum_years" smallint, "record_type" "text", "sex" "text", "weight" real, "wing_length" smallint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
 WITH bird_last_encounters AS (
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
    FROM bird_last_encounters
    ORDER BY
      bird_last_encounters.visit_date DESC,
      bird_last_encounters.capture_time DESC,
      bird_last_encounters.id ASC
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
$$;


ALTER FUNCTION "public"."paginated_birds_table"("species_name_param" "text", "result_limit" integer, "result_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."species_stats"("species_name_filter" "text" DEFAULT NULL::"text", "from_date" "date" DEFAULT NULL::"date", "to_date" "date" DEFAULT NULL::"date") RETURNS TABLE("species_name" "text", "bird_count" bigint, "encounter_count" bigint, "session_count" bigint, "max_weight" real, "avg_weight" numeric, "min_weight" real, "median_weight" numeric, "max_wing" smallint, "avg_wing" numeric, "min_wing" smallint, "median_wing" numeric, "max_encountered_bird" bigint, "pct_retrapped" numeric, "max_time_span" numeric, "max_per_session" bigint, "max_proven_age" numeric)
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
  RETURN QUERY
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
    WHERE (from_date IS NULL OR sess.visit_date >=from_date)
     AND (to_date IS NULL OR sess.visit_date<=to_date)
     AND (species_name_filter IS NULL OR sp.species_name = species_name_filter)
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
      MAX(bird_stats.encounter_count) AS max_encounter_count,
      MAX(bird_stats.time_span_days) AS max_time_span,
      MAX(
        bird_stats.min_years_at_first +
        EXTRACT(YEAR FROM bird_stats.last_visit) -
        EXTRACT(YEAR FROM bird_stats.first_visit)
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
      MAX(session_counts.encounter_count) AS max_per_session
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
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY se.weight)::numeric, 1) AS "median_weight",
    MAX(se.wing_length) AS "max_wing",
    ROUND(AVG(se.wing_length)::numeric, 1) AS "avg_wing",
    MIN(se.wing_length) AS "min_wing",
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY se.wing_length)::numeric, 0) AS "median_wing",
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

END;
$$;


ALTER FUNCTION "public"."species_stats"("species_name_filter" "text", "from_date" "date", "to_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."top_metrics_by_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params" DEFAULT NULL::"public"."top_metrics_filter_params") RETURNS TABLE("visit_date" "date", "metric_value" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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


ALTER FUNCTION "public"."top_metrics_by_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."top_metrics_by_species_and_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params" DEFAULT NULL::"public"."top_metrics_filter_params") RETURNS TABLE("species_name" "text", "visit_date" "date", "metric_value" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
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


ALTER FUNCTION "public"."top_metrics_by_species_and_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer DEFAULT NULL::integer, "year_filter" integer DEFAULT NULL::integer, "exact_months_filter" "text"[] DEFAULT NULL::"text"[], "months_filter" integer[] DEFAULT NULL::integer[], "species_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("visit_date" "date", "metric_value" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc(temporal_unit, sess.visit_date)::DATE AS visit_date,
    CASE
      WHEN metric_name = 'encounters' THEN count(e.*)
      WHEN metric_name = 'individuals' THEN count(DISTINCT b.ring_no)
      WHEN metric_name = 'species' THEN count(DISTINCT sp.species_name)
      ELSE count(e.*)
    END::BIGINT AS metric_value
  FROM
    public."Birds" b
    LEFT JOIN public."Encounters" e ON b.id = e.bird_id
    LEFT JOIN public."Sessions" sess ON e.session_id = sess.id
    LEFT JOIN public."Species" sp ON b.species_id = sp.id
  WHERE
    sess.visit_date IS NOT NULL
    AND (month_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = month_filter)
    AND (year_filter IS NULL OR EXTRACT(YEAR FROM sess.visit_date) = year_filter)
    AND (exact_months_filter IS NULL OR TO_CHAR(sess.visit_date, 'YYYY-MM') = ANY(exact_months_filter))
    AND (months_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = ANY(months_filter))
    AND (species_filter IS NULL OR sp.species_name = species_filter)
  GROUP BY
    date_trunc(temporal_unit, sess.visit_date)
  ORDER BY
    metric_value DESC
  LIMIT result_limit;
END;
$$;


ALTER FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[], "species_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."top_species_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer DEFAULT NULL::integer, "year_filter" integer DEFAULT NULL::integer, "exact_months_filter" "text"[] DEFAULT NULL::"text"[], "months_filter" integer[] DEFAULT NULL::integer[]) RETURNS TABLE("species_name" "text", "visit_date" "date", "metric_value" bigint)
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.species_name as species_name,
    date_trunc(temporal_unit, sess.visit_date)::DATE AS visit_date,
    CASE
      WHEN metric_name = 'encounters' THEN count(e.*)
      WHEN metric_name = 'individuals' THEN count(DISTINCT b.ring_no)
      WHEN metric_name = 'species' THEN count(DISTINCT sp.species_name)
      ELSE count(e.*)
    END::BIGINT AS metric_value
  FROM
    public."Birds" b
    LEFT JOIN public."Encounters" e ON b.id = e.bird_id
    LEFT JOIN public."Sessions" sess ON e.session_id = sess.id
    LEFT JOIN public."Species" sp ON b.species_id = sp.id
  WHERE
    sess.visit_date IS NOT NULL
    AND (month_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = month_filter)
    AND (year_filter IS NULL OR EXTRACT(YEAR FROM sess.visit_date) = year_filter)
    AND (exact_months_filter IS NULL OR TO_CHAR(sess.visit_date, 'YYYY-MM') = ANY(exact_months_filter))
    AND (months_filter IS NULL OR EXTRACT(MONTH FROM sess.visit_date) = ANY(months_filter))
  GROUP BY
    sp.species_name,
    date_trunc(temporal_unit, sess.visit_date)
  ORDER BY
    metric_value DESC
  LIMIT result_limit;
END;
$$;


ALTER FUNCTION "public"."top_species_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Birds" (
    "ring_no" "text" NOT NULL,
    "id" bigint NOT NULL,
    "species_id" bigint NOT NULL
);


ALTER TABLE "public"."Birds" OWNER TO "postgres";


COMMENT ON TABLE "public"."Birds" IS '@graphql({"aggregate": {"enabled": true}})';



CREATE SEQUENCE IF NOT EXISTS "public"."Birds_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."Birds_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."Birds_id_seq" OWNED BY "public"."Birds"."id";



CREATE TABLE IF NOT EXISTS "public"."Encounters" (
    "capture_time" time without time zone NOT NULL,
    "record_type" "text" NOT NULL,
    "scheme" "text" NOT NULL,
    "sex" "text" NOT NULL,
    "sexing_method" "text",
    "breeding_condition" "text",
    "wing_length" smallint,
    "weight" real,
    "moult_code" "text",
    "old_greater_coverts" smallint,
    "extra_text" "text",
    "is_juv" boolean DEFAULT false NOT NULL,
    "id" bigint NOT NULL,
    "bird_id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "age_code" smallint NOT NULL,
    "minimum_years" smallint NOT NULL
);


ALTER TABLE "public"."Encounters" OWNER TO "postgres";


COMMENT ON TABLE "public"."Encounters" IS 'Encounters with individual birds';



CREATE SEQUENCE IF NOT EXISTS "public"."Encounters_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."Encounters_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."Encounters_id_seq" OWNED BY "public"."Encounters"."id";



CREATE TABLE IF NOT EXISTS "public"."Sessions" (
    "id" bigint NOT NULL,
    "visit_date" "date" NOT NULL
);


ALTER TABLE "public"."Sessions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."Sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."Sessions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."Sessions_id_seq" OWNED BY "public"."Sessions"."id";



CREATE TABLE IF NOT EXISTS "public"."Species" (
    "species_name" "text" NOT NULL,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."Species" OWNER TO "postgres";


COMMENT ON TABLE "public"."Species" IS 'Bird Species';



CREATE SEQUENCE IF NOT EXISTS "public"."Species_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."Species_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."Species_id_seq" OWNED BY "public"."Species"."id";



ALTER TABLE ONLY "public"."Birds" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Birds_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Encounters" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Encounters_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Sessions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Sessions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Species" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Species_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Birds"
    ADD CONSTRAINT "Birds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Encounters"
    ADD CONSTRAINT "Encounters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Sessions"
    ADD CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Sessions"
    ADD CONSTRAINT "Sessions_visit_date_key" UNIQUE ("visit_date");



ALTER TABLE ONLY "public"."Species"
    ADD CONSTRAINT "Species_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Birds"
    ADD CONSTRAINT "birds_ring_no_unique" UNIQUE ("ring_no");



ALTER TABLE ONLY "public"."Encounters"
    ADD CONSTRAINT "encounters_bird_id_session_id_unique" UNIQUE ("bird_id", "session_id");



ALTER TABLE ONLY "public"."Species"
    ADD CONSTRAINT "species_species_name_unique" UNIQUE ("species_name");



CREATE INDEX "idx_birds_species_id" ON "public"."Birds" USING "btree" ("species_id");



CREATE INDEX "idx_encounters_bird_id" ON "public"."Encounters" USING "btree" ("bird_id");



CREATE INDEX "idx_encounters_session_id" ON "public"."Encounters" USING "btree" ("session_id");



ALTER TABLE ONLY "public"."Birds"
    ADD CONSTRAINT "birds_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "public"."Species"("id");



ALTER TABLE ONLY "public"."Encounters"
    ADD CONSTRAINT "encounters_bird_id_fkey" FOREIGN KEY ("bird_id") REFERENCES "public"."Birds"("id");



ALTER TABLE ONLY "public"."Encounters"
    ADD CONSTRAINT "encounters_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."Sessions"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."metrics_by_period_and_species"("temporal_unit" "text", "metric_name" "text", "filters" "public"."top_metrics_filter_params") TO "anon";
GRANT ALL ON FUNCTION "public"."metrics_by_period_and_species"("temporal_unit" "text", "metric_name" "text", "filters" "public"."top_metrics_filter_params") TO "authenticated";
GRANT ALL ON FUNCTION "public"."metrics_by_period_and_species"("temporal_unit" "text", "metric_name" "text", "filters" "public"."top_metrics_filter_params") TO "service_role";



GRANT ALL ON FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."paginated_birds_table"("species_name_param" "text", "result_limit" integer, "result_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."paginated_birds_table"("species_name_param" "text", "result_limit" integer, "result_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."paginated_birds_table"("species_name_param" "text", "result_limit" integer, "result_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."species_stats"("species_name_filter" "text", "from_date" "date", "to_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."species_stats"("species_name_filter" "text", "from_date" "date", "to_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."species_stats"("species_name_filter" "text", "from_date" "date", "to_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."top_metrics_by_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") TO "anon";
GRANT ALL ON FUNCTION "public"."top_metrics_by_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") TO "authenticated";
GRANT ALL ON FUNCTION "public"."top_metrics_by_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") TO "service_role";



GRANT ALL ON FUNCTION "public"."top_metrics_by_species_and_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") TO "anon";
GRANT ALL ON FUNCTION "public"."top_metrics_by_species_and_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") TO "authenticated";
GRANT ALL ON FUNCTION "public"."top_metrics_by_species_and_period"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "filters" "public"."top_metrics_filter_params") TO "service_role";



GRANT ALL ON FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[], "species_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[], "species_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[], "species_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."top_species_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[]) TO "anon";
GRANT ALL ON FUNCTION "public"."top_species_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."top_species_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[], "months_filter" integer[]) TO "service_role";


















GRANT ALL ON TABLE "public"."Birds" TO "anon";
GRANT ALL ON TABLE "public"."Birds" TO "authenticated";
GRANT ALL ON TABLE "public"."Birds" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Birds_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Birds_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Birds_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Encounters" TO "anon";
GRANT ALL ON TABLE "public"."Encounters" TO "authenticated";
GRANT ALL ON TABLE "public"."Encounters" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Encounters_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Encounters_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Encounters_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Sessions" TO "anon";
GRANT ALL ON TABLE "public"."Sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."Sessions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Sessions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Species" TO "anon";
GRANT ALL ON TABLE "public"."Species" TO "authenticated";
GRANT ALL ON TABLE "public"."Species" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Species_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Species_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Species_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

