


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





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."top_periods_result" (
    "visit_date" "date",
    "metric_value" bigint
);


ALTER TABLE "public"."top_periods_result" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text" DEFAULT 'day'::"text", "metric_name" "text" DEFAULT 'encounters'::"text", "result_limit" integer DEFAULT 5, "month_filter" integer DEFAULT NULL::integer, "year_filter" integer DEFAULT NULL::integer, "exact_months_filter" "text"[] DEFAULT NULL::"text"[]) RETURNS SETOF "public"."top_periods_result"
    LANGUAGE "plpgsql" STABLE
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
    AND (month_filter IS NULL OR EXTRACT(MONTH FROM e.visit_date) = month_filter)
    AND (year_filter IS NULL OR EXTRACT(YEAR FROM e.visit_date) = year_filter)
    AND (exact_months_filter IS NULL OR TO_CHAR(e.visit_date, 'YYYY-MM') = ANY(exact_months_filter))
  GROUP BY
    date_trunc(temporal_unit, e.visit_date)
  ORDER BY
    metric_value DESC
  LIMIT result_limit;
END;
$$;


ALTER FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[]) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Birds" (
    "ring_no" "text" NOT NULL,
    "species_name" "text" NOT NULL
);


ALTER TABLE "public"."Birds" OWNER TO "postgres";


COMMENT ON TABLE "public"."Birds" IS '@graphql({"aggregate": {"enabled": true}})';



CREATE TABLE IF NOT EXISTS "public"."Encounters" (
    "ring_no" "text" NOT NULL,
    "visit_date" "date" NOT NULL,
    "capture_time" time without time zone NOT NULL,
    "record_type" "text" NOT NULL,
    "scheme" "text" NOT NULL,
    "age" smallint NOT NULL,
    "sex" "text" NOT NULL,
    "sexing_method" "text",
    "breeding_condition" "text",
    "wing_length" smallint,
    "weight" real,
    "moult_code" "text",
    "old_greater_coverts" smallint,
    "extra_text" "text",
    "is_juv" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."Encounters" OWNER TO "postgres";


COMMENT ON TABLE "public"."Encounters" IS 'Encounters with individual birds';



CREATE TABLE IF NOT EXISTS "public"."Species" (
    "species_name" "text" NOT NULL
);


ALTER TABLE "public"."Species" OWNER TO "postgres";


COMMENT ON TABLE "public"."Species" IS 'Bird Species';



CREATE OR REPLACE VIEW "public"."species_league_table" AS
 SELECT "b"."species_name",
    "count"(DISTINCT "b"."ring_no") AS "individuals",
    "count"("e".*) AS "encounters",
    "count"(DISTINCT "e"."visit_date") AS "session_count",
    "max"("e"."weight") AS "heaviest",
    "avg"("e"."weight") AS "average_weight",
    "min"("e"."weight") AS "lightest",
    "max"("e"."wing_length") AS "longest_winged",
    "avg"("e"."wing_length") AS "average_wing_length",
    "min"("e"."wing_length") AS "shortest_winged",
    "sum"("e"."weight") AS "total_weight",
    "u"."cnt" AS "unluckiest",
    "u"."longest_stay"
   FROM (("public"."Birds" "b"
     LEFT JOIN "public"."Encounters" "e" ON (("b"."ring_no" = "e"."ring_no")))
     LEFT JOIN LATERAL ( SELECT "e2"."ring_no",
            "count"(*) AS "cnt",
            "round"((EXTRACT(epoch FROM ("max"(("e2"."visit_date")::timestamp without time zone) - "min"(("e2"."visit_date")::timestamp without time zone))) / (86400.0 * 365.0)), 2) AS "longest_stay"
           FROM "public"."Encounters" "e2"
          WHERE (("e2"."ring_no" IS NOT NULL) AND (EXISTS ( SELECT 1
                   FROM "public"."Birds" "b2"
                  WHERE (("b2"."ring_no" = "e2"."ring_no") AND ("b2"."species_name" = "b"."species_name")))))
          GROUP BY "e2"."ring_no"
          ORDER BY ("count"(*)) DESC
         LIMIT 1) "u" ON (true))
  GROUP BY "b"."species_name", "u"."ring_no", "u"."cnt", "u"."longest_stay";


ALTER VIEW "public"."species_league_table" OWNER TO "postgres";


ALTER TABLE ONLY "public"."Birds"
    ADD CONSTRAINT "Birds_pkey" PRIMARY KEY ("ring_no");



ALTER TABLE ONLY "public"."Encounters"
    ADD CONSTRAINT "Encounters_pkey" PRIMARY KEY ("ring_no", "visit_date");



ALTER TABLE ONLY "public"."Species"
    ADD CONSTRAINT "Species_pkey" PRIMARY KEY ("species_name");



ALTER TABLE ONLY "public"."Birds"
    ADD CONSTRAINT "Birds_species_name_fkey" FOREIGN KEY ("species_name") REFERENCES "public"."Species"("species_name");



ALTER TABLE ONLY "public"."Encounters"
    ADD CONSTRAINT "Encounters_ring_no_fkey" FOREIGN KEY ("ring_no") REFERENCES "public"."Birds"("ring_no");



ALTER TABLE "public"."Birds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Encounters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Species" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON TABLE "public"."top_periods_result" TO "anon";
GRANT ALL ON TABLE "public"."top_periods_result" TO "authenticated";
GRANT ALL ON TABLE "public"."top_periods_result" TO "service_role";



GRANT ALL ON FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."top_periods_by_metric"("temporal_unit" "text", "metric_name" "text", "result_limit" integer, "month_filter" integer, "year_filter" integer, "exact_months_filter" "text"[]) TO "service_role";


















GRANT ALL ON TABLE "public"."Birds" TO "anon";
GRANT ALL ON TABLE "public"."Birds" TO "authenticated";
GRANT ALL ON TABLE "public"."Birds" TO "service_role";



GRANT ALL ON TABLE "public"."Encounters" TO "anon";
GRANT ALL ON TABLE "public"."Encounters" TO "authenticated";
GRANT ALL ON TABLE "public"."Encounters" TO "service_role";



GRANT ALL ON TABLE "public"."Species" TO "anon";
GRANT ALL ON TABLE "public"."Species" TO "authenticated";
GRANT ALL ON TABLE "public"."Species" TO "service_role";



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































drop extension if exists "pg_net";


