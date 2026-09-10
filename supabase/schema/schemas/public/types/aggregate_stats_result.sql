-- Shared return shape for aggregate_stats and its public, group-gated wrapper
-- public_aggregate_stats (#768). Both functions RETURN SETOF this type so the
-- 36-column result shape is defined in exactly one place; the wrapper is
-- guaranteed to stay row-for-row identical to what it forwards. Matches the SELECT
-- list order in aggregate_stats.sql positionally (SETOF composite is matched by
-- position, not name) — keep the two in the same column order.
CREATE TYPE public.aggregate_stats_result AS (
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
	median_wing numeric,
	-- Age-split subsets of adult_bird_count (#800). Mutually exclusive and exhaustive
	-- over adult-bucketed birds, so new_adult + first_summer + oldies = adult_bird_count
	-- for every row. Partition adults by lifetime history with the ringing group.
	new_adult_bird_count bigint,
	first_summer_bird_count bigint,
	oldies_bird_count bigint,
	-- Young-trends encounter-level counts (#800). The 3J-only slice of juv_enc_count
	-- (which combines 1J and 3J), plus New-record variants. Additive — juv_enc_count
	-- is unchanged.
	postjuv_juv_enc_count bigint,
	new_postjuv_juv_enc_count bigint,
	new_postjuv_enc_count bigint
);
