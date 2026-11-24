const check = (section, question, otherwise, alternatives) => ({section, question, otherwise, alternatives});
const path = (title, checks, outcome, detail) => ({title, checks, outcome, detail});
const act = (title, slug, note, routes) => ({
  title, source: 'https://www.legislation.vic.gov.au/in-force/acts/' + slug, note, routes,
});

export const acts = {
  vds: act('Victorian Data Sharing Act 2017', 'victorian-data-sharing-act-2017',
    'Follow the route that matches the proposed recipient and use.', [
      path('Written request from the statewide Chief Data Officer', [
        check('ss 3, 5, 8 and 31(1)', 'Has the statewide Chief Data Officer or an authorised delegate given the responsible officer a written notice for the statutory policy, planning, or design purpose?', 'Verify the notice and preserve any response deadline.'),
        check('ss 3 and 8(1)–(3)', 'Does the notice specify the held data, reasons, and handling, and leave out restricted data?', 'Refer any defect or restricted material to the responsible officer.'),
        check('ss 14, 15(1), 20 and 21', 'Can the responsible officer provide the requested scope after assessing refusal grounds and any applicable secrecy provision?', 'A data sharing body must give written reasons for refusing any part to the CDO and the Secretary of the administering department.'),
      ], 'Respond to the notice', 'A data sharing body must respond within 10 business days of receipt unless the CDO agrees to more time (s 9). A designated body may provide data or decline to respond (s 10). For identifiable data, use s 15(1). Notify the CDO of any known applicable secrecy provision.'),
      path('Direct sharing for data integration', [
        check('ss 3, 5 and 15(2)', 'Is a data sharing body or designated body sharing identifiable data to combine or collate two or more datasets to inform government policy making, service planning, or design?', 'This pathway does not cover the proposed purpose or data.'),
        check('ss 3, 15(2) and 31(2)–(3)', 'Is the legal recipient a departmental Secretary or other qualifying data analytics body, and is the sender’s responsible officer or delegate authorised to decide?', 'Verify the legal recipient, responsible officer, and applicable delegations.'),
        check('ss 17–24', 'Is disclosure permitted under source restrictions, with safeguards for integration, de-identification before analytics, and de-identified results?', 'Resolve the restriction or safeguard before disclosing.'),
      ], 'May disclose for integration', 'Section 15(2) does not require a Chief Data Officer request. Limit disclosure to the integration purpose and approved scope.'),
    ]),
  pdp: act('Privacy and Data Protection Act 2014', 'privacy-and-data-protection-act-2014',
    'Apply this chart to disclosure of personal information covered by the Information Privacy Principles (IPPs). For a mixed dataset, check the health information separately.', [
      path('Personal information disclosure', [
        check('Schedule 1, IPP 2.1', 'Does the disclosure serve the original collection purpose, or is at least one secondary-purpose ground satisfied?', 'Identify a valid ground, or consider a version that cannot reasonably identify an individual.', [
          'Related purpose the individual would reasonably expect. For sensitive information the relationship must be direct (a).',
          'Consent to the specific disclosure (b).',
          'Necessary public-interest research or statistics, with impracticable consent and the required protections against identifying publication and onward disclosure (c).',
          'Necessary to lessen or prevent a serious threat on the specified grounds (d).',
          'Necessary to investigate or report suspected unlawful activity on the specified grounds (e).',
          'Required or authorised by or under law (f).',
          'Reasonably believed necessary for a listed law enforcement purpose, with the required written note (g and IPP 2.2).',
          'Qualifying ASIO or ASIS disclosure with the required authorisation and certification (h).',
        ]),
        check('Schedule 1, IPPs 4, 7 and 9', 'Have security, applicable unique identifier rules, and any applicable transfer conditions for a recipient outside Victoria been cleared?', 'Resolve the outstanding condition before disclosure.'),
      ], 'Privacy ground is available', 'Record the ground and its evidence. Confirm the agency’s authority and any separate source restrictions.'),
    ]),
  health: act('Health Records Act 2001', 'health-records-act-2001',
    'Apply this chart to health information covered by the Health Privacy Principles (HPPs).', [
      path('Health information disclosure', [
        check('Schedule 1, HPP 2', 'Is disclosure for the lawful original collection purpose, or is at least one applicable disclosure ground satisfied?', 'Identify a valid ground or refer for a privacy decision.', [
          'Directly related purpose reasonably expected by the individual, consent, or disclosure required, authorised, or permitted by law (2.2(a)–(c)).',
          'Necessary health service for an individual unable to consent, subject to the representative and consent conditions (2.2(d)).',
          'Specified health service management, monitoring, improvement, or training, or public-interest research or statistics. Apply the exact consent, de-identification, guidelines, and publication conditions (2.2(f)–(g)).',
          'Serious threat, suspected unlawful activity, or specified law enforcement purpose, with the applicable guidelines, confidence protections, or written note (2.2(h)–(j), 2.3).',
          'Necessary for a legal or equitable claim, qualifying service to an individual by law enforcement, or a qualifying family or identification disclosure (2.2(k)–(l), 2.4–2.5).',
        ]),
        check('Schedule 1, HPPs 4, 7 and 9', 'Have security, applicable identifier rules, and any applicable transfer conditions for a recipient outside Victoria been cleared?', 'Resolve the outstanding condition before disclosure.'),
      ], 'Health privacy ground is available', 'Record the specific HPP ground and evidence, then check the agency’s authority and any separate source restrictions.'),
    ]),
  ciss: act('Child Wellbeing and Safety Act 2005', 'child-wellbeing-and-safety-act-2005',
    'Part 6A · Child Information Sharing Scheme (CISS).', [
      path('Sharing with another information sharing entity', [
        check('ss 41P–41T', 'Are the sender and recipient prescribed in the relevant roles, and is the confidential information outside the excluded categories?', 'Verify the prescribed roles and withhold excluded information under this scheme.'),
        check('ss 41V and 41W', 'Is sharing to promote a child’s wellbeing or safety, with a reasonable belief it may assist the recipient with a listed activity?', 'This entity-to-entity route is unavailable for the proposed disclosure.'),
      ], 'May disclose or must disclose', 'Voluntary disclosure may proceed under s 41V. A qualifying request requires disclosure under s 41W, subject to the statutory exceptions. Apply the principles, guidelines, and records requirements.'),
      path('Sharing directly to manage a child’s safety risk', [
        check('ss 41Q and 41Y', 'Is the sender prescribed, the information not excluded, and the recipient the child, a person with parental responsibility, or a person the child lives with?', 'Check the recipient category and exclude protected information.'),
        check('s 41Y', 'Is the disclosure for managing a risk to the child’s safety?', 'The direct-disclosure route is unavailable for this purpose.'),
      ], 'May disclose for safety', 'Limit what is shared to the safety purpose and apply scheme requirements.'),
    ]),
  fviss: act('Family Violence Protection Act 2008', 'family-violence-protection-act-2008',
    'Part 5A · Family Violence Information Sharing Scheme (FVISS).', [
      path('Sharing with another entity', [
        check('ss 144C–144D, 144K and 144L', 'Is the sender prescribed, is the recipient eligible for the assessment or protection purpose, and is the information within scope and not excluded?', 'Verify roles and withhold excluded information under this scheme.'),
        check('ss 144N–144ND', 'Does the relevant consent rule or exception cover each person whose information is proposed for disclosure?', 'Obtain consent where required, narrow the scope, or confirm an applicable exception.'),
        check('ss 144KA–144KC and 144LA–144LC', 'Does the proposed disclosure meet the requirements for its risk purpose and for sharing voluntarily or on request?', 'Confirm necessity for protection where required and any statutory exception to the duty to disclose.'),
      ], 'May disclose or must disclose', 'Apply the relevant voluntary or requested route for assessment or protection. Complete applicable guideline and recordkeeping checks.'),
      path('Sharing directly for protection', [
        check('ss 144C and 144M', 'Is an eligible entity sharing non-excluded information about a person of concern with a qualifying primary person or eligible parent for the statutory protection purpose?', 'Verify the exact recipient and purpose under s 144M.'),
      ], 'May disclose for protection', 'Limit the release and recipient use or disclosure to the statutory scope (ss 144M–144MA).'),
    ]),
  cyfa: act('Children, Youth and Families Act 2005', 'children-youth-and-families-act-2005',
    'Child protection and out-of-home care. Check reporter identity and publication restrictions where relevant.', [
      path('Information for a carer', [
        check('s 179', 'Is the Secretary or out-of-home care service provider dealing with a proposed or existing placement with a person other than a parent?', 'Check another authority.'),
        check('s 179(1)–(2)', 'Is the information reasonably necessary for the proposed carer’s decision, or known medical information for appropriate care after placement?', 'Keep the information outside the statutory scope out of this disclosure.'),
      ], 'Provide the information within scope', 'Apply the duty for the relevant stage of the placement.'),
      path('Information for a child protection function', [
        check('s 192(1)–(2)', 'Is the Secretary or a protective intervener disclosing on the required reasonable grounds for a statutory function, or is the sender responding to their qualifying request?', 'This pathway does not establish permission.'),
        check('ss 41, 190–192 and 534', 'Has the decision-maker checked applicable reporter identity, confidentiality, and publication restrictions?', 'Resolve any restriction before release.'),
      ], 'May disclose within the applicable power', 'Confirm whether the authority is s 192(1) or s 192(2) and record the statutory function.'),
    ]),
  housing: act('Housing Act 1983', 'housing-act-1983',
    'Sections 142G–142J · Victorian Housing Register and social housing information.', [
      path('Sharing between relevant persons', [
        check('ss 142I–142J', 'Are sender and recipient both statutory relevant persons, and is this applicant, household, tenancy application, or housing information in scope?', 'Verify the statutory roles and information scope.'),
        check('s 142J(1)–(2)', 'Is disclosure necessary for a listed purpose, with access authorisation where the route concerns establishment, administration, or accuracy of the register?', 'Identify the listed purpose and any required access authorisation.'),
        check('s 142J(3)', 'Can the disclosure proceed consistently with any other statutory prohibition?', 'Hold the affected material pending a decision on the prohibition.'),
      ], 'May disclose within the applicable purpose', 'Limit the information to what is necessary and record the relevant subsection.'),
    ]),
  youth: act('Youth Justice Act 2024', 'youth-justice-act-2024',
    'Part 15.1 · Information sharing under the youth justice provisions.', [
      path('Requested or voluntary sharing', [
        check('ss 701–705 and 708', 'Does the exact provision cover the information, the sender and recipient’s roles, and whether sharing was requested or voluntary?', 'Verify the actor, recipient, and route before disclosure.'),
        check('ss 704–708', 'Is sharing reasonably necessary for the applicable official duty or listed statutory purpose, and have any restrictions been addressed?', 'Withhold the affected material or obtain a specialist determination.'),
      ], 'Apply the identified youth justice provision', 'Check the exact subsection to determine whether it permits or requires disclosure and what conditions apply.'),
    ]),
  regulator: act('Social Services Regulation Act 2021', 'social-services-regulation-act-2021',
    'Part 8 · Sharing information with the Social Services Regulator.', [
      path('Relevant agency disclosure to the Regulator', [
        check('ss 189 and 193(2)', 'Is a statutory relevant agency disclosing information it holds to the Regulator?', 'Verify both statutory roles.'),
        check('s 193(2)(a)–(b)', 'Is the agency reasonably satisfied the information is reasonably required for a covered Regulator function, or necessary to determine whether further information can lawfully be disclosed?', 'This permission does not apply. Check any distinct duty to assist under s 195.'),
        check('Part 8, including s 201', 'Have applicable confidentiality notices and other restrictions been cleared?', 'Resolve the restriction before disclosure.'),
      ], 'May disclose under section 193(2)', 'Record the reason, scope, and protections.'),
    ]),
  foi: act('Freedom of Information Act 1982', 'freedom-information-act-1982/115',
    'Formal access and other lawful access follow different processes.', [
      path('Formal access request', [
        check('ss 13, 17–21 and 26', 'Has the authorised FOI officer confirmed the request, the documents in scope, and that the Act applies?', 'Refer defects, exclusions, transfers, or scope issues to the FOI team.'),
        check('ss 25, 27 and 28–38', 'Can access be granted in full, or can an edited copy be provided under s 25?', 'The FOI officer determines any refusal and gives the applicable reasons and review information.'),
        check('ss 27, 29, 29B, 31 and 33–35 as applicable', 'Are all applicable consultation, notice, and release delay requirements complete?', 'Complete the required FOI steps before granting access.'),
      ], 'Give access in the form authorised', 'The FOI decision controls the scope and timing of access.'),
      path('Informal access or publication', [
        check('ss 7, 8 and 16', 'Is there a specific publication duty, or can the agency properly give informal access to this exact version under section 16?', 'Use the formal access process or check another applicable authority.'),
        check('s 16 and applicable source and privacy law', 'Has the agency cleared all applicable secrecy, privacy, and source restrictions for this recipient or public audience?', 'Withhold or narrow the version pending clearance.'),
      ], 'Provide access within the applicable authority', 'Apply the relevant publication duty or informal access process.'),
    ]),
  adoption: act('Adoption Act 1984', 'adoption-act-1984/077',
    'Part VI · Access to adoption records and information.', [
      path('Request for adoption information', [
        check('Part VI', 'Has the Adoption Information Service confirmed the applicant’s identity and eligibility, the information requested, and any age, consent, and other statutory conditions?', 'Refer the request for specialist assessment. A court application may be relevant under s 100.'),
      ], 'Follow the specialist access decision', 'Release only the information authorised by the applicable provision or court order.'),
    ]),
  crime: act('Crime Statistics Act 2014', 'crime-statistics-act-2014',
    'Requests from the Crime Statistics Agency.', [
      path('Sharing for a statistical function', [
        check('ss 5, 7 and 7A', 'Is the request within the Chief Statistician’s functions, with a specific access power covering the sender and data where one is relied on?', 'Clarify the function or the claimed access power.'),
        check('Applicable source and privacy law', 'Does the sending agency have authority for this extract and recipient, with privacy and source restrictions addressed?', 'Establish the sender’s authority before release. The statistical function alone is insufficient.'),
      ], 'Apply the sender’s verified release authority', 'Record the authority, recipient, scope, and handling conditions. Assess any later publication separately.'),
    ]),
};
