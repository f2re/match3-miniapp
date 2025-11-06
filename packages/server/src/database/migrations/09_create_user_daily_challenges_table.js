exports.up = async function(knex) {
  return knex.schema.createTable('user_daily_challenges', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('challenge_id').notNullable().references('id').inTable('daily_challenges').onDelete('CASCADE');
    table.integer('progress').defaultTo(0);
    table.boolean('completed').defaultTo(false);
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'challenge_id']);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('user_daily_challenges');
};