-- Add sample video URLs to existing courses
-- Using free, public domain demo videos from Big Buck Bunny

UPDATE public.courses SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
WHERE title = 'Introduction to AI';

UPDATE public.courses SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
WHERE title = 'Advanced Machine Learning';

UPDATE public.courses SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
WHERE title = 'Natural Language Processing';

UPDATE public.courses SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
WHERE title = 'Computer Vision Mastery';

UPDATE public.courses SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
WHERE title = 'AI Ethics and Responsible AI';

UPDATE public.courses SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
WHERE title = 'Deep Learning Specialization';

-- Add sample resources to courses
UPDATE public.courses SET resources = '[
  {
    "title": "Course Slides",
    "type": "pdf",
    "url": "#"
  },
  {
    "title": "Code Examples",
    "type": "github",
    "url": "#"
  },
  {
    "title": "Additional Reading",
    "type": "link",
    "url": "#"
  }
]'::jsonb;
