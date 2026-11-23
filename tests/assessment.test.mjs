import test from 'node:test';
import assert from 'node:assert/strict';
import {firstStep,getStep,nextStep,result} from '../assessment.mjs';
import graph from '../question-map-data.mjs';

const defaults={audience:'government',context:'neither',request:'regular',cdoRequest:'no',purpose:'service',information:'anonymous',departmentWork:'yes',integrationControls:'yes',schemeRoles:'yes',schemeClear:'yes',youthRoles:'yes',regulatorRoles:'yes',govPurpose:'yes',arrangements:'none',limits:'no',safeVersion:'yes',rightsCheck:'yes',approval:'unsure'};
function assess(overrides={}) {
  const choices={...defaults,...overrides},answers={department:'dffh',authorityFunction:'Test service function',authorityBasis:'Verified test provision',authorityRole:'Verified test delegation entry',authorityVerified:'yes',...Object.fromEntries(Object.entries(choices).filter(([key])=>['department','authorityFunction','authorityBasis','authorityRole','authorityVerified'].includes(key)))},trail=[];
  let current=firstStep;
  while(getStep(current,answers)) {
    assert.ok(trail.length<40,'Assessment must finish');
    const value=choices[current];
    assert.ok(getStep(current,answers).options.some(o=>o.value===value),`Missing answer for ${current}`);
    const next=nextStep(current,value,answers);
    assert.ok(graph.nodes.some(n=>n.id===current),`Missing map node ${current}`);
    assert.ok(graph.edges.some(e=>e.from===current&&e.to===next&&e.answers.some(o=>o.value===value)),`Missing map branch ${current}/${value} -> ${next}`);
    answers[current]=value;trail.push(current);current=next;
  }
  return {...result(current,answers),current,answers,trail};
}
const underAct=o=>o.release.bases.some(b=>b.law.startsWith('Victorian Data Sharing Act'));

test('ordinary non-identifying sharing requires a recorded and checked underlying authority',()=>{
  const o=assess();
  assert.equal(o.current,'ready');assert.equal(underAct(o),false);
  assert.match(o.release.departmentBasis,/responsible team/);
  assert.equal(o.type,'refer');

  assert.ok(o.trail.includes('cdoRequest'));
});
for(const request of ['cdo','regular']) test(`non-identifying CDO request uses the Act: ${request}`,()=>{
  const o=assess({request,cdoRequest:'yes',cdoWriting:'yes',cdoPurpose:'yes',cdoRestricted:'no'});
  assert.equal(underAct(o),true);assert.match(o.release.bases[0].provision,/9\(2\)\(a\)/);
  assert.match(o.release.approval.provision,/31\(3\)/);
  assert.equal(o.release.departmentFunction,false);
});
test('uncertain requester is referred before ordinary release',()=>{
  assert.equal(assess({cdoRequest:'unsure'}).current,'cdo-review');
});
test('CDO operational purpose is referred and restricted data is held',()=>{
  assert.equal(assess({request:'cdo',cdoWriting:'yes',cdoPurpose:'no'}).current,'cdo-review');
  assert.equal(assess({request:'cdo',cdoWriting:'yes',cdoPurpose:'yes',cdoRestricted:'yes'}).current,'cdo-restricted');
});
for(const purpose of ['policy','research','linkage']) test(`eligible identifiable integration is detected from ${purpose}`,()=>{
  const o=assess({purpose,information:'mixed',linkage:'yes',linkageRecipient:'yes',destination:'no'});
  assert.equal(underAct(o),true);assert.match(o.release.bases[0].provision,/15\(2\)/);
  assert.equal(o.trail.includes('original'),false);
});
for(const linkageRecipient of ['no','unsure']) test(`unconfirmed analytics body cannot reach release: ${linkageRecipient}`,()=>{
  const o=assess({purpose:'policy',information:'personal',linkage:'yes',linkageRecipient});
  assert.equal(underAct(o),false);assert.ok(['ordinary-alternative','refer'].includes(o.current));
});
test('anonymous combined datasets can use the ordinary function route',()=>{
  const o=assess({purpose:'linkage',approval:'yes'});
  assert.equal(o.current,'approved');assert.equal(o.type,'refer');assert.equal(underAct(o),false);
  assert.doesNotMatch(o.title,/statutory/);assert.equal(o.release.departmentFunction,true);
});
test('policy analysis without integration still checks ordinary privacy grounds',()=>{
  const o=assess({purpose:'policy',information:'personal',linkage:'no',original:'yes',destination:'no'});
  assert.equal(underAct(o),false);assert.equal(o.release.privacy.length,1);
  assert.ok(o.trail.includes('departmentWork'));
});
test('operational personal-information route retains its privacy checks',()=>{
  const o=assess({information:'personal',original:'yes',destination:'no'});
  assert.equal(underAct(o),false);assert.equal(o.release.privacy.length,1);
  assert.equal(o.trail.includes('linkage'),false);
});
test('map question text matches the form',()=>{
  for(const node of graph.nodes){const step=getStep(node.id);if(step){assert.equal(node.title,step.title);assert.equal(node.description,step.description);}}
});
test('applicable agreements must be checked before release',()=>{
  assert.equal(assess({arrangements:'both',arrangementChecked:'no'}).current,'arrangement-review');
  assert.equal(assess({arrangements:'both',arrangementChecked:'yes'}).current,'ready');
  assert.equal(assess({arrangements:'unsure'}).current,'arrangement-review');
});

test('ordinary route completes without asking the user for legislation',()=>{
 const o=assess({authorityBasis:undefined,authorityRole:undefined,authorityFunction:undefined,authorityVerified:undefined});
 assert.equal(o.type,'refer');assert.equal(o.trail.includes('authorityCheck'),false);
 assert.equal(getStep('authorityCheck'),null);
});

for(const scenario of [
 {purpose:'child',childRecipient:'org',childRequest:'no',childAction:'yes',schemeRoles:'yes',schemeClear:'yes'},
 {purpose:'family',familyRecipient:'org',familyPurpose:'assessment',familyRequest:'no',familyNeed:'yes',familyWhose:'adult',familyConsent:'yes',schemeRoles:'yes',schemeClear:'yes'},
 {purpose:'protection',protection:'yes',protectionRole:'response'},
 {purpose:'placement',audience:'person',placement:'yes'},
 {purpose:'housing',housingParties:'yes',housingRegister:'yes',housingAuthorised:'yes',housingNeed:'yes'},
 {purpose:'youth',youth:'yes',youthRoles:'yes'},
 {purpose:'regulator',regulator:'yes',regulatorRoles:'yes'},
])test(`normal entry evaluates ${scenario.purpose} from facts and matches its map`,()=>{
 const o=assess({...scenario,approval:'yes'});
 assert.equal(o.current,'approved');assert.equal(o.type,'release');assert.ok(o.release.bases.length);
});
