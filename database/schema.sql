-- PostgreSQL Schema for 13-Day Stories Trecena Data
-- Local development database only

-- Trecenas table: stores trecena metadata
CREATE TABLE IF NOT EXISTS trecenas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  prologue TEXT,
  epilogue TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Days table: stores all day data for each trecena
CREATE TABLE IF NOT EXISTS days (
  id SERIAL PRIMARY KEY,
  trecena_id INT NOT NULL REFERENCES trecenas(id) ON DELETE CASCADE,
  day INT NOT NULL,
  number INT NOT NULL,
  nawal VARCHAR(50),
  chapter TEXT,
  horoscope TEXT,
  affirmation TEXT,
  meditation TEXT,
  energy_of_the_day JSONB,
  birthday JSONB,
  colors JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trecena_id, day)
);

-- Image prompts table: stores image generation prompts separately
-- This data is not included in API output, only used for image generation
CREATE TABLE IF NOT EXISTS image_prompts (
  id SERIAL PRIMARY KEY,
  day_id INT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  story_primary TEXT,
  story_wide_1 TEXT,
  story_wide_2 TEXT,
  horoscope TEXT,
  affirmation TEXT,
  birthday TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(day_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_days_trecena ON days(trecena_id);
CREATE INDEX IF NOT EXISTS idx_days_nawal ON days(nawal);
CREATE INDEX IF NOT EXISTS idx_days_energy_gin ON days USING GIN(energy_of_the_day);
CREATE INDEX IF NOT EXISTS idx_days_colors_gin ON days USING GIN(colors);
CREATE INDEX IF NOT EXISTS idx_image_prompts_day_id ON image_prompts(day_id);
