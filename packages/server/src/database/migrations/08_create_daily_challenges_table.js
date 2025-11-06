exports.up = async function(knex) {
  return knex.schema.createTable('daily_challenges', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('challenge_date').notNullable();
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('objective_type', 50).notNullable(); // 'score', 'moves', 'time', 'special_tiles'
    table.integer('objective_value').notNullable();
    table.integer('reward_coins').defaultTo(0);
    table.integer('reward_experience').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['challenge_date']);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('daily_challenges');
};