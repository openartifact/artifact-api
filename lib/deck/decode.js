/* eslint-disable no-bitwise */
const {
  charMapping, currentVersion,
  encodedPrefix, entities,
  nameTrimLen,
} = require('./common');

module.exports = (code) => {
  if (!code.startsWith(encodedPrefix)) {
    return false;
  }

  let work = code.substring(encodedPrefix.length);

  Object.keys(charMapping).forEach((key) => {
    const val = charMapping[key];

    work = work.split(val).join(key);
  });

  const bytes = Buffer.from(work, 'base64');
  const versionAndHeroes = bytes[0];

  if (versionAndHeroes >> 4 !== currentVersion) {
    return false;
  }

  const checksum = bytes[1];
  const nameLen = bytes[2];
  const cardBytes = bytes.length - nameLen;



  return {
    name: '',
  };
};
