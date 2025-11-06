exports.up = async function(knex) {
  // Check if columns already exist to avoid conflicts
  const hasLanguageCode = await knex.schema.hasColumn('users', 'language_code');
  const hasIsPremium = await knex.schema.hasColumn('users', 'is_premium');
  const hasLives = await knex.schema.hasColumn('users', 'lives');
  const hasCoins = await knex.schema.hasColumn('users', 'coins');
  
  return knex.schema.alterTable('users', table => {
    if (!hasLanguageCode) table.string('language_code');
    if (!hasIsPremium) table.boolean('is_premium').defaultTo(false);
    if (!hasLives) table.integer('lives').defaultTo(5);
    if (!hasCoins) table.integer('coins').defaultTo(100);
  });
};

exports.down = async function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('language_code');
    table.dropColumn('is_premium');
    table.dropColumn('lives');
    table.dropColumn('coins');
  });
};