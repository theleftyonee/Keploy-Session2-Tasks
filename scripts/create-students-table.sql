-- Create the students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  course TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- In production, you'd want to restrict this based on authentication
CREATE POLICY "Allow all operations on students" ON students
  FOR ALL USING (true);

-- Insert some sample data
INSERT INTO students (name, age, course) VALUES
  ('Alice Johnson', 20, 'Computer Science'),
  ('Bob Smith', 22, 'AI'),
  ('Carol Davis', 19, 'Biology'),
  ('David Wilson', 21, 'Mathematics'),
  ('Eva Brown', 23, 'Physics'),
  ('Frank Miller', 20, 'Computer Science'),
  ('Grace Lee', 24, 'Engineering'),
  ('Henry Taylor', 22, 'Chemistry');
