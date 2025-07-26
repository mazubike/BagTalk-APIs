/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.string('provider').defaultTo(null);
        table.string('provider_id').defaultTo(null);
        table.string('full_name').defaultTo(null);
        table.string('profile_image').defaultTo(null);
        table.string('user_name').defaultTo(null);
        table.text('bio').defaultTo(null);
        table.json('social_links').defaultTo(null);
        table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('SET NULL');
        table.boolean('is_completed').defaultTo(false);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('deleted_at').nullable();

        table.timestamps(true, true); // created_at, updated_at
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};