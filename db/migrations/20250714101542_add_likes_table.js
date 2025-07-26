/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/YYYYMMDD_create_likes.js

exports.up = function (knex) {
    return knex.schema.createTable('likes', table => {
        table.increments('id').primary();
        table.integer('post_id').unsigned().nullable();
        table.integer('comment_id').unsigned().nullable();
        table.integer('liked_by').unsigned().notNullable();
        table.timestamp('deleted_at').nullable();
        table.timestamps(true, true);

        table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
        table.foreign('comment_id').references('id').inTable('comments').onDelete('CASCADE');
        table.foreign('liked_by').references('id').inTable('users').onDelete('CASCADE');
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('likes');
};
