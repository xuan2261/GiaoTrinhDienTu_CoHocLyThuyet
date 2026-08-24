const { expectFailure, json, save } = require('./traceability-test-utils');

expectFailure(root => {
  const data = json(root, 'data/content-learning-map.json');
  data.mappings[0].contentId = 'missing-route';
  save(root, 'data/content-learning-map.json', data);
}, /content route coverage/i);
expectFailure(root => {
  const data = json(root, 'data/quiz-learning-map.json');
  data.items[0].learningOutcomeId = 'missing-lo';
  save(root, 'data/quiz-learning-map.json', data);
}, /dangling learning outcome/i);
expectFailure(root => {
  const data = json(root, 'data/simulation-learning-map.json');
  data.mappings[0].contentIds = ['missing-route'];
  save(root, 'data/simulation-learning-map.json', data);
}, /dangling content/i);
expectFailure(root => {
  const data = json(root, 'data/requirement-traceability.json');
  data.requirements[0].evidenceIds = ['missing-evidence'];
  save(root, 'data/requirement-traceability.json', data);
}, /dangling learning outcome or evidence reference/i);
console.log('traceability referential integrity: PASS');
