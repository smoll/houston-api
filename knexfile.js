// Update with your config settings.

module.exports = {

  development: {
    client: 'postgres',
    connection: {
      database: 'houston',
      user:     'houston',
      password: 'houston'
    },
    migrations: {
      directory: __dirname + "/src/database/migrations",
      tableName: 'migrations'
    }
  }
};
