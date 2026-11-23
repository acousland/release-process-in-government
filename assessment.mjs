import {hasPersonal,hasHealth,missingPrivacy,identify,releaseDetails,isCdoRequest} from './release-rules.mjs?v=20261123-tracker';

export const stages=['Request','Information','Safeguards','Decision'];
export const firstStep='audience';
const choice=(value,label,description,next)=>({value,label,description,next});
const unsure=(next='refer')=>choice('unsure','I’m not sure','Choose this if you need to confirm the facts.',next);
const options=(stage,title,description,choices)=>({stage,title,description,options:choices,refs:[]});
const ask=(stage,title,description,yes,no='refer',unknown='refer',captions=[])=>options(stage,title,description,[
  choice('yes','Yes',captions[0]??'',yes),choice('no','No',captions[1]??'',no),unsure(unknown),
]);
const Q=stages[0], I=stages[1], S=stages[2];
const policyCheck=a=>a.audience==='government'?'govPurpose':a.audience==='public'?'publication':'limits';
const workingBasis=a=>a.request==='regular'&&!isCdoRequest(a)&&(!skillsNeeded.has(a.purpose)||(a.purpose==='linkage'&&a.information==='anonymous'))?'departmentWork':policyCheck(a);
const alertRoute=a=>a.purpose==='threat'?'threat':a.purpose==='research'?'researchNeed':
  a.purpose==='enforcement'?'enforcement':a.purpose==='unlawful'?'unlawful':a.purpose==='claim'?'claim':a.purpose==='health-services'&&hasHealth(a)?'healthReason':a.purpose==='intelligence'&&hasPersonal(a)?'intelCheck':'no-basis';
const nextPrivacy=a=>missingPrivacy(a)?'consent':workingBasis(a);
const afterConsent=a=>missingPrivacy(a)?alertRoute(a):workingBasis(a);
const afterException=a=>missingPrivacy(a)?'privacy-block':workingBasis(a);
const nextDestination=a=>hasPersonal(a)||hasHealth(a)?'destination':'safeVersion';
const skillsNeeded=new Set(['child','family','placement','protection','youth','regulator','housing','linkage']);

const purposeOptions=[
  choice('service','Deliver a service or do operational work','For example, arrange support for a client or administer an existing service.','information'),
  choice('policy','Inform government policy, service planning, or design','For example, analyse demand, compare policy options, or design a future service. This is different from delivering a service to an individual.','information'),
  choice('research','Research, statistics, or evaluation','For example, analyse outcomes or prepare a statistical extract.','information'),
  choice('linkage','Combine datasets for government policy or service planning or design','For example, match records about the same people or households.','information'),
  choice('child','Help with a child’s wellbeing or safety','For example, help another service assess a child’s needs or manage a safety risk.','childRecipient'),
  choice('family','Assess or manage family violence risk','For example, check the risk to someone or help them stay safe.','familyRecipient'),
  choice('placement','Give information to someone who may care for a child or already does','The child is being placed, or has been placed, with someone other than their parent.','placement'),
  choice('protection','Carry out a child protection function','The disclosure is needed for a particular case or statutory child protection function.','protection'),
  choice('youth','Support a youth justice case','For example, coordinate case management, planning, or services.','youth'),
  choice('regulator','Give information to the Social Services Regulator','The regulator needs the material for its work.','regulator'),
  choice('housing','Assess housing needs or manage social housing','For example, eligibility, applications, allocations, or register work.','housingParties'),
  choice('threat','Address a serious threat to someone or the public','The proposed disclosure would help lessen or prevent serious harm.','information'),
  choice('unlawful','Investigate or report suspected unlawful activity','the agency has reason to suspect unlawful activity and plans to investigate or report it.','information'),
  choice('enforcement','Help an agency investigate, enforce the law, or conduct proceedings','For example, Victoria Police investigating an offence.','information'),
  choice('health-services','Provide care, manage health services, or identify someone after an emergency','This concerns health information held in connection with care or health services.','information'),
  choice('intelligence','Respond to a request from an Australian intelligence agency','For example, a specific written request addressed to the agency.','information'),
  choice('claim','Establish, exercise, or defend a legal claim','The information is needed for an actual claim.','information'),
  choice('publish','Publish information or report on the department’s work','For example, publish figures, an annual report, or contract details.','information'),
  unsure(),
];

function definitionOfPurpose(a) {
  const priority = a.audience==='public'
    ? ['publish','research','service','threat']
    : a.audience==='person' ? ['service','child','family','placement','housing','threat']
    : ['service','policy','research','linkage','child','family','protection','housing'];
  const score=opt=>{const i=priority.indexOf(opt.value);return opt.value==='unsure'?999:i<0?90:i;};
  const hasAudience=(opt)=>{
    if (a.audience==='public') return ['service','research','publish','threat','unsure'].includes(opt.value);
    if (a.audience!=='person'&&opt.value==='placement') return false;
    if (a.audience==='person'&&['policy','linkage','regulator','intelligence'].includes(opt.value)) return false;
    return true;
  };
  return purposeOptions.filter(hasAudience).sort((a,b)=>score(a)-score(b));
}

export const steps={
  audience:options(Q,'Who would receive the information?','Choose the audience for this particular release. You’ll answer questions about the facts, and the result will identify the relevant rules.',[
    choice('government','Another Victorian government body','A Victorian department, agency, or statutory body.','context'),
    choice('person','A person or their representative','For example, a client, parent, carer, or someone asking for a record.','context'),
    choice('public','Anyone, through publication','For example, a website, dashboard, report, or open data portal.','context'),
    choice('other','Another organisation or provider','For example, a contractor, researcher, service provider, or interstate body.','context'),
    unsure(),
  ]),
  context:options(Q,'Does this information or proposed sharing involve children or family violence?','Consider the people described and the purpose of sharing. This keeps child and family violence pathways open even when your main task is routine service delivery.',[
    choice('children','Children, without a family violence context','','request'),
    choice('family','Family violence, involving adults only','','request'),
    choice('both','Children and family violence','','request'),
    choice('neither','Neither children nor family violence','','request'),
    unsure('request'),
  ]),
  request:options(Q,'How did the release come about?','Choose the description that best matches what happened. A routine email from another agency is a regular request.',[
    choice('regular','A regular request, or the agency plans to share or publish','There is no formal demand or special request for personal records.',a=>a.audience==='government'?'cdoRequest':'purpose'),
    choice('foi','The person specifically asked for freedom of information','They said they were making an FOI request, or it came through the FOI team.','foiWriting'),
    choice('order','A court or authority sent a document saying the information is required','For example, a subpoena, warrant, order, or written direction.','noticeType'),
    choice('cdo','The Victorian Chief Data Officer sent a written data request','The request is from that officer and is addressed to the department.','cdoWriting'),
    choice('adoption','Someone wants adoption records or identifying adoption information','For example, records about an adoption or their family of origin.','special-review'),
    choice('care','Someone wants records of their own time in out-of-home care','For example, records about when they were a child in care.','special-review'),
    choice('own','Someone wants their own other records without a formal request','For example, the person or an authorised representative asks for a copy.','special-review'),
    unsure(),
  ]),
  purpose:options(Q,'What is the information needed for?','Choose the main reason for this release. If the same information will be used for another purpose, assess that separately.',definitionOfPurpose),
  foiWriting:ask(Q,'Is the request in writing and clear about the records sought?','Check whether the request identifies the records. Keep the date it arrived so the access team can manage any deadline.','foi-review','foi-review','foi-review'),
  noticeType:options(Q,'Who sent the document requiring the information?','Use the sender and document heading. You do not need to interpret its legal effect.',[
    choice('court','A court or tribunal, or a warrant issued through a court','For example, a subpoena or an order to produce.','noticeReviewed'),
    choice('authority','A regulator, government authority, or another official','For example, a notice or written direction to supply information.','noticeReviewed'),
    unsure('notice-reviewed-pending'),
  ]),
  noticeReviewed:ask(Q,'Has the responsible team confirmed what the document requires?','Check for an existing written confirmation of the exact information to produce, where to send it, and when it is due.','information','notice-reviewed-pending','notice-reviewed-pending'),
  cdoRequest:ask(Q,'Does the request identify the Victorian Chief Data Officer as the requester?','Check the sender, request letter, and attachments. An ordinary agency email or a request under the VPS Data Sharing Policy is different. Non-identifying data can also be requested by the Chief Data Officer.','cdoWriting','purpose','cdo-review'),
  cdoWriting:ask(Q,'Does the written request say what data is needed, why, and how it will be handled?','Check whether it is addressed to your agency’s head or responsible officer. Record when it arrived so the statutory response period can be managed.','cdoPurpose','cdo-review','cdo-review'),
  cdoPurpose:ask(Q,'Will the data inform government policy making, service planning, or design?','For example, analyse demand or design future services. Delivering a service to an individual, or carrying out an individual enforcement action, is a different purpose.','cdoRestricted','cdo-review','cdo-review'),
  cdoRestricted:ask(I,'Could the data reveal a protected source, witness, or investigation method?','Also consider whether disclosure could prejudice national security. Give the responsible officer enough time to respond.','cdo-restricted','information','cdo-review'),
  linkage:ask(I,'Will the receiving team combine or collate two or more datasets for government policy, service planning, or design?','For example, match records about the same people to understand service needs. Identifiable data are for integration. Later analysis and release of results have separate safeguards.','linkageRecipient',a=>a.purpose==='linkage'?'ordinary-alternative':'original','refer'),
  linkageRecipient:ask(I,'Has the responsible team confirmed that this recipient can receive identifiable data for this integration project?','Use an existing written check naming the legal recipient. Under the Victorian Data Sharing Act, this must be a department Secretary or a body or person prescribed as a data analytics body. Another Victorian government body does not automatically qualify.',policyCheck,'ordinary-alternative','refer'),
  childRecipient:options(Q,'Who would receive the information about the child?','Choose the recipient for this disclosure.',[
    choice('org','A service or another organisation working with children','For example, a school or support service.','childRequest'),
    choice('direct','The child or someone responsible for or living with them','The purpose is to manage a risk to the child’s safety.','childAction'),
    choice('other','Someone else','For example, a member of the public or a different kind of recipient.','ordinary-alternative'),
    unsure(),
  ]),
  childRequest:ask(Q,'Did the other organisation ask for the information to help a child or group of children?','Choose No if the agency is considering sharing on its own initiative.','childAction','childAction'),
  childAction:ask(Q,'Would sharing help with the child’s wellbeing or safety?','For an organisation, check whether sharing may help it make a decision or plan, investigate, provide services, or manage a risk. If sharing directly with a child or caregiver, it must be to manage a risk to the child’s safety.','information','scheme-ineligible'),
  familyRecipient:options(Q,'Who would receive the family violence information?','Choose the person or organisation receiving this release.',[
    choice('org','An organisation assessing or managing the risk','For example, a service or a specialist risk assessment team.','familyPurpose'),
    choice('direct','The person at risk, or an eligible parent of a child at risk','It would help them manage their risk.','familyDirect'),
    choice('other','A different recipient','The recipient does not fit either description.','ordinary-alternative'),
    unsure(),
  ]),
  familyDirect:ask(Q,'Is it about the person posing the risk and needed to help the recipient stay safe?','If the recipient is a parent of the child at risk, confirm they are not the person of concern in relation to that child.','information','scheme-ineligible'),
  familyPurpose:options(Q,'Is the recipient establishing the risk or managing it?','An initial assessment establishes risk. Ongoing assessment can be part of managing a known risk.',[
    choice('assessment','Establish or initially assess the risk','','familyRequest'),
    choice('protection','Manage an existing risk, including ongoing assessment','','familyRequest'),
    unsure(),
  ]),
  familyRequest:ask(Q,'Did the other organisation ask for the information for that purpose?','Choose No if the agency is considering sharing on its own initiative.','familyNeed','familyNeed'),
  familyNeed:ask(Q,'Would this information support that work on family violence risk?','For an organisation asking for material to manage an existing risk, consider whether the agency reasonably believes the disclosure is necessary for that purpose.','familyWhose','scheme-ineligible'),
  familyWhose:options(I,'Whose information would be shared?','Consider everyone described in the material, including people mentioned alongside the person at risk.',[
    choice('poses','Only a person who poses, or is alleged to pose, the risk','','information'),
    choice('child','A child at risk, including adult information connected to managing or assessing that child’s risk','Verify the connection for each adult whose information is included.','information'),
    choice('adult','An adult at risk or another person connected to the situation','This includes information about a connected third party.','familyConsent'),
    choice('mixed','A mix of people and the parts cannot readily be assessed separately','The decision-maker needs to check whose information can be shared.','family-mixed'),
    unsure(),
  ]),
  familyConsent:options(I,'Has each adult at risk or other connected person agreed to this sharing?','Agreement should be informed, current, and cover this recipient and purpose. If there is no consent, a serious threat may still be relevant.',[
    choice('yes','Yes, everyone whose agreement is needed has agreed','','information'),
    choice('no','No, or consent cannot safely be sought','','familyThreat'),
    unsure(),
  ]),
  familyThreat:ask(I,'Is sharing necessary to lessen or prevent a serious threat to someone?','Consider the person’s life, health, safety, or welfare. Record the evidence for a reasonable belief that this disclosure is necessary.','information','scheme-ineligible'),
  placement:ask(Q,'Does the requested information help the carer decide or care for the child?','Before placement, consider information reasonably needed to decide whether to accept the placement. After placement, consider known medical information needed to provide appropriate care.','information','special-review'),
  protection:ask(Q,'Is the disclosure needed to carry out a specific child protection job?','Confirm it is for a particular function, duty, or power of the Secretary or a protective intervener, and the recipient’s role is known.','information','special-review'),
  youth:ask(Q,'Is sharing needed for the recipient to do their youth justice work?','For example, an official Youth Justice function or eligible case management, planning, or service delivery.','information','special-review'),
  regulator:ask(Q,'Is the material needed by the Social Services Regulator?','It should help the Regulator perform its functions, or be necessary to decide whether further information may lawfully be supplied.','information','special-review'),
  housingParties:ask(Q,'Are the two parties involved in delivering or administering the relevant social housing service?','For example, Homes Victoria and a participating registered agency or designated provider. Confirm the exact organisations and their roles.','housingRegister','special-review'),
  housingRegister:ask(Q,'Is the disclosure to establish, administer, or correct the housing register?','Choose No for a request about eligibility, priority, allocation, housing needs, tenancy management, reporting, or another operational housing function.','housingAuthorised','housingNeed'),
  housingAuthorised:ask(Q,'Is the person making the disclosure authorised to access the register for that work?','Check written authorisation under the Housing Act 1983 (Vic), s 142G(2), and permitted access purposes under s 142H. Section 142J(2) sets out when the information can be shared for register work.','information','special-review'),
  housingNeed:ask(Q,'Is this information needed for that housing task?','Confirm the recipient is doing the specific housing job and genuinely needs the fields proposed for release.','information','special-review'),
  information:options(I,'Could someone work out who the information is about?','Think about what the recipient already knows or can access. Removing names may still leave identifying combinations, small counts, dates, or free text.',[
    choice('anonymous','No, nobody can reasonably be identified','For example, an aggregate table that has been checked for small counts and linkage risk.',afterInformation),
    choice('personal','Yes, it identifies living people and contains no health information','For example, names, contact details, individual case fields, or details that can reasonably identify someone.',afterInformation),
    choice('health','Yes, it identifies people and contains health or disability information','For example, a medical condition, health service, diagnosis, treatment, or disability, without separate non-health personal information.',afterInformation),
    choice('mixed','Yes, it contains both health and other personal information','For example, a file with health details and separate personal case or administrative information.',afterInformation),
    choice('deceased','It identifies only people who have died and contains no health information','The records may still be subject to source or confidentiality restrictions.','refer'),
    unsure(),
  ]),
  original:ask(I,'Is this release for the original reason the information was collected?','For example, information collected to arrange support is being sent to the provider who will arrange that same support. Check what people were told at collection.',workingBasis,'relationship','relationship'),
  relationship:options(I,'How closely does the new use relate to the original reason for collecting it?','Think about the connection between the two purposes, based on the actual service or activity.',[
    choice('direct','Directly related','There is a close connection between the original and new purposes.','expected'),
    choice('related','Related, but not directly','There is some connection, but the new purpose goes beyond it.',a=>hasPersonal(a)?'sensitive':'consent'),
    choice('unrelated','Unrelated','','consent'),
    unsure('consent'),
  ]),
  sensitive:ask(I,'Is the personal information of one of these kinds?','Examples include race or ethnicity, political opinions, party or trade union membership, religion or philosophical beliefs, sexual preferences or practices, and criminal records.','consent','expected','consent'),
  expected:ask(I,'Would the person reasonably expect this particular sharing?','Consider what they were told, the service they received, and what they would reasonably expect about this recipient and purpose.',nextPrivacy,'consent','consent'),
  consent:ask(I,'Has the person agreed to this specific release?','Confirm the agreement is informed, voluntary, current, and covers this recipient and purpose. If a representative agreed, confirm their authority.',afterConsent,afterConsent,afterConsent),
  researchNeed:ask(I,'Is sharing identifiable information necessary for research or statistics that benefit the public?','Confirm why this exact information is necessary for the work, and who benefits from it.','researchConsent','privacy-block'),
  researchConsent:ask(I,'Is it impracticable to ask the people affected to agree?','Record the practical reason it cannot reasonably be done. A preference to skip consent is insufficient.','researchControls','privacy-block'),
  researchControls:ask(I,'Will the recipient keep the identifiable data from being shared further or published?','There must be a reasonable basis to believe the recipient will not pass the information on. Public results must avoid identifying people.','researchExtra','privacy-block'),
  researchHealth:ask(I,'Would non-identifying information be insufficient for the health research or statistics?','Consider whether aggregate or safely de-identified information could serve the research purpose.','ethics','privacy-block'),
  ethics:ask(I,'Has the research been through the applicable approval and safeguards process?','Look for confirmation from the research governance team, including ethics review where required and controls on handling, onward release, and published results.',afterException,'privacy-block'),
  threat:ask(I,'Is sharing necessary to lessen or prevent a serious threat?','Consider life, health, safety, or welfare of an individual, or public health, safety, or welfare. Record the facts that make it reasonable to believe sharing is necessary.',afterException,'privacy-block'),
  unlawful:ask(I,'Does the agency have reason to suspect unlawful activity and need to share to investigate or report it?','Check the disclosure is a necessary part of the investigation or report to someone relevant, and record the facts that support it.',enforcementNext,'privacy-block'),
  enforcement:ask(I,'Does a law enforcement agency need this information for a specific enforcement task?','For example, investigating an offence, enforcing criminal proceeds laws, protecting public revenue, addressing serious misconduct, or conducting court proceedings. Confirm the agency reasonably believes the disclosure is reasonably necessary for the specified task.',enforcementNext,'privacy-block'),
  healthconfidence:ask(I,'If a registered health practitioner is making the disclosure, can they do so without breaching confidence?','Answer Yes if this additional condition is satisfied or the discloser is not a registered health practitioner.',afterException,'privacy-block'),
  claim:ask(I,'Is this information necessary to establish, exercise, or defend the specific legal claim?','Confirm the claim and why this exact information is needed. A separate basis may be required for personal information outside the health information.',afterException,'privacy-block'),
  departmentWork:ask(I,'Is this sharing part of a job your agency is responsible for?','For example, delivering a funded service, reporting on results, or doing work assigned to your agency. Be able to explain who needs the information and why.',policyCheck,'function-review','function-review'),
  healthReason:options(I,'Why is the health information needed?', 'Choose the situation that best matches the actual disclosure.',[
    choice('management','Management, funding, planning, monitoring, evaluation, or qualifying staff training','This is about health services, or training provided by a health service provider to staff or people working with it.','healthServiceData'),
    choice('provider','Provide necessary care when the person cannot agree','The health service provider is currently providing care to the person.','provider'),
    choice('family','Help a person receive care or give information to their immediate family for compassionate reasons','The person cannot agree to the release themselves.','healthFamily'),
    choice('identify','Identify someone or locate their relative after death, disappearance, or an accident','The proposal is to help identify the person, or assist police, a coroner, or another approved body to make compassionate contact.','healthIdentify'),
    unsure(),
  ]),
  healthServiceData:options(I,'Could the health service work use non-identifying data?','Consider whether the proposed work can use an aggregate or de-identified version. Choose the condition that actually applies.',[
    choice('unable','A non-identifying version cannot serve the purpose and seeking consent is impracticable','','healthServiceControls'),
    choice('steps','Reasonable steps have been taken to remove the ability to identify individuals','','healthServiceControls'),
    choice('neither','Neither describes the release','','privacy-block'),
    unsure(),
  ]),
  healthServiceControls:ask(I,'Are publication and handling safeguards in place?','Keep any information that could reasonably identify people out of generally available publications. Confirm with the privacy or research team that any applicable health information guidelines are followed.',afterException,'privacy-block'),
  provider:ask(I,'Is the provider sharing only what is needed for care when there is no available authorised representative?','The person is incapable of agreeing, and they either have no authorised representative or it is not reasonably practicable to obtain that representative’s consent.',afterException,'privacy-block'),
  healthFamily:ask(I,'Does sharing with immediate family meet the care, capacity, and wishes checks?','The health service provider is sharing only what is necessary and reasonable for appropriate care or compassionate reasons. The person cannot consent. Check any reasonably discoverable prior wishes and whether any immediate family recipient under 18 is mature enough in the circumstances.',afterException,'privacy-block'),
  healthIdentify:ask(I,'Is this needed to identify the person or find an eligible relative?','Confirm death or disappearance is known or suspected, or the person is unable to agree after an accident or misadventure. Use only the necessary information. In missing or accident cases respect reasonably discoverable prior wishes, and follow any applicable health information guidelines.',afterException,'privacy-block'),
  intelCheck:ask(I,'Is the request from ASIO or ASIS for its functions, with written authority and certification?','Check the named officer or employee is authorised in writing to receive the information and there is a written certification by a properly authorised officer or employee linking the disclosure to the agency’s functions.',afterException,'privacy-block'),
  govPurpose:ask(S,'Does the Victorian government recipient need the information for policy or services with a clear public benefit?','For example, the agency explains how the data would help plan, design, improve, or deliver a service for Victorians.','limits','limits','limits'),
  publication:options(S,'What are you proposing to publish?','This helps identify whether specific publication rules may also apply.',[
    choice('dataset','A dataset, table, or public dashboard','For example, aggregate figures intended for public reuse.','limits'),
    choice('contract','Details of an awarded government contract','','limits'),
    choice('report','A statutory annual report or corporate disclosure','','limits'),
    choice('other','Something else','','limits'),
    unsure('limits'),
  ]),
  arrangements:options(S,'Is there an existing MoU or data sharing agreement for this release?','Check with the information owner. An arrangement must cover the actual parties, data, and purpose, and its conditions must be checked separately from legal authority.',[
    choice('none','No applicable MoU or data sharing agreement','','limits'),
    choice('mou','An MoU applies','','arrangementChecked'),
    choice('agreement','A data sharing agreement applies','','arrangementChecked'),
    choice('both','Both apply','','arrangementChecked'),
    unsure('arrangement-review'),
  ]),
  arrangementChecked:ask(S,'Has the information owner confirmed this release meets the arrangement’s conditions?','Check it is current and covers the parties, data, and purpose. Confirm approvals, secure handling, retention, onward sharing, and any limits on linking or publication.','limits','arrangement-review','arrangement-review'),
  limits:ask(S,'Is there a known restriction on sharing this material?','Look for a court order, a promise of confidentiality, a limit in a data-sharing agreement, protected reporter details, or a risk of harm or prejudice to an investigation. Ask the record owner if uncertain.','limitsResolved',nextDestination,'source-hold'),
  limitsResolved:ask(S,'Has the team responsible for that restriction confirmed this version can be shared?','Use a written decision about the exact fields and recipient. If the restriction applies to only some material, narrow the version and assess it again.',nextDestination,'source-hold','source-hold'),
  destination:ask(S,'Will an external recipient outside Victoria receive or access this personal or health information?','Include service providers, remote support and administrators, and access to hosted data. Choose No if the release contains no personal or health information.','transferChecked','safeVersion','transfer-review'),
  transferChecked:ask(S,'Has a privacy reviewer confirmed the transfer can happen and the recipient protects the information?','Check for a written decision covering this recipient, location, exact data, and safeguards.','safeVersion','transfer-review','transfer-review'),
  safeVersion:ask(S,'Is the version limited to what is needed and ready to send safely?','Confirm the intended recipient or publication channel, only necessary fields, secure delivery or controlled access, and any agreed limits on reuse, linking, or onwards sharing.','approval','safety-hold','safety-hold'),
  approval:options(S,'Has someone with the authority to decide approved this exact release?','Use the Act and provision identified for your release to check who can decide. Confirm the approval covers the exact information, recipient, and purpose.',[
    choice('yes','Yes, I’ve checked their authority and they’ve approved this release','','approved'),
    choice('no','No, approval is still needed','','ready'),
    choice('unsure','I’m not sure who can approve or whether they’ve approved it','','ready'),
  ]),
};

function afterInformation(a) {
  if (a.request==='order'||isCdoRequest(a)) return policyCheck(a);
  if (a.purpose==='linkage'&&a.information==='anonymous') return workingBasis(a);
  if (a.purpose==='linkage'||(a.audience==='government'&&['policy','research'].includes(a.purpose)&&a.information!=='anonymous')) return 'linkage';
  if (skillsNeeded.has(a.purpose)) return policyCheck(a);
  if (a.information==='anonymous') return workingBasis(a);
  return 'original';
}
function enforcementNext(a) {
  return hasHealth(a)?'healthconfidence':afterException(a);
}
function optionsFor(id,a) {
  const source=steps[id]?.options;
  const possible=typeof source==='function'?source(a):source??[];
  return possible.map(opt=>({...opt,next:opt.next==='researchExtra'?(hasHealth(a)?'researchHealth':workingBasis):opt.next}));
}
export function getStep(id,a={}) {
  return steps[id]?{...steps[id],options:optionsFor(id,a)}:null;
}
export function nextStep(id,value,answers={}) {
  const a={...answers,[id]:value};
  const next=optionsFor(id,a).find(o=>o.value===value)?.next;
  if (!next) return null;
  const destination=typeof next==='function'?next(a):next;
  return destination==='limits'&&!['arrangements','arrangementChecked'].includes(id)?'arrangements':destination;
}

const messages={
  refer:['refer','More information is needed','The answers so far leave a material fact unresolved. Confirm the flagged facts before arranging any release.'],
  'foi-review':['refer','Send this to the formal access team','The request points to the freedom-of-information process. The authorised team will check the request and make the access decision.'],
  'special-review':['refer','Use the specialist records or sharing team','The result identifies the likely process from the facts so far. Ask the team responsible for the record to determine what can be provided.'],
  'notice-reviewed-pending':['refer','Have the written demand checked promptly','Give the instrument to the responsible team. Confirm the scope, delivery instructions and deadline before providing any information.'],
  'cdo-review':['refer','Have the written data request checked','Confirm it is a valid notice and identify any deadline, restrictions, or reasons for withholding before responding.'],
  'cdo-restricted':['hold','Hold the restricted material','The Chief Data Officer notice route does not cover restricted data. Refer the affected fields and preserve the statutory response deadline.'],
  'ordinary-alternative':['refer','A different sharing basis is needed','The answers do not support this specific route. Check another purpose or, if appropriate, reassess a narrower version.'],
  'scheme-ineligible':['hold','Hold the information under this route','A condition of the likely sharing route has not been established. Check whether a different route applies or a narrower version can be shared.'],
  'family-mixed':['refer','Check whose information can be shared','Separate information about the different people and ask the responsible team to confirm consent or an exception for each person.'],
  'no-basis':['hold','A release ground was not established','The answers did not establish an applicable ground for every type of identifiable information. Reassess a non-identifying version or refer for another possible authority.'],
  'privacy-block':['hold','A privacy condition has not been met','Hold the proposed version. The release needs a supported ground for every type of identifiable information, or a lawful narrower version.'],
  'source-hold':['hold','Hold until the source restriction is resolved','Ask the record owner or relevant specialist to confirm the permission in writing, or assess a version that excludes any protected material.'],
  'transfer-review':['refer','Confirm the transfer before release','Ask Privacy to review who will have access outside Victoria, the applicable transfer ground, and the safeguards.'],
  'function-review':['refer','Confirm why the agency is sharing','Ask the record owner to confirm the departmental function and why the proposed recipient needs this information.'],
  'arrangement-review':['refer','Confirm the sharing arrangements','Ask the information owner to identify any applicable MoU or data sharing agreement and confirm its conditions for this exact release. An agreement does not replace the legal basis.'],
  'safety-hold':['hold','Hold until the release is ready to send safely','Limit the version to what is needed and confirm the recipient, delivery channel, and safeguards.'],
};

export function result(id,a) {
  const findings=identify(a);
  const release=releaseDetails(a,findings);
  const formal=a.request==='order'||isCdoRequest(a);
  const must= a.request==='order'||a.purpose==='placement'||
    (a.purpose==='child'&&a.childRecipient==='org'&&a.childRequest==='yes')||
    (a.purpose==='family'&&a.familyRecipient==='org'&&a.familyRequest==='yes');
  if (!['approved','ready'].includes(id)) {
    const [type,title,description]=messages[id]??messages.refer;
    return {type,title,description,findings,release};
  }
  if (!findings.some(finding=>finding.kind!=='policy')&&a.audience!=='public'&&a.information==='anonymous') {
    findings.unshift({kind:'context',law:'Ordinary departmental sharing',provision:'Provisional basis: authority for the underlying departmental function',why:'The version was assessed as genuinely non-identifying. These answers do not establish a Victorian Data Sharing Act pathway or another standalone disclosure provision. Non-identifying data can still fall within a statutory Chief Data Officer request.',verify:'Confirm the function, requester, purpose, source restrictions, and approval before finalising the basis. If the requester or purpose changes, reassess the applicable pathway.',refs:['I4','R1','R2','V1','V2','V3']});
  }
  if (id==='ready') {
    return {type:'refer',title:must?'Possible duty to disclose · confirmation pending':'Release pathway identified · approval pending',description:'Use the basis below to prepare the decision. Confirm who has authority and send them the exact version, recipient, and purpose for approval before release.',findings,release,approvalStatus:'pending'};
  }
  if (must||formal||release.bases.some(b=>b.law==='Victorian Data Sharing Act 2017 (Vic)')||(skillsNeeded.has(a.purpose)&&a.information!=='anonymous')) {
    return {type:'release',title:must?'A duty to disclose may apply':isCdoRequest(a)?'A statutory response pathway applies':'A possible statutory sharing pathway applies',description:'Use the basis below for the approved scope. Confirm the specified conditions and any required records or notice with the responsible officer before sending the information.',findings,release,approvalStatus:'recorded'};
  }
  return {type:'release',title:'The answers support the proposed release',description:'The result identifies the basis and checks for this approved version. Record the exact purpose and recipient, the decision, and the reasons before release.',findings,release,approvalStatus:'recorded'};
}

