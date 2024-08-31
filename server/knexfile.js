module.exports = {
  client: 'pg',
  version: '7.2',
  connection: {
    host: '127.0.0.1',
    // default PostgreS port
    port: '5432',
    user: 'postgres',
    database: 'job_search_db',
    password: 'postgres'
  },
  migrations: {
    directory: './knex/migrations'
  },
  seeds: {
    directory: './knex/seeds'
  }
}