const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Execute each real method without loading browser-only Lit modules.
for (const file of [
  'src/badges/template/template-badge.ts',
  'src/cards/chips-card/chips/template-chip.ts',
  'src/cards/title-card/title-card.ts',
  'src/cards/legacy-template-card/legacy-template-card.ts',
]) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ts.ScriptTarget.Latest, true);
  const cls = source.statements.find(ts.isClassDeclaration);
  const method = cls.members.find(m => ts.isMethodDeclaration(m) && m.name.getText(source) === 'isTemplate');
  assert.ok(method, file);
  const compiled = ts.transpileModule(`class Subject { ${method.getText(source)} }; Subject`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const Subject = vm.runInNewContext(compiled);

  test(`${file}: non-string YAML scalars do not throw or subscribe`, () => {
    for (const value of [0, 42, false, true, null, undefined]) {
      const subject = new Subject(); subject._config = { field: value };
      assert.equal(Boolean(subject.isTemplate('field')), false);
    }
  });
  test(`${file}: string detection retains its existing behavior`, () => {
    for (const [value, expected] of [['plain text', false], ['', false], ['{{ states("sensor.lab") }}', true], ['{% if true %}yes{% endif %}', true], ['literal { brace', true]]) {
      const subject = new Subject(); subject._config = { field: value };
      assert.equal(subject.isTemplate('field'), expected);
    }
  });
  test(`${file}: absent configuration is safe`, () => {
    assert.equal(Boolean(new Subject().isTemplate('field')), false);
  });
}
