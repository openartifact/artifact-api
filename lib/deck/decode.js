/* eslint-disable no-bitwise, no-param-reassign */
const {
  charMapping, currentVersion,
  encodedPrefix, entities,
  headerSize,
} = require('./common');

// eslint-disable-next-line no-unused-vars
const readBitsChunk = (chunk, numBits, currShift, hold) => {
  const continueBit = 1 << numBits;
  const newBits = chunk & (continueBit - 1);

  hold.result |= (newBits << currShift);

  return (chunk & continueBit) !== 0;
};

const readUint32 = (value, baseBits, buffer, end, hold) => {
  let shift = 0;

  if (baseBits === 0 || readBitsChunk(value, baseBits, shift, hold)) {
    shift += baseBits;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (hold.currByteIndex >= end) {
        return false;
      }

      const data = buffer[hold.currByteIndex];
      hold.currByteIndex += 1;

      if (!readBitsChunk(data, 7, shift, hold)) {
        break;
      }

      shift += 7;
    }
  }

  return true;
};

const readCard = (buffer, end, hold) => {
  if (hold.currByteIndex >= end) {
    return false;
  }

  const header = buffer[hold.currByteIndex];
  const hasExtendedCount = ((header >> 6) === 0x03);

  const delta = { currByteIndex: hold.currByteIndex + 1, result: 0 };

  if (!readUint32(header, 5, buffer, end, delta)) {
    return false;
  }

  hold.id = hold.prevCardId + delta.result;
  hold.prevCardId = hold.id;

  const count = { currByteIndex: delta.currByteIndex, result: 0 };

  if (hasExtendedCount) {
    if (!readUint32(0, 0, buffer, end, count)) {
      return false;
    }

    hold.count = count.result;
  } else {
    hold.count = (header >> 6) + 1;
  }

  hold.currByteIndex = count.currByteIndex;

  return true;
};

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

  let computedChecksum = 0;
  let currByteIndex = headerSize;

  const totalBytes = bytes.length;
  const totalCardBytes = totalBytes - nameLen;

  for (let i = currByteIndex; i < totalCardBytes; i += 1) {
    computedChecksum += bytes[i];
  }

  if (checksum !== (computedChecksum & 0x0FF)) {
    return false;
  }

  const noOfHeroes = { currByteIndex, result: 0 };
  readUint32(versionAndHeroes, 3, bytes, totalCardBytes, noOfHeroes);
  ({ currByteIndex } = noOfHeroes);

  let prevCardId = 0;
  const deck = {
    name: '',
    heroes: [],
    cards: [],
  };

  for (let i = 0; i < noOfHeroes.result; i += 1) {
    const hold = {
      prevCardId, currByteIndex, count: 0, id: 0,
    };

    if (!readCard(bytes, totalCardBytes, hold)) {
      return false;
    }

    deck.heroes.push({ turn: hold.count, id: hold.id });
    ({ prevCardId, currByteIndex } = hold);
  }

  prevCardId = 0;

  while (currByteIndex < totalCardBytes) {
    const hold = {
      prevCardId, currByteIndex, count: 0, id: 0,
    };

    if (!readCard(bytes, totalCardBytes, hold)) {
      return false;
    }

    deck.cards.push({ count: hold.count, id: hold.id });
    ({ prevCardId, currByteIndex } = hold);
  }

  if (currByteIndex < totalBytes) {
    const name = bytes.slice(currByteIndex).toString('utf8');
    deck.name = entities.decode(name);
  }

  return deck;
};
