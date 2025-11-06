exports.up = async function(knex) {
  return knex.schema.createTable('game_data', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('score').defaultTo(0);
    table.integer('level').defaultTo(1);
    table.integer('moves').defaultTo(0);
    table.jsonb('board'); // Store the game board as JSON
    table.specificType('achievements', 'text[]').defaultTo(knex.raw('ARRAY[]::text[]')); // Array of achievement IDs
    table.timestamp('last_played').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('game_data');
};