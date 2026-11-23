import tree from './tree-data.mjs';
import { firstStep, getStep, nextStep, result, stages } from './assessment.mjs';
import { releaseDetails } from './release-rules.mjs';
import { drawLivePath, hasQuestionNode, showQuestionMap } from './question-map.mjs';

const get = id => document.getElementById(id);
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const button = (label, classes, action) => {
  const node = element('button', classes, label);
  node.type = 'button';
  if (action) node.addEventListener('click', action);
  return node;
};
const rows = Object.fromEntries(Object.values(tree.pages).flatMap(section=>section.rows.map(row=>[row[0],row])));
const refText = ref => rows[ref] ? `${ref} · ${rows[ref][1]}` : tree.pages[ref]?.title ?? ref;
const jump = (ref,label,classes) => {
  const link = element('a', classes, label);
  link.href = '#reference/' + encodeURIComponent(ref);
  link.title = refText(ref);
  return link;
};
function appendTreeText(target, source, linked = true) {
  const parts = source.split(/(<\/?b>|<br\s*\/?\s*>|\[[a-z]+\])/gi);
  let current = target;
  const ids = /\b(?:CSA[1-5]|VD[1-5]|SH[1-5]|HS[1-5]|SP[1-5]|FA[1-5]|FX[1-6]|[A-Z]\d{1,2})\b/g;
  for (const item of parts) {
    if (item === '<b>') {
      current = element('strong');
      target.append(current);
    } else if (item === '</b>') {
      current = target;
    } else if (/^<br/i.test(item)) {
      current.append(element('br'));
    } else if (/^\[[a-z]+\]$/.test(item) && tree.labels[item.slice(1,-1)]) {
      const id = item.slice(1,-1);
      current.append(linked ? jump(id,tree.labels[id]) : document.createTextNode(tree.labels[id]));
    } else {
      let pos=0;
      if (linked) for (const match of item.matchAll(ids)) {
        const id=match[0];
        if (!rows[id]) continue;
        current.append(document.createTextNode(item.slice(pos,match.index)),jump(id,id));
        pos=match.index+id.length;
      }
      current.append(document.createTextNode(item.slice(pos)));
    }
  }
}
const trail = [];
let activeStep = firstStep;
let previousChoice = null;
let reviewOpen = false;
const getAnswers = () => Object.fromEntries(trail.map(item=>[item.step,item.choice]));
const getQuestion = (id) => getStep(id,getAnswers());
function pathFrame(selection=null) {
  const answers=getAnswers();
  return {
    answers,selection,current:activeStep,
    trail:trail.map(item=>({...item,label:getQuestion(item.step).options.find(opt=>opt.value===item.choice).label})),
    outcome:getQuestion(activeStep)?null:result(activeStep,answers),
  };
}
function syncPath(selection=null) { drawLivePath(pathFrame(selection)); }
const question = get('question');
function backTo(index) {
  const item = trail[index];
  if (!item) return;
  activeStep = item.step;
  previousChoice = item.choice;
  trail.splice(index);
  renderAssessment(true);
}
function resetAssessment() {
  trail.length=0;
  activeStep=firstStep;
  previousChoice=null;
  reviewOpen=false;
  renderAssessment(true);
}
function references(refs) {
  const block=element('div','ref-row');
  block.append(element('span',null,'In the legal reference'));
  refs.forEach(ref=>block.append(jump(ref,rows[ref]?ref:tree.labels[ref]??ref,'ref-link')));
  return block;
}
function renderProgress(stage) {
  const progress=get('progress');
  const lastIndex=stages.indexOf(stage);
  progress.replaceChildren(...stages.map((name,i)=>{
    const cleared=trail.some((entry,index)=>{
      if (getQuestion(entry.step)?.stage!==name) return false;
      const next=trail[index+1]?.step ?? activeStep;
      const followingStage=getQuestion(next)?.stage;
      return followingStage ? stages.indexOf(followingStage)>i : next==='approved'&&i<lastIndex;
    });
    const li=element('li',cleared?'done':null);
    if (i===lastIndex) li.setAttribute('aria-current','step');
    const badge=element('span','stage-mark',cleared?'✓':String(i+1));
    badge.setAttribute('aria-hidden','true');
    li.append(badge,name);
    return li;
  }));
  get('answer-count').textContent=trail.length;
  get('review-toggle').setAttribute('aria-expanded',String(reviewOpen));
  const review=get('review');
  review.hidden=!reviewOpen;
  if (!reviewOpen) return;
  const list=element('ol');
  for (const [i,record] of trail.entries()) {
    const st=getQuestion(record.step);
    const choice=st.options.find(o=>o.value===record.choice);
    const li=element('li');
    li.append(button(st.title,null,()=>backTo(i)),element('small',null,choice.label));
    list.append(li);
  }
  review.replaceChildren(list);
  if (!trail.length) review.append(element('p','result-detail','Your answers will appear here.'));
}
function releaseSections(release) {
  const sections=[];
  if (release.bases.length) sections.push(['Act, provision, or written demand',release.bases]);
  if (release.departmentFunction) sections.push(['Agency function',[
    {law:'Ordinary agency work',provision:'The underlying agency function is the basis. No standalone disclosure provision was identified.'},
  ]]);
  if (release.privacy.length) sections.push(['Privacy provisions',release.privacy]);
  if (release.policy.length) sections.push(['Applicable policies',release.policy]);
  return sections;
}
const approvalRecord='Record the decision-maker’s role, the applicable instrument and entry or other authority, and any conditions. Check that it is current and covers this decision.';
const approvalStatus={
  pending:'Approval still to be confirmed. Refer the proposed release to the authorised decision-maker.',
  recorded:'Your answers record that the decision-maker’s authority was checked and this release was approved.',
};
function renderReleaseDetails(release,{heading,description,status}={}) {
  const block=element('section','release-details');
  const title=element('h3',null,heading);
  title.id='release-details-heading';
  block.setAttribute('aria-labelledby',title.id);
  block.append(title);
  if (description) block.append(element('p','release-summary-description',description));
  const sections=releaseSections(release);
  if (!sections.length) block.append(element('p',null,'No specific release basis has been identified from the answers so far.'));
  for (const [label,items] of sections) {
    const list=element('ul','release-basis');
    for (const item of items) {
      const row=element('li');
      row.append(element('strong',null,item.law),element('span',null,item.provision));
      list.append(row);
    }
    block.append(element('h4',null,label),list);
  }
  if (sections.length||status) {
    const {approval}=release;
    const check=element('div','release-approval');
    check.append(element('h4',null,'Who can approve the release?'));
    if (approval.provision) check.append(element('p','release-authority',approval.provision));
    check.append(element('p',null,approval.instruction));
    if (status) check.append(element('p','release-authority',approvalStatus[status]));
    check.append(element('p',null,approvalRecord));
    if (approval.source) {
      const source=element('a',null,approval.source.label);
      source.href=approval.source.url;
      source.target='_blank';
      source.rel='noopener';
      check.append(source);
    }
    block.append(check);
  }
  return block;
}
function renderFindings(findings) {
  const block=element('section','findings');
  block.setAttribute('aria-label','Basis and conditions');
  if (!findings.length) return block;
  block.append(element('h3',null,'Conditions and references'));
  for (const finding of findings) {
    const item=element('article','finding');
    const top=element('div','finding-header');
    top.append(element('h4',null,finding.law),element('span','finding-type',{
      legislation:'Legislation',policy:'Policy',instrument:'Written demand',context:'Departmental function',
    }[finding.kind]??'Basis'));
    const confirm=element('p','finding-check');
    confirm.append(element('strong',null,'Confirm before release'),' '+finding.verify);
    item.append(top,element('p','finding-provision',finding.provision),element('p','finding-why',finding.why),confirm,references(finding.refs));
    block.append(item);
  }
  return block;
}
function recordText(outcome) {
  const parts=['Release Process in Government | Working assessment record',new Date().toLocaleString('en-AU'),
    outcome.title,outcome.description,'','Legislation and release basis'];
  const sections=releaseSections(outcome.release);
  if (!sections.length) parts.push('No specific release basis has been identified from the answers so far.');
  for (const [label,items] of sections) {
    parts.push(label,...items.map(item=>`${item.law} · ${item.provision}`));
  }
  if (sections.length||outcome.approvalStatus) {
    const {approval}=outcome.release;
    parts.push('','Who can approve the release?',...[approval.provision,approval.instruction,approvalStatus[outcome.approvalStatus],approvalRecord,approval.source?.url].filter(Boolean));
  }
  if (outcome.findings.length) parts.push('','Conditions and references');
  for(const finding of outcome.findings) {
    parts.push(finding.law,finding.provision,finding.why,'Confirm before release. '+finding.verify,'References. '+finding.refs.map(refText).join(' · '),'');
  }
  parts.push('Answers');
  trail.forEach((item,i)=>{
    const st=getQuestion(item.step), choice=st.options.find(o=>o.value===item.choice);
    parts.push(`${i+1}. ${st.title}`,`   ${choice.label}`);
  });
  parts.push('','Retain alongside the authorised decision and supporting evidence through your agency’s applicable process.');
  return parts.join('\n');
}
function downloadRecord(outcome) {
  const url=URL.createObjectURL(new Blob([recordText(outcome)],{type:'text/plain;charset=utf-8'}));
  const anchor=element('a');
  anchor.href=url;
  anchor.download='information-release-assessment.txt';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function focusHeading(title,move) {
  title.tabIndex=-1;
  if (move) {
    title.focus({preventScroll:true});
    if (title.getBoundingClientRect().top<0 || title.getBoundingClientRect().top>innerHeight/2) {
      title.scrollIntoView({block:'center'});
    }
  }
}
function renderAssessment(move=false) {
  question.replaceChildren();
  const st=getQuestion(activeStep);
  if (!st) {
    const out=result(activeStep,getAnswers());
    const title=element('h2',null,out.title);
    const banner=element('div','result-banner '+out.type);
    banner.append(title,element('p',null,out.description));
    const detail=element('p','result-detail','This record reflects the answers entered. Retain it with the relevant authority, approval, and supporting evidence.');
    const status=element('p','status-message');
    status.setAttribute('role','status');
    const actions=element('div','question-actions');
    const group=element('div','action-group');
    const copy=button('Copy record','button outline',async()=>{
      try { await navigator.clipboard.writeText(recordText(out)); status.textContent='Assessment copied.'; }
      catch { status.textContent='Clipboard access is unavailable. Use Download record.'; }
    });
    group.append(button('Start again','button ghost',resetAssessment),copy,button('Download record','button primary',()=>downloadRecord(out)));
    actions.append(button('Back','button ghost',()=>backTo(trail.length-1)),group);
    const basis=renderReleaseDetails(out.release,{
      heading:'Legislation and release basis',status:out.approvalStatus,
      description:out.approvalStatus||!releaseSections(out.release).length?null:
        out.type==='hold'?'The provisions below identify the pathway considered. Your outcome is to hold the release.':'The provisions below identify a pathway for review before any release.',
    });
    question.append(element('p','step-label','Assessment outcome'),banner,basis);
    if (out.findings.length) question.append(renderFindings(out.findings));
    question.append(detail,actions,status);
    renderProgress('Decision');
    syncPath();
    focusHeading(title,move);
    return;
  }
  const title=element('h2',null,st.title);
  title.id='step-heading';
  const form=element('form');
  const fieldset=element('fieldset','options');
  fieldset.append(element('legend','sr-only','Choose one answer'));
  fieldset.setAttribute('aria-labelledby',title.id);
  const continueButton=element('button','button primary','Continue');
  continueButton.type='submit';
  continueButton.disabled=!previousChoice;
  for (const item of st.options) {
    const label=element('label','option');
    const input=element('input');
    input.type='radio';
    input.name='choice';
    input.value=item.value;
    input.checked=item.value===previousChoice;
    input.addEventListener('change',()=>{continueButton.disabled=false;syncPath(input.value);});
    const detail=element('span');
    detail.append(element('strong',null,item.label));
    if (item.description) detail.append(element('small',null,item.description));
    label.append(input,detail);
    fieldset.append(label);
  }
  const actions=element('div','question-actions');
  const back=button('Back','button ghost',()=>backTo(trail.length-1));
  back.disabled=!trail.length;
  const group=element('div','action-group');
  group.append(continueButton);
  actions.append(back,group);
  form.append(fieldset,actions);
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const choice=new FormData(form).get('choice');
    const next=nextStep(activeStep,choice,getAnswers());
    if (!next) return;
    trail.push({step:activeStep,choice});
    activeStep=next;
    previousChoice=null;
    renderAssessment(true);
  });
  question.append(element('p','step-label',st.stage),title,element('p','question-intro',st.description));
  if (activeStep==='approval') question.append(renderReleaseDetails(releaseDetails(getAnswers()),{heading:'Release basis to check'}));
  question.append(form);
  renderProgress(st.stage);
  syncPath(previousChoice);
  focusHeading(title,move);
}
get('toggle-path').addEventListener('click',()=>{
  const panel=get('path-panel'), toggle=get('toggle-path');
  panel.hidden=!panel.hidden;
  toggle.textContent=panel.hidden?'Show decision path':'Hide decision path';
  toggle.setAttribute('aria-expanded',String(!panel.hidden));
  get('assessment-grid').classList.toggle('path-hidden',panel.hidden);
  if(!panel.hidden)syncPath(question.querySelector('input:checked')?.value??null);
});
get('review-toggle').addEventListener('click',()=>{
  reviewOpen=!reviewOpen;
  renderProgress(getQuestion(activeStep)?.stage??'Decision');
});

const viewport=get('viewport'), board=get('board'), search=get('tree-search'), searchResults=get('search-results');
const anchors={};
const searchable=[];
let constructed=false, shownTree=false, scale=.31, x=0, y=0, highlight, pendingTarget=null;

function mapText(tag,classes,text) {
  const node=element(tag,classes);
  appendTreeText(node,text);
  return node;
}
function constructTree() {
  if (constructed) return;
  constructed=true;
  const root=element('div','board-root');
  root.append(element('strong',null,'Start with the proposed release'),element('p',null,'Follow every applicable branch for this recipient, purpose, and version.'));
  const columns=element('div','board-columns');
  board.append(root,columns);
  for (const [index,group] of tree.groups.entries()) {
    const lane=element('section','lane');
    lane.append(element('h2',null,group.title));
    columns.append(lane);
    const short=['Source restrictions','Privacy','Statutory schemes','FOI and reporting','Policy and decision'][index];
    get('map-nav').append(button(short,null,()=>goTo(group.keys[0])));
    for (const key of group.keys) {
      const data=tree.pages[key];
      const branch=element('section','tree-section');
      anchors[key]=branch;
      searchable.push({id:key,label:data.title,desc:group.title,text:data.intro});
      branch.append(element('h3',null,data.title),mapText('p','tree-section-intro',data.intro));
      for (const [id,clause,test,yes,no] of data.rows) {
        const node=element('article','tree-decision');
        anchors[id]=node;
        searchable.push({id,label:`${id} · ${clause}`,desc:test,text:data.title});
        const q=element('div','tree-question');
        q.append(element('strong',null,`${id}  ${clause}`),mapText('p',null,test));
        const arms=element('div','arms');
        for (const [label,text,klass] of [['Yes',yes,'arm'],['No / unclear',no,'arm no']]) {
          const arm=element('div',klass);
          arm.append(element('strong',null,label),mapText('p',null,text));
          arms.append(arm);
        }
        node.append(q,arms);
        branch.append(node);
      }
      if (data.note) branch.append(mapText('p','tree-note',data.note));
      const sources=element('div','tree-sources');
      for (const [title,url] of data.sources) {
        if (!url.startsWith('https://')) continue;
        const link = element('a',null,title);
        link.href=url;
        link.target='_blank';
        link.rel='noopener noreferrer';
        sources.append(link);
      }
      branch.append(sources);
      lane.append(branch);
    }
  }
  anchors.home=root;
}
function transform() {
  board.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
  get('zoom-level').textContent=`${Math.round(scale*100)}%`;
}
function fit(full=false) {
  if (!viewport.clientWidth) return;
  const horizontal=(viewport.clientWidth-24)/board.offsetWidth;
  const vertical=(viewport.clientHeight-22)/board.offsetHeight;
  scale=full?Math.min(horizontal,vertical):Math.max(.16,horizontal);
  x=(viewport.clientWidth-board.offsetWidth*scale)/2;
  y=11;
  transform();
}
function zoom(amount,px=viewport.clientWidth/2,py=viewport.clientHeight/2) {
  const next=Math.max(.035,Math.min(1.7,scale*amount));
  x=px-(px-x)*next/scale;
  y=py-(py-y)*next/scale;
  scale=next;
  transform();
}
function goTo(key) {
  if (!anchors[key] || !viewport.clientWidth) return;
  highlight?.classList.remove('tree-highlight');
  const node=anchors[key];
  if (key==='home') { fit(); return; }
  const nr=node.getBoundingClientRect(), br=board.getBoundingClientRect();
  const left=(nr.left-br.left)/scale, top=(nr.top-br.top)/scale;
  scale=Math.min(1.15,(viewport.clientWidth-32)/node.offsetWidth);
  x=(viewport.clientWidth-node.offsetWidth*scale)/2-left*scale;
  y=20-top*scale;
  node.classList.add('tree-highlight');
  highlight=node;
  transform();
}
get('zoom-in').onclick=()=>zoom(1.26);
get('zoom-out').onclick=()=>zoom(1/1.26);
get('zoom-fit').onclick=()=>fit(true);
viewport.addEventListener('wheel',e=>{
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    const rect=viewport.getBoundingClientRect();
    zoom(Math.exp(-e.deltaY*.007),e.clientX-rect.left,e.clientY-rect.top);
  } else {
    x-=e.deltaX;
    y-=e.deltaY;
    transform();
  }
},{passive:false});
const pointers=new Map();
let dragged=false;
viewport.addEventListener('pointerdown',e=>{
  if (e.target.closest('button') || (e.pointerType==='mouse' && e.button!==0)) return;
  if (!pointers.size) dragged=false;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
});
viewport.addEventListener('pointermove',e=>{
  const old=pointers.get(e.pointerId);
  if (!old) return;
  const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];
  const dx=e.clientX-old.x, dy=e.clientY-old.y;
  if (!dragged && !other && Math.hypot(dx,dy)<4) return;
  if (!viewport.hasPointerCapture(e.pointerId)) viewport.setPointerCapture(e.pointerId);
  dragged=true;
  viewport.classList.add('dragging');
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if (other) {
    const r=viewport.getBoundingClientRect(), before=Math.hypot(old.x-other.x,old.y-other.y);
    if (before>1) zoom(Math.hypot(e.clientX-other.x,e.clientY-other.y)/before,
      (e.clientX+other.x)/2-r.left,(e.clientY+other.y)/2-r.top);
  } else { x+=dx; y+=dy; transform(); }
});
function stopPointer(e) { pointers.delete(e.pointerId); if (!pointers.size) viewport.classList.remove('dragging'); }
viewport.addEventListener('pointerup',stopPointer);
viewport.addEventListener('pointercancel',stopPointer);
viewport.addEventListener('pointerleave',e=>{if(!viewport.hasPointerCapture(e.pointerId))stopPointer(e);});
viewport.addEventListener('click',e=>{if(dragged && e.target.closest('a')){e.preventDefault();e.stopPropagation();dragged=false;}},true);
viewport.addEventListener('keydown',e=>{
  if(e.target!==viewport) return;
  switch(e.key){
    case '+':case '=': zoom(1.25);break;
    case '-':zoom(.8);break;
    case 'ArrowLeft':x+=55;break;
    case 'ArrowRight':x-=55;break;
    case 'ArrowUp':y+=55;break;
    case 'ArrowDown':y-=55;break;
    case 'Home':fit();break;
    default:return;
  }
  e.preventDefault();transform();
});
function updateSearch() {
  const normal=s=>s.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const query=normal(search.value);
  searchResults.replaceChildren();
  searchResults.hidden=!query;
  if (!query) return;
  const tokens=query.split(' ');
  const exact=searchable.filter(item=>normal(item.id)===query || normal(item.label).includes(query));
  const matches=[...new Set([...exact,...searchable.filter(item=>tokens.every(t=>normal([item.label,item.desc,item.text].join(' ')).includes(t)))])].slice(0,16);
  for (const item of matches) {
    const entry=button(item.label,null,()=>{
      goTo(item.id);
      searchResults.hidden=true;
      viewport.focus({preventScroll:true});
    });
    const summary=item.desc.length>115?item.desc.slice(0,112)+'…':item.desc;
    entry.append(element('small',null,summary));
    searchResults.append(entry);
  }
  if (!matches.length) searchResults.append(element('p',null,'No matching clause or question.'));
}
search.addEventListener('input',updateSearch);
search.addEventListener('focus',updateSearch);
search.addEventListener('keydown',e=>{
  if(e.key==='Escape') searchResults.hidden=true;
  if(e.key==='ArrowDown' && !searchResults.hidden) { e.preventDefault(); searchResults.querySelector('button')?.focus(); }
  if(e.key==='Enter' && !searchResults.hidden) {e.preventDefault();searchResults.querySelector('button')?.click();}
});
document.addEventListener('pointerdown',e=>{if (!e.target.closest('.map-search')) searchResults.hidden=true;});
function decodeFragment(value) {
  try { return decodeURIComponent(value); } catch { return ''; }
}
let mode='assessment';
function hashRoute() {
  const current=location.hash.slice(1);
  if (current==='main') return;
  const treeTarget=current.startsWith('tree/')?decodeFragment(current.slice(5)):'';
  const referenceTarget=current.startsWith('reference/')?decodeFragment(current.slice(10)):'';
  const legacyReference=!!treeTarget&&!hasQuestionNode(treeTarget);
  const presentMode=current==='reference'||current.startsWith('reference/')||legacyReference?'reference':
    current==='tree'||current.startsWith('tree/')?'tree':'assessment';
  const oldMode=mode;
  mode=presentMode;
  for(const [view,tab,match] of [
    ['assessment-view','assessment-tab','assessment'],
    ['decision-view','tree-tab','tree'],
    ['reference-view','reference-tab','reference'],
  ]) {
    const selected=mode===match;
    get(view).hidden=!selected;
    if(selected) get(tab).setAttribute('aria-current','page');
    else get(tab).removeAttribute('aria-current');
  }
  shownTree=mode==='reference';
  if(shownTree) {
    constructTree();
    pendingTarget=referenceTarget||(legacyReference?treeTarget:'');
    requestAnimationFrame(()=>{
      if(!shownTree)return;
      if(pendingTarget)goTo(pendingTarget);else fit();
    });
  }
  if(mode==='tree')showQuestionMap(pathFrame(),treeTarget);
  if(oldMode!==mode) window.scrollTo(0,0);
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#reference/"],a[href^="#tree/"]');
  if(!link||link.hash!==location.hash)return;
  event.preventDefault();
  if(link.hash.startsWith('#reference/'))goTo(decodeFragment(link.hash.slice(11)));
  else hashRoute();
});
window.addEventListener('hashchange',hashRoute);
renderAssessment();
hashRoute();
