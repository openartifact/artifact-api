const encode = require('./deck/encode');
const decode = require('./deck/decode');
const { version } = require('./deck/common');

module.exports = {
  encode,
  decode,
  deckEncodingVersion: version,
};
