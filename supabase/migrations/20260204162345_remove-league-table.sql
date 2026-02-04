DROP VIEW IF EXISTS "public"."species_league_table";
DROP VIEW IF EXISTS "public"."SpeciesStats";
CREATE OR REPLACE VIEW "public"."SpeciesStats" WITH ("security_invoker"='true') AS
 SELECT "sp"."species_name",
    "count"(DISTINCT "b"."ring_no") AS "bird_count",
    "count"("e".*) AS "encounter_count",
    "count"(DISTINCT "sess"."visit_date") AS "session_count",
    "max"("e"."weight") AS "max_weight",
    "round"(("avg"("e"."weight"))::numeric, 1) AS "avg_weight",
    "min"("e"."weight") AS "min_weight",
    "round"("percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("e"."weight")::double precision))::numeric, 1) AS "median_weight",
    "max"("e"."wing_length") AS "max_wing",
    "round"("avg"("e"."wing_length"), 1) AS "avg_wing",
    "min"("e"."wing_length") AS "min_wing",
    "round"("percentile_cont"((0.5)::double precision) WITHIN GROUP (ORDER BY (("e"."wing_length")::double precision))::numeric, 0) AS "median_wing",
    "u"."cnt" AS "max_encountered_bird",
    "round"((((100)::numeric * ("count"(DISTINCT
        CASE
            WHEN ("encounter_counts"."encounter_count" > 1) THEN "b"."id"
            ELSE NULL::bigint
        END))::numeric) / (NULLIF("count"(DISTINCT "b"."id"), 0))::numeric), 0) AS "pct_retrapped",
    "u"."max_time_span",
    "max"("busy_session"."encounter_count") AS "max_per_session",
    ( SELECT "max"(((("first_enc"."minimum_years")::numeric + EXTRACT(year FROM "last_enc"."visit_date")) - EXTRACT(year FROM "first_enc"."visit_date"))) AS "max"
           FROM ((("public"."Species" "sp2"
             JOIN "public"."Birds" "b3" ON (("sp2"."id" = "b3"."species_id")))
             JOIN ( SELECT DISTINCT ON ("e3"."bird_id") "e3"."bird_id",
                    "e3"."minimum_years",
                    "s3"."visit_date"
                   FROM ("public"."Encounters" "e3"
                     JOIN "public"."Sessions" "s3" ON (("e3"."session_id" = "s3"."id")))
                  ORDER BY "e3"."bird_id", "s3"."visit_date") "first_enc" ON (("b3"."id" = "first_enc"."bird_id")))
             JOIN ( SELECT DISTINCT ON ("e4"."bird_id") "e4"."bird_id",
                    "s4"."visit_date"
                   FROM ("public"."Encounters" "e4"
                     JOIN "public"."Sessions" "s4" ON (("e4"."session_id" = "s4"."id")))
                  ORDER BY "e4"."bird_id", "s4"."visit_date" DESC) "last_enc" ON (("b3"."id" = "last_enc"."bird_id")))
          WHERE ("sp2"."species_name" = "sp"."species_name")) AS "max_proven_age"
   FROM (((((("public"."Species" "sp"
     JOIN "public"."Birds" "b" ON (("sp"."id" = "b"."species_id")))
     LEFT JOIN "public"."Encounters" "e" ON (("b"."id" = "e"."bird_id")))
     LEFT JOIN "public"."Sessions" "sess" ON (("e"."session_id" = "sess"."id")))
     LEFT JOIN LATERAL ( SELECT "b2"."id",
            "count"(*) AS "cnt",
            "round"((EXTRACT(epoch FROM ("max"(("sess2"."visit_date")::timestamp without time zone) - "min"(("sess2"."visit_date")::timestamp without time zone))) / 86400.0), 0) AS "max_time_span"
           FROM (("public"."Encounters" "e2"
             JOIN "public"."Birds" "b2" ON (("e2"."bird_id" = "b2"."id")))
             JOIN "public"."Sessions" "sess2" ON (("e2"."session_id" = "sess2"."id")))
          WHERE ("b2"."species_id" = "sp"."id")
          GROUP BY "b2"."id"
          ORDER BY ("count"(*)) DESC
         LIMIT 1) "u" ON (true))
     LEFT JOIN ( SELECT "Encounters"."bird_id",
            "count"(*) AS "encounter_count"
           FROM "public"."Encounters"
          GROUP BY "Encounters"."bird_id") "encounter_counts" ON (("b"."id" = "encounter_counts"."bird_id")))
     LEFT JOIN ( SELECT "Encounters"."session_id",
            "count"(*) AS "encounter_count"
           FROM "public"."Encounters"
          GROUP BY "Encounters"."session_id") "busy_session" ON (("sess"."id" = "busy_session"."session_id")))
  GROUP BY "sp"."species_name", "u"."cnt", "u"."max_time_span";


ALTER VIEW "public"."SpeciesStats" OWNER TO "postgres";
