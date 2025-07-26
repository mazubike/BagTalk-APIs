/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('posts', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('title').notNullable();
        table.text('description').nullable();
        table.string('image').nullable();
        table.string('visibility').notNullable().defaultTo('public');
        table.string('joiner').notNullable().defaultTo('anyone');
        table.string('duration').notNullable().defaultTo('30');
        table.date('schedule_date').nullable();
        table.time('schedule_time').nullable();
        table.time('start_time').nullable();
        table.time('end_time').nullable();
        table.string('post_type').notNullable().defaultTo('simple');
        table.json('tags').nullable();
        table.timestamp('deleted_at').nullable();
        table.timestamps(true, true); // Adds created_at and updated_at
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('posts');
};
