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
    let path = Config.get(Config.REGISTRY_CERT_PATH);
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

  async generate(userUuid, payload = []) {
    await this.loadCerts();

    const now = Math.floor(new Date().getTime() / 1000);

    return this.sign({
      "iss": Config.get(Config.REGISTRY_ISSUER),
      "sub": userUuid,
      "aud": Config.get(Config.REGISTRY_SERVICE),
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