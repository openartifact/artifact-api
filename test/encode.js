const { assert } = require('chai');
const { encode } = require('../lib');
const greenBlackDeck = require('./green-black');
const multipleSameHero = require('./multiple-same-hero');

describe('Encoding Artifact Deck Code', () => {
  it('should fail when encoding non-object', () => {
    assert.isFalse(encode());
    assert.isFalse(encode(null));
    assert.isFalse(encode(true));
    assert.isFalse(encode('random'));
  });

  it('should fail when not given proper keys', () => {
    assert.isFalse(encode({ heroes: [] }));
    assert.isFalse(encode({ cards: [] }));
    assert.isFalse(encode({ heroes: [], cards: {} }));
    assert.isFalse(encode({ heroes: {}, cards: [] }));
  });

  it('should succeed', () => {
    assert.equal(encode(greenBlackDeck), 'ADCJWkTZX05uwGDCRV4XQGy3QGLmqUBg4GQJgGLGgO7AaABR3JlZW4vQmxhY2sgRXhhbXBsZQ__');
  });

  it('should successfully encode multiple of the same hero', () => {
    assert.equal(encode(multipleSameHero), 'ADCJZ8ZZLkCAIAAAE11bHRpcGxlIG9mIHRoZSBzYW1lIGhlcm8_');
  });
});
