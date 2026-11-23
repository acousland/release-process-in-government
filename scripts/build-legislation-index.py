"""Build a title-only navigation index from the signed General Order PDF text.
Input: general-order-lines.json ({n, page, text} extracted from the official PDF).
Scope notes remain in the source PDF. This index does not allocate entire Acts.
"""
import json,re
from pathlib import Path
lines=json.loads(Path('general-order-lines.json').read_text())
first={}
for x in lines:first.setdefault(x['page'],x['n'])
heads=[x for x in lines if x['n']==first[x['page']] and re.match(r'^(Minister for |Attorney-General$|Premier$|Special Minister of State$|Treasurer$)',x['text'])]
portfolios=[]
for hi,h in enumerate(heads):
 end=heads[hi+1]['n'] if hi+1<len(heads) else len(lines)
 name=re.sub(r'\d+$','',h['text']).removeprefix('Minister for ')
 entries=[]
 for n in range(h['n']+1,end):
  x=lines[n];t=x['text']
  if not re.match(r'^[A-Z]',t) or re.match(r'^(The |This |Where |In |Division|Part |Section|Chapter|Schedule|Except|Act |Office |Minister |Melbourne \(|Planning Strategy|Metropolitan Activity)',t):continue
  # These long titles wrap in the signed source. Do not join scope-note continuations.
  if t.startswith(('Monitoring of Places of Detention by the United Nations Subcommittee',
                   'National Redress Scheme for Institutional Child Sexual Abuse (Commonwealth Powers)',
                   'Firefighters’ Presumptive Rights Compensation and Fire Services Legislation Amendment',
                   'Victorian Independent Remuneration Tribunal and Improving Parliamentary Standards Act')):
   t+=' '+lines[n+1]['text']
  t=re.sub(r'\s+\d{1,3}$','',t)
  match=re.match(r'^(.+? Act \d{4})(?:\d+)?(?:\s*[–—-].*)?$',t)
  law=match[1] if match else None
  if not law and (re.match(r'^.+ National Law \(Victoria\)',t) or t in ['Legal Profession Uniform Law (Victoria)','Marine Safety (Domestic Commercial Vessel) National Law','Windfall Gains Tax 2021']):law=t.split(' –')[0]
  if t in ['Statute Law Revision Acts','Appropriation Acts (passed annually)']:law=t
  if law:entries.append({'title':law,'page':x['page']})
 portfolios.append({'name':name,'page':h['page'],'entries':entries})
Path('portfolio-legislation.mjs').write_text('// Title navigation only. Read the signed General Order for split provisions, exceptions, and joint administration.\nexport default '+json.dumps(portfolios,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'{len(portfolios)} portfolios, {sum(len(p["entries"]) for p in portfolios)} title entries, {len(set(e["title"] for p in portfolios for e in p["entries"]))} unique titles')
