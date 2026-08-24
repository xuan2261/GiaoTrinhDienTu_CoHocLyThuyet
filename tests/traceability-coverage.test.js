const { expectFailure, json, save } = require('./traceability-test-utils');

expectFailure(root => {
  const data = json(root, 'data/quiz-learning-map.json');
  data.items[0].questionHash = '0'.repeat(64);
  save(root, 'data/quiz-learning-map.json', data);
}, /stale question hash/i);
expectFailure(root => {
  const data = json(root, 'data/quiz-learning-map.json');
  data.items.pop();
  save(root, 'data/quiz-learning-map.json', data);
}, /legacy no-ID sidecar or missing question/i);
expectFailure(root => {
  const data = json(root, 'data/quiz-learning-map.json');
  delete data.items[0].id;
  save(root, 'data/quiz-learning-map.json', data);
}, /invalid ID|unexpected or missing fields/i);
expectFailure(root => {
  const bank = json(root, 'data/quiz-ch1.json');
  bank.items.pop();
  save(root, 'data/quiz-ch1.json', bank);
  const map = json(root, 'data/quiz-learning-map.json');
  map.items = map.items.filter(item => !(item.sourceFile === 'data/quiz-ch1.json' && item.sourceIndex === 99));
  save(root, 'data/quiz-learning-map.json', map);
}, /expected 100 questions/i);
expectFailure(root => {
  const data = json(root, 'data/simulation-learning-map.json');
  data.mappings.pop();
  save(root, 'data/simulation-learning-map.json', data);
}, /Sim2 parity/i);
console.log('traceability coverage: PASS');
