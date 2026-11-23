const privacyAct='Privacy and Data Protection Act 2014 (Vic)';
const healthAct='Health Records Act 2001 (Vic)';
const childScheme='Child Wellbeing and Safety Act 2005 (Vic)';
const familyScheme='Family Violence Protection Act 2008 (Vic)';
const childrenAct='Children, Youth and Families Act 2005 (Vic)';
const foiAct='Freedom of Information Act 1982 (Vic)';
const sharingAct='Victorian Data Sharing Act 2017 (Vic)';

const basis=(law, provision, why, verify, refs)=>({law,provision,why,verify,refs,kind:'legislation'});
const policy=(law, provision, why, verify, refs)=>({law,provision,why,verify,refs,kind:'policy'});
const privacy=(law,provision,why,verify,ref)=>({...basis(law,provision,why,verify,[ref]),role:'privacy'});
const ip=(provision,why,verify,ref)=>privacy(privacyAct,provision,why,verify,ref);
const hp=(provision,why,verify,ref)=>privacy(healthAct,provision,why,verify,ref);

export function hasPersonal(a){return a.information==='personal'||a.information==='mixed';}
export function hasHealth(a){return a.information==='health'||a.information==='mixed';}

export function privacyGrounds(a) {
  let personal=null,health=null;
  if (a.original==='yes') {
    personal=ip('Schedule 1, IPP 2.1 (primary purpose)','The release serves the reason for which the information was originally collected.','Confirm the original collection purpose and the proposed disclosure’s role in it.','P1');
    health=hp('Schedule 1, HPP 2.1 (primary purpose)','The disclosure serves the reason for which the health information was lawfully collected.','Confirm lawful collection and the original purpose.','H1');
  }
  if (a.expected==='yes') {
    if (a.relationship==='direct'||(a.relationship==='related'&&a.sensitive==='no'))
      personal=ip('Schedule 1, IPP 2.1(a)','The new purpose is related and the person would reasonably expect the disclosure. A directly related purpose meets the relationship limb for sensitive information.','Record the connection and the evidence for reasonable expectation.','P2');
    if (a.relationship==='direct')
      health=hp('Schedule 1, HPP 2.2(a)','The new purpose is directly related and the person would reasonably expect the disclosure.','Record both findings.','H1');
  }
  if (a.consent==='yes') {
    personal??=ip('Schedule 1, IPP 2.1(b)','The person has agreed to this specific release.','Verify valid, current consent and the person or representative’s authority.','P3');
    health??=hp('Schedule 1, HPP 2.2(b)','The person or their authorised representative has agreed to this specific release.','Verify valid, current consent and capacity or representative authority.','H1');
  }
  if (a.threat==='yes') {
    personal??=ip('Schedule 1, IPP 2.1(d)','The answers indicate a serious threat and a reasonable belief that disclosure is necessary to lessen or prevent it.','Limit the disclosure to the information needed to address the threat.','P5');
    health??=hp('Schedule 1, HPP 2.2(h)','The answers indicate a serious threat and a reasonable belief that disclosure is necessary to lessen or prevent it.','Apply any applicable Health Complaints Commissioner guidelines and confine the disclosure to the threat.','H4');
  }
  if (a.unlawful==='yes') {
    personal??=ip('Schedule 1, IPP 2.1(e)','the agency has reason to suspect unlawful activity and disclosure is necessary to investigate it or report it to a relevant person or authority.','Record the reasons for suspicion, necessity, and why the recipient is relevant.','P6');
    if (a.healthconfidence==='yes') health??=hp('Schedule 1, HPP 2.2(i) and 2.3','The answers support necessary disclosure to investigate or report suspected unlawful activity.','Make the required written note. A registered health practitioner must preserve confidence as required by the principle.','H5');
  }
  if (a.enforcement==='yes') {
    personal??=ip('Schedule 1, IPP 2.1(g) and 2.2','the agency reasonably believes the disclosure is reasonably necessary for a specified purpose by or for a law enforcement agency.','Confirm the agency and exact statutory purpose, and make the written record.','P8');
    if (a.healthconfidence==='yes') health??=hp('Schedule 1, HPP 2.2(j) and 2.3','the agency reasonably believes the disclosure is reasonably necessary for a law enforcement function by or for a law enforcement agency.','Make the written note and check the additional confidence condition for registered health practitioners.','H5');
  }
  if (a.researchNeed==='yes'&&a.researchConsent==='yes'&&a.researchControls==='yes') {
    personal??=ip('Schedule 1, IPP 2.1(c)','The answers indicate the identifiable release is necessary for public-interest research or statistics, seeking consent is impracticable, and the recipient can be expected not to disclose the data.','Record those findings and the prohibition on publication that identifies individuals.','P4');
    if (a.researchHealth==='yes'&&a.ethics==='yes') health??=hp('Schedule 1, HPP 2.2(g) and s 22 research guidelines','The answers indicate non-identifying information is insufficient and the research safeguards and approvals are in place.','Verify the statutory research guidelines are met, including any applicable review, and the restrictions on onward disclosure and identifiable publication.','H3');
  }
  if (a.healthServiceControls==='yes'&&['unable','steps'].includes(a.healthServiceData)) health??=hp('Schedule 1, HPP 2.2(f)','The answers support a specified health-service or qualifying training purpose and its safeguards.','Confirm the exact purpose, the chosen de-identification or consent condition, relevant guidelines, and publication limits.','H2');
  if (a.provider==='yes') health??=hp('Schedule 1, HPP 2.2(d) and s 85','The provider needs the information to deliver the service and the person cannot consent.','Confirm incapacity, representative availability, and why disclosure is reasonably necessary.','HS1');
  if (a.healthFamily==='yes') health??=hp('Schedule 1, HPP 2.4','The answers indicate necessary or compassionate disclosure by a health service provider to immediate family where the person cannot consent.','Confirm the recipient, scope, any reasonably discoverable wishes, and maturity where the recipient is under 18.','HS2');
  if (a.healthIdentify==='yes') health??=hp('Schedule 1, HPP 2.5','The answers indicate necessary disclosure for identification or locating an eligible relative in a specified situation.','Confirm the purpose, prior wishes where relevant, and any applicable guidelines.','HS3');
  if (a.intelCheck==='yes') personal??=ip('Schedule 1, IPP 2.1(h)','An authorised request from ASIO or ASIS points to the specific intelligence agency ground.','Verify the recipient’s written authorisation and the required certification before disclosure.','P9');
  if (a.claim==='yes') {
    health??=hp('Schedule 1, HPP 2.2(k)','Disclosure of the health information is necessary to establish, exercise, or defend a legal or equitable claim.','Verify the claim and necessity of the precise version. Establish a separate ground for other personal information.','H6');
  }
  return {personal:hasPersonal(a)?personal:null,health:hasHealth(a)?health:null};
}
export function missingPrivacy(a) {
  const g=privacyGrounds(a);
  return (hasPersonal(a)&&!g.personal)||(hasHealth(a)&&!g.health);
}

export function identify(a) {
  const results=[];
  const add=(...args)=>results.push(basis(...args));
  const addPolicy=(...args)=>results.push(policy(...args));
  if (a.request==='foi') add(foiAct,'ss 13, 17 and 21; edited access under s 25','The person has asked to use the formal freedom-of-information process.','Send to the authorised FOI team. It must check validity, document scope, exemptions, edited access, notice and review requirements, and the decision deadline.',['A1','FA5','foiex']);
  if (a.request==='order') {
    if (a.noticeType==='court') {
      results.push({kind:'instrument',law:'Court order, warrant, or subpoena',provision:'Exact authority in the instrument',why:'The demand may require production of specified material through a formal channel.',verify:'Legal must verify the instrument, service, deadline, scope, source restrictions, and any claim to privilege before production.',refs:['S1','S11']});
    } else {
      results.push({kind:'instrument',law:'Written statutory demand',provision:'Exact Act and provision on the notice',why:'An authorised body may have a power to require the material requested.',verify:'Verify the issuer, power, addressee, scope, any exception, and response deadline. The instrument determines the precise authority.',refs:['S1','S11']});
    }
    if(hasPersonal(a)) results.push(ip('Schedule 1, IPP 2.1(f)','A verified law requiring or authorising the disclosure can supply the privacy ground.','Confirm the exact requirement and approved scope.','P7'));
    if(hasHealth(a)) results.push(hp('Schedule 1, HPP 2.2(c)','A verified law requiring, authorising or permitting the disclosure may supply the health privacy ground.','Confirm the exact authority and that the prescribed-law exception is not engaged.','H1'));
  }
  if (a.request==='cdo') add(sharingAct,'s 9(2)(a) (providing data in response to an s 8 notice)'+
    (hasPersonal(a)||hasHealth(a)?' and s 15(1) (disclosing identifiable data)':''),
    'A written request from the Victorian Chief Data Officer points to the statutory notice pathway.',
    'Confirm a valid notice and responsible officer, screen restricted data and any secrecy provisions under ss 20–21, and respond within 10 business days or any agreed longer period. Provide lawful data or written reasons under ss 9 and 14.',['V2','VD1','VD2']);
  if (a.request==='adoption') add('Adoption Act 1984 (Vic)','Part VI, including s 100 where applicable','The person is seeking an adoption record or information.','Refer to the Adoption Information Service for identity, applicant role, age, consent, and any court pathway.',['S9']);
  if (a.request==='care') addPolicy('DFFH Care Leavers Access to Records Policy','Dedicated records process','The person is seeking their own out-of-home care history.','Refer to the care records team to verify identity or authority and review reporter protections and third-party information.',['S10']);
  if (a.request==='own') {
    add(foiAct,'s 16(2) or formal access under ss 13 and 17','The person is asking for their own records outside the formal FOI process.','Verify identity or authority and screen third-party material and source restrictions. Use the authorised informal access or formal FOI route.',['A7','FA1','A3']);
  }
  if (a.purpose==='child') {
    const mode=a.childRecipient==='direct'?'direct':a.childRecipient==='org'&&a.childRequest==='yes'?'request':a.childRecipient==='org'&&a.childRequest==='no'?'voluntary':'unconfirmed';
    const provision=mode==='direct'?'s 41Y':mode==='request'?'ss 41W(1), 41W(3)–(5)':mode==='voluntary'?'s 41V':'Part 6A (confirm the recipient and way the request was made)';
    add(childScheme,provision,
      mode==='direct'?'The proposed recipient is the child or their caregiver, for managing a risk to the child’s safety.':mode==='request'?'The proposed sharing responds to a request to promote a child’s wellbeing or safety. A qualifying request can require disclosure.':mode==='voluntary'?'The proposed sharing would help with a child’s wellbeing or safety on the agency’s initiative.':'The proposal concerns a child’s wellbeing or safety. The recipient and whether they requested the information determine the appropriate pathway.',
      'Confirm the actual entity roles and authorisations, source restrictions, and scheme exclusions. Complete the required record and any written reasons when applicable.',
      mode==='direct'?['C5','C6']:['C1','C2','C3','C4','SP1','SP5']);
  }
  if (a.purpose==='family') {
    const direct=a.familyRecipient==='direct', assessment=a.familyPurpose==='assessment', requested=a.familyRequest==='yes';
    const provision=direct?'ss 144M–144MA':a.familyPurpose==null||a.familyPurpose==='unsure'||!['yes','no'].includes(a.familyRequest)?'Part 5A (exact provision depends on purpose and recipient)':
      (assessment?(requested?'ss 144KB–144KC':'s 144KA'):(requested?'ss 144LB–144LC':'s 144LA'))+' and ss 144N–144ND';
    add(familyScheme,provision,direct?'The release is for a person at risk, or an eligible parent, to manage family violence risk.':'The proposed sharing concerns assessing or managing family violence risk. The request and eligible recipient determine whether a duty or permission applies.',
      'Verify the prescribed recipient’s capacity, person categories, consent or exception, safety and exclusions, and required record or written reasons.',['F1','F2','F3','F4','F5','SP2','SP5']);
  }
  if (a.purpose==='placement') add(childrenAct,'s 179(1)–(2)','The information is needed in connection with placement of a child with a person other than a parent.','Confirm the case and prospective or actual carer. Before placement provide information reasonably necessary for the choice to accept care. After placement provide the known medical status information needed for appropriate care.',['SH4']);
  if (a.purpose==='protection') add(childrenAct,'s 192(1)','A protective intervener or the Secretary needs the information to perform a child protection function or power.','Confirm the actor and recipient, the reasonable belief that disclosure is required for that function, and applicable reporter protections.',['SH5','S3']);
  if (a.purpose==='youth') add('Youth Justice Act 2024 (Vic)','Part 15.1, including ss 704(2) and 708 where applicable','The proposed release supports specified youth justice functions or case coordination.','Confirm the actor, recipient, function, and necessity before choosing the exact subsection.',['S5']);
  if (a.purpose==='regulator') add('Social Services Regulation Act 2021 (Vic)','ss 189 and 193(2)','The proposal concerns giving material to the Social Services Regulator for its functions or to decide whether further information may lawfully be shared.','Confirm the recipient is the Regulator, the agency’s relevant-agency capacity, reasonable satisfaction about the purpose and scope, and any confidentiality notice.',['S6']);
  if (a.purpose==='housing') add('Housing Act 1983 (Vic)',a.housingRegister==='yes'?'s 142J(2) (housing register disclosure)':a.housingRegister==='no'?'s 142J(1) (social housing disclosure)':'ss 142I–142J (confirm which housing purpose applies)','The request concerns social housing purposes or the Victorian Housing Register.','Confirm both parties’ roles, necessity for the specific purpose, and any register authorisation or preserved statutory prohibition.',['SH1','SH2','SH3']);
  if (a.purpose==='linkage'&&a.linkage==='yes'&&a.information!=='anonymous') add(sharingAct,'s 15(2) (disclosing identifiable data for integration)','The proposal involves matching identifiable datasets to inform government policy making, service planning, or design.','Verify the receiving body’s statutory eligibility and the agency’s responsible officer. Check secrecy, confine identifiers to integration, and check ss 18–19 for de-identification and releasing results.',['V1','V3','V4','V5']);
  const grounds=privacyGrounds(a);
  for (const ground of [grounds.personal,grounds.health]) if (ground) results.push(ground);
  if (a.audience==='public'&&a.request==='regular') {
    add(foiAct,'s 16(1)–(2) (proactive/informal access)','The proposal is to make the information available outside a formal FOI request.','Confirm that publication of the exact version is proper and authorised, including privacy, confidentiality, rights, and restrictions.',['A7','G9']);
    if(a.publication==='dataset'&&a.information==='anonymous')
      addPolicy('DataVic Access Policy','Open data default','A non-identifying dataset or table is proposed for public reuse.','Confirm rights to publish, safety, confidentiality, re-identification risk, licensing and suitable publication format.',['G4']);
    if(a.publication==='contract') addPolicy('Victorian government contract disclosure requirements','VGPB goods and services policy or Construction Instruction 5.2, as applicable','The proposed release contains awarded government contract information.','Confirm procurement category, threshold, prescribed fields, deadline, and lawful redactions.',['G6','G7']);
    if(a.publication==='report') addPolicy('Victorian financial reporting and publication requirements','Applicable Financial Reporting Direction or Standing Direction','The material is being prepared for annual reporting or corporate publication.','Confirm the correct direction, content and channel with Corporate Reporting.',['G8']);
  }
  if(a.govPurpose==='yes') addPolicy('Victorian Public Sector Data Sharing Policy','Interagency sharing and formal-request response','Another Victorian government body needs the information for policy or services with a clear public benefit.','Verify scope, exclusions, and safe handling. If formally requested under the policy, respond within 14 days with data or written reasons, and copy refusals to the Secretary, Department of Government Services. The policy does not supply a privacy ground.',['G1','G2','G3']);
  if(a.destination==='yes'&&(hasPersonal(a)||hasHealth(a))) {
    if(hasPersonal(a)) results.push(ip('Schedule 1, IPP 9.1','Personal information will be transferred to an external recipient outside Victoria.','Obtain Privacy confirmation of an applicable transfer ground and recipient safeguards.','T2'));
    if(hasHealth(a)) results.push(hp('Schedule 1, HPP 9.1','Health information will be transferred to an external recipient outside Victoria.','Obtain Privacy confirmation of an applicable transfer ground and recipient safeguards.','T2'));
  }
  return results;
}

export function releaseDetails(a,findings=identify(a)) {
  const bases=findings.filter(finding=>finding.kind==='instrument'||(finding.kind==='legislation'&&finding.role!=='privacy'));
  const privacy=findings.filter(finding=>finding.role==='privacy');
  const policy=findings.filter(finding=>finding.kind==='policy');
  const primary=bases[0];
  const schemeGuidance={label:'Victorian guidance on authorised information-sharing roles',url:'https://www.vic.gov.au/information-sharing-entity-list'};
  let approval={
    instruction:'Check the agency’s current approval arrangements and any applicable instrument of delegation or authorisation. Match the exact power or function to the decision-maker’s role.',
  };
  if (a.request==='foi') {
    approval={
      provision:`${foiAct}, s 26(1)`,
      instruction:'A formal FOI decision is made by the responsible Minister, the agency’s principal officer, or an officer acting within arrangements approved by one of them. For an officer, check the current s 26(1) authorisation and its scope.',
      source:{label:'OVIC guidance on FOI decision-makers',url:'https://ovic.vic.gov.au/freedom-of-information/foi-guidelines/section-26/'},
    };
  } else if (primary?.law===sharingAct) {
    approval={
      provision:`${sharingAct}, ss 3 and 31(3)`,
      instruction:'Check that the decision-maker is the responsible officer or that a current instrument of delegation under s 31(3) covers their role and the relevant power or duty.',
      source:{label:'Victorian Data Sharing Act',url:'https://www.legislation.vic.gov.au/in-force/acts/victorian-data-sharing-act-2017'},
    };
  } else if ([childScheme,familyScheme].includes(primary?.law)) {
    approval={
      instruction:'Check your agency’s scheme procedures for the roles authorised to share on behalf of the prescribed entity. Check any instrument of delegation or authorisation that applies to that role and provision.',
      source:schemeGuidance,
    };
  } else if (a.request==='order') {
    approval={instruction:'Use the Act and provision cited in the notice, or the authority identified in the court instrument. Confirm who is named to respond and check the agency’s current authorisation or delegation for that response.'};
  } else if (a.purpose==='housing'&&a.housingRegister==='yes') {
    approval={
      instruction:'Check written register access authorisation under s 142G(2), permitted access purposes under s 142H, and authority to disclose under s 142J(2). Check any applicable instrument of delegation for the decision-maker’s role.',
      source:{label:'Housing Act 1983',url:'https://www.legislation.vic.gov.au/in-force/acts/housing-act-1983'},
    };
  } else if (a.request==='own') {
    approval={instruction:'For informal access under s 16(2), check the agency’s administrative release arrangements. If the request is handled as formal FOI, check who can decide it under s 26(1) and the agency’s approved arrangements.'};
  } else if (primary?.law===foiAct) {
    approval={
      instruction:'Check the agency’s administrative release or publication approval arrangements and any applicable delegation or authorisation. Confirm who can approve this publication or informal release.',
      source:{label:'OVIC guidance on informal access',url:'https://ovic.vic.gov.au/freedom-of-information/foi-guidelines/section-16/'},
    };
  }
  return {bases,privacy,policy,departmentFunction:a.departmentWork==='yes'&&!bases.length,approval};
}
