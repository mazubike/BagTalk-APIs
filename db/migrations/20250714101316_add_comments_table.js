/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
    return knex.schema.createTable('comments', table => {
        table.increments('id').primary();
        table.integer('post_id').unsigned().notNullable();
        table.text('comment').notNullable();
        table.integer('comment_by').unsigned().notNullable();
        table.integer('comment_id').unsigned().nullable(); // parent comment (for replies)
        table.timestamp('deleted_at').nullable();
        table.timestamps(true, true);

        table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
        table.foreign('comment_by').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('comment_id').references('id').inTable('comments').onDelete('CASCADE');
    });
};



/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('comments');
};