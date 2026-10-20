import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
await import('../scripts/build-pages.mjs');
const script=await readFile(new URL('../pages/app.js',import.meta.url),'utf8');
const adapter=script.split('const $=')[0];
function context(){const c=vm.createContext({crypto:webcrypto});vm.runInContext(adapter,c);return c;}

test('public practice respects selected subject and chapter, including short chapters',async()=>{
  const c=context();
  const quiz=await vm.runInContext('pagesRequest("/api/practice",{body:{subject:"romana",level:"mediu",focus:"gramatica"}})',c);
  assert.ok(quiz.questions.length>0&&quiz.questions.length<=6);
  assert.ok(quiz.questions.every(q=>q.id.startsWith('r')&&q.topic==='gramatica'));
  assert.ok(quiz.questions.every(q=>!('correct'in q)&&!('explanation'in q)));
  const result=await vm.runInContext('pagesRequest("/api/demo/grade",{body:{answers:Object.fromEntries(pagesActiveQuestions.map(q=>[q.id,q.correct]))}})',c);
  assert.equal(result.total,quiz.questions.length);
  assert.equal(result.score,result.total);
  assert.ok(result.questions.every(q=>q.explanation));
});
test('changing practice subject replaces the questions being graded',async()=>{
  const c=context();
  await vm.runInContext('pagesRequest("/api/practice",{body:{subject:"romana",level:"avansat",focus:"literatura"}})',c);
  const quiz=await vm.runInContext('pagesRequest("/api/demo")',c);
  assert.equal(quiz.questions.length,6);
  assert.ok(quiz.questions.every(q=>q.id.startsWith('m')));
  const result=await vm.runInContext('pagesRequest("/api/demo/grade",{body:{answers:Object.fromEntries(pagesActiveQuestions.map(q=>[q.id,(q.correct+1)%4]))}})',c);
  assert.equal(result.score,0);
  assert.equal(result.questions.length,6);
});
test('public edition blocks server connections and exposes no credential configuration',async()=>{
  const html=await readFile(new URL('../pages/index.html',import.meta.url),'utf8');
  assert.match(html,/connect-src 'none'/);
  assert.doesNotMatch(script,/re_[a-zA-Z0-9]{20,}/);
  assert.match(script,/localStorage\.removeItem\('grademint-week-plan'\)/);
});
