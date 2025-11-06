exports.up = async function(knex) {
  return knex.schema.createTable('leaderboards', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('leaderboard_type', 50).notNullable(); // 'daily', 'weekly', 'monthly', 'all_time'
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.integer('level').notNullable();
    table.integer('rank').notNullable();
    table.date('period_start');
    table.date('period_end');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('leaderboards');
};