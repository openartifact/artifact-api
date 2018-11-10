/* eslint-disable no-bitwise */
const {
  charMapping, currentVersion,
  encodedPrefix, entities,
  nameTrimLen,
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

const addCardToBuffer = (countOrTurn, value, buffer) => {
  if (!countOrTurn || value <= 0) {
    return false;
  }

  return true;
};

const addRemaniningBits = (value, written, buffer) => {
  let work = value >> written;

  while (work > 0) {
    buffer.push(extractNBitsWithCarry(value, 7));
    work >>= 7;
  }
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

  if (deck.name && typeof deck.name === 'string') {
    let name = entities.encode(deck.name);

    if (name.length > 63) {
      name = name.substring(0, 63);
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

  return '';
};
