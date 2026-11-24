const authorised = {
  "foi": "https://content.legislation.vic.gov.au/sites/default/files/2026-08/82-9859aa115-authorised.pdf",
  "vds": "https://content.legislation.vic.gov.au/sites/default/files/55621f6c-5972-363c-be02-1db29da69bcc_17-60aa002%20authorised.pdf",
  "pdp": "https://content.legislation.vic.gov.au/sites/default/files/2026-09/14-60aa034-authorised.pdf",
  "health": "https://content.legislation.vic.gov.au/sites/default/files/2026-04/01-2aa050-authorised.pdf",
  "ciss": "https://content.legislation.vic.gov.au/sites/default/files/2026-09/05-83aa048-authorised.pdf",
  "fviss": "https://content.legislation.vic.gov.au/sites/default/files/2026-11/08-52aa071-authorised.pdf",
  "cyfa": "https://content.legislation.vic.gov.au/sites/default/files/2026-10/05-96aa149-authorised.pdf",
  "housing": "https://content.legislation.vic.gov.au/sites/default/files/2025-08/83-10020aa082-authorised.pdf",
  "youth": "https://content.legislation.vic.gov.au/sites/default/files/2026-09/24-32aa009-authorised.pdf",
  "regulator": "https://content.legislation.vic.gov.au/sites/default/files/2026-10/21-37aa009-authorised.pdf",
  "adoption": "https://content.legislation.vic.gov.au/sites/default/files/2025-09/84-10150aa077-authorised.pdf",
  "crime": "https://content.legislation.vic.gov.au/sites/default/files/2025-05/14-54aa004-authorised.pdf"
}

const groups = {
  vds: {
    'ss 3, 5, 8 and 31(1)': [
      ['s 8(1)', 12, 'The statutory CDO gives the request to the responsible officer.', 'may give a written notice'],
      ['s 31(1)', 27, 'The CDO can delegate the request power by instrument to a person employed or engaged by the administering department.'],
      ['s 5', 10, 'The data must be handled to inform government policy making, service planning, and design.'],
      ['s 3(1)', 4, 'The Act defines the CDO as the person appointed to the statewide statutory role. See section 6 for the appointment power.'],
      ['s 6', 11, 'This establishes the appointment power for the statutory CDO.'],
    ],
    'ss 3 and 8(1)–(3)': [
      ['s 8(1)–(3)', 12, 'The notice identifies held data, the reasons, and how it will be handled. The CDO cannot request restricted data.', 'must not request restricted data'],
      ['s 3(1)', 8, 'The definition of restricted data spans these pages.'],
    ],
    'ss 14, 15(1), 20 and 21': [
      ['s 15(1)', 17, 'A responsible officer can disclose identifiable data to the CDO in response to a section 8 request.', 'in response to a request under section 8'],
      ['ss 9 and 10', 12, 'A data sharing body responds in writing. A designated body can decide whether to respond.'],
      ['s 14', 15, 'The responsible officer can refuse to provide data and must follow the written reasons process in section 9 where it applies.'],
      ['ss 20 and 21', 18, 'These provisions cover the secrecy rule for disclosure to the CDO and the duty to tell the CDO of a known relevant secrecy provision.'],
    ],
    'ss 3, 5 and 15(2)': [
      ['s 15(2)', 17, 'A responsible officer can disclose identifiable data directly to a data analytics body for integration, subject to section 5.', 'for the purpose of data integration'],
      ['s 3(1)', 5, 'Integration involves combining or collating data from at least two datasets.'],
      ['s 5', 10, 'The statutory purpose is government policy making, service planning, and design.'],
    ],
    'ss 3, 15(2) and 31(2)–(3)': [
      ['s 3(1)', 4, 'A departmental Secretary qualifies as a data analytics body. Other categories must be prescribed where relevant.'],
      ['s 15(2)', 17, 'The responsible officer of the sending body is the statutory actor.'],
      ['s 31(2)–(3)', 27, 'A departmental Secretary or the responsible officer can delegate their relevant powers or duties by instrument.'],
    ],
    'ss 17–24': [
      ['ss 17 and 18', 17, 'The Act provides for using identifiable data for integration and taking reasonable steps to de-identify it before using it for analytics.'],
      ['s 19', 18, 'Disclosed results must contain only de-identified data.'],
      ['s 24', 20, 'The Act preserves obligations under the two privacy Acts except where Part 4 expressly provides otherwise.'],
    ],
  },
  pdp: {
    'Schedule 1, IPP 2.1': [
      ['IPP 2.1(a)–(h)', 144, 'This provision sets out the secondary-purpose exceptions to the original-purpose rule.', 'other than the primary purpose of collection unless'],
      ['IPP 2.2', 146, 'This is the written note requirement for law enforcement disclosure under IPP 2.1(g).'],
    ],
    'Schedule 1, IPPs 4, 7 and 9': [
      ['IPP 4.1', 147, 'The organisation must take reasonable steps to protect personal information.', "must take reasonable steps to protect"],
      ['IPP 7.3', 151, 'Check when an identifier assigned by another organisation can be used or disclosed.'],
      ['IPP 9.1', 152, 'This principle sets out conditions for transferring personal information outside Victoria.'],
    ],
  },
  health: {
    'Schedule 1, HPP 2': [
      ['HPP 2.1 and 2.2', 114, 'These provisions distinguish the lawful original collection purpose from specified secondary purposes.', 'unless at least one of the following paragraphs applies'],
      ['HPP 2.3–2.5', 118, 'Read the written note requirement and the distinct grounds for family, identification, and related disclosures.'],
    ],
    'Schedule 1, HPPs 4, 7 and 9': [
      ['HPP 4.1', 121, 'Health information must be protected through reasonable security steps.', "must take reasonable steps to protect"],
      ['HPP 7', 126, 'The principle sets out identifier rules and relevant exceptions.'],
      ['HPP 9.1', 128, 'This principle sets out conditions for transferring health information outside Victoria.'],
    ],
  },
  ciss: {
    'ss 41P–41T': [
      ['ss 41P and 41Q', 201, 'Read the definition of confidential information and the exclusions beginning on the following page.'],
      ['ss 41R–41T', 203, 'Check prescribed status and any limits on the entity or its functions.', "Meaning of information sharing entity"],
    ],
    'ss 41V and 41W': [
      ['s 41V', 207, 'The voluntary route turns on child wellbeing or safety and reasonable belief that disclosure may assist a listed activity.', 'promoting the wellbeing or safety'],
      ['s 41W', 208, 'The requested route sets out when disclosure is required and where exceptions apply.'],
    ],
    'ss 41Q and 41Y': [
      ['s 41Q', 202, 'Check whether the proposed information is excluded.'],
      ['s 41Y(1)', 209, 'This provision identifies the child and carers who can receive confidential information directly.', "a person who has parental responsibility"],
    ],
    's 41Y': [
      ['s 41Y(1)–(2)', 209, 'This pathway is limited to managing a risk to the child’s safety, including limits on the recipient’s use or disclosure.', "managing a risk to a child's safety"],
    ],
  },
  fviss: {
    'ss 144C–144D, 144K and 144L': [
      ['ss 144C and 144D', 203, 'Check the exclusions and what makes the sender or recipient a qualifying entity.', "Meaning of excluded information"],
      ['ss 144K and 144L', 209, 'The assessment and protection divisions cover different information and roles. The protection division starts two pages later.'],
    ],
    'ss 144N–144ND': [
      ['ss 144N–144NB', 213, 'Check the rules for persons of concern, adult primary persons, and linked persons.'],
      ['ss 144NC and 144ND', 215, 'Check child-related consent exceptions and the treatment of disclosures where consent is not given.', "without the consent of any person"],
    ],
    'ss 144KA–144KC and 144LA–144LC': [
      ['ss 144KA–144KC', 209, 'The assessment provisions cover voluntary disclosure, requests, and obligations to respond.', "not excluded information"],
      ['ss 144LA–144LC', 211, 'The protection provisions set out the parallel voluntary and requested routes and the applicable necessity and exception tests.'],
    ],
    'ss 144C and 144M': [
      ['s 144M', 213, 'An eligible entity may disclose within the direct-to-primary-person or eligible-parent route for protection.', 'for a family violence protection purpose'],
      ['s 144C', 203, 'Read the excluded-information definition.'],
      ['s 144MA', 213, 'This section limits recipient onward disclosure.'],
    ],
  },
  cyfa: {
    's 179': [['s 179(1)–(2)', 171, 'The provision identifies the Secretary or provider as responsible when intending to place, or having placed, a child with someone other than their parent.', "intends to place"]],
    's 179(1)–(2)': [['s 179(1)–(2)', 172, 'A prospective carer needs information to make an informed choice. A carer after placement must receive known information about the child’s medical status.', 'to make an informed decision']],
    's 192(1)–(2)': [['s 192(1)–(2)', 182, 'The first subsection permits disclosure by the Secretary or protective intervener for the function it specifies. The second deals with a person disclosing in response to their request.', "on reasonable grounds that it is required"]],
    'ss 41, 190–192 and 534': [
      ['s 41', 118, 'Reporter or referrer identity is protected subject to statutory exceptions.'],
      ['ss 190–192', 179, 'Check the evidence, confidentiality, and disclosure provisions together.'],
      ['s 534', 390, 'Check restrictions before publishing material relating to proceedings.'],
    ],
  },
  housing: {
    'ss 142I–142J': [['ss 142I and 142J', 117, 'These provisions define who and what are in scope and when collection, use, and disclosure are allowed.', "relevant information means"]],
    's 142J(1)–(2)': [
      ['s 142J(1)–(2)', 117, 'Confirm the particular listed purpose and the authorisation requirement for the register route.', "necessary for any of the following"],
      ['s 142G', 115, 'This section deals with authorisation for access to the register.'],
    ],
    's 142J(3)': [['s 142J(3)', 119, 'The disclosure permission preserves applicable prohibitions under other Acts.']],
  },
  youth: {
    'ss 701–705 and 708': [
      ['ss 701–703', 645, 'Check official duties, official persons, and information holders.', "What is an official duty?"],
      ['ss 704–705', 649, 'Read the requested and voluntary routes and the particular parties each covers.'],
      ['s 708', 652, 'This section addresses separate case-planning and related disclosure purposes.'],
    ],
    'ss 704–708': [
      ['ss 704–705', 649, 'Check the necessity test for the applicable official duty and the exact requested or voluntary pathway.', 'reasonably necessary'],
      ['s 708', 652, 'Check the particular purposes and recipients in the case-planning pathway.'],
    ],
  },
  regulator: {
    'ss 189 and 193(2)': [
      ['s 189', 169, 'The definition lists the relevant agencies.'],
      ['s 193(2)', 174, 'The provision covers information held by a relevant agency and disclosure to the Regulator.', "held by the relevant agency"],
    ],
    's 193(2)(a)–(b)': [
      ['s 193(2)(a)–(b)', 174, 'Check the reasonably required function ground or the necessity of determining if further information can lawfully be disclosed.', "reasonably required for the performance"],
      ['s 195', 175, 'This is a separate duty of relevant agencies to assist the Regulator.'],
    ],
    'Part 8, including s 201': [['s 201', 180, 'Read the Regulator’s confidentiality notice power and the effect of a notice.', "may issue a confidentiality notice"]],
  },
  foi: {
    'ss 13, 17–21 and 26': [
      ['s 17', 63, 'The Act sets out the request form and information needed to identify the document.', "shall make a request in writing"],
      ['s 21', 66, 'This section sets out decision timing and extensions.'],
      ['s 26', 78, 'The section identifies who may make the decision for an agency.'],
    ],
    'ss 25, 27 and 28–38': [
      ['s 25', 74, 'Check edited access where deletions are practicable and the applicant would want an edited copy.'],
      ['s 27', 78, 'This is the decision notice provision.'],
      ['Part IV, s 38', 110, 'Assess exemptions, including source secrecy under section 38, against the particular document.'],
    ],
    'ss 27, 29, 29B, 31 and 33–35 as applicable': [
      ['s 27', 78, 'Check notice requirements.'],
      ['s 33', 96, 'Check personal-affairs consultation and any restriction on granting access before review rights expire. Check the other exemptions separately where relevant.'],
    ],
    'ss 7, 8 and 16': [
      ['s 7', 48, 'Check publication requirements for information about agencies and their functions.'],
      ['s 8', 52, 'Check public inspection and access to relevant agency documents.'],
      ['s 16(2)', 62, 'The Act allows for other proper or legally required publication or access.'],
    ],
    's 16 and applicable source and privacy law': [
      ['s 16(2)', 62, 'Check whether the agency can properly give access outside the formal process. The relevant secrecy, privacy, and source law depends on the information.', 'can properly do so'],
    ],
  },
  adoption: {
    'Part VI': [
      ['ss 92–94', 127, 'Check access rules for birth certificates and for adopted people of different ages.', "Persons entitled to birth certificates"],
      ['ss 95–98', 132, 'Check the specific rules for birth parents, relatives, and adoptive parents.'],
      ['ss 99–100', 139, 'Read the court and other-person pathways.'],
    ],
  },
  crime: {
    'ss 5, 7 and 7A': [
      ['s 5', 8, 'Check the Chief Statistician’s statutory functions.', "to publish and release statistical information"],
      ['ss 7 and 7A', 9, 'These access powers cover specified law enforcement and applicable court data.'],
    ],
    'Applicable source and privacy law': [
      ['ss 5, 7 and 7A', 8, 'These provisions help identify the recipient’s function and access powers. Apply the actual source and privacy rules that cover the sender and extract.'],
    ],
  },
};

export function provisionsFor(act, decision) {
  return groups[act][decision].map(([citation, location, note, quote]) => ({
    citation, note, quote,
    href: authorised[act] + '#page=' + location,
  }));
}
