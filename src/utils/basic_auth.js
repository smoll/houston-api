let Pass = require("pass");
let Config = require("./config.js");

const users = {};

for(let user of Config.get(Config.BASIC_AUTHS).split("\n")) {
  let pos = user.indexOf(":");
  users[user.substr(0, pos)] = user.substr(pos + 1);
}

module.exports = {
  ValidateCreds: (username, password) => {
    return new Promise((resolve, reject) => {
      if (!users.hasOwnProperty(username)) {
        return reject("User not found");
      }

      let hash = users[username];

      Pass.validate(password, hash, (err, match) => {
        if (err) {
          return reject("Authorization misconfigured");
        }
        if (!match) {
          return reject("Incorrect password");
        }
        return resolve(username)
      });
    });
  }
};