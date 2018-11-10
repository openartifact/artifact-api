const { assert } = require('chai');
const { decode } = require('../lib');

describe('Decoding Artifact Deck Code', () => {
  it('should fail without correct prefix', () => {
    assert.isFalse(decode('random'));
  });

  it('should correctly return deck', () => {
    const res = decode('ADCJWkTZX05uwGDCRV4XQGy3QGLmqUBg4GQJgGLGgO7AaABR3JlZW4vQmxhY2sgRXhhbXBsZQ__');

    assert.deepEqual(res, {
      name: '',
    });
  });

  it('should fail with bad version', () => {
    assert.isFalse(decode('ADCFQ__'));
  });
});
