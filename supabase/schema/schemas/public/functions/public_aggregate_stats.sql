-- Public, group-gated wrapper around aggregate_stats (#648 req 1). Runs SECURITY
-- DEFINER so the (owner-privileged) definer bypasses RLS to compute the aggregate,
-- but only ever after confirming the target group has opted its summary data into
-- public view via 'summary' = ANY(public_areas). It returns exactly what
-- aggregate_stats returns for the same params, or nothing at all when the group has
-- not opted in / does not exist / no group is given. Execute is granted to PUBLIC so
-- an anonymous (no-JWT) client can call it directly; no base-table grant or RLS
-- policy is widened, so raw Sessions/Encounters/Birds rows stay inaccessible.
CREATE FUNCTION public.public_aggregate_stats (
	species_name_filter text DEFAULT NULL::text,
	from_date date DEFAULT NULL::date,
	to_date date DEFAULT NULL::date,
	ringing_group_filter bigint DEFAULT NULL::bigint,
	group_by_species boolean DEFAULT FALSE,
	group_by_time_period text DEFAULT NULL::text
) RETURNS TABLE (
	species_name text,
	time_period date,
	session_count bigint,
	total_effort interval,
	effort_per_session interval,
	effort_per_encounter interval,
	avg_encounters_per_session numeric,
	max_per_session bigint,
	species_count bigint,
	bird_count bigint,
	encounter_count bigint,
	new_bird_count bigint,
	pullus_bird_count bigint,
	juv_bird_count bigint,
	postjuv_bird_count bigint,
	adult_bird_count bigint,
	unknown_age_bird_count bigint,
	new_young_bird_count bigint,
	pullus_enc_count bigint,
	juv_enc_count bigint,
	postjuv_enc_count bigint,
	adult_enc_count bigint,
	unknown_age_enc_count bigint,
	max_new_per_session bigint,
	max_weight real,
	avg_weight numeric,
	min_weight real,
	median_weight numeric,
	max_wing smallint,
	avg_wing numeric,
	min_wing smallint,
	median_wing numeric
) LANGUAGE plpgsql SECURITY DEFINER
SET
	search_path TO 'public',
	'pg_catalog' AS $function$
BEGIN
  -- Only expose data for a group that has explicitly published its summary area.
  IF ringing_group_filter IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM public."RingingGroups" rg
       WHERE rg.id = ringing_group_filter
         AND 'summary' = ANY(rg.public_areas)
     ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.aggregate_stats(
    species_name_filter,
    from_date,
    to_date,
    ringing_group_filter,
    group_by_species,
    group_by_time_period
  );
END;
$function$;

GRANT
EXECUTE ON FUNCTION public.public_aggregate_stats (text, date, date, bigint, boolean, text) TO PUBLIC;
