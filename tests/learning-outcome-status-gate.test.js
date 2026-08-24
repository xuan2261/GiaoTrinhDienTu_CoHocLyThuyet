const { expectFailure, expectPass, json, save } = require('./traceability-test-utils');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

expectFailure(root => {
  const requirements = json(root, 'data/requirement-traceability.json');
  requirements.requirements[0].status = 'confirmed';
  requirements.requirements[0].authorityStatus = 'confirmed';
  save(root, 'data/requirement-traceability.json', requirements);
}, /authority status is not confirmed|official reviewed legal row required|missing confirmed learning outcome/i);
expectFailure(root => {
  const requirements = json(root, 'data/requirement-traceability.json');
  requirements.requirements[2].status = 'confirmed';
  requirements.requirements[2].authorityStatus = 'confirmed';
  requirements.requirements[2].legalStandardId = 'missing-legal-row';
  save(root, 'data/requirement-traceability.json', requirements);
}, /dangling legal reference/i);
expectFailure(root => {
  const requirements = json(root, 'data/requirement-traceability.json');
  const los = json(root, 'data/learning-outcomes.json');
  const legal = json(root, 'data/legal-standards-register.json');
  const evidence = json(root, 'data/evidence-registry.json');
  const quiz = json(root, 'data/quiz-learning-map.json');
  const simulations = json(root, 'data/simulation-learning-map.json');
  requirements.requirements[0].status = 'confirmed';
  requirements.requirements[0].authorityStatus = 'confirmed';
  legal.records.forEach(item => { item.reviewStatus = 'confirmed'; });
  los.learningOutcomes.forEach(item => { if (item.id !== 'lo-course-foundation') { item.status = 'confirmed'; item.authorityStatus = 'confirmed'; } });
  save(root, 'data/requirement-traceability.json', requirements);
  save(root, 'data/learning-outcomes.json', los);
  save(root, 'data/legal-standards-register.json', legal);
  save(root, 'data/evidence-registry.json', evidence);
  quiz.items.forEach(item => { if (item.learningOutcomeId === 'lo-ch1-statics') item.learningOutcomeId = 'lo-ch2-kinematics'; });
  simulations.mappings.forEach(item => { if (item.learningOutcomeId === 'lo-ch1-statics') item.learningOutcomeId = 'lo-ch2-kinematics'; });
  for (const chapter of ['ch1', 'ch2', 'ch3']) {
    const bank = json(root, `data/quiz-${chapter}.json`);
    bank.items.forEach(item => { if (item.learningOutcomeIds.includes('lo-ch1-statics')) item.learningOutcomeIds = ['lo-ch2-kinematics']; });
    save(root, `data/quiz-${chapter}.json`, bank);
  }
  save(root, 'data/quiz-learning-map.json', quiz);
  save(root, 'data/simulation-learning-map.json', simulations);
}, /confirmed learning outcome: missing assessment/i);
expectFailure(root => {
  const evidence = json(root, 'data/evidence-registry.json');
  evidence.records[0].status = 'pass';
  evidence.records[0].hash = `sha256:${'0'.repeat(64)}`;
  save(root, 'data/evidence-registry.json', evidence);
}, /artifact hash mismatch/i);
expectPass(root => {
  const los = json(root, 'data/learning-outcomes.json');
  const quiz = json(root, 'data/quiz-learning-map.json');
  const simulations = json(root, 'data/simulation-learning-map.json');
  const target = los.learningOutcomes.find(item => item.id === 'lo-ch1-statics');
  target.status = 'confirmed';
  target.authorityStatus = 'confirmed';
  target.assessmentException = 'Institutional review approved content-only evidence for this isolated fixture.';
  quiz.items.forEach(item => { if (item.learningOutcomeId === target.id) item.learningOutcomeId = 'lo-ch2-kinematics'; });
  simulations.mappings.forEach(item => { if (item.learningOutcomeId === target.id) item.learningOutcomeId = 'lo-ch2-kinematics'; });
  for (const chapter of ['ch1', 'ch2', 'ch3']) {
    const bank = json(root, `data/quiz-${chapter}.json`);
    bank.items.forEach(item => { if (item.learningOutcomeIds.includes(target.id)) item.learningOutcomeIds = ['lo-ch2-kinematics']; });
    save(root, `data/quiz-${chapter}.json`, bank);
  }
  save(root, 'data/learning-outcomes.json', los);
  save(root, 'data/quiz-learning-map.json', quiz);
  save(root, 'data/simulation-learning-map.json', simulations);
});
expectPass(root => {
  const requirements = json(root, 'data/requirement-traceability.json');
  const los = json(root, 'data/learning-outcomes.json');
  const legal = json(root, 'data/legal-standards-register.json');
  const evidence = json(root, 'data/evidence-registry.json');
  requirements.status = 'confirmed';
  requirements.requirements.forEach(item => { item.status = 'confirmed'; item.authorityStatus = 'confirmed'; });
  los.status = 'confirmed';
  los.learningOutcomes.forEach(item => { if (item.id !== 'lo-course-foundation') { item.status = 'confirmed'; item.authorityStatus = 'confirmed'; } });
  legal.status = 'confirmed';
  legal.records.forEach(item => { item.reviewStatus = 'confirmed'; });
  evidence.status = 'confirmed';
  evidence.records[0].status = 'pass';
  const artifact = path.join(root, evidence.records[0].artifact);
  const capture = fs.readFileSync(artifact, 'utf8').replace('exitCode: 1', 'exitCode: 0').replace('status: not-run', 'status: pass').replace('status: blocked', 'status: pass');
  fs.writeFileSync(artifact, capture);
  evidence.records[0].hash = `sha256:${crypto.createHash('sha256').update(capture).digest('hex')}`;
  save(root, 'data/requirement-traceability.json', requirements);
  save(root, 'data/learning-outcomes.json', los);
  save(root, 'data/legal-standards-register.json', legal);
  save(root, 'data/evidence-registry.json', evidence);
});
console.log('learning outcome status gate: PASS');
