/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('saved_posts', function (table) {
        table.increments('id').primary();           // Primary Key
        table.integer('user_id').unsigned().notNullable();
        table.integer('post_id').unsigned().notNullable();
        table.timestamp('deleted_at').nullable();
        table.timestamps(true, true);               // created_at & updated_at

        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
    });
};




/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('saved_posts');
};
