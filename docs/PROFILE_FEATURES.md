# Profile Features Implementation

This document outlines the profile functionality that has been implemented in the StartIn application.

## Overview

The profile system allows users to:
- Automatically create a profile record on first login
- View and edit their profile information
- Display their name throughout the application
- Manage profile pictures and basic information

## Database Schema

The profile data is stored in the `public.users` table:

```sql
create table public.users (
  id uuid primary key references auth.users(id),
  name text,
  profile_pic_url text,
  created_at timestamptz default now()
);
```

### Row Level Security (RLS)

The table has RLS enabled with the following policies:
- Users can view their own profile
- Users can insert their own profile (create new profile)
- Users can update their own profile

## Implementation Details

### 1. Profile Creation on Login

**File**: `src/app/auth/callback/page.tsx`

When a user successfully authenticates, the system automatically:
1. Checks if a profile exists in `public.users`
2. If no profile exists, creates one using data from `auth.users`
3. Uses `user_metadata.full_name` or `user_metadata.name` if available
4. Falls back to email-based name generation (e.g., "john.doe@example.com" → "John.doe")
5. Uses "New User" as final fallback if email is not available
6. Falls back gracefully if profile creation fails

### 2. Profile Management Utilities

**File**: `src/lib/profile.ts`

Contains utility functions:
- `ensureUserProfile(user)`: Creates profile if it doesn't exist
- `updateUserProfile(userId, updates)`: Updates profile information
- `getUserProfile(userId)`: Fetches user profile
- `getDisplayName(profile, email)`: Gets display name with fallback logic

### 3. Profile Page

**File**: `src/app/profile/page.tsx`

Features:
- Displays user profile information
- Allows editing of name and profile picture
- Shows loading states and error handling
- Prompts users to create profile if none exists
- Shows alert when user has a default/generated name
- Real-time updates to database

### 4. Navigation Integration

**File**: `src/components/Navigation.tsx`

The navigation component now:
- Loads and displays user profile data
- Shows user's name in the dropdown menu using `getDisplayName()`
- Uses profile picture or initials in avatar
- Never shows null names - always has a fallback

### 5. Dashboard Integration

**File**: `src/app/dashboard/page.tsx`

The dashboard now:
- Displays personalized welcome message with user's name using `getDisplayName()`
- Loads user profile data alongside other dashboard data
- Never shows null names - always has a fallback

## User Experience Flow

1. **First Login**: User signs in with magic link
2. **Profile Creation**: System automatically creates profile record
3. **Profile Setup**: User can visit profile page to add/edit information
4. **App Usage**: User's name appears throughout the application

## Name Fallback Logic

The system implements a robust fallback strategy for user names:

1. **Primary**: `user_metadata.full_name` (from OAuth providers)
2. **Secondary**: `user_metadata.name` (from OAuth providers)
3. **Tertiary**: Email-based name generation (e.g., "john.doe@example.com" → "John.doe")
4. **Final**: "New User" (if no email available)

This ensures that:
- No null names appear anywhere in the UI
- Users always have a meaningful display name
- The system works with magic link authentication (no user_metadata)
- Users are prompted to update default names

## Error Handling

- Profile creation failures don't block authentication
- Graceful fallbacks when profile data is missing
- Loading states for better UX
- Error messages for failed operations

## Future Enhancements

Potential additions to the profile system:
- Bio/description field
- Location information
- Company/role information
- Social media links
- Profile picture upload functionality
- Profile completion percentage
- Public profile pages

## Testing

To test the profile functionality:

1. Sign up with a new email
2. Check that profile is created automatically
3. Visit profile page and edit information
4. Verify changes appear in navigation and dashboard
5. Test with users who have no profile (edge case)

## Security Considerations

- RLS policies ensure users can only access their own data
- Profile creation uses authenticated user context
- No sensitive data is exposed through profile fields
- Input validation and sanitization in place

## Troubleshooting

### RLS Policy Errors

If you encounter errors like `"new row violates row-level security policy for table 'users'"`, it means the RLS policies are not properly configured. You need to add the missing INSERT policy:

```sql
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
```

This ensures users can create, read, and update their own profiles. 