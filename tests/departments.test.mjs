import test from 'node:test';
import assert from 'node:assert/strict';
import {departments,getDepartment,departmentRecord} from '../department-data.mjs';
import portfolios from '../portfolio-legislation.mjs';
import {evaluatePathways} from '../pathway-tracker.mjs';

test('ten major departments have source-backed establishment or naming records',()=>{
 assert.equal(departments.length,10);assert.equal(new Set(departments.map(d=>d.id)).size,10);
 for(const d of departments){assert.ok(d.instruments.length);for(const i of d.instruments){assert.match(i.url,/^https:/);assert.ok(i.authority&&i.citation&&i.effective&&i.verification);}for(const name of d.portfolios)assert.ok(portfolios.some(p=>p.name===name),`${d.short}: ${name}`);}
 const i=getDepartment('dffh').instruments[0];assert.match(i.citation,/S 684/);assert.equal(i.effective,'1 February 2021');assert.match(i.authority,/s 10/);
 assert.match(getDepartment('dh').instruments[0].effect,/Renames/);
 for(const id of ['dpc','dtf'])assert.match(getDepartment(id).instruments[0].verification,/not independently inspected/);
});
test('portfolio navigation preserves split allocations as separate ministerial entries',()=>{
 assert.equal(portfolios.length,60);
 const child=portfolios.find(p=>p.name==='Children');assert.equal(child.page,15);
 assert.ok(child.entries.some(e=>e.title==='Child Wellbeing and Safety Act 2005'));
 assert.ok(portfolios.find(p=>p.name==='Health').entries.some(e=>e.title==='Child Wellbeing and Safety Act 2005'));
 assert.ok(portfolios.some(p=>!p.entries.length));
 for(const title of ['Ambulance Services Act 1986','Health Records Act 2001','National Redress Scheme for Institutional Child Sexual Abuse (Commonwealth Powers) Act 2018','Monitoring of Places of Detention by the United Nations Subcommittee on Prevention of Torture (OPCAT) Act 2022'])assert.ok(portfolios.some(p=>p.entries.some(e=>e.title===title)),title);
 for(const p of portfolios)for(const e of p.entries){assert.ok(e.page>=p.page&&e.page<=103);assert.doesNotMatch(e.title,/Except:|•|\d{5}|administered|the Minister/);}
});
test('department records do not require a user-supplied legal basis',()=>{
 const record=departmentRecord({department:'dffh'}).join('\n');
 assert.match(record,/S 684/);assert.doesNotMatch(record,/Not recorded|authorityFunction/);
 assert.equal(evaluatePathways({departmentWork:'yes'}).find(p=>p.id==='agency').status,'check');
});
