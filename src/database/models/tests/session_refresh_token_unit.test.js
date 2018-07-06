const Faker = require("faker");

const Postgres = require("../../postgres.js");
const User = require("../user.js");
const SessionRefreshToken = require("../session_refresh_token.js");

describe("When testing session_refresh_tokens", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("is successful", async (done) => {
      let username = Faker.internet.userName();

      const user = await User.query().insertAndFetch({
        username: username,
      });

      const date =new Date();
      date.setDate(new Date().getDate() + 365);

      const token = await SessionRefreshToken.query().insertAndFetch({
        user_uuid: user.uuid,
        source: "cli",
        metadata: "Location: Unknown",
        expires_at: date.toISOString(),
      });
      expect(token.user_uuid).toEqual(user.uuid);
      done();
    });
  });
});