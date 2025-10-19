# Data Directory

Place your CSV files here for import into Supabase.

## CSV File Format

Your CSV files should have headers that match your Supabase table column names.

### Example: bird_sightings.csv

```csv
id,species,location,date,ringer_id,ring_number,notes
1,Robin,London Park,2024-01-15,101,R12345,Adult male
2,Blue Tit,Manchester Gardens,2024-01-16,102,BT67890,Juvenile
3,Sparrow,Birmingham Heath,2024-01-17,101,S11223,Adult female
```

## Import Command

To import a CSV file:

```bash
npm run import -- data/your-file.csv table_name
```

Example:
```bash
npm run import -- data/bird_sightings.csv bird_sightings
```

## Notes

- Ensure your table exists in Supabase before importing
- Column names in CSV must match table column names exactly
- The import script uses the service role key, so ensure it's set in your `.env.local` file
- Large files are processed in batches of 100 records for efficiency
