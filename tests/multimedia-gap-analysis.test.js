const test = require('node:test');
const {
  expectFailure,
  mutateContract
} = require('./media-pilot-test-utils');

test('multimedia gap analysis requires deterministic scores and all selected/no-go decisions', () => {
  expectFailure(root => mutateContract(root, 'data/multimedia-gap-analysis.json', gap => {
    gap.evaluatedCandidates[0].decision = null;
  }), /selection or no-go decision/);

  expectFailure(root => mutateContract(root, 'data/multimedia-gap-analysis.json', gap => {
    gap.evaluatedCandidates[1].weightedScore = 99;
  }), /weighted score is stale/);

  expectFailure(root => mutateContract(root, 'data/multimedia-gap-analysis.json', gap => {
    gap.evaluatedCandidates = gap.evaluatedCandidates.filter(candidate => candidate.chapterSection !== 'VII');
  }), /sections I-VII/);
});
