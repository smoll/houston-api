const Faker = require("faker");
const { Airflow } = require("../../database/postgres.js");
const PostgresUtil = require("../postgres.js");
let application = {};

let password = "password";
let createUser = `user_${Faker.random.number()}`;
let fakeUser = `user_${Faker.random.number()}_fake`;
let createDB = `db_${Faker.random.number()}`;
let fakeDB = `db_${Faker.random.number()}_fake`;
let createSchema = `schema_${Faker.random.number()}`;
let fakeSchema = `schema_${Faker.random.number()}_fake`;

describe("When testing Postgres util", () => {

  let deploymentUuid = Faker.random.uuid();
  let deployment = {

  };

  describe("check that #createUser", () => {
    test("works with non existant user", async (done) => {
      let user = await PostgresUtil.createUser(Airflow, createUser, password);
      expect(user).toEqual(true);
      let check = await Airflow.raw(`SELECT 1 FROM pg_roles WHERE rolname='${createUser}'`);
      expect(check.rows.length).toEqual(1);
      done();
    });

    test("does not fail if user exists", async (done) => {
      let user = await PostgresUtil.createUser(Airflow, createUser, password);
      expect(user).toEqual(false);
      let check = await Airflow.raw(`SELECT 1 FROM pg_roles WHERE rolname='${createUser}'`);
      expect(check.rows.length).toEqual(1);
      done();
    });
  });

  describe("check that #userExists", () => {
    test("find a user that does exist", async (done) => {
      let func = await PostgresUtil.userExists(Airflow, createUser);
      expect(func).toEqual(true);
      done();
    });

    test("does not find user that doesn't exist", async (done) => {
      let func = await PostgresUtil.userExists(Airflow, fakeUser);
      expect(func).toEqual(false);
      done();
    });
  });

  describe("check that #createDatabase", () => {
    test("creates database that doesn't exist", async (done) => {
      let func = await PostgresUtil.createDatabase(Airflow, createDB);
      expect(func).toEqual(true);
      let check = await Airflow.raw(`SELECT 1 FROM pg_database WHERE datname='${createDB}';`);
      expect(check.rows.length).toEqual(1);
      done();
    });

    test("returns false if database does exist", async (done) => {
      let func = await PostgresUtil.createDatabase(Airflow, createDB);
      expect(func).toEqual(false);
      let check = await Airflow.raw(`SELECT 1 FROM pg_database WHERE datname='${createDB}';`);
      expect(check.rows.length).toEqual(1);
      done();
    });
  });

  describe("check that #databaseExists", () => {
    test("find a db that does exist", async (done) => {
      let func = await PostgresUtil.databaseExists(Airflow, createDB);
      expect(func).toEqual(true);
      done();
    });

    test("does not find db that doesn't exist", async (done) => {
      let func = await PostgresUtil.databaseExists(Airflow, fakeDB);
      expect(func).toEqual(false);
      done();
    });
  });

  describe("check that #uriReplace", () => {
    test("replaces database in connection", () => {
      let before = "postgres://user:pass@localhost/before";
      let after = "postgres://user:pass@localhost/after";
      expect(after).toEqual(PostgresUtil.uriReplace(before, {
        database: "after"
      }));
    });

    test("replaces protocol in connection", () => {
      let before = "postgres://user:pass@localhost/database";
      let after = "postgresql://user:pass@localhost/database";
      expect(after).toEqual(PostgresUtil.uriReplace(before, {
        protocol: "postgresql"
      }));
    });

    test("replaces user/pass in connection", () => {
      let before = "postgres://user:pass@localhost/database";
      let after = "postgres://test:derp@localhost/database";
      expect(after).toEqual(PostgresUtil.uriReplace(before, {
        username: "test",
        password: "derp"
      }));
    });

    test("replaces protocol, database, and user/pass in connection", () => {
      let before = "postgres://user:pass@localhost/before";
      let after =  "db+postgres://test:derp@localhost/after";
      expect(after).toEqual(PostgresUtil.uriReplace(before, {
        protocol: "db+postgres",
        database: "after",
        username: "test",
        password: "derp"
      }));
    });
  });

  describe("functions that require a deployment specific connection", () => {

    let userConn;
    beforeAll(() => {
      userConn = PostgresUtil.userAirflowConnect(createDB);
    });

    afterAll(async (done) => {
      await userConn.destroy();
      done();
    });

    describe("check that #createSchema", () => {

      test("creates schema that doesn't exist", async (done) => {
        let func = await PostgresUtil.createSchema(userConn, createSchema, createUser);
        expect(func).toEqual(true);
        let check = await userConn.raw(`select 1 from pg_catalog.pg_namespace WHERE nspname='${createSchema}';`);
        expect(check.rows.length).toEqual(1);
        done();
      });

      test("returns false if schema exists", async (done) => {
        let func = await PostgresUtil.createSchema(userConn, createSchema, createUser);
        expect(func).toEqual(false);
        let check = await userConn.raw(`select 1 from pg_catalog.pg_namespace WHERE nspname='${createSchema}';`);
        expect(check.rows.length).toEqual(1);
        done();
      });
    });

    describe("check that #resetAccessGrants", () => {

      test("returns true", async (done) => {
        let func = await PostgresUtil.resetAccessGrants(userConn, createDB, createSchema, createUser);
        expect(func).toEqual(true);
        done();
      });
    });

    describe("check that #setUserDefaultSchema", async () => {

      let createTestTableAndData = (conn, schema, value) => {
        return conn.schema.withSchema(schema).createTable("test", function (table) {
          table.string("check").primary();
        }).then(() => {
          return conn("test").withSchema(schema).insert({
            "check": value
          });
        });
      };

      beforeAll(async (done) => {
        // create table
        try {
          await createTestTableAndData(userConn, "public", "public");
          await createTestTableAndData(userConn, createSchema, "user");
        } catch (err) {
          console.log(err);
        }
        done();
      });

      test("sets searchPath to schema", async (done) => {
        let func = await PostgresUtil.setUserDefaultSchema(userConn, createUser, createSchema);
        expect(func).toEqual(true);
        let check = await userConn.raw(`
          SELECT r.rolname, d.datname, rs.setconfig
          FROM   pg_db_role_setting rs
          LEFT   JOIN pg_roles      r ON r.oid = rs.setrole
          LEFT   JOIN pg_database   d ON d.oid = rs.setdatabase
          WHERE  r.rolname = '${createUser}' OR d.datname = '${createDB}';`);
        expect(check.rows[0].setconfig[0]).toEqual(`search_path=${createSchema}`);
        done();
      });

      test("searches default schema for table as expected", async (done) => {

        // reconnect
        await userConn.destroy();
        userConn = PostgresUtil.userAirflowConnect(createDB, createUser, password);
        let check = await userConn.select("check").from("test");
        expect(check[0].check).toEqual("user");
        // query for table 'test' without a schema specified, see what the value of 'foo' is
        done();
      });
    });
  });
});