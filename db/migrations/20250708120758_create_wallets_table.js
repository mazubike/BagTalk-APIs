/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('wallets', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');

        table.string('address').notNullable();
        table.string('wallet_type').notNullable();
        table.boolean('is_primary').defaultTo(false);

        // Analytics fields
        table.boolean('total_assets').defaultTo(true);
        table.boolean('risk_analysis').defaultTo(true);
        table.boolean('statistics').defaultTo(true);
        table.boolean('ai_analysis').defaultTo(true);
        table.timestamp('deleted_at').nullable();

        table.timestamps(true, true); // created_at, updated_at

        // Unique constraint: a user can't have the same wallet address twice
        table.unique(['address']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('wallets');
};

