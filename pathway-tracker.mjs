import {ordinaryAuthorityComplete} from './department-data.mjs?v=20261123-departments';
import {hasPersonal,hasHealth,isCdoRequest,identify} from './release-rules.mjs?v=20261123-departments';

// Evaluate from the current answers every time, so Back and Start again restore candidates.
// A ruled-out disclosure pathway does not remove other duties under the same Act.
export const statusLabels={possible:'Still possible',relevant:'Relevant',excluded:'Ruled out',check:'Check needed'};
const state=(status,reason,evidence=[])=>({status,reason,evidence});
const open=reason=>state('possible',reason??'No answer has ruled this out.');
const out=(reason,...evidence)=>state('excluded',reason,evidence);
const relevant=(reason,...evidence)=>state('relevant',reason,evidence);
const check=(reason,...evidence)=>state('check',reason,evidence);
const known=(a,key)=>a[key]!=null&&a[key]!=='unsure';
const picked=(a,values)=>values.includes(a.purpose);

export function evaluatePathways(a={}) {
  const items=[];
  const add=(id,label,group,assessment,refs=[],branches=[])=>items.push({id,label,group,...assessment,refs,branches});
  const childPurpose=picked(a,['child','placement','protection','youth']);
  const childContext=['children','both'].includes(a.context);
  const familyContext=['family','both'].includes(a.context)||a.purpose==='family';
  const noChildren=['neither','family'].includes(a.context)&&!childPurpose;
  const noFamily=['neither','children'].includes(a.context)&&a.purpose!=='family';
  const privacy=findingsFor(a,'privacy');
  add('pdp','Privacy and Data Protection Act 2014','Disclosure pathways',
    a.information==='anonymous'?out('You assessed this version as non-identifying, so a personal-information disclosure ground is not needed. Security duties remain.','information'):
    ['health','deceased'].includes(a.information)?out('You selected health information only, or deceased people without health information. This personal-information disclosure pathway is not the applicable test.','information'):
    hasPersonal(a)?(privacy.some(f=>f.law.startsWith('Privacy'))?relevant('A personal-information disclosure ground is supported by your answers. Confirm its conditions.','information'):relevant('This version contains personal information. An applicable disclosure ground is still needed.','information')):open(),['P1','P2','P3','R2']);
  add('health','Health Records Act 2001','Disclosure pathways',
    ['anonymous','personal','deceased'].includes(a.information)?out('Your selected version contains no identifying health information. The health-information disclosure pathway is not needed for this version.','information'):
    hasHealth(a)?relevant('This version contains health or disability information. Apply the health-information disclosure conditions.','information'):open(),['H1','R2']);

  let cdo=open('A statutory request from the Victorian Chief Data Officer has not yet been confirmed.');
  if(isCdoRequest(a)) cdo=relevant('You identified the Victorian Chief Data Officer as the requester. This route can cover non-identifying data.','request','cdoRequest');
  if(a.cdoRequest==='unsure')cdo=check('Whether this is a statutory Chief Data Officer request needs verification.','cdoRequest');
  if(a.cdoRequest==='no'||(!isCdoRequest(a)&&known(a,'request')&&a.request!=='regular')||(!isCdoRequest(a)&&known(a,'audience')&&a.audience!=='government')) cdo=out('This release was not identified as a statutory request to provide data to the Victorian Chief Data Officer.','request','cdoRequest','audience');
  if(isCdoRequest(a)&&a.cdoWriting==='no')cdo=check('The notice details have not been established. Have the request checked and preserve any response deadline.','cdoWriting');
  if(isCdoRequest(a)&&a.cdoPurpose==='no')cdo=out('The stated purpose is not informing government policy making, service planning, or design. Refer the request for a response decision.','cdoPurpose');
  if(isCdoRequest(a)&&a.cdoRestricted==='yes')cdo=out('The proposed data includes restricted material that cannot be requested under s 8. Refer the affected scope and preserve the response deadline.','cdoRestricted');
  let integration=open('Whether identifiable data will be provided to an eligible body for integration is not yet established.');
  if(a.information==='anonymous')integration=out('Section 15(2) concerns identifiable data. You assessed this version as non-identifying.','information');
  else if(known(a,'audience')&&['public','person'].includes(a.audience))integration=out('This recipient is a person or the public, rather than a qualifying data analytics body.','audience');
  else if(a.linkage==='no')integration=out('The receiving team will not combine or collate datasets for the required policy or planning purpose.','linkage');
  else if(a.linkageRecipient==='no')integration=out('The responsible team has not confirmed that the proposed recipient qualifies for this integration route. Another basis or recipient is needed.','linkageRecipient');
  else if(a.linkage==='yes'&&a.linkageRecipient==='yes')integration=relevant('Identifiable-data integration and recipient eligibility were confirmed. This route does not require a CDO request.','linkage','linkageRecipient');
  else if(picked(a,['service','publish','enforcement','unlawful','intelligence','claim','placement','health-services']))integration=out('Your selected purpose is operational delivery, publication, or another specific activity, rather than integration to inform policy, service planning, or design.','purpose');
  if(a.linkageRecipient==='unsure')integration=check('Recipient eligibility is unresolved. Keep this route open for verification.','linkageRecipient');
  const branches=[{label:'CDO request · ss 8–9',...cdo},{label:'Identifiable-data integration · s 15(2)',...integration}];
  const vds=branches.every(b=>b.status==='excluded')?out('Both routes considered by this tool are ruled out for the stated release. This does not remove restrictions on data previously received under the Act.',...cdo.evidence,...integration.evidence):
    branches.some(b=>b.status==='relevant')?relevant('At least one statutory route remains relevant. Check the notice, source restrictions, and responsible officer.'):branches.some(b=>b.status==='check')?check('A statutory route needs further verification.'):open();
  add('vds','Victorian Data Sharing Act 2017','Disclosure pathways',vds,['V1','V2','V3','V5'],branches);

  const publicAudience=a.audience==='public';
  add('ciss','Child Wellbeing and Safety Act 2005 · CISS','Disclosure pathways',
    publicAudience?out('You selected unrestricted publication. CISS is not a public publication authority.','audience'):
    noChildren?out('You said this information and sharing do not involve children.','context'):
    a.childAction==='no'?out('You said sharing would not help the child’s wellbeing or safety.','childAction'):
    a.childRecipient==='other'?out('The proposed recipient does not fit the child-sharing route selected.','childRecipient'):
    a.purpose==='child'?relevant('Child wellbeing or safety is the stated purpose. Prescribed roles, exclusions, and required records still need verification.','purpose'):open(childContext?'Children are involved. Whether the scheme’s purpose and recipient tests are met is still open.':undefined),['C1','C3','C5','SP1','SP5']);
  add('fviss','Family Violence Protection Act 2008 · FVISS','Disclosure pathways',
    publicAudience?out('You selected unrestricted publication. FVISS is not a public publication authority.','audience'):
    noFamily?out('You said there is no family violence context.','context'):
    a.familyNeed==='no'||a.familyDirect==='no'?out('You said the proposed information does not support the relevant family violence risk purpose.','familyNeed','familyDirect'):
    a.familyRecipient==='other'?out('The recipient does not fit the family violence sharing route selected.','familyRecipient'):
    a.familyThreat==='no'?out('Required agreement was not established and the serious-threat exception was not met for this version.','familyConsent','familyThreat'):
    a.purpose==='family'?relevant('Family violence risk is the stated purpose. Verify prescribed roles, exclusions, consent conditions, and records.','purpose'):open(familyContext?'Family violence is involved. The specific sharing conditions remain to be assessed.':undefined),['F1','F2','F3','F4','SP2','SP5']);
  add('cyfa','Children, Youth and Families Act 2005','Disclosure pathways',
    noChildren?out('You said the information and sharing do not involve children. Child protection and carer disclosure routes are not indicated.','context'):
    publicAudience?out('The child protection and carer routes considered here do not authorise unrestricted publication. Reporter and publication restrictions can still apply.','audience'):
    a.placement==='no'||a.protection==='no'?out('The required carer need or specific child protection function was not established for the selected route. Other CYFA restrictions still apply.','placement','protection'):
    picked(a,['placement','protection'])?relevant('You selected a carer or child protection function. Confirm the exact actor, recipient, and source protections.','purpose'):open(),['SH4','SH5','S3','S8']);
  add('foi','Freedom of Information Act 1982 (Vic)','Disclosure pathways',
    a.request==='foi'?relevant('You identified a formal FOI request. The authorised FOI team must make the access decision.','request'):
    publicAudience||a.request==='own'?relevant('Publication or informal access may engage s 16. This does not itself clear source or privacy restrictions.','audience','request'):
    known(a,'request')?out('No formal FOI or own-record access request, or public publication, was identified. This excludes the access routes considered here, not the agency’s ongoing FOI obligations.','request','audience'):open(),['A1','A7','FA1']);
  const specialist=(id,label,purposes,answer,refs)=>add(id,label,'Disclosure pathways',
    publicAudience?out('The specialist recipient and function route considered here does not cover unrestricted publication.','audience'):
    a[answer]==='no'?out('The required recipient, purpose, or necessity condition was not met. Other legal restrictions may still apply.',answer):
    picked(a,purposes)?relevant('Your selected purpose points to this route. Verify its particular recipient, necessity, and approval conditions.','purpose'):
    known(a,'purpose')?out('This is not the function identified for this release. Reassess if that function is also intended.','purpose'):open(),refs);
  specialist('housing','Housing Act 1983',['housing'],'housingParties',['SH1','SH2','SH3']);
  specialist('youth','Youth Justice Act 2024',['youth'],'youth',['S5']);
  specialist('regulator','Social Services Regulation Act 2021',['regulator'],'regulator',['S6']);
  add('adoption','Adoption Act 1984 · adoption-record access','Disclosure pathways',a.request==='adoption'?relevant('You identified an adoption-record request. Use the specialist access process.','request'):known(a,'request')?out('This was not identified as an adoption-record access request. Restrictions on adoption information may still apply.','request'):open(),['S9']);
  add('agency','Underlying agency function and legal authority','Disclosure pathways',
    a.departmentWork==='no'?out('You said sharing is not part of a function your agency is responsible for.','departmentWork'):
    a.departmentWork==='yes'?(ordinaryAuthorityComplete(a)&&a.authorityCheck==='yes'?relevant('You recorded the actual function, legal authority, and authorised role, and confirmed the responsible team’s check. Any separate privacy ground and release approval are still needed.','authorityCheck'):check('The agency function alone does not establish disclosure authority. Record and verify the actual legal basis and authorised role. A department establishment order or General Order is insufficient.','departmentWork')):open(),['I4','R1']);

  add('vps','Victorian Public Sector Data Sharing Policy','Frameworks and safeguards',
    known(a,'audience')&&a.audience!=='government'?out('The proposed recipient is not another Victorian government body.','audience'):
    a.govPurpose==='no'?out('The public-benefit policy or service need was not established.','govPurpose'):
    a.govPurpose==='yes'?relevant('A public-benefit policy or service need was confirmed. Check policy scope and any formal-request deadline.','govPurpose'):open(),['G1','G2','G3']);
  add('datavic','DataVic Access Policy','Frameworks and safeguards',
    known(a,'audience')&&!publicAudience?out('This is a controlled release to a named recipient, rather than public open data. Assess any later publication separately.','audience'):
    known(a,'publication')&&a.publication!=='dataset'?out('You did not select an open dataset, table, or public dashboard.','publication'):
    a.publication==='dataset'?relevant('You selected a dataset for public access. Check rights, licensing, metadata, restrictions, and safe outputs.','publication'):open(),['G4']);
  add('maram','MARAM framework','Frameworks and safeguards',
    noFamily?out('You said there is no family violence context.','context'):
    familyContext?check('Family violence is involved. Confirm the relevant risk assessment, safety plan, and professional responsibilities. The current form does not verify MARAM alignment.','context','purpose'):open(),['F1','SP5']);
  for(const [id,label,value] of [['mou','Memorandum of understanding (MoU)','mou'],['agreement','Data sharing agreement','agreement']]) {
    add(id,label,'Frameworks and safeguards',
      known(a,'arrangements')&&!['both',value].includes(a.arrangements)?out('You confirmed that no applicable '+label.toLowerCase()+' covers this release.','arrangements'):
      ['both',value].includes(a.arrangements)?(a.arrangementChecked==='yes'?relevant('The information owner confirmed that this release meets the current arrangement’s conditions. The legal basis is assessed separately.','arrangements','arrangementChecked'):check('An applicable arrangement was identified. Confirm its scope, currency, approvals, and handling conditions.','arrangements','arrangementChecked')):
      a.arrangements==='unsure'?check('Ask the information owner whether an applicable arrangement exists.','arrangements'):open(),['S2','R5']);
  }
  add('security','Information security classification and handling','Frameworks and safeguards',
    Object.keys(a).length?check(a.safeVersion==='yes'?'You confirmed general safe handling. The tool has not verified the agency’s actual classification or rating and its required controls.':'Confirm the agency’s security classification or rating, permitted recipients, and delivery controls. This check can apply to non-identifying data.','safeVersion'):open(),['R4']);
  add('charter','Charter of Human Rights and Responsibilities Act 2006','Frameworks and safeguards',Object.keys(a).length?check('Consider relevant rights and compatibility before deciding. The current form does not perform a separate Charter assessment.'):open(),['R4']);
  add('records','Public Records Act 1973 · decision records','Frameworks and safeguards',Object.keys(a).length?relevant('Retain the decision, version, authority, recipient, purpose, and supporting evidence through the agency’s recordkeeping process.'):open(),['R5','D5']);
  return items;
}

function findingsFor(a,role){return identify(a).filter(f=>f.role===role);}
