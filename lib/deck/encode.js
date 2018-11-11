/* eslint-disable no-bitwise */
const {
  charMapping, currentVersion,
  encodedPrefix, entities,
  headerSize, nameTrimLen,
} = require('./common');

const sortById = (a, b) => {
  if (a.id <= b.id) {
    return -1;
  }

  return 1;
};

const extractNBitsWithCarry = (value, num) => {
  const limit = 1 << num;
  let result = value & (limit - 1);

  if (value >= limit) {
    result |= limit;
  }

  return result;
};

const addRemaniningBits = (value, written, buffer) => {
  let work = value >> written;

  while (work > 0) {
    buffer.push(extractNBitsWithCarry(work, 7));
    work >>= 7;
  }
};

const addCardToBuffer = (countOrTurn, value, buffer) => {
  if (!countOrTurn || value <= 0) {
    return false;
  }

  const bytesStart = buffer.length;

  const firstByteMaxCount = 0x03;
  const extendedCount = (countOrTurn - 1) >= firstByteMaxCount;
  const firstByteCount = extendedCount ? firstByteMaxCount : countOrTurn - 1;

  let firstByte = firstByteCount << 6;
  firstByte |= extractNBitsWithCarry(value, 5);

  buffer.push(firstByte);
  addRemaniningBits(value, 5, buffer);

  if (extendedCount) {
    addRemaniningBits(countOrTurn, 0, buffer);
  }

  if (buffer.length - bytesStart > 11) {
    return false;
  }

  return true;
};

const computeChecksum = (buffer) => {
  let checksum = 0;
  const num = buffer.length;

  for (let i = headerSize; i < num; i += 1) {
    checksum += buffer[i];
  }

  return checksum;
};

module.exports = (deck) => {
  if (!deck || !Array.isArray(deck.heroes) || !Array.isArray(deck.cards)) {
    return false;
  }

  const bytes = [];

  deck.heroes.sort(sortById);
  deck.cards.sort(sortById);

  const noOfHeroes = deck.heroes.length;

  // Add version and 3 bits of heroes
  const versionAndHeroes = (currentVersion << 4) | extractNBitsWithCarry(noOfHeroes, 3);

  bytes.push(versionAndHeroes);
  bytes.push(0); // Dummy checksum to be filled later

  let nameLen = 0;
  let name = '';

  if (deck.name && typeof deck.name === 'string') {
    name = entities.encode(deck.name);

    if (name.length > nameTrimLen) {
      name = name.substring(0, nameTrimLen);
    }

    nameLen = name.length;
  }

  bytes.push(nameLen);
  addRemaniningBits(noOfHeroes, 3, bytes);

  let prevCardId = 0;

  for (let i = 0; i < noOfHeroes; i += 1) {
    const card = deck.heroes[i];

    if (!addCardToBuffer(card.turn, card.id - prevCardId, bytes)) {
      return false;
    }

    prevCardId = card.id;
  }

  prevCardId = 0;

  for (let i = 0; i < deck.cards.length; i += 1) {
    const card = deck.cards[i];

    if (!addCardToBuffer(card.count, card.id - prevCardId, bytes)) {
      return false;
    }

    prevCardId = card.id;
  }

  bytes[1] = computeChecksum(bytes) & 0x0FF;

  const nameBuffer = Buffer.from(name);
  const byteBuffer = Buffer.from(bytes);

  const buffer = Buffer.concat([byteBuffer, nameBuffer]);
  let ret = buffer.toString('base64');

  Object.keys(charMapping).forEach((key) => {
    const val = charMapping[key];

    ret = ret.split(key).join(val);
  });

  return `${encodedPrefix}${ret}`;
};
