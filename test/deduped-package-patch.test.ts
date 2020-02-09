import { test } from 'tap';
import * as protect from '../src/lib/protect';
import { readFileSync } from 'fs';

test('npm deduped packages are found and patched correctly', async (t) => {
  let answers;
  try {
    const fileContent = readFileSync('/fixtures/deduped-dep/answers.json', 'utf8');
    answers = JSON.parse(fileContent);
  } catch (err) {
    throw new Error('Could not read json file');
  }

  process.chdir(__dirname + '/fixtures/deduped-dep/');
  const res = await protect.patch(answers, false);
  t.equal(Object.keys(res.patch).length, 1, 'found and patched 1 file');
  process.chdir(__dirname);
});
