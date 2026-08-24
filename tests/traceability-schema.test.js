const { expectFailure, expectPass, json, save } = require('./traceability-test-utils');

expectPass(() => {});
expectFailure(root => {
  const data = json(root, 'data/learning-outcomes.json');
  data.learningOutcomes.push({ ...data.learningOutcomes[0] });
  save(root, 'data/learning-outcomes.json', data);
}, /duplicate IDs/i);
expectFailure(root => {
  const data = json(root, 'data/requirement-traceability.json');
  data.requirements[0].id = 'invalid_requirement';
  save(root, 'data/requirement-traceability.json', data);
}, /invalid ID/i);
expectFailure(root => {
  const data = json(root, 'data/legal-standards-register.json');
  data.records[0].officialSource = 'https://example.com/not-official';
  save(root, 'data/legal-standards-register.json', data);
}, /official source required/i);
expectFailure(root => {
  const data = json(root, 'data/requirement-traceability.json');
  data.requirements[0].approvalRef = '';
  save(root, 'data/requirement-traceability.json', data);
}, /invalid approval reference/i);
expectPass(root => {
  const data = json(root, 'data/requirement-traceability.json');
  data.requirements[0].approvalRef = 'institutional-record:fixture-only';
  save(root, 'data/requirement-traceability.json', data);
});
expectFailure(root => {
  const data = json(root, 'data/evidence-registry.json');
  data.records[0].artifact = '../README.md';
  save(root, 'data/evidence-registry.json', data);
}, /invalid logical path|escapes repository/i);
expectFailure(root => {
  const data = json(root, 'data/evidence-registry.json');
  data.records[0].inputs[0] = '../README.md';
  save(root, 'data/evidence-registry.json', data);
}, /invalid logical path|escapes repository/i);
expectFailure(root => {
  const data = json(root, 'data/evidence-registry.json');
  data.records[0].command = 'python tools/../README.md';
  save(root, 'data/evidence-registry.json', data);
}, /invalid logical path|escapes repository/i);
expectFailure(root => {
  const data = json(root, 'data/evidence-registry.json');
  data.records[0].command = 'py tools/validate_traceability.py --strict-claims';
  save(root, 'data/evidence-registry.json', data);
}, /unsupported command/i);
console.log('traceability schema: PASS');
