exports.up = async function(knex) {
  return knex.schema.createTable('user_achievements', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('achievement_id', 100).notNullable().references('id').inTable('achievements').onDelete('CASCADE');
    table.integer('progress').defaultTo(0);
    table.timestamp('unlocked_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'achievement_id']);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('user_achievements');
};