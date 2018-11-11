const { assert } = require('chai');
const { decode } = require('../lib');
const greenBlackDeck = require('./green-black');

describe('Decoding Artifact Deck Code', () => {
  it('should fail without correct prefix', () => {
    assert.isFalse(decode('random'));
  });

  it('should correctly return deck', () => {
    const res = decode('ADCJWkTZX05uwGDCRV4XQGy3QGLmqUBg4GQJgGLGgO7AaABR3JlZW4vQmxhY2sgRXhhbXBsZQ__');

    assert.deepEqual(res, greenBlackDeck);
  });

  it('should fail with bad version', () => {
    assert.isFalse(decode('ADCFQ__'));
  });
});
