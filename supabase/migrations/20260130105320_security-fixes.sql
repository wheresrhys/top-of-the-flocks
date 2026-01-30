ALTER TABLE public."Sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Birds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Encounters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Species" ENABLE ROW LEVEL SECURITY;


CREATE OR REPLACE VIEW "public"."species_league_table"
WITH (security_invoker = true)
AS
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
