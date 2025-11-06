exports.up = async function(knex) {
  return knex.schema.createTable('achievements', table => {
    table.string('id', 100).primary();
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('icon', 255);
    table.string('category', 50).defaultTo('general');
    table.string('requirement_type', 50).notNullable(); // 'score', 'level', 'matches', etc.
    table.integer('requirement_value').notNullable();
    table.integer('reward_coins').defaultTo(0);
    table.integer('reward_lives').defaultTo(0);
    table.integer('reward_experience').defaultTo(0);
    table.string('rarity', 20).defaultTo('common'); // 'common', 'rare', 'epic', 'legendary'
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('achievements');
};