const { assert } = require('chai');
const { encode } = require('../lib');

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
});
