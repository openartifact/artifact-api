const { AllHtmlEntities } = require('html-entities');

const entities = new AllHtmlEntities();

const currentVersion = 2;
const encodedPrefix = 'ADC';

const charMapping = {
  '/': '-',
  '=': '_',
};

const nameTrimLen = 63;
const headerSize = 3;

module.exports = {
  charMapping,
  currentVersion,
  encodedPrefix,
  entities,
  headerSize,
  nameTrimLen,
};
