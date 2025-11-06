exports.up = async function(knex) {
  return knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('telegram_id').notNullable().unique();
    table.string('username');
    table.string('first_name');
    table.string('last_name');
    table.integer('score').defaultTo(0);
    table.integer('level').defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('users');
};