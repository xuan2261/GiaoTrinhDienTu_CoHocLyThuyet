const test = require('node:test');
const {
  expectFailure,
  mutateContract
} = require('./media-pilot-test-utils');

test('multimedia accessibility rejects missing fallback, keyboard, reduced-motion, captions, and manual status', () => {
  expectFailure(root => mutateContract(root, 'data/multimedia-accessibility.json', data => {
    delete data.entries[0].staticFallback;
  }), /staticFallback mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-accessibility.json', data => {
    data.entries[1].keyboard = '';
  }), /keyboard mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-accessibility.json', data => {
    data.entries[2].reducedMotion = '';
  }), /reducedMotion mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-accessibility.json', data => {
    data.entries[3].captions = null;
  }), /captions mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-accessibility.json', data => {
    data.entries[0].manualReview.screenReader = 'passed';
  }), /must remain pending/);
});
