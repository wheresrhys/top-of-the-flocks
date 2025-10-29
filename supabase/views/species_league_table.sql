drop view if exists species_league_table;
create view species_league_table as
select
  b.species_name,
  count(DISTINCT b.ring_no) AS individuals,
  count(e.*) AS encounters,
  count(distinct e.visit_date) as session_count,
  max(e.weight) as heaviest,
  avg(e.weight) as average_weight,
  min(e.weight) as lightest,
  max(e.wing_length) as longest_winged,
  avg(e.wing_length) as average_wing_length,
  min(e.wing_length) as shortest_winged,
  sum(e.weight) as total_weight,
  u.cnt as unluckiest,
  u.longest_stay as longest_stay,
  max(
    case
      when u.cnt is not null
      and u.cnt > 1 then ROUND(u.longest_stay / u.cnt, 2)
      else null
    end
  ) as frequent_flyer
from
  "Birds" b
  left join "Encounters" e on b.ring_no = e.ring_no
  left join lateral (
    select
      ring_no,
      COUNT(*) as cnt,
      ROUND(
        EXTRACT(
          epoch
          from
            (
              max(e2.visit_date::timestamp) - min(e2.visit_date::timestamp)
            )
        ) / (86400.0 * 365.0),
        2
      ) as longest_stay
    from
      "Encounters" e2
    where
      e2.ring_no is not null
      and exists (
        select
          1
        from
          "Birds" b2
        where
          b2.ring_no = e2.ring_no
          and b2.species_name = b.species_name
      )
    group by
      ring_no
    order by
      cnt desc
    limit
      1
  ) u on true
group by
  b.species_name,
  u.ring_no,
  u.cnt,
  u.longest_stay;
