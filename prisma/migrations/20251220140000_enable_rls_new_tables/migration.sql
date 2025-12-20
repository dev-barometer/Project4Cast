-- Enable Row Level Security (RLS) on tables created after initial RLS migration
-- These tables were added in the user profile fields migration

-- Enable RLS on Team table
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserTeam junction table
ALTER TABLE "UserTeam" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserActivity table
ALTER TABLE "UserActivity" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserNotificationPreferences table
ALTER TABLE "UserNotificationPreferences" ENABLE ROW LEVEL SECURITY;
