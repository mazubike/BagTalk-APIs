/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('roles', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique(); // Role name like 'admin', 'user'
        table.timestamp('deleted_at').nullable();
        table.timestamps(true, true); // created_at, updated_at (optional)
    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles');
};
