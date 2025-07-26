/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('profile_tags', function (table) {
        table.increments('id').primary(); // Auto-incrementing primary key
        table.string('name').notNullable(); // Name column, required
        table.timestamp('deleted_at').nullable();

        table.timestamps(true, true);
    });
};



/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('profile_tags');
};
