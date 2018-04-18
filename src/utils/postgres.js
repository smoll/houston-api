const Knex = require("knex");
const Url = require("url");

const Config = require("./config.js");

class PostgresFunctions {
  // Airflow Postgres functions

  static createUser(knexConn, user, password) {
    try {
      this.validNames(user);
    } catch (err) {
      return Promise.reject(err);
    }

    return knexConn.raw(`CREATE USER ${user} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION CONNECTION LIMIT -1 ENCRYPTED PASSWORD '${password}';`).then(() => {
      return Promise.resolve(true);
    }).catch((err) => {
      return Promise.resolve(false);
    });
  }

  static createDatabase(knexConn, database) {
    try {
      this.validNames(database);
    } catch (err) {
      return Promise.reject(err);
    }

    return knexConn.raw(`CREATE DATABASE ${database};`).then(() => {
      return Promise.resolve(true);
    }).catch((err) => {
      return Promise.resolve(false);
    });
  }

  static createSchema(knexConn, schema, user = null) {
    try {
      this.validNames(schema, user);
    } catch (err) {
      return Promise.reject(err);
    }

    let query = `CREATE SCHEMA ${schema}`;
    if (user) {
      query = `${query} AUTHORIZATION ${user}`;
    }
    return knexConn.raw(`${query};`).then(() => {
      return Promise.resolve(true);
    }).catch((err) => {
      return Promise.resolve(false);
    });

  }

  static setUserDefaultSchema(knexConn, user, schema) {
    try {
      this.validNames(user, schema);
    } catch (err) {
      return Promise.reject(err);
    }

    return knexConn.raw(`ALTER ROLE ${user} SET search_path = ${schema};`).then(() => {
      return Promise.resolve(true);
    }).catch((err) => {
      return Promise.resolve(false);
    });
  }

  static userExists(knexConn, user) {
    try {
      this.validNames(user);
    } catch (err) {
      return Promise.reject(err);
    }
    return knexConn.raw(`SELECT 1 FROM pg_roles WHERE rolname='${user}';`).then((result) => {
      return (result.rows.length === 1);
    });
  }

  static databaseExists(knexConn, database) {
    try {
      this.validNames(database);
    } catch (err) {
      return Promise.reject(err);
    }
    return knexConn.raw(`SELECT 1 FROM pg_database WHERE datname='${database}';`).then((result) => {
      return (result.rows.length === 1);
    });
  }

  static async resetAccessGrants(knexConn, database, schema, user) {
    try {
      this.validNames(database, schema, user);
    } catch (err) {
      return Promise.reject(err);
    }

    return knexConn.raw(
      // `GRANT ${user} TO ${database};` +
      `ALTER DEFAULT PRIVILEGES              IN SCHEMA ${schema} GRANT ALL PRIVILEGES ON TABLES TO ${user};` +
      `ALTER DEFAULT PRIVILEGES              IN SCHEMA ${schema} GRANT USAGE          ON SEQUENCES TO ${user};` +
      `GRANT ALL PRIVILEGES ON                  SCHEMA ${schema} TO ${user};` +
      `GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA ${schema} TO ${user};` +
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ${schema} TO ${user};`
    ).then(() => {
      return Promise.resolve(true);
    }).catch((err) => {
      return Promise.resolve(false);
    });
  }

  static userAirflowConnect(database, username, password) {

    let uri = Config.get(Config.AIRFLOW_POSTGRES_URI);
    uri = this.uriReplace(uri, {
      database: database,
      username: username,
      password: password
    });

    return Knex({
      client: "postgres",
      connection: uri,
      debug: Config.get(Config.DEBUG_DB) === "true"
    });
  }

  static validNames(...values) {
    for(let value of values) {
      if (!/^[A-Za-z][A-Za-z0-9_\-]+$/.test(value)) {
        throw new Error(`Invalid characters in ${value}`);
      }
    }
  }

  // TODO: Refactor to have a second arg that is an object with props "db", "user", & "pass"
  static uriReplace(uri, options) {
    let parts = Url.parse(uri);
    if (options.database) {
      parts.pathname = `${options.database}`;
    }
    if (options.username && options.password) {
      parts.auth = `${options.username}:${options.password}`;
    }
    if (options.protocol) {
      parts.protocol = options.protocol;
    }
    return Url.format(parts);
  }
}

module.exports = PostgresFunctions;