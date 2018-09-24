const Faker = require("faker");
const Postgres = require("../../database/postgres.js");
const Constants = require("../../constants.js");
const UserService = require("../user.js");
const UserModel = require("../../database/models/user.js");
const UserPropertyModel = require("../../database/models/user_property.js");
const EmailModel = require("../../database/models/email.js");
const GroupModel = require("../../database/models/group.js");
let application = {
  model: function(name) {
    return {
      user: UserModel,
      email: EmailModel,
      user_property: UserPropertyModel,
    }[name];
  },
  service: function(name) {
    let settings = {};
    let group = null;
    return {
      common: {
        emailConfirmationEnabled: function(){
          return false;
        }
      },

      // TODO: Should eventually full support testing this, but for now stub out
      system_setting: {
        getSetting: function() {},
      },
      group: {
        fetchGroupByUuid: function() {},
        addUser: function() {}
      },
      workspace: {
        createWorkspaceWithDefaultGroups: function() {}
      }

    }[name];
  }
};


describe("When testing user service", () => {

  let userService;
  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      userService = new UserService(application);
      done();
    });
  });

  let username = Faker.internet.userName();
  let email = Faker.internet.email();
  let user;
  describe("check that #createUser", () => {
    test("creates new user that doesn't exist", async (done) => {
      user = await userService.createUser({
        username: username,
        email: email,
        password:"password"
      });
      expect(user.username).toEqual(username);
      expect(user.emails[0].address).toEqual(email);
      done();
    });

    test("fails to creates new user with email that exists", async () => {
      expect(userService.createUser({
        username: username,
        email: email,
        password:"password"
      })).rejects.toThrow();
    });
  });

  describe("check that #fetchUserByEmail", () => {
    test("works for email that exists", async (done) => {
      let fetchUser = await userService.fetchUserByEmail(email);
      expect(fetchUser.username).toEqual(username);
      expect(fetchUser.emails[0].address).toEqual(email);
      done();
    });

    test("fails with email that does not exist", async (done) => {
      let fetchUser = await userService.fetchUserByEmail(Faker.internet.email(), false);
      expect(fetchUser).toBeNull();
      done();
    });
  });

  describe("check that #fetchUserByUsername", () => {

    test("works for username that exists", async (done) => {
      let fetchUser = await userService.fetchUserByUsername(username);
      expect(fetchUser.username).toEqual(username);
      expect(fetchUser.emails[0].address).toEqual(email);
      done();
    });

    test("fails with username that does not exist", async (done) => {
      let fetchUser = await userService.fetchUserByUsername(Faker.internet.userName(), false);
      expect(fetchUser).toBeNull();
      done();
    });
  });

  describe("check that #fetchUserByUuid", () => {

    test("works for uuid that exists", async (done) => {
      let fetchUser = await userService.fetchUserByUuid(user.uuid);
      expect(fetchUser.uuid).toEqual(user.uuid);
      expect(fetchUser.username).toEqual(user.username);
      done();
    });

    test("fails with uuid that does not exist", async (done) => {
      let fetchUser = await userService.fetchUserByUuid("202f8e12-05af-4b20-9443-339eeeef7552", false);
      expect(fetchUser).toBeNull();
      done();
    });
  });

  describe("check that #updateUser", () => {

    test("works for email that exists", async (done) => {
      let updateUser = await userService.updateUser(user, {
        fullName: "derp"
      });
      expect(updateUser.fullName).toEqual("derp");

      let fetchUser = await userService.fetchUserByUuid(user.uuid);
      expect(fetchUser.fullName).toEqual("derp");
      done();
    });
  });


  describe("check that #deleteUser", () => {
    test("works", async (done) => {
      await userService.deleteUser(user);

      let userRecord = await UserModel.query().findById(user.uuid);
      expect(userRecord).toBeUndefined();
      done();
    });
  });
});