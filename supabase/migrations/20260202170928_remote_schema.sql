


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


COMMENT ON SCHEMA "public" IS '@graphql({"inflect_names": true})';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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


CREATE OR REPLACE FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text" DEFAULT 'day'::"text", "metric_name" "text" DEFAULT 'encounters'::"text", "result_limit" integer DEFAULT 5, "month_filter" integer DEFAULT NULL::integer, "year_filter" integer DEFAULT NULL::integer, "exact_months_filter" "text"[] DEFAULT NULL::"text"[], "months_filter" integer[] DEFAULT NULL::integer[], "species_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("visit_date" "date", "metric_value" bigint)
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


CREATE OR REPLACE FUNCTION "public"."top_species_by_metric"("temporal_unit" "text" DEFAULT 'day'::"text", "metric_name" "text" DEFAULT 'encounters'::"text", "result_limit" integer DEFAULT 5, "month_filter" integer DEFAULT NULL::integer, "year_filter" integer DEFAULT NULL::integer, "exact_months_filter" "text"[] DEFAULT NULL::"text"[], "months_filter" integer[] DEFAULT NULL::integer[]) RETURNS TABLE("species_name" "text", "visit_date" "date", "metric_value" bigint)
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



CREATE OR REPLACE VIEW "public"."species_league_table" WITH ("security_invoker"='true') AS
 SELECT "sp"."species_name",
    "count"(DISTINCT "b"."ring_no") AS "individuals",
    "count"("e".*) AS "encounters",
    "count"(DISTINCT "sess"."visit_date") AS "session_count",
    "max"("e"."weight") AS "heaviest",
    "avg"("e"."weight") AS "average_weight",
    "min"("e"."weight") AS "lightest",
    "max"("e"."wing_length") AS "longest_winged",
    "avg"("e"."wing_length") AS "average_wing_length",
    "min"("e"."wing_length") AS "shortest_winged",
    "sum"("e"."weight") AS "total_weight",
    "u"."cnt" AS "unluckiest",
    "u"."longest_stay"
   FROM (((("public"."Species" "sp"
     JOIN "public"."Birds" "b" ON (("sp"."id" = "b"."species_id")))
     LEFT JOIN "public"."Encounters" "e" ON (("b"."id" = "e"."bird_id")))
     LEFT JOIN "public"."Sessions" "sess" ON (("e"."session_id" = "sess"."id")))
     LEFT JOIN LATERAL ( SELECT "b2"."id",
            "count"(*) AS "cnt",
            "round"((EXTRACT(epoch FROM ("max"(("sess2"."visit_date")::timestamp without time zone) - "min"(("sess2"."visit_date")::timestamp without time zone))) / (86400.0 * 365.0)), 2) AS "longest_stay"
           FROM (("public"."Encounters" "e2"
             JOIN "public"."Birds" "b2" ON (("e2"."bird_id" = "b2"."id")))
             JOIN "public"."Sessions" "sess2" ON (("e2"."session_id" = "sess2"."id")))
          WHERE ("b2"."species_id" = "sp"."id")
          GROUP BY "b2"."id"
          ORDER BY ("count"(*)) DESC
         LIMIT 1) "u" ON (true))
  GROUP BY "sp"."species_name", "u"."id", "u"."cnt", "u"."longest_stay";


ALTER VIEW "public"."species_league_table" OWNER TO "postgres";


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

























































































































































GRANT ALL ON FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."most_caught_birds"("result_limit" integer, "species_filter" "text", "year_filter" integer) TO "service_role";



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



GRANT ALL ON TABLE "public"."species_league_table" TO "anon";
GRANT ALL ON TABLE "public"."species_league_table" TO "authenticated";
GRANT ALL ON TABLE "public"."species_league_table" TO "service_role";









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

