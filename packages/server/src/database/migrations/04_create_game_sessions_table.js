exports.up = async function(knex) {
  return knex.schema.createTable('game_sessions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('start_time').defaultTo(knex.fn.now());
    table.timestamp('end_time');
    table.integer('score').defaultTo(0);
    table.integer('level').defaultTo(1);
    table.integer('moves').defaultTo(0);
    table.string('game_mode', 50).defaultTo('classic');
    table.string('difficulty', 20).defaultTo('medium');
    table.boolean('completed').defaultTo(false);
    table.specificType('achievements', 'text[]').defaultTo(knex.raw('ARRAY[]::text[]'));
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('game_sessions');
};