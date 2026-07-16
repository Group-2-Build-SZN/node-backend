ALTER TABLE properties
  ALTER COLUMN location TYPE geometry(Point, 4326)
  USING ST_SetSRID(location, 4326);

ALTER TABLE amenities
  ALTER COLUMN location TYPE geometry(Point, 4326)
  USING ST_SetSRID(location, 4326);-- Custom SQL migration file, put your code below! --