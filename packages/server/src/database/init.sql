-- Match-3 Telegram Mini App Database Schema
-- Run this script to initialize the database

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10),
    is_premium BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    lives INTEGER DEFAULT 5,
    coins INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC);

-- Game sessions table for tracking individual game plays
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    moves INTEGER DEFAULT 0,
    game_mode VARCHAR(50) DEFAULT 'classic',
    difficulty VARCHAR(20) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    achievements TEXT[], -- Array of achievement IDs unlocked during this session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for game_sessions table
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed);

-- Game state table for saving/loading game progress
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_data JSONB NOT NULL, -- Serialized game state
    last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for game_states table
CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
CREATE INDEX IF NOT EXISTS idx_game_states_last_played ON game_states(last_played DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_game_state ON game_states(user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    category VARCHAR(50) DEFAULT 'general',
    requirement_type VARCHAR(50) NOT NULL, -- 'score', 'level', 'matches', etc.
    requirement_value INTEGER NOT NULL,
    reward_coins INTEGER DEFAULT 0,
    reward_lives INTEGER DEFAULT 0,
    reward_experience INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create indexes for achievements tables
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objective_type VARCHAR(50) NOT NULL, -- 'score', 'moves', 'time', 'special_tiles'
    objective_value INTEGER NOT NULL,
    reward_coins INTEGER DEFAULT 0,
    reward_experience INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_date)
);

-- User daily challenge progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Create indexes for daily challenges
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_id ON user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_completed ON user_daily_challenges(completed);

-- Leaderboards table (for caching)
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leaderboard_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(leaderboard_type, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period_start, period_end);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON game_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (id, name, description, icon, category, requirement_type, requirement_value, reward_coins, rarity) VALUES
('first_game', 'First Steps', 'Complete your first game', '🎆', 'general', 'games_played', 1, 50, 'common'),
('score_1000', 'Rising Star', 'Reach a score of 1,000 points', '⭐', 'score', 'score', 1000, 100, 'common'),
('score_5000', 'Shining Bright', 'Reach a score of 5,000 points', '🌟', 'score', 'score', 5000, 200, 'rare'),
('score_10000', 'Stellar Performance', 'Reach a score of 10,000 points', '💫', 'score', 'score', 10000, 500, 'epic'),
('level_5', 'Getting Started', 'Reach level 5', '🏆', 'level', 'level', 5, 75, 'common'),
('level_10', 'Experienced Player', 'Reach level 10', '🏅', 'level', 'level', 10, 150, 'rare'),
('level_20', 'Master Player', 'Reach level 20', '🏄', 'level', 'level', 20, 300, 'epic'),
('combo_5', 'Combo Starter', 'Achieve a 5x combo', '🔥', 'special', 'combo', 5, 100, 'common'),
('combo_10', 'Combo Master', 'Achieve a 10x combo', '💥', 'special', 'combo', 10, 250, 'rare'),
('special_tiles_10', 'Special Agent', 'Create 10 special tiles', '💎', 'special', 'special_tiles', 10, 150, 'common'),
('games_played_10', 'Dedicated Player', 'Play 10 games', '🎮', 'general', 'games_played', 10, 200, 'common'),
('games_played_50', 'Enthusiast', 'Play 50 games', '🎖️', 'general', 'games_played', 50, 500, 'rare'),
('games_played_100', 'Addicted', 'Play 100 games', '🏆', 'general', 'games_played', 100, 1000, 'epic')
ON CONFLICT (id) DO NOTHING;

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    u.score as current_score,
    u.level as current_level,
    u.lives,
    u.coins,
    u.created_at as user_created_at,
    COALESCE(gs.total_games, 0) as total_games,
    COALESCE(gs.avg_score, 0) as avg_score,
    COALESCE(gs.best_score, u.score) as best_score,
    COALESCE(gs.total_playtime, 0) as total_playtime_seconds,
    COALESCE(ua.achievements_unlocked, 0) as achievements_unlocked,
    COALESCE(dc.daily_challenges_completed, 0) as daily_challenges_completed
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_games,
        AVG(score) as avg_score,
        MAX(score) as best_score,
        SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))) as total_playtime
    FROM game_sessions 
    GROUP BY user_id
) gs ON u.id = gs.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as achievements_unlocked
    FROM user_achievements 
    WHERE unlocked_at IS NOT NULL
    GROUP BY user_id
) ua ON u.id = ua.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as daily_challenges_completed
    FROM user_daily_challenges 
    WHERE completed = TRUE
    GROUP BY user_id
) dc ON u.id = dc.user_id;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

COMMIT;