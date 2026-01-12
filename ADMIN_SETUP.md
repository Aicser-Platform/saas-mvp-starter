# Admin Setup Guide

## Quick Start for Testing

### Option 1: Convert Your First Account to Admin (Recommended)

1. **Sign up** through the app at `/auth/sign-up` with your email and password
2. **Get your User ID**:
   - Go to your Supabase dashboard
   - Navigate to Authentication → Users
   - Copy your User ID
3. **Run this SQL in Supabase SQL Editor**:
   \`\`\`sql
   UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
   \`\`\`
4. **Access admin panel** at `/admin`

### Option 2: Use Demo Admin Account (One-Time Setup)

Run the `scripts/004_create_demo_admin.sql` script in Supabase:

**Demo Admin Credentials:**
- Email: `admin@aicser.ai`
- Password: `Admin123!@`

**Important:** This script uses Supabase's `crypt()` function to hash passwords. You must run it in the Supabase SQL Editor.

## Admin Panel Access

Once your profile has `role = 'admin'`, you can access:

- **Dashboard**: `/admin` - Overall statistics and analytics
- **Users Management**: `/admin/users` - View and manage user accounts
- **Courses Management**: `/admin/courses` - Manage course content
- **Payments History**: `/admin/payments` - Track all transactions

## Security Notes

- Only create admin accounts for trusted users
- Change demo credentials if using in production
- Regularly audit admin access logs
- Use strong, unique passwords for admin accounts

## Troubleshooting

**Can't access admin panel?**
- Verify your profile role is set to 'admin' in Supabase
- Check that you're logged in to the correct account
- Clear browser cache and try again

**"Access Denied" error?**
- Your account role is not set to 'admin'
- Run the UPDATE query again to set your role
- Refresh the page after updating

## User Subscription Tiers

Users can be assigned to subscription tiers via the `subscription_tier` field:

- **free** - Free tier (default)
- **pro** - Pro tier ($19.99/month)
- **premium** - Premium tier ($49.99/month)

Manual tier changes can be made directly in Supabase if needed.
