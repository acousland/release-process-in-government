import test from 'node:test';
import assert from 'node:assert/strict';
import {all,any,legalConditions} from '../legal-conditions.mjs';
import {identify,privacyGrounds} from '../release-rules.mjs';
import {evaluatePathways} from '../pathway-tracker.mjs';
import {result} from '../assessment.mjs';
const vds=a=>identify(a).filter(f=>f.law.startsWith('Victorian Data Sharing'));
const cdo={department:'dffh',request:'cdo',cdoWriting:'yes',cdoPurpose:'yes',cdoRestricted:'no',information:'anonymous'};
const integration={department:'dffh',request:'regular',cdoRequest:'no',purpose:'linkage',information:'personal',linkage:'yes',linkageRecipient:'yes',integrationControls:'yes'};
test('three-valued AND and OR preserve unknowns and decisive answers',()=>{
 for(const a of [true,false,null])for(const b of [true,false,null]){
  assert.equal(all(a,b),a===false||b===false?false:a===true&&b===true?true:null);
  assert.equal(any(a,b),a===true||b===true?true:a===false&&b===false?false:null);
 }
});
test('CDO purpose, notice, restrictions, and source eligibility gate the same basis everywhere',()=>{
 assert.equal(vds(cdo).length,1);
 for(const changed of [{cdoWriting:'no'},{cdoWriting:'unsure'},{cdoPurpose:'no'},{cdoRestricted:'yes'},{department:'other'}]){
  const a={...cdo,...changed};assert.equal(vds(a).length,0);
  assert.notEqual(result('approved',a).type,'release');
  assert.notEqual(evaluatePathways(a).find(p=>p.id==='vds').branches[0].status,'relevant');
 }
 assert.match(vds({...cdo,department:'other',sharingBody:'designated'})[0].provision,/optional response/);
});
test('direct integration can succeed without a CDO request and every required fact matters',()=>{
 assert.match(vds(integration)[0].provision,/15\(2\)/);
 for(const field of ['linkage','linkageRecipient','integrationControls'])for(const value of ['no','unsure',undefined]){
  const a={...integration,[field]:value};assert.equal(vds(a).length,0);assert.notEqual(result('approved',a).type,'release');
 }
 assert.equal(vds({...integration,information:'anonymous'}).length,0);
});
test('child and family sharing require roles and exclusion screening before becoming a release basis',()=>{
 const cases=[{purpose:'child',childRecipient:'org',childRequest:'no',childAction:'yes'}, {purpose:'family',familyRecipient:'org',familyPurpose:'assessment',familyRequest:'yes',familyNeed:'yes',familyWhose:'adult',familyConsent:'yes'}];
 for(const facts of cases){const a={...facts,schemeRoles:'yes',schemeClear:'yes'};
  assert.equal(legalConditions(a)[facts.purpose].state,true);
  for(const field of ['schemeRoles','schemeClear'])for(const value of ['no','unsure',undefined])assert.equal(identify({...a,[field]:value}).some(f=>f.law.includes(facts.purpose==='child'?'Child Wellbeing':'Family Violence')),false);
 }
});
test('housing register requires both access authorisation and necessary relevant information',()=>{
 const a={housingParties:'yes',housingRegister:'yes',housingAuthorised:'yes',housingNeed:'yes'};
 assert.equal(legalConditions(a).housing.state,true);
 assert.equal(legalConditions({...a,housingNeed:undefined}).housing.state,null);
 assert.equal(legalConditions({...a,housingAuthorised:'no'}).housing.state,false);
});
test('privacy alternatives retain their exact AND conditions',()=>{
 for(const information of ['personal','health','mixed']){
  assert.equal(Boolean(privacyGrounds({information,relationship:'direct',expected:'no'}).personal),false);
  assert.equal(Boolean(privacyGrounds({information,relationship:'direct',expected:'yes'}).health),information!=='personal');
 }
 assert.equal(privacyGrounds({information:'personal',relationship:'related',expected:'yes',sensitive:'yes'}).personal,null);
 assert.ok(privacyGrounds({information:'personal',relationship:'related',expected:'yes',sensitive:'no'}).personal);
 const research={information:'mixed',researchNeed:'yes',researchConsent:'yes',researchControls:'yes',researchHealth:'yes',ethics:'yes'};
 assert.ok(privacyGrounds(research).personal&&privacyGrounds(research).health);
 assert.equal(privacyGrounds({...research,researchConsent:'no'}).health,null);
 assert.equal(privacyGrounds({information:'health',healthServiceData:'steps',healthServiceControls:'no'}).health,null);
 assert.equal(privacyGrounds({information:'health',threat:'yes'}).health,null);
 assert.ok(privacyGrounds({information:'health',threat:'yes',healthThreatGuidelines:'yes'}).health);
 assert.equal(identify({request:'order',noticeReviewed:'no',information:'mixed'}).some(f=>f.role==='privacy'),false);
});
