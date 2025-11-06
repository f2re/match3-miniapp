const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('user_daily_challenges').del();
  await knex('user_achievements').del();
  await knex('daily_challenges').del();
  await knex('achievements').del();
  await knex('game_sessions').del();
  await knex('game_states').del();
  await knex('users').del();

  // Insert seed entries for users - starting with a demo user
  const demoUser = {
    id: uuidv4(),
    telegram_id: '123456789', // Demo user ID
    username: 'demo_user',
    first_name: 'Demo',
    last_name: 'User',
    language_code: 'en',
    is_premium: false,
    score: 1500,
    level: 5,
    lives: 5,
    coins: 250
  };

  await knex('users').insert(demoUser);

  // Insert default achievements based on init.sql
  const achievements = [
    {
      id: 'first_game',
      name: 'First Steps',
      description: 'Complete your first game',
      icon: '🎆',
      category: 'general',
      requirement_type: 'games_played',
      requirement_value: 1,
      reward_coins: 50,
      rarity: 'common'
    },
    {
      id: 'score_1000',
      name: 'Rising Star',
      description: 'Reach a score of 1,000 points',
      icon: '⭐',
      category: 'score',
      requirement_type: 'score',
      requirement_value: 1000,
      reward_coins: 100,
      rarity: 'common'
    },
    {
      id: 'score_5000',
      name: 'Shining Bright',
      description: 'Reach a score of 5,000 points',
      icon: '🌟',
      category: 'score',
      requirement_type: 'score',
      requirement_value: 5000,
      reward_coins: 200,
      rarity: 'rare'
    },
    {
      id: 'level_5',
      name: 'Getting Started',
      description: 'Reach level 5',
      icon: '🏆',
      category: 'level',
      requirement_type: 'level',
      requirement_value: 5,
      reward_coins: 75,
      rarity: 'common'
    },
    {
      id: 'combo_5',
      name: 'Combo Starter',
      description: 'Achieve a 5x combo',
      icon: '🔥',
      category: 'special',
      requirement_type: 'combo',
      requirement_value: 5,
      reward_coins: 100,
      rarity: 'common'
    }
  ];

  await knex('achievements').insert(achievements);

  // Insert today's daily challenge
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const dailyChallenge = {
    challenge_date: today,
    name: 'Reach 1000 Points',
    description: 'Score at least 1000 points in a single game',
    objective_type: 'score',
    objective_value: 1000,
    reward_coins: 100,
    reward_experience: 50
  };

  await knex('daily_challenges').insert(dailyChallenge);

  console.log('✅ Seeding completed successfully!');
};