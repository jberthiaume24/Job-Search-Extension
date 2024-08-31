/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const users = require('/app/bin/assets/users.json')
  const applications = require('/app/bin/assets/applications.json')
  const statistics = require('/app/bin/assets/statistics.json')
  const apps_by_result = require('/app/bin/assets/apps_by_result.json')
  
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('applications').del()
  await knex('statistics').del()
  await knex('apps_by_result').del()

  // Add entries
  await knex('users').insert(users)
  await knex('applications').insert(applications)
  await knex('statistics').insert(statistics)
  for (const entry of apps_by_result) {
    const clientID = Object.keys(entry)[0]; // Get the clientID
    const companies = entry[clientID]; // Get the companies data

    // Convert companies data to JSON string for storage
    const apps_by_company = JSON.stringify(companies);

    // Insert or update record in the database
    await knex('apps_by_result').insert({
      clientID,
      apps_by_company
    })
  }
}