const Haikunator = require("haikunator");
const HaikuAdjs = require("../../data/haikunator/adjectives.js");
const HaikuNouns = require("../../data/haikunator/nouns.js");

const haikunator = new Haikunator({
  adjectives: HaikuAdjs,
  nouns: HaikuNouns
});

module.exports = {
  generate: function(length = 4) {
    let name = haikunator.haikunate({
      tokenLength: length
    });
    console.log(name);
    name = name.replace(/_/g, "-");
    console.log(name);
    return name;
  }
};