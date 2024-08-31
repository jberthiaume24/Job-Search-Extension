/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Drop existing tables
    await knex.schema.dropTableIfExists('applications');
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('statistics');
    await knex.schema.dropTableIfExists('apps_by_result');

    // Create users table
    await knex.schema.createTable('users', function(table) {
        table.string('clientID').primary();
        table.json('visited_frontier');
    });

    // Create applications table
    await knex.schema.createTable('applications', function(table) {
        table.increments('appID').primary();
        table.string('clientID').notNullable().index(); // Consider adding index if used for lookups
        table.string('company');
        table.string('position');
        table.string('interview_type');
        table.string('previous_interview');
        table.string('result');
        table.string('interviewers');
        table.string('submission_date'); // Changed to timestamp for better date handling
        table.string('recent_date'); // Changed to timestamp for better date handling
    });

    // Create statistics table
    await knex.schema.createTable('statistics', function(table) {
        table.string('clientID').primary();
        table.integer('total_apps');
        table.integer('total_pending_apps');
        table.float('pass_rate');
    });

    // Create apps_by_result table
    await knex.schema.createTable('apps_by_result', function(table) {
        table.string('clientID').primary();
        table.json('apps_by_company');
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('apps_by_result');
    await knex.schema.dropTableIfExists('statistics');
    await knex.schema.dropTableIfExists('applications');
    await knex.schema.dropTableIfExists('users');
}

