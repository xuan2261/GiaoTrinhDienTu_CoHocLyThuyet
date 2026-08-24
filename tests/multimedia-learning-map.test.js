const test = require('node:test');
const {
  expectFailure,
  mutateContract
} = require('./media-pilot-test-utils');

test('multimedia learning map rejects dangling LO, route, simulation, and claimed evidence', () => {
  expectFailure(root => mutateContract(root, 'data/multimedia-learning-map.json', data => {
    data.entries[0].parentLearningOutcomeId = 'lo-missing';
  }), /dangling LO/);

  expectFailure(root => mutateContract(root, 'data/multimedia-learning-map.json', data => {
    data.entries[1].contentRoutes = ['ch1-9-9'];
  }), /route mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-learning-map.json', data => {
    data.entries[2].canonicalSimulationId = 'ch1-9-9';
  }), /simulation mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-learning-map.json', data => {
    data.entries[3].evidenceStatus = 'effective';
  }), /unsupported approval or efficacy wording|must remain not-collected/);
});
