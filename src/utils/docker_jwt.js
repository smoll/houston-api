const FS = require("fs");
const JWT = require("jsonwebtoken");

const Config = require("./config.js");
const LibTrust = require("./libtrust.js");
const Common = require("./common.js");

class DockerJWT {
  constructor(expiration = 3600) {
    this.algorithm = "RS256";
    this.crt = null;
    this.key = null;
    this.expiration = expiration
  }

  async loadCerts() {
    let path = Config.get(Config.DOCKER_CERT_PATH);
    this.crt = await this.loadFile(`${path}tls.crt`);
    this.key = await this.loadFile(`${path}tls.key`);
  }

  loadFile(filepath) {
    return new Promise((resolve, reject) => {
      FS.readFile(filepath, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  async generate(userUuid, service, payload = []) {
    await this.loadCerts();

    const now = Math.floor(new Date().getTime() / 1000);

    return this.sign({
      "iss": Config.get(Config.DOCKER_ISSUER),
      "sub": userUuid,
      "aud": service,
      "exp": (now + this.expiration),
      "nbf": now,
      "iat": now,
      "jti": await Common.randomToken(32),
      "access": payload
    });
  }

  async sign(payload) {
    let libTrust = new LibTrust(this.crt, this.key);

    try {
      return JWT.sign(payload, this.key, {
        algorithm: this.algorithm,
        header: {
          kid: await libTrust.generateKid()
        }
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
module.exports = DockerJWT;

// sub (Subject)
// The subject of the token; the name or id of the client which requested it. This should be empty (`""`) if the client did not authenticate.
// aud (Audience)
// The intended audience of the token; the name or id of the service which will verify the token to authorize the client/subject.
// exp (Expiration)
// The token should only be considered valid up to this specified date and time.
// nbf (Not Before)
// The token should not be considered valid before this specified date and time.
// iat (Issued At)
// Specifies the date and time which the Authorization server generated this token.
// jti (JWT ID)
// A unique identifier for this token. Can be used by the intended audience to prevent replays of the token.
