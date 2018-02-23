const Crypto = require('crypto');

module.exports = {
  randomToken: function(length) {
    return new Promise((resolve, reject) => {
      Crypto.randomBytes(Math.ceil(length / 2), function(err, buffer) {
        if(err) {
          return reject(err);
        }
        return resolve(buffer.toString('hex').substr(0, length));
      });
    });
  },

  trimSlashes(value) {
    return value.replace(/^\/|\/$/g, '');
  }
};