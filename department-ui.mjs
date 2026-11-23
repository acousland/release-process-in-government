import {departments,getDepartment,foundationLaws,generalOrder,checkedDate} from './department-data.mjs?v=20261123-logic';
import portfolios from './portfolio-legislation.mjs?v=20261123-logic';
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
const link=(text,url)=>{const a=el('a',null,text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
const selectOptions=(select)=>{select.append(new Option('Choose a department',''));for(const d of departments)select.append(new Option(`${d.name} (${d.short})`,d.id));select.append(new Option('Other Victorian department or body','other'));};
export function setupDepartments({getAnswers,onChange}) {
 const select=document.getElementById('department');selectOptions(select);
 const profile=document.getElementById('department-profile');
 const updateProfile=()=>{
  const d=getDepartment(select.value);profile.replaceChildren();
  if(!d){profile.append(el('p',null,select.value==='other'?'The responsible team will need to check this body’s establishment and functions. Department profiles do not establish authority for a statutory body.':'Choose the department making the release to see its establishment or naming instrument.'));return;}
  const i=d.instruments.find(i=>/2020|2022|2018/.test(i.made))??d.instruments[0];
  profile.append(el('strong',null,d.short+' · '+(i.verification==='Original Gazette inspected'?'Instrument located':'Historical source requires verification')),el('p',null,i.effect),link(i.citation,i.url));
  const more=el('a','text-button','Explore foundations and portfolio Acts →');more.href='#departments';profile.append(more);
 };
 select.addEventListener('change',()=>{updateProfile();onChange('department',select.value);renderLibrary();});
 const librarySelect=document.getElementById('library-department');selectOptions(librarySelect);
 librarySelect.addEventListener('change',()=>renderLibraryProfile(librarySelect.value));
 const portfolioSelect=document.getElementById('portfolio-filter');portfolioSelect.append(new Option('All 60 ministerial portfolios','all'),new Option('Department starting points','department'));
 for(const p of portfolios)portfolioSelect.append(new Option(p.name,p.name));
 portfolioSelect.value='department';
 const search=document.getElementById('legislation-search');
 search.addEventListener('input',renderIndex);portfolioSelect.addEventListener('change',renderIndex);
 function renderLibrary(){librarySelect.value=select.value;renderLibraryProfile(select.value);}
 function renderLibraryProfile(id){
  const target=document.getElementById('foundation-profile');target.replaceChildren();
  const d=getDepartment(id);
  if(!d){target.append(el('p',null,'Select a major department to inspect its legal foundations. Other bodies need their own enabling instrument and authority check.'));renderIndex();return;}
  target.append(el('p','eyebrow',d.short),el('h2',null,d.name));
  for(const i of d.instruments){
   const article=el('article','instrument');article.append(el('span','source-status',i.verification),el('h3',null,i.title),el('p',null,i.effect));
   const dl=el('dl','instrument-facts');
   for(const [name,value] of [['Authority',i.authority],['Made',i.made],['Took effect',i.effective],['Publication',i.citation]])dl.append(el('dt',null,name),el('dd',null,value));
   article.append(dl,link('Open source',i.url));target.append(article);
  }
  target.append(link('Department context and responsibilities',d.context),el('p','source-note','These profiles identify the verified creation or current-name instruments and selected predecessor links. They are not a complete historical chain of every machinery-of-government change. DPC and DTF original historical instruments still require verification.'));
  renderIndex();
 }
 function renderIndex(){
  const d=getDepartment(librarySelect.value),filter=portfolioSelect.value,q=search.value.toLocaleLowerCase().trim();
  const names=d?.portfolios??[];
  const visible=portfolios.filter(p=>filter==='all'||filter==='department'&&names.includes(p.name)||filter===p.name);
  const target=document.getElementById('legislation-results');target.replaceChildren();let count=0;
  for(const p of visible){
   const entries=p.entries.filter(e=>!q||`${e.title} ${p.name}`.toLocaleLowerCase().includes(q));
   if(!entries.length&&(q||p.entries.length))continue;
   const section=el('section','portfolio-group');section.append(el('h3',null,p.name),link('Read allocation and exceptions · PDF p '+p.page,generalOrder.pdf+'#page='+p.page));
   if(!entries.length)section.append(el('p',null,'No Act titles listed under this portfolio in this Order. This does not mean the portfolio has no functions or responsibilities.'));
   const ul=el('ul','legislation-list');
   for(const e of entries){const li=el('li');li.append(link(e.title,generalOrder.pdf+'#page='+e.page),el('small',null,'Allocation begins on PDF p '+e.page));ul.append(li);count++;}
   section.append(ul);target.append(section);
  }
  document.getElementById('legislation-count').textContent=`${count} portfolio title entries shown · ${new Set(portfolios.flatMap(p=>p.entries.map(e=>e.title))).size} distinct titles indexed across 60 portfolios`;
  if(!target.childElementCount)target.append(el('p',null,filter==='department'&&!d?'Choose a department, or search all portfolios.':'No matching title. Check the signed Order and the Act itself for scope and alternative titles.'));
 }
 const common=document.getElementById('foundation-laws');
 for(const f of foundationLaws){const article=el('article','instrument');article.append(el('h3',null,f.title),el('p',null,f.scope),link('Current Act',f.url));common.append(article);}
 const sources=document.getElementById('allocation-sources');sources.append(link('Signed General Order · '+generalOrder.date,generalOrder.pdf),link('Check for a newer General Order',generalOrder.latest));
 document.getElementById('department-checked').textContent='Sources checked '+checkedDate+'. Confirm currency for the date of your decision.';
 updateProfile();renderLibrary();
 return {refresh:()=>{const a=getAnswers();select.value=a.department??'';updateProfile();renderLibrary();}};
}
