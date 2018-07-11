// Docker registry needs a libtrust compatible "kid" field in the JWT
// This is generated from the configured cert

// Below is a modified version of a code snippet provided in
// https://github.com/docker/distribution/issues/813#issuecomment-171955975

const crypto = require("crypto");

const forge = require("node-forge");

let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

class LibTrustFingerprint {
  constructor(crt, key) {
    this.crt = crt;
    this.key = key;
  }

  async generateKid() {
    if (!this.crt || !this.key) {
      await this.loadCerts();
    }

    let cert = forge.pki.certificateFromPem(this.crt);
    let asn1 = forge.pki.publicKeyToAsn1(cert.publicKey);
    let der = forge.asn1.toDer(asn1);
    let buf = new Buffer(der.getBytes(), 'binary');
    let hash = crypto.createHash('sha256').update(buf).digest();
    let base32 = this.base32encode(hash.slice(0, 30));

    // Create key id (fingerprint)
    let kid = '';
    for (let i = 0; i < 48; ++i) {
      kid += base32[i];
      if (i % 4 === 3 && (i + 1) !== 48) {
        kid += ":";
      }
    }
    return kid;
  }

  base32encode(value) {
    let skip = 0;
    let bits = 0;
    let output = '';

    // Iterate over bytes
    let i = 0;
    while (i < value.length) {
      let v = value[i];
      if (typeof v == 'string') {
        v = v.charCodeAt(0);
      }

      // Set current bits
      if (skip < 0) { // We have a carry from the previous byte
        bits |= (v >> (-skip));
      } else { // No carry
        bits = (v << skip) & 248;
      }

      // Produce a character if there is enough data, otherwise, get more data
      if (skip < 4) {
        output += alphabet[bits >> 3];
        skip += 5;
      } else {
        skip -= 8;
        i++;
      }
    }

    // Consume any remaining bits left
    output += (skip < 0 ? alphabet[bits >> 3] : '');

    return output;
  }
}

module.exports = LibTrustFingerprint;