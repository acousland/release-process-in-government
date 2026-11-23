// Shared statutory conditions for the implemented disclosure pathways.
// A condition remains unconfirmed until its factual question is answered.
export const all = (...values) => values.includes(false) ? false : values.every(v => v === true) ? true : null;
export const any = (...values) => values.includes(true) ? true : values.every(v => v === false) ? false : null;
const answer = (a, key, values = ['yes']) => a[key] == null || a[key] === 'unsure' ? null : values.includes(a[key]);
const condition = (label, value, reference) => ({label, value, reference});
export function legalConditions(a = {}) {
  const c = (label, key, reference, values) => condition(label, answer(a, key, values), reference);
  const route = (id, conditions) => ({id, conditions, state: all(...conditions.map(c => c.value))});
  const source = condition('Sender is an eligible data sharing or designated body', /^d(ffh|gs|h|jsir|jcs|pc|tp|tf|e|eeca)$/.test(a.department ?? '') ? true : answer(a, 'sharingBody', ['sharing','designated']), 'VDS Act s 3');
  const identifiable = condition('Data includes personal information, health information, identifiers, or unique identifiers', a.information == null ? null : ['personal','health','mixed','identifiers'].includes(a.information), 'VDS Act s 3');
  const roles = c('Sender and recipient participate in the required sharing roles', 'schemeRoles', 'CWS Act ss 41R–41T / FVPA ss 144D, 144I');
  const excluded = c('The proposed information passes the scheme exclusion screen', 'schemeClear', 'CWS Act s 41Q / FVPA s 144C');
  const consent = condition('Consent or the applicable consent exception covers every person', a.familyRecipient === 'direct' ? true : a.familyWhose === 'poses' || a.familyWhose === 'child' ? true : a.familyWhose === 'adult' ? any(answer(a,'familyConsent'),answer(a,'familyThreat')) : null, 'FVPA ss 144N–144NC');
  return {
    cdo: route('cdo', [source, condition('Request is from the Chief Data Officer', a.request === 'cdo' ? true : answer(a,'cdoRequest'), 'VDS Act s 8'), c('Written notice specifies held data, reasons, handling, addressee, and delivery to the CDO', 'cdoWriting', 'VDS Act s 8(1)–(2)'), c('Approved policy, planning, or design purpose', 'cdoPurpose', 'VDS Act s 5'), c('No restricted data is requested', 'cdoRestricted', 'VDS Act ss 3, 8(3)', ['no'])]),
    integration: route('integration', [source, identifiable, c('Recipient combines or collates two or more datasets for policy, planning, or design', 'linkage', 'VDS Act ss 3, 5, 15(2)'), c('Legal recipient is a department Secretary or prescribed data analytics body', 'linkageRecipient', 'VDS Act ss 3, 15(2)'), c('Integration, subsequent analytics, and results have the required safeguards', 'integrationControls', 'VDS Act ss 17–19, 24')]),
    child: route('child', [roles, excluded, c('Reasonable belief that sharing assists a listed child wellbeing or safety activity, or manages safety risk for a direct recipient', 'childAction', 'CWS Act ss 41V, 41W, 41Y'), condition('Recipient and request mode identified', a.childRecipient === 'direct' ? true : a.childRecipient === 'org' ? answer(a,'childRequest',['yes','no']) : a.childRecipient == null ? null : false, 'CWS Act ss 41V, 41W, 41Y')]),
    family: route('family', [roles, excluded, consent, condition('Family violence risk purpose and recipient established', a.familyRecipient === 'direct' ? answer(a,'familyDirect') : a.familyRecipient === 'org' ? all(answer(a,'familyPurpose',['assessment','protection']),answer(a,'familyRequest',['yes','no']),answer(a,'familyNeed')) : a.familyRecipient == null ? null : false, 'FVPA ss 144KA–144LC, 144M')]),
    placement: route('placement', [c('Placement, relevant carer, timing, and information needed for the decision or care confirmed', 'placement', 'CYFA s 179(1)–(2)')]),
    protection: route('protection', [c('Statutory actor reasonably believes disclosure is required for the specified protection function', 'protection', 'CYFA s 192(1)'), c('Secretary or protective intervener discloses, OR sender responds to their request', 'protectionRole', 'CYFA s 192(1)–(2)', ['official','response'])]),
    youth: route('youth', [c('Youth justice official duty and reasonable necessity established', 'youth', 'Youth Justice Act ss 701, 704–708'), c('Sender, recipient, request mode, and their roles established', 'youthRoles', 'Youth Justice Act ss 702–705, 708')]),
    regulator: route('regulator', [c('Information reasonably required for regulator function OR necessary to decide lawful further disclosure', 'regulator', 'Social Services Regulation Act s 193(2)(a)–(b)'), c('Sender is a relevant agency and recipient is the Regulator', 'regulatorRoles', 'Social Services Regulation Act ss 189, 193(2)')]),
    housing: route('housing', [c('Both parties satisfy the statutory housing roles', 'housingParties', 'Housing Act ss 142I–142J'), condition('Register purpose AND access authorisation, OR a necessary listed social housing purpose', a.housingRegister === 'yes' ? all(answer(a,'housingAuthorised'),answer(a,'housingNeed')) : a.housingRegister === 'no' ? answer(a,'housingNeed') : null, 'Housing Act ss 142G–142J')]),
  };
}
export const selectedLegalRoute = a => a.purpose === 'linkage' || a.linkage === 'yes' ? 'integration' : ['child','family','placement','protection','youth','regulator','housing'].includes(a.purpose) ? a.purpose : null;
