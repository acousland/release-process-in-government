import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePathways} from '../pathway-tracker.mjs';
import tree from '../tree-data.mjs';
const byId=(answers,id)=>evaluatePathways(answers).find(p=>p.id===id);
test('every item starts possible with stable unique IDs and a reason',()=>{
  const items=evaluatePathways();
  assert.equal(new Set(items.map(p=>p.id)).size,items.length);
  assert.ok(items.length>=20);
  assert.ok(items.every(p=>p.status==='possible'&&p.reason&&p.refs.length));
});
test('unknown facts never rule out child or family schemes',()=>{
  for(const id of ['ciss','fviss','maram'])assert.equal(byId({context:'unsure',purpose:'service'},id).status,'possible');
});
test('a routine service purpose does not exclude a child or family context',()=>{
  assert.equal(byId({context:'both',purpose:'service'},'ciss').status,'possible');
  assert.equal(byId({context:'both',purpose:'service'},'fviss').status,'possible');
  assert.equal(byId({context:'both',purpose:'service'},'maram').status,'check');
});
test('explicit absence of child and family context narrows the schemes',()=>{
  for(const id of ['ciss','fviss','maram','cyfa']){
    const item=byId({context:'neither'},id);
    assert.equal(item.status,'excluded');assert.ok(item.evidence.includes('context'));
  }
});
test('later positive child or family facts prevent exclusion from an earlier context answer',()=>{
  assert.equal(byId({context:'neither',purpose:'child'},'ciss').status,'relevant');
  assert.equal(byId({context:'neither',purpose:'family'},'fviss').status,'relevant');
});
test('VDS remains possible until both routes are ruled out',()=>{
  assert.equal(byId({audience:'government',cdoRequest:'no'},'vds').status,'possible');
  const item=byId({audience:'government',cdoRequest:'no',information:'anonymous'},'vds');
  assert.equal(item.status,'excluded');assert.ok(item.branches.every(b=>b.status==='excluded'));
});
test('non-identifying data does not exclude a statutory CDO pathway',()=>{
  const item=byId({request:'cdo',information:'anonymous'},'vds');
  assert.equal(item.status,'relevant');assert.equal(item.branches[0].status,'relevant');
  assert.equal(item.branches[1].status,'excluded');
});
test('lack of recipient eligibility rules out only the direct integration route',()=>{
  const item=byId({audience:'government',linkage:'yes',linkageRecipient:'no'},'vds');
  assert.equal(item.status,'possible');assert.equal(item.branches[1].status,'excluded');
  assert.equal(byId({audience:'government',linkage:'yes',linkageRecipient:'unsure'},'vds').status,'check');
});
test('agreements are assessed separately and conditions remain open until checked',()=>{
  assert.equal(byId({arrangements:'mou'},'mou').status,'check');
  assert.equal(byId({arrangements:'mou'},'agreement').status,'excluded');
  assert.equal(byId({arrangements:'both',arrangementChecked:'yes'},'agreement').status,'relevant');
  assert.equal(byId({arrangements:'unsure'},'agreement').status,'check');
});
test('non-identifying data retains security and other safeguards',()=>{
  const answers={information:'anonymous',safeVersion:'yes'};
  assert.equal(byId(answers,'pdp').status,'excluded');
  assert.equal(byId(answers,'security').status,'check');
  assert.equal(byId(answers,'charter').status,'check');
  assert.equal(byId(answers,'records').status,'relevant');
});
test('re-evaluation restores statuses after Back and Start again',()=>{
  assert.equal(byId({audience:'public'},'ciss').status,'excluded');
  assert.equal(byId({audience:'government'},'ciss').status,'possible');
  assert.ok(evaluatePathways({}).every(p=>p.status==='possible'));
});
test('every reference points to an existing legal reference entry',()=>{
  const refs=new Set(Object.values(tree.pages).flatMap(page=>page.rows.map(row=>row[0])));
  for(const item of evaluatePathways())for(const ref of item.refs)assert.ok(refs.has(ref),`${item.id}: ${ref}`);
});
