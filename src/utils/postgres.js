const Knex = require("knex");
const Url = require("url");

const Config = require("./config.js");

const DEBUG = false;

class PostgresFunctions {
  // Airflow Postgres functions

  static createUser(knexConn, user, password) {
    try {
      this.validNames(user);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Create user ${user}`);
    return knexConn.raw(`CREATE USER ${user} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE ` +
      `NOINHERIT NOREPLICATION CONNECTION LIMIT -1 ENCRYPTED PASSWORD '${password}';`).then((result) => {
        PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static deleteUser(knexConn, user) {
    try {
      this.validNames(user);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Delete user ${user}`);
    return knexConn.raw(`DROP USER ${user};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static createDatabase(knexConn, database) {
    try {
      this.validNames(database);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Create database ${database}`);
    return knexConn.raw(`CREATE DATABASE ${database};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static deleteDatabase(knexConn, database) {
    try {
      this.validNames(database);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Drop database ${database}`);
    return knexConn.raw(`DROP DATABASE ${database};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static forceDisconnectSessions(knexConn, database) {
    try {
      this.validNames(database);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Force disconnect database session on ${database}`);
    return knexConn.raw(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${database}'
      AND pid <> pg_backend_pid();
    `).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static creatorGrantRole(knexConn, creator, user) {
    try {
      this.validNames(creator, user);
    } catch (err) {
      return Promise.reject(err);
    }

    const query = `GRANT ${user} TO ${creator}`;

    PostgresFunctions.debug(`Grant ${creator} to ${user}`);
    return knexConn.raw(`${query};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static creatorRevokeRole(knexConn, creator, user) {
    try {
      this.validNames(creator, user);
    } catch (err) {
      return Promise.reject(err);
    }

    const query = `REVOKE ${user} FROM ${creator}`;

    PostgresFunctions.debug(`Revoke ${creator} from ${user}`);
    return knexConn.raw(`${query};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
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
    PostgresFunctions.debug(`Create schema ${schema}, authorize ${user}`);
    return knexConn.raw(`${query};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static setUserDefaultSchema(knexConn, user, schema) {
    try {
      this.validNames(user, schema);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Set default schema ${schema} for ${user}`);
    return knexConn.raw(`ALTER ROLE ${user} SET search_path = ${schema};`).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
      return Promise.resolve(false);
    });
  }

  static userExists(knexConn, user) {
    try {
      this.validNames(user);
    } catch (err) {
      return Promise.reject(err);
    }
    PostgresFunctions.debug(`Check ${user} exists`);
    return knexConn.raw(`SELECT 1 FROM pg_roles WHERE rolname='${user}';`).then((result) => {
      PostgresFunctions.debug(result);
      return (result.rows.length === 1);
    });
  }

  static databaseExists(knexConn, database) {
    try {
      this.validNames(database);
    } catch (err) {
      return Promise.reject(err);
    }
    PostgresFunctions.debug(`Check ${database} exists`);
    return knexConn.raw(`SELECT 1 FROM pg_database WHERE datname='${database}';`).then((result) => {
      PostgresFunctions.debug(result);
      return (result.rows.length === 1);
    });
  }

  static async resetAccessGrants(knexConn, database, schema, user) {
    try {
      this.validNames(database, schema, user);
    } catch (err) {
      return Promise.reject(err);
    }

    PostgresFunctions.debug(`Update access grants in db "${database}" to user "${user}" for schema "${schema}"`);
    return knexConn.raw(
      // `GRANT ${user} TO ${database};` +
      `ALTER DEFAULT PRIVILEGES              IN SCHEMA ${schema} GRANT ALL PRIVILEGES ON TABLES TO ${user};` +
      `ALTER DEFAULT PRIVILEGES              IN SCHEMA ${schema} GRANT USAGE          ON SEQUENCES TO ${user};` +
      `GRANT USAGE          ON                  SCHEMA ${schema} TO ${user};` +
      `GRANT CREATE         ON                  SCHEMA ${schema} TO ${user};` +
      `GRANT ALL PRIVILEGES ON                  SCHEMA ${schema} TO ${user};` +
      `GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA ${schema} TO ${user};` +
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ${schema} TO ${user};`
    ).then((result) => {
      PostgresFunctions.debug(result);
      return Promise.resolve(true);
    }).catch((err) => {
      PostgresFunctions.debug(err);
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

  static connectionUser(uri) {
    const parts = Url.parse(uri);
    return parts.auth.substr(0, parts.auth.indexOf(":"));
  }

  static debug(message) {
    if(!DEBUG) {
      return;
    }
    console.log(message);
  }
}

module.exports = PostgresFunctions;