-- Update species_league_table view to use normalized schema with ID-based joins
DROP VIEW IF EXISTS species_league_table;

CREATE VIEW species_league_table AS
SELECT
  sp.species_name,
  count(DISTINCT b.ring_no) AS individuals,
  count(e.*) AS encounters,
  count(DISTINCT sess.visit_date) as session_count,
  max(e.weight) as heaviest,
  avg(e.weight) as average_weight,
  min(e.weight) as lightest,
  max(e.wing_length) as longest_winged,
  avg(e.wing_length) as average_wing_length,
  min(e.wing_length) as shortest_winged,
  sum(e.weight) as total_weight,
  u.cnt as unluckiest,
  u.longest_stay as longest_stay
FROM
  "Species" sp
  INNER JOIN "Birds" b ON sp.id = b.species_id
  LEFT JOIN "Encounters" e ON b.id = e.bird_id
  LEFT JOIN "Sessions" sess ON e.session_id = sess.id
  LEFT JOIN LATERAL (
    SELECT
      b2.id,
      COUNT(*) as cnt,
      ROUND(
        EXTRACT(
          epoch
          FROM
            (
              max(sess2.visit_date::timestamp) - min(sess2.visit_date::timestamp)
            )
        ) / (86400.0 * 365.0),
        2
      ) as longest_stay
    FROM
      "Encounters" e2
      INNER JOIN "Birds" b2 ON e2.bird_id = b2.id
      INNER JOIN "Sessions" sess2 ON e2.session_id = sess2.id
    WHERE
      b2.species_id = sp.id
    GROUP BY
      b2.id
    ORDER BY
      cnt DESC
    LIMIT
      1
  ) u ON true
GROUP BY
  s.species_name,
  u.id,
  u.cnt,
  u.longest_stay;
