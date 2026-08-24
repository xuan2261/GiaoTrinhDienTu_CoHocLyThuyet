const test = require('node:test');
const {
  expectFailure,
  mutateContract,
  mutatePacket
} = require('./media-pilot-test-utils');

test('multimedia content contracts reject modality, route, objective, and packet drift', () => {
  expectFailure(root => mutateContract(root, 'data/multimedia-content-contracts.json', data => {
    data.contracts[1].modality = 'animated-figure';
  }), /modality mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-content-contracts.json', data => {
    data.contracts[2].contentRoutes = ['ch1-9-9'];
  }), /route mismatch/);

  expectFailure(root => mutateContract(root, 'data/multimedia-content-contracts.json', data => {
    data.contracts[0].localObjective.criterion = '';
  }), /objective criterion/);

  expectFailure(root => mutatePacket(root, 3, packet => {
    packet.authoring.storyboard = [];
  }), /missing storyboard/);
});
