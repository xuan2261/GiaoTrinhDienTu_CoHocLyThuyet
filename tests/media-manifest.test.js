const test = require('node:test');
const {
  expectFailure,
  expectPass,
  mutateMediaManifest
} = require('./media-pilot-test-utils');

test('canonical four-asset media manifest passes', () => {
  expectPass();
});

test('media manifest rejects missing fallback, stale hash, remote dependency, and budget drift', () => {
  expectFailure(root => mutateMediaManifest(root, media => {
    delete media.assets[0].runtime.staticFallback;
  }), /missing staticFallback/);

  expectFailure(root => mutateMediaManifest(root, media => {
    media.assets[1].sourceFiles[0].sha256 = '0'.repeat(64);
  }), /stale hash/);

  expectFailure(root => mutateMediaManifest(root, media => {
    media.assets[2].runtime.primary.path = 'https://example.invalid/sim.js';
  }), /remote dependency/);

  expectFailure(root => mutateMediaManifest(root, media => {
    media.assets[3].budget.maximumBytes = 1;
  }), /module size budget exceeded/);

  expectFailure(root => mutateMediaManifest(root, media => {
    media.assets[0].review.efficacyClaim = true;
  }), /review mismatch|unsupported claim flag/);
});
