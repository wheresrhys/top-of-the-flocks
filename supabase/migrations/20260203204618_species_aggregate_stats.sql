DROP VIEW IF EXISTS "public"."SpeciesStats";

CREATE VIEW "public"."SpeciesStats" WITH ("security_invoker" = 'true') AS
SELECT "sp"."species_name",
  "count" (DISTINCT "b"."ring_no") AS "bird_count",
  "count" ("e".*) AS "encounter_count",
  "count" (DISTINCT "sess"."visit_date") AS "session_count",
  "max" ("e"."weight") AS "max_weight",
  "avg" ("e"."weight") AS "avg_weight",
  "min" ("e"."weight") AS "min_weight",
  "percentile_cont" (0.5) WITHIN GROUP (ORDER BY wing_length) AS "median_weight",
  "max" ("e"."wing_length") AS "max_wing",
  "avg" ("e"."wing_length") AS "avg_wing",
  "min" ("e"."wing_length") AS "min_wing",
  "percentile_cont" (0.5) WITHIN GROUP (ORDER BY wing_length) AS "median_wing",
  "u"."cnt" AS "max_encounters",
  ROUND(COUNT(DISTINCT CASE WHEN encounter_counts.encounter_count > 1 THEN
        b.id
      END)::numeric / NULLIF (COUNT(DISTINCT b.id), 0)::numeric, 4) AS "pct_retrapped",
  "u"."max_time_span"
FROM (((("public"."Species" "sp"
        JOIN "public"."Birds" "b" ON ("sp"."id" = "b"."species_id"))
      LEFT JOIN "public"."Encounters" "e" ON ("b"."id" = "e"."bird_id"))
    LEFT JOIN "public"."Sessions" "sess" ON ("e"."session_id" = "sess"."id"))
  LEFT JOIN LATERAL (
    SELECT "b2"."id",
      "count" (*) AS "cnt",
      "round" ((EXTRACT(epoch FROM ("max" (("sess2"."visit_date")::timestamp WITHOUT time zone) - "min" (("sess2"."visit_date")::timestamp WITHOUT time zone))) / (86400.0)), 0) AS "max_time_span"
    FROM (("public"."Encounters" "e2"
        JOIN "public"."Birds" "b2" ON ("e2"."bird_id" = "b2"."id"))
      JOIN "public"."Sessions" "sess2" ON ("e2"."session_id" = "sess2"."id"))
  WHERE ("b2"."species_id" = "sp"."id")
GROUP BY "b2"."id"
ORDER BY ("count" (*)) DESC
LIMIT 1) "u" ON (TRUE))
  LEFT JOIN (
    SELECT bird_id,
      COUNT(*) AS encounter_count
    FROM public."Encounters"
    GROUP BY bird_id) encounter_counts ON b.id = encounter_counts.bird_id
GROUP BY "sp"."species_name",
  "u"."cnt",
  "u"."max_time_span";

ALTER VIEW "public"."SpeciesStats" OWNER TO "postgres";
