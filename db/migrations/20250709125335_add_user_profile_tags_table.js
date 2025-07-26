/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// knexfile.js (or in the migrations folder, example: 2023_07_09_123457_create_user_profile_tags.js)

exports.up = function (knex) {
    return knex.schema.createTable('user_profile_tags', function (table) {
        table.increments('id').primary(); // Auto-incrementing primary key
        table.integer('user_id').unsigned().notNullable(); // user_id as foreign key
        table.integer('tag_id').unsigned().notNullable(); // tag_id as foreign key
        table.timestamp('deleted_at').nullable();

        table.timestamps(true, true);

        // Foreign key constraints
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('tag_id').references('id').inTable('profile_tags').onDelete('CASCADE');

        // Optionally, add a unique constraint on the combination of user_id and tag_id
        table.unique(['user_id', 'tag_id']);
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_profile_tags');
};
