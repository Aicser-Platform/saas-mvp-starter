-- Add video_url and resources columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_video_url ON public.courses(video_url);
