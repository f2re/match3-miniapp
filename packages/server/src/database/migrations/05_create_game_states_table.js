exports.up = async function(knex) {
  return knex.schema.createTable('game_states', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('game_data').notNullable();
    table.timestamp('last_played').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('game_states');
};