# Video Setup Guide

This guide explains how to add videos to your courses in the Aicser AI Studio platform.

## Quick Start

The easiest way to add videos to courses is by running the provided SQL script that adds demo videos:

```bash
# Run this script in your Supabase SQL Editor
scripts/007_add_video_urls.sql
```

This will add free, public domain demo videos to all existing courses.

## Adding Your Own Videos

### Option 1: Using Public Video URLs

If you have videos hosted elsewhere (YouTube, Vimeo, CDN, etc.), you can directly update the database:

```sql
UPDATE public.courses 
SET video_url = 'https://your-video-url.mp4'
WHERE id = 'course-id-here';
```

### Option 2: Using Vercel Blob Storage (Recommended for Production)

1. **Install Vercel Blob**:
   ```bash
   npm install @vercel/blob
   ```

2. **Upload videos via the Vercel Dashboard**:
   - Go to your Vercel project
   - Navigate to Storage → Blob
   - Upload your video files
   - Copy the generated URL

3. **Update your course**:
   ```sql
   UPDATE public.courses 
   SET video_url = 'https://your-blob-url.vercel-storage.com/video.mp4'
   WHERE id = 'course-id-here';
   ```

### Option 3: Using Supabase Storage

1. **Upload to Supabase Storage**:
   - Go to your Supabase project
   - Navigate to Storage
   - Create a bucket called `course-videos`
   - Upload your video files

2. **Get the public URL**:
   ```typescript
   const { data } = supabase
     .storage
     .from('course-videos')
     .getPublicUrl('video-name.mp4')
   ```

3. **Update the database**:
   ```sql
   UPDATE public.courses 
   SET video_url = 'https://your-supabase-url/storage/v1/object/public/course-videos/video-name.mp4'
   WHERE id = 'course-id-here';
   ```

## Supported Video Formats

The video player supports:
- MP4 (H.264) - Recommended
- WebM
- Ogg

For best compatibility across all browsers, use MP4 with H.264 codec.

## Video Optimization Tips

1. **Resolution**: 1080p or 720p for best quality/size balance
2. **Bitrate**: 2-5 Mbps for 1080p, 1-2 Mbps for 720p
3. **Format**: MP4 with H.264 codec
4. **Audio**: AAC codec, 128-192 kbps

## Free Demo Videos

The platform comes with links to free, public domain demo videos:
- Big Buck Bunny
- Elephants Dream
- For Bigger Blazes
- For Bigger Escapes
- For Bigger Fun
- For Bigger Joyrides

These are perfect for testing and demonstrations.

## Troubleshooting

If videos don't play:

1. **Check CORS**: Ensure your video host allows cross-origin requests
2. **Check URL**: Make sure the video URL is publicly accessible
3. **Check Format**: Verify the video is in a supported format
4. **Check Network**: Test the URL directly in a browser

## Admin Panel

You can also update video URLs through the admin panel:
1. Go to `/admin/courses`
2. Click on a course
3. Edit the "Video URL" field
4. Save changes
