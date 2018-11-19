const { assert } = require('chai');
const { decode } = require('../lib');
const greenBlackDeck = require('./green-black');
const multipleSameHero = require('./multiple-same-hero');

describe('Decoding Artifact Deck Code', () => {
  it('should fail without correct prefix', () => {
    assert.isFalse(decode('random'));
  });

  it('should correctly return deck', () => {
    const res = decode('ADCJWkTZX05uwGDCRV4XQGy3QGLmqUBg4GQJgGLGgO7AaABR3JlZW4vQmxhY2sgRXhhbXBsZQ__');
    assert.deepEqual(res, greenBlackDeck);
  });

  it('should correctly decode multiple of the same hero', () => {
    const res = decode('ADCJZ8ZZLkCAIAAAE11bHRpcGxlIG9mIHRoZSBzYW1lIGhlcm8_');
    assert.deepEqual(res, multipleSameHero);
  });

  it('should fail with bad version', () => {
    assert.isFalse(decode('ADCFQ__'));
  });
});
