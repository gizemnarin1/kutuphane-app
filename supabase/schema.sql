-- Create enum for rating
CREATE TYPE book_rating AS ENUM ('İyi', 'Orta', 'Kötü');

-- Create enum for book status
CREATE TYPE book_status AS ENUM ('Kütüphanemde', 'İstek Listemde');

-- Create books table
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  isbn TEXT,
  status book_status DEFAULT 'Kütüphanemde',
  is_read BOOLEAN DEFAULT false,
  rating book_rating,
  read_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own books" 
  ON books FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books" 
  ON books FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" 
  ON books FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" 
  ON books FOR DELETE 
  USING (auth.uid() = user_id);

-- Create reading goals table
CREATE TABLE reading_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  yearly_goal INTEGER DEFAULT 10,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reading goals
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading goals" 
  ON reading_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading goals" 
  ON reading_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading goals" 
  ON reading_goals FOR UPDATE 
  USING (auth.uid() = user_id);
